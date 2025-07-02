const express = require("express");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();

// 🔧 DEBUGGING FUNCTION
const log = (label, data) => {
  console.log(`🔍 [${label}]`, data);
};

// 🔧 1. ENVIRONMENT VALIDATION - Check all required variables
const requiredEnvVars = [
  "MONGO_URI",
  "AWS_REGION",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_S3_BUCKET",
];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error("❌ Missing environment variables:", missingEnvVars);
  console.error("Please set the following environment variables:");
  missingEnvVars.forEach((envVar) =>
    console.error(`${envVar}=your_value_here`)
  );
  process.exit(1);
}

log("ENV", "All environment variables found");
log("ENV", `Using S3 bucket: ${process.env.AWS_S3_BUCKET}`);
log("ENV", `Using AWS region: ${process.env.AWS_REGION}`);

// 🔧 2. AWS S3 CONFIGURATION - Add error handling
let s3;
try {
  s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
  log("S3", "S3 client initialized successfully");
} catch (error) {
  console.error("❌ S3 initialization failed:", error);
  process.exit(1);
}

// 🔧 3. FIREBASE INITIALIZATION - Fix path and add error handling
let firebaseApp;
try {
  // Try different possible paths for the Firebase key
  const possiblePaths = [
    path.join(__dirname, "API Key.json"),
    path.join(__dirname, "../mavsmart-backend/API Key.json"),
    path.join(__dirname, "./API Key.json"),
    path.join(process.cwd(), "API Key.json"),
  ];

  let keyPath = null;
  for (const testPath of possiblePaths) {
    try {
      require.resolve(testPath);
      keyPath = testPath;
      break;
    } catch (e) {
      // Continue to next path
    }
  }

  if (!keyPath) {
    throw new Error(
      'Firebase service account key file not found. Please ensure "API Key.json" exists in your project directory.'
    );
  }

  if (admin.apps.length === 0) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(require(keyPath)),
    });
  }
  log("FIREBASE", "Firebase Admin initialized successfully");
} catch (error) {
  console.error("❌ Firebase initialization failed:", error);
  console.error(
    'Make sure your "API Key.json" file exists and contains valid Firebase service account credentials'
  );
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 5002;

// 🔧 4. MONGODB CONNECTION - Add better error handling
const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri, {
  serverSelectionTimeoutMS: 10000, // 10 second timeout
  connectTimeoutMS: 10000,
});
let mongoDB;

async function connectToMongoDBAndStartServer() {
  try {
    log("MONGO", "Attempting to connect to MongoDB...");
    log("MONGO", `URI: ${mongoUri.replace(/\/\/.*@/, "//***:***@")}`); // Hide credentials in log

    await client.connect();
    await client.db("admin").command({ ping: 1 });

    mongoDB = client.db("Mavs_User");
    log("MONGO", "Connected to MongoDB successfully");

    // Test if collections exist
    const collections = await mongoDB.listCollections().toArray();
    log(
      "MONGO",
      `Available collections: ${collections.map((c) => c.name).join(", ")}`
    );

    startServer();
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    console.error("Please check:");
    console.error("1. Your MONGO_URI in .env file");
    console.error("2. MongoDB Atlas IP whitelist settings");
    console.error("3. Database user permissions");
    process.exit(1);
  }
}

function startServer() {
  app.listen(port, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`🔗 Health check: http://localhost:${port}/api/health`);
    console.log(`🔗 API root: http://localhost:${port}/api`);
  });
}

// 🔧 5. ENHANCED CORS CONFIGURATION - CRITICAL CHANGES
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "https://localhost:3000",
  "https://mavsmart.uta.cloud",
  "http://mavsmart.uta.cloud",
  "https://api.mavsmart.uta.cloud",
  "http://api.mavsmart.uta.cloud",
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log(`🔍 [CORS] Request from origin: ${origin}`);

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // Allow any localhost for development
    if (origin && origin.includes("localhost")) return callback(null, true);

    // Allow mavsmart domains
    if (origin && origin.includes("mavsmart.uta.cloud"))
      return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.error(`❌ CORS blocked origin: ${origin}`);
      callback(null, true); // Change to false in production for security
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Cache-Control",
    "X-File-Name",
  ],
  exposedHeaders: ["Content-Length", "X-Total-Count"],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400, // 24 hours
};

// Apply CORS
app.use(cors(corsOptions));

// Handle preflight requests explicitly - CRITICAL
app.options("*", cors(corsOptions));

