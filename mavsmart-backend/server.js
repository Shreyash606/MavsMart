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

// 🔧 DEBUGGING HELPERS
const debug = {
  log: (label, data) => {
    console.log(`🔍 [${label}]`, JSON.stringify(data, null, 2));
  },
  error: (label, error) => {
    console.error(`❌ [${label}]`, error);
  },
  success: (label, message) => {
    console.log(`✅ [${label}]`, message);
  },
};

// 🔧 ENVIRONMENT VALIDATION
const validateEnvironment = () => {
  const required = [
    "MONGO_URI",
    "AWS_REGION",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
  ];

  const missing = required.filter((env) => !process.env[env]);

  if (missing.length > 0) {
    debug.error(
      "ENVIRONMENT",
      `Missing required environment variables: ${missing.join(", ")}`
    );
    process.exit(1);
  }

  debug.success("ENVIRONMENT", "All required environment variables found");
};

validateEnvironment();

// 🔧 AWS S3 CONFIGURATION
let s3;
try {
  s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
  debug.success("S3", "S3 client initialized successfully");
} catch (error) {
  debug.error("S3", "Failed to initialize S3 client");
  debug.error("S3", error);
}

// 🔧 FIREBASE INITIALIZATION
let firebaseInitialized = false;
try {
  // Check if Firebase is already initialized
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(
        require(path.join(__dirname, "API Key.json")) // Adjust path as needed
      ),
    });
  }
  firebaseInitialized = true;
  debug.success("FIREBASE", "Firebase Admin initialized successfully");
} catch (error) {
  debug.error("FIREBASE", "Failed to initialize Firebase Admin");
  debug.error("FIREBASE", error);
}

const app = express();
const port = process.env.PORT || 5002;

// 🔧 CORS CONFIGURATION
const allowedOrigins = [
  "http://localhost:3000",
  "https://localhost:3000",
  "https://mavsmart.uta.cloud",
  "http://localhost:3001",
];

app.use(
  cors({
    origin: function (origin, callback) {
      console.log(`🌐 CORS Origin: ${origin}`);
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        debug.error("CORS", `Origin ${origin} not allowed`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
  })
);

// 🔧 MIDDLEWARE
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static("uploads"));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📋 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log(`📋 Headers:`, req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`📋 Body:`, req.body);
  }
  next();
});

// 🔧 MONGODB CONNECTION
const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri);
let mongoDB;

async function connectToMongoDBAndStartServer() {
  try {
    debug.log("MONGO", "Attempting to connect to MongoDB...");
    debug.log(
      "MONGO",
      `Connection string: ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, "//***:***@")}`
    );

    await client.connect();
    await client.db("admin").command({ ping: 1 });

    mongoDB = client.db("Mavs_User");
    debug.success("MONGO", "Connected to MongoDB successfully");

    // Test collections
    try {
      const collections = await mongoDB.listCollections().toArray();
      debug.log(
        "MONGO",
        `Available collections: ${collections.map((c) => c.name).join(", ")}`
      );
    } catch (error) {
      debug.error("MONGO", "Failed to list collections");
    }

    startServer();
  } catch (err) {
    debug.error("MONGO", "MongoDB connection failed");
    debug.error("MONGO", err);
    process.exit(1);
  }
}

function startServer() {
  app.listen(port, "0.0.0.0", () => {
    debug.success("SERVER", `Server running on port ${port}`);
    debug.log("SERVER", `Server URL: http://localhost:${port}`);
    debug.log("SERVER", `API URL: http://localhost:${port}/api`);
  });
}

// 🔧 MULTER CONFIGURATION
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "mavsmart-images",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "public-read",
    key: (req, file, cb) => {
      const timestamp = Date.now();
      const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
      const uniqueFilename = `items/${timestamp}-${sanitizedName}`;
      debug.log("UPLOAD", `Generated filename: ${uniqueFilename}`);
      cb(null, uniqueFilename);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    debug.log("UPLOAD", `File type: ${file.mimetype}`);
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      debug.error("UPLOAD", `Invalid file type: ${file.mimetype}`);
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."
        )
      );
    }
  },
});

// 🔧 AUTHENTICATION MIDDLEWARE
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    debug.log(
      "AUTH",
      `Authorization header: ${authHeader ? "Present" : "Missing"}`
    );

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      debug.error("AUTH", "No valid authorization header");
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authorization header required",
      });
    }

    const idToken = authHeader.split("Bearer ")[1];
    debug.log("AUTH", `Token length: ${idToken ? idToken.length : 0}`);

    if (!firebaseInitialized) {
      debug.error("AUTH", "Firebase not initialized");
      return res.status(500).json({ error: "Firebase not initialized" });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    debug.log("AUTH", `Decoded token for user: ${decodedToken.uid}`);

    req.user = decodedToken;
    next();
  } catch (error) {
    debug.error("AUTH", "Token verification failed");
    debug.error("AUTH", error);
    return res.status(403).json({
      error: "Invalid token",
      message: error.message,
    });
  }
};

// 🔧 HEALTH CHECK ENDPOINT
app.get("/api/health", async (req, res) => {
  const health = {
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: "Unknown",
    firebase: firebaseInitialized ? "OK" : "Failed",
    s3: s3 ? "OK" : "Failed",
  };

  try {
    await mongoDB.admin().ping();
    health.mongodb = "OK";
  } catch (error) {
    health.mongodb = "Failed";
  }

  debug.log("HEALTH", health);
  res.status(200).json(health);
});

// 🔧 ROOT ENDPOINT
app.get("/api", (req, res) => {
  res.json({
    message: "🚀 MavsMart API is running!",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      items: "/api/items",
      users: "/api/UserData",
    },
  });
});

// 🔧 GET ALL ITEMS (with debugging)
app.get("/api/items", authenticateUser, async (req, res) => {
  try {
    debug.log("ITEMS_GET", "Fetching items...");
    debug.log("ITEMS_GET", `User: ${req.user.uid}`);

    if (!mongoDB) {
      debug.error("ITEMS_GET", "MongoDB not connected");
      return res.status(500).json({ error: "Database not connected" });
    }

    const itemsCollection = mongoDB.collection("items");
    debug.log("ITEMS_GET", "Collection accessed");

    const items = await itemsCollection.find({}).toArray();
    debug.log("ITEMS_GET", `Found ${items.length} items`);

    const processedItems = items.map((item) => ({
      ...item,
      photo: item.photo || null,
    }));

    debug.success("ITEMS_GET", `Returning ${processedItems.length} items`);
    res.status(200).json(processedItems);
  } catch (error) {
    debug.error("ITEMS_GET", "Failed to fetch items");
    debug.error("ITEMS_GET", error);
    res.status(500).json({
      error: "Error fetching items",
      message: error.message,
    });
  }
});

// 🔧 GET ALL USERS (with debugging)
app.get("/api/UserData", authenticateUser, async (req, res) => {
  try {
    debug.log("USERS_GET", "Fetching users...");
    debug.log("USERS_GET", `Requesting user: ${req.user.uid}`);

    if (!mongoDB) {
      debug.error("USERS_GET", "MongoDB not connected");
      return res.status(500).json({ error: "Database not connected" });
    }

    const usersCollection = mongoDB.collection("UserData");
    const users = await usersCollection.find({}).toArray();

    debug.log("USERS_GET", `Found ${users.length} users`);
    debug.success("USERS_GET", `Returning ${users.length} users`);

    res.status(200).json(users);
  } catch (error) {
    debug.error("USERS_GET", "Failed to fetch users");
    debug.error("USERS_GET", error);
    res.status(500).json({
      error: "Error fetching user data",
      message: error.message,
    });
  }
});