// Additional preflight handling for complex requests
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    log("PREFLIGHT", `${req.method} ${req.path} from ${req.headers.origin}`);
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,DELETE,OPTIONS,PATCH"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type,Authorization,X-Requested-With,Accept,Origin,Cache-Control,X-File-Name"
    );
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Max-Age", "86400");
    return res.status(200).end();
  }
  next();
});

// 🔧 6. ENHANCED MIDDLEWARE WITH INCREASED LIMITS
app.use(
  bodyParser.json({
    limit: "50mb",
    strict: false,
    type: "application/json",
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "50mb",
    parameterLimit: 50000,
    type: "application/x-www-form-urlencoded",
  })
);

// Add request size logging
app.use((req, res, next) => {
  if (req.headers["content-length"]) {
    const sizeInMB = (
      parseInt(req.headers["content-length"]) /
      1024 /
      1024
    ).toFixed(2);
    log("REQUEST_SIZE", `${sizeInMB}MB`);
  }
  next();
});

// Request logging with more details
app.use((req, res, next) => {
  console.log(`📋 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.headers.authorization) {
    console.log(
      `🔑 Auth header present: ${req.headers.authorization.substring(0, 20)}...`
    );
  }
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`📦 Body keys: ${Object.keys(req.body).join(", ")}`);
  }
  if (req.headers.origin) {
    console.log(`🌍 Origin: ${req.headers.origin}`);
  }
  next();
});

// 🔧 7. ENHANCED MULTER CONFIGURATION
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "public-read",
    key: (req, file, cb) => {
      const timestamp = Date.now();
      const randomId = Math.round(Math.random() * 1e9);
      const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
      const uniqueFilename = `items/${timestamp}-${randomId}-${sanitizedName}`;
      log("UPLOAD", `Generated filename: ${uniqueFilename}`);
      cb(null, uniqueFilename);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1,
    fieldSize: 2 * 1024 * 1024, // 2MB for field data
    fieldNameSize: 100,
    fields: 20,
  },
  fileFilter: (req, file, cb) => {
    log(
      "UPLOAD",
      `File type: ${file.mimetype}, Original name: ${file.originalname}`
    );
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (allowedTypes.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      log("UPLOAD", `Rejected file type: ${file.mimetype}`);
      cb(
        new Error(
          `Invalid file type: ${file.mimetype}. Only JPEG, PNG, GIF, and WebP are allowed.`
        )
      );
    }
  },
});

// 🔧 8. ENHANCED AUTHENTICATION MIDDLEWARE
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    log("AUTH", `Auth header: ${authHeader ? "Present" : "Missing"}`);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      log("AUTH", "No Bearer token found");
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authorization header with Bearer token required",
        code: "NO_TOKEN",
      });
    }

    const idToken = authHeader.split("Bearer ")[1];
    log("AUTH", `Token length: ${idToken.length}`);

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    log("AUTH", `Token verified for user: ${decodedToken.uid}`);

    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("❌ Firebase Authentication error:", error);
    return res.status(403).json({
      error: "Invalid token",
      message: "Token verification failed. Please log in again.",
      code: "INVALID_TOKEN",
    });
  }
};

// 🔧 9. ENHANCED HEALTH CHECK
app.get("/api/health", async (req, res) => {
  const health = {
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {},
    version: "1.0.0",
  };

  // Check MongoDB
  try {
    await mongoDB.admin().ping();
    health.services.mongodb = "Connected";
  } catch (error) {
    health.services.mongodb = "Disconnected";
    health.status = "Partial";
  }

  // Check Firebase
  try {
    await admin.auth().listUsers(1);
    health.services.firebase = "Connected";
  } catch (error) {
    health.services.firebase = "Error";
    health.status = "Partial";
  }

  health.services.s3 = s3 ? "Initialized" : "Not initialized";
  health.services.cors = "Enabled";
  health.services.multer = "Configured";

  log("HEALTH", health);
  res.status(200).json(health);
});

// Root endpoint
app.get("/api", (req, res) => {
  res.json({
    message: "🚀 MavsMart API is running!",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      items: "/api/items",
      users: "/api/UserData",
    },
    documentation: "Check /api/health for service status",
    cors: "Enabled for mavsmart.uta.cloud",
  });
});

// 🔧 10. ENHANCED GET ITEMS
app.get("/api/items", authenticateUser, async (req, res) => {
  try {
    log("GET_ITEMS", `Request from user: ${req.user.uid}`);
    log("GET_ITEMS", `Query params: ${JSON.stringify(req.query)}`);

    if (!mongoDB) {
      throw new Error("MongoDB not connected");
    }

    const itemsCollection = mongoDB.collection("items");

    // Build query
    let query = { isActive: { $ne: false } }; // Only show active items
    const {
      category,
      minPrice,
      maxPrice,
      search,
      page = 1,
      limit = 50,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    if (category && category !== "All") {
      query.category = new RegExp(category, "i");
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (search) {
      query.$or = [
        { title: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
      ];
    }

    log("GET_ITEMS", `MongoDB query: ${JSON.stringify(query)}`);

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const items = await itemsCollection
      .find(query)
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    log("GET_ITEMS", `Found ${items.length} items`);

    // Process items
    const processedItems = items.map((item) => ({
      ...item,
      photo: item.photo || null,
    }));

    // Get total count for pagination
    const totalCount = await itemsCollection.countDocuments(query);

    res.status(200).json({
      items: processedItems,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("❌ Error fetching items:", error);
    res.status(500).json({
      error: "Error fetching items",
      message: error.message,
    });
  }
});

// Backward compatibility - return just items array if no pagination needed
app.get("/api/items/simple", authenticateUser, async (req, res) => {
  try {
    const itemsCollection = mongoDB.collection("items");
    const items = await itemsCollection
      .find({ isActive: { $ne: false } })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    const processedItems = items.map((item) => ({
      ...item,
      photo: item.photo || null,
    }));

    res.status(200).json(processedItems);
  } catch (error) {
    console.error("❌ Error fetching items:", error);
    res.status(500).json({
      error: "Error fetching items",
      message: error.message,
    });
  }
});

// 🔧 11. ENHANCED GET USERS
app.get("/api/UserData", authenticateUser, async (req, res) => {
  try {
    log("GET_USERS", `Request from user: ${req.user.uid}`);

    if (!mongoDB) {
      throw new Error("MongoDB not connected");
    }

    const usersCollection = mongoDB.collection("UserData");
    const users = await usersCollection
      .find({ isActive: { $ne: false } })
      .sort({ createdAt: -1 })
      .toArray();

    log("GET_USERS", `Found ${users.length} users`);

    res.status(200).json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({
      error: "Error fetching user data",
      message: error.message,
    });
  }
});

// 🔧 12. ENHANCED POST USER
app.post("/api/UserData", async (req, res) => {
  try {
    log("POST_USER", `Request body keys: ${Object.keys(req.body).join(", ")}`);

    const { uid, name, email, phoneNumber, avatar } = req.body;

    // Validation
    if (!uid || !name || !email || !phoneNumber) {
      log("POST_USER", "Missing required fields");
      return res.status(400).json({
        error: "Missing required fields",
        required: ["uid", "name", "email", "phoneNumber"],
        received: Object.keys(req.body),
      });
    }

    if (!email.endsWith("@mavs.uta.edu")) {
      log("POST_USER", `Invalid email domain: ${email}`);
      return res.status(400).json({
        error: "Invalid email domain",
        message: "Only @mavs.uta.edu emails are allowed",
      });
    }

    if (!mongoDB) {
      throw new Error("MongoDB not connected");
    }

    const usersCollection = mongoDB.collection("UserData");

    // Check if user exists
    const existingUser = await usersCollection.findOne({
      $or: [{ uid }, { email: email.toLowerCase().trim() }],
    });

    if (existingUser) {
      log("POST_USER", `User already exists: ${uid}`);
      return res.status(409).json({
        error: "User already exists",
        message: "A user with this UID or email already exists",
        user: {
          uid: existingUser.uid,
          name: existingUser.name,
          email: existingUser.email,
        },
      });
    }

    const newUser = {
      uid,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phoneNumber: phoneNumber.trim(),
      avatar: avatar || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    const result = await usersCollection.insertOne(newUser);
    log("POST_USER", `User created with ID: ${result.insertedId}`);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      id: result.insertedId,
      user: {
        uid: newUser.uid,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("❌ Error creating user:", error);
    res.status(500).json({
      error: "Error saving user details",
      message: error.message,
    });
  }
});

// 🔧 13. COMPLETELY REWRITTEN POST ITEM WITH BETTER ERROR HANDLING
app.post("/api/items", authenticateUser, (req, res) => {
  log("POST_ITEM", `Starting upload process for user: ${req.user.uid}`);

  // Use multer middleware with enhanced error handling
  upload.single("photo")(req, res, async (uploadError) => {
    if (uploadError) {
      console.error("❌ Upload error:", uploadError);

      if (uploadError instanceof multer.MulterError) {
        if (uploadError.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({
            error: "File too large",
            message: "Maximum file size is 10MB",
            code: "LIMIT_FILE_SIZE",
          });
        }
        if (uploadError.code === "LIMIT_UNEXPECTED_FILE") {
          return res.status(400).json({
            error: "Invalid file field",
            message: "Only 'photo' field is allowed",
            code: "LIMIT_UNEXPECTED_FILE",
          });
        }
        if (uploadError.code === "LIMIT_FIELD_COUNT") {
          return res.status(400).json({
            error: "Too many fields",
            message: "Maximum 20 fields allowed",
            code: "LIMIT_FIELD_COUNT",
          });
        }
      }

      // AWS S3 errors
      if (uploadError.code === "NoSuchBucket") {
        return res.status(500).json({
          error: "Storage configuration error",
          message: "S3 bucket not found",
          code: "S3_BUCKET_ERROR",
        });
      }

      return res.status(400).json({
        error: "Upload failed",
        message: uploadError.message,
        code: uploadError.code || "UNKNOWN_UPLOAD_ERROR",
      });
    }

    try {
      log("POST_ITEM", `Request from user: ${req.user.uid}`);
      log("POST_ITEM", `Body keys: ${Object.keys(req.body).join(", ")}`);
      log(
        "POST_ITEM",
        `File: ${req.file ? "Uploaded successfully" : "Missing"}`
      );

      const { uid } = req.user;
      const {
        title,
        description,
        price,
        category,
        sold,
        usedDuration,
        uploadedBy,
      } = req.body;

      // Enhanced validation
      const requiredFields = {
        title,
        description,
        price,
        category,
        usedDuration,
        uploadedBy,
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([key, value]) => !value || value.toString().trim() === "")
        .map(([key]) => key);

      if (missingFields.length > 0) {
        log("POST_ITEM", `Missing fields: ${missingFields.join(", ")}`);
        return res.status(400).json({
          error: "Missing required fields",
          missingFields,
          received: Object.keys(req.body),
          code: "MISSING_FIELDS",
        });
      }

      // Price validation
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        log("POST_ITEM", `Invalid price: ${price}`);
        return res.status(400).json({
          error: "Invalid price",
          message: "Price must be a positive number",
          code: "INVALID_PRICE",
        });
      }

      // Title length validation
      if (title.trim().length < 3 || title.trim().length > 100) {
        return res.status(400).json({
          error: "Invalid title length",
          message: "Title must be between 3 and 100 characters",
          code: "INVALID_TITLE_LENGTH",
        });
      }

      // Description length validation
      if (description.trim().length < 10 || description.trim().length > 1000) {
        return res.status(400).json({
          error: "Invalid description length",
          message: "Description must be between 10 and 1000 characters",
          code: "INVALID_DESCRIPTION_LENGTH",
        });
      }

      if (!req.file) {
        log("POST_ITEM", "No photo uploaded");
        return res.status(400).json({
          error: "Photo required",
          message: "Please upload a photo of your item",
          code: "NO_PHOTO",
        });
      }

      if (!mongoDB) {
        throw new Error("MongoDB not connected");
      }

      const itemsCollection = mongoDB.collection("items");

      const newItem = {
        title: title.trim(),
        description: description.trim(),
        price: parsedPrice,
        category: category.trim(),
        photo: req.file.location,
        photoKey: req.file.key,
        sold: sold === "true" || sold === true,
        usedDuration: usedDuration.trim(),
        uploadedBy: uploadedBy.trim(),
        userId: uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        views: 0,
        isActive: true,
        tags: [
          category.toLowerCase(),
          ...title
            .toLowerCase()
            .split(" ")
            .filter((word) => word.length > 2),
        ],
      };

      log("POST_ITEM", `Creating item: ${newItem.title}`);

      const result = await itemsCollection.insertOne(newItem);
      log("POST_ITEM", `Item created with ID: ${result.insertedId}`);

      res.status(201).json({
        success: true,
        message: "Item posted successfully",
        id: result.insertedId,
        item: {
          _id: result.insertedId,
          title: newItem.title,
          price: newItem.price,
          photo: newItem.photo,
          category: newItem.category,
          createdAt: newItem.createdAt,
        },
      });
    } catch (error) {
      console.error("❌ Error creating item:", error);

      // Cleanup uploaded file if item creation failed
      if (req.file && req.file.key) {
        try {
          await s3.send(
            new DeleteObjectCommand({
              Bucket: process.env.AWS_S3_BUCKET,
              Key: req.file.key,
            })
          );
          log("POST_ITEM", "Cleaned up uploaded file after error");
        } catch (s3Error) {
          console.error("Error cleaning up file:", s3Error);
        }
      }

      res.status(500).json({
        error: "Error saving item",
        message: error.message,
        code: "DATABASE_ERROR",
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  });
});

// 🔧 14. ENHANCED DELETE ITEM
app.delete("/api/items/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;

    log("DELETE_ITEM", `User ${uid} attempting to delete item ${id}`);

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "Invalid item ID",
        code: "INVALID_ID",
      });
    }

    if (!mongoDB) {
      throw new Error("MongoDB not connected");
    }

    const itemsCollection = mongoDB.collection("items");
    const item = await itemsCollection.findOne({ _id: new ObjectId(id) });

    if (!item) {
      log("DELETE_ITEM", `Item not found: ${id}`);
      return res.status(404).json({
        error: "Item not found",
        code: "ITEM_NOT_FOUND",
      });
    }

    if (item.userId !== uid) {
      log(
        "DELETE_ITEM",
        `Unauthorized: ${uid} tried to delete item owned by ${item.userId}`
      );
      return res.status(403).json({
        error: "Forbidden",
        message: "You can only delete your own items",
        code: "UNAUTHORIZED_DELETE",
      });
    }

    const result = await itemsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        error: "Item not found",
        code: "DELETE_FAILED",
      });
    }

    // Clean up S3 image
    if (item.photoKey) {
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: item.photoKey,
          })
        );
        log("DELETE_ITEM", "S3 image deleted");
      } catch (s3Error) {
        console.error("S3 cleanup error:", s3Error);
        // Don't fail the delete if S3 cleanup fails
      }
    }

    log("DELETE_ITEM", `Item deleted successfully: ${id}`);
    res.status(200).json({
      success: true,
      message: "Item deleted successfully",
      deletedItem: {
        id: item._id,
        title: item.title,
      },
    });
  } catch (error) {
    console.error("❌ Error deleting item:", error);
    res.status(500).json({
      error: "Error deleting item",
      message: error.message,
      code: "DELETE_ERROR",
    });
  }
});

// 🔧 15. ENHANCED ERROR HANDLING MIDDLEWARE
app.use((error, req, res, next) => {
  console.error("❌ Global error handler:", error);

  // Handle specific error types
  if (error.type === "entity.too.large") {
    return res.status(413).json({
      error: "Request too large",
      message: "The uploaded file or request is too large (max 50MB)",
      code: "ENTITY_TOO_LARGE",
    });
  }

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        error: "File too large",
        message: "Maximum file size is 10MB",
        code: "LIMIT_FILE_SIZE",
      });
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        error: "Invalid file field",
        message: "Only 'photo' field is allowed",
        code: "LIMIT_UNEXPECTED_FILE",
      });
    }
    return res.status(400).json({
      error: "File upload error",
      message: error.message,
      code: error.code,
    });
  }

  // MongoDB errors
  if (error.name === "MongoError" || error.name === "MongoServerError") {
    return res.status(500).json({
      error: "Database error",
      message: "Database operation failed",
      code: "MONGO_ERROR",
    });
  }

  // Firebase errors
  if (error.code && error.code.startsWith("auth/")) {
    return res.status(401).json({
      error: "Authentication error",
      message: error.message,
      code: error.code,
    });
  }

  // CORS errors
  if (error.message && error.message.includes("CORS")) {
    return res.status(403).json({
      error: "CORS error",
      message: "Cross-origin request blocked",
      code: "CORS_ERROR",
    });
  }

  // AWS S3 errors
  if (error.code && error.code.startsWith("NoSuch")) {
    return res.status(500).json({
      error: "Storage error",
      message: "File storage operation failed",
      code: "S3_ERROR",
    });
  }

  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong",
    code: "INTERNAL_ERROR",
    requestId: req.headers["x-request-id"] || "unknown",
  });
});

// 🔧 16. ENHANCED 404 HANDLER
app.use("*", (req, res) => {
  log(
    "404",
    `${req.method} ${req.originalUrl} from ${
      req.headers.origin || "unknown origin"
    }`
  );
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
    code: "ROUTE_NOT_FOUND",
    availableEndpoints: {
      health: "GET /api/health",
      items: "GET|POST /api/items",
      item: "DELETE /api/items/:id",
      users: "GET|POST /api/UserData",
    },
  });
});

// 🔧 17. ENHANCED GRACEFUL SHUTDOWN
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  try {
    if (client) {
      await client.close();
      console.log("✅ MongoDB connection closed");
    }
    console.log("✅ Server shutdown complete");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

// Start the server
connectToMongoDBAndStartServer();