// 🔧 POST NEW USER (with debugging)
app.post("/api/UserData", async (req, res) => {
  try {
    debug.log("USER_POST", "Creating new user...");
    debug.log("USER_POST", req.body);

    const { uid, name, email, phoneNumber, avatar } = req.body;

    if (!uid || !name || !email || !phoneNumber) {
      debug.error("USER_POST", "Missing required fields");
      return res.status(400).json({
        error: "Missing required fields",
        required: ["uid", "name", "email", "phoneNumber"],
      });
    }

    if (!email.endsWith("@mavs.uta.edu")) {
      debug.error("USER_POST", `Invalid email domain: ${email}`);
      return res.status(400).json({
        error: "Invalid email domain",
        message: "Only @mavs.uta.edu emails are allowed",
      });
    }

    if (!mongoDB) {
      debug.error("USER_POST", "MongoDB not connected");
      return res.status(500).json({ error: "Database not connected" });
    }

    const usersCollection = mongoDB.collection("UserData");

    // Check if user already exists
    const existingUser = await usersCollection.findOne({
      $or: [{ uid }, { email }],
    });

    if (existingUser) {
      debug.error("USER_POST", `User already exists: ${uid}`);
      return res.status(409).json({
        error: "User already exists",
        message: "A user with this UID or email already exists",
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
    debug.success("USER_POST", `User created with ID: ${result.insertedId}`);

    res.status(201).json({
      message: "User registered successfully",
      id: result.insertedId,
      user: {
        uid: newUser.uid,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    debug.error("USER_POST", "Failed to create user");
    debug.error("USER_POST", error);
    res.status(500).json({
      error: "Error saving user details",
      message: error.message,
    });
  }
});

// 🔧 POST NEW ITEM (with debugging)
app.post(
  "/api/items",
  authenticateUser,
  upload.single("photo"),
  async (req, res) => {
    try {
      debug.log("ITEM_POST", "Creating new item...");
      debug.log("ITEM_POST", `User: ${req.user.uid}`);
      debug.log("ITEM_POST", `Body: ${JSON.stringify(req.body)}`);
      debug.log("ITEM_POST", `File: ${req.file ? "Present" : "Missing"}`);

      if (req.file) {
        debug.log(
          "ITEM_POST",
          `File details: ${JSON.stringify({
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            location: req.file.location,
          })}`
        );
      }

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

      // Validation
      const requiredFields = {
        title,
        description,
        price,
        category,
        usedDuration,
        uploadedBy,
      };
      const missingFields = Object.entries(requiredFields)
        .filter(([key, value]) => !value)
        .map(([key]) => key);

      if (missingFields.length > 0) {
        debug.error("ITEM_POST", `Missing fields: ${missingFields.join(", ")}`);
        return res.status(400).json({
          error: "Missing required fields",
          missingFields,
        });
      }

      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        debug.error("ITEM_POST", `Invalid price: ${price}`);
        return res.status(400).json({
          error: "Invalid price",
          message: "Price must be a positive number",
        });
      }

      if (!req.file) {
        debug.error("ITEM_POST", "No photo uploaded");
        return res.status(400).json({
          error: "Photo required",
          message: "Please upload a photo of your item",
        });
      }

      if (!mongoDB) {
        debug.error("ITEM_POST", "MongoDB not connected");
        return res.status(500).json({ error: "Database not connected" });
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
      };

      debug.log("ITEM_POST", `New item: ${JSON.stringify(newItem, null, 2)}`);

      const result = await itemsCollection.insertOne(newItem);
      debug.success("ITEM_POST", `Item created with ID: ${result.insertedId}`);

      res.status(201).json({
        message: "Item posted successfully",
        id: result.insertedId,
        item: {
          _id: result.insertedId,
          title: newItem.title,
          price: newItem.price,
          photo: newItem.photo,
        },
      });
    } catch (error) {
      debug.error("ITEM_POST", "Failed to create item");
      debug.error("ITEM_POST", error);

      // Clean up uploaded image if item creation fails
      if (req.file && req.file.key) {
        try {
          await s3.send(
            new DeleteObjectCommand({
              Bucket: "mavsmart-images",
              Key: req.file.key,
            })
          );
          debug.log("ITEM_POST", "Cleaned up uploaded file");
        } catch (s3Error) {
          debug.error("ITEM_POST", "Failed to cleanup uploaded file");
        }
      }

      res.status(500).json({
        error: "Error saving item",
        message: error.message,
      });
    }
  }
);

// 🔧 DELETE ITEM (with debugging)
app.delete("/api/items/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;

    debug.log("ITEM_DELETE", `Deleting item ${id} for user ${uid}`);

    if (!mongoDB) {
      debug.error("ITEM_DELETE", "MongoDB not connected");
      return res.status(500).json({ error: "Database not connected" });
    }

    const itemsCollection = mongoDB.collection("items");

    const item = await itemsCollection.findOne({ _id: new ObjectId(id) });

    if (!item) {
      debug.error("ITEM_DELETE", `Item not found: ${id}`);
      return res.status(404).json({ error: "Item not found" });
    }

    if (item.userId !== uid) {
      debug.error(
        "ITEM_DELETE",
        `Unauthorized delete attempt by ${uid} for item owned by ${item.userId}`
      );
      return res.status(403).json({
        error: "Forbidden",
        message: "You can only delete your own items",
      });
    }

    const result = await itemsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      debug.error("ITEM_DELETE", `Failed to delete item: ${id}`);
      return res.status(404).json({ error: "Item not found" });
    }

    // Clean up S3 image
    if (item.photoKey) {
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: "mavsmart-images",
            Key: item.photoKey,
          })
        );
        debug.success("ITEM_DELETE", `Deleted S3 image: ${item.photoKey}`);
      } catch (s3Error) {
        debug.error("ITEM_DELETE", "Failed to delete S3 image");
        debug.error("ITEM_DELETE", s3Error);
      }
    }

    debug.success("ITEM_DELETE", `Item deleted successfully: ${id}`);
    res.status(200).json({
      message: "Item deleted successfully",
      deletedItem: {
        id: item._id,
        title: item.title,
      },
    });
  } catch (error) {
    debug.error("ITEM_DELETE", "Failed to delete item");
    debug.error("ITEM_DELETE", error);
    res.status(500).json({
      error: "Error deleting item",
      message: error.message,
    });
  }
});

// 🔧 ERROR HANDLING MIDDLEWARE
app.use((error, req, res, next) => {
  debug.error("MIDDLEWARE", "Unhandled error");
  debug.error("MIDDLEWARE", error);

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File too large",
        message: "Maximum file size is 5MB",
      });
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        error: "Invalid file field",
        message: "Only 'photo' field is allowed",
      });
    }
  }

  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong",
  });
});

// 🔧 404 HANDLER
app.use("*", (req, res) => {
  debug.error("404", `Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// 🔧 GRACEFUL SHUTDOWN
process.on("SIGINT", async () => {
  debug.log("SHUTDOWN", "Shutting down gracefully...");
  try {
    await client.close();
    debug.success("SHUTDOWN", "MongoDB connection closed");
    process.exit(0);
  } catch (error) {
    debug.error("SHUTDOWN", "Error during shutdown");
    debug.error("SHUTDOWN", error);
    process.exit(1);
  }
});

// 🔧 START THE SERVER
connectToMongoDBAndStartServer();
