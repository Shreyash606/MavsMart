const express = require("express");
const https = require("https");
const fs = require("fs");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();

// Configure AWS S3
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(
    require("../mavsmart-backend/API Key.json")
  ),
});

const app = express();
const port = process.env.PORT || 5002;

// MongoDB connection
const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri);
let mongoDB;

async function connectToMongoDBAndStartServer() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Connected to MongoDB");

    mongoDB = client.db("Mavs_User");

    // Start server
    app.listen(port, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  }
}

// Enhanced CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "https://localhost:3000",
  "https://mavsmart.uta.cloud",
  "http://localhost:3001", // Add if you use different ports
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
  })
);

// Enhanced middleware
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static("uploads"));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Enhanced multer configuration with better error handling
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "mavsmart-images",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "public-read",
    key: (req, file, cb) => {
      // Create organized folder structure
      const timestamp = Date.now();
      const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
      const uniqueFilename = `items/${timestamp}-${sanitizedName}`;
      cb(null, uniqueFilename);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    // Enhanced file type validation
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."
        )
      );
    }
  },
});

// Enhanced authentication middleware
const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Authorization header required",
    });
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Firebase Authentication error:", error);
    return res.status(403).json({
      error: "Invalid token",
      message: "Please log in again",
    });
  }
};

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Root API endpoint
app.get("/api", (req, res) => {
  res.json({
    message: "Welcome to MavsMart API!",
    version: "1.0.0",
    documentation: "/api/docs",
  });
});

// Enhanced GET all items with filtering and pagination
app.get("/api/items", authenticateUser, async (req, res) => {
  try {
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

    const itemsCollection = mongoDB.collection("items");

    // Build query
    let query = { sold: { $ne: true } }; // Only show unsold items by default

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

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute query with pagination
    const items = await itemsCollection
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    // Get total count for pagination
    const totalItems = await itemsCollection.countDocuments(query);
    const totalPages = Math.ceil(totalItems / parseInt(limit));

    res.status(200).json({
      items: items.map((item) => ({
        ...item,
        photo: item.photo || null,
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({
      error: "Error fetching items",
      message: error.message,
    });
  }
});

// Get single item by ID
app.get("/api/items/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const itemsCollection = mongoDB.collection("items");

    const item = await itemsCollection.findOne({ _id: new ObjectId(id) });

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.status(200).json({
      ...item,
      photo: item.photo || null,
    });
  } catch (error) {
    console.error("Error fetching item:", error);
    res.status(500).json({
      error: "Error fetching item",
      message: error.message,
    });
  }
});

// Enhanced GET all users
app.get("/api/UserData", authenticateUser, async (req, res) => {
  try {
    const usersCollection = mongoDB.collection("UserData");
    const users = await usersCollection
      .find(
        {},
        {
          projection: {
            _id: 1,
            uid: 1,
            name: 1,
            email: 1,
            avatar: 1,
            createdAt: 1,
          },
        }
      )
      .toArray();

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({
      error: "Error fetching user data",
      message: error.message,
    });
  }
});

// Get user by UID
app.get("/api/UserData/:uid", authenticateUser, async (req, res) => {
  try {
    const usersCollection = mongoDB.collection("UserData");
    const user = await usersCollection.findOne({ uid: req.params.uid });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      uid: user.uid,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      avatar: user.avatar,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({
      error: "Error fetching user data",
      message: error.message,
    });
  }
});

// Enhanced POST user registration
app.post("/api/UserData", async (req, res) => {
  const { uid, name, email, phoneNumber, avatar } = req.body;

  // Enhanced validation
  if (!uid || !name || !email || !phoneNumber) {
    return res.status(400).json({
      error: "Missing required fields",
      required: ["uid", "name", "email", "phoneNumber"],
    });
  }

  // Email validation for UTA domain
  if (!email.endsWith("@mavs.uta.edu")) {
    return res.status(400).json({
      error: "Invalid email domain",
      message: "Only @mavs.uta.edu emails are allowed",
    });
  }

  try {
    const usersCollection = mongoDB.collection("UserData");

    // Check if user already exists
    const existingUser = await usersCollection.findOne({
      $or: [{ uid }, { email }],
    });

    if (existingUser) {
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
    console.error("Error saving user:", error);
    res.status(500).json({
      error: "Error saving user details",
      message: error.message,
    });
  }
});

// Enhanced POST new item
app.post(
  "/api/items",
  authenticateUser,
  upload.single("photo"),
  async (req, res) => {
    console.log("Request Body:", req.body);
    console.log("Uploaded File:", req.file);

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
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: "Missing required fields",
        missingFields,
      });
    }

    // Price validation
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({
        error: "Invalid price",
        message: "Price must be a positive number",
      });
    }

    // Photo validation
    if (!req.file) {
      return res.status(400).json({
        error: "Photo required",
        message: "Please upload a photo of your item",
      });
    }

    try {
      const itemsCollection = mongoDB.collection("items");

      const newItem = {
        title: title.trim(),
        description: description.trim(),
        price: parsedPrice,
        category: category.trim(),
        photo: req.file.location,
        photoKey: req.file.key, // Store S3 key for deletion
        sold: sold === "true" || sold === true,
        usedDuration: usedDuration.trim(),
        uploadedBy: uploadedBy.trim(),
        userId: uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        views: 0,
        isActive: true,
      };

      const result = await itemsCollection.insertOne(newItem);

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
      console.error("Error saving item:", error);

      // If item creation fails, clean up uploaded image
      if (req.file && req.file.key) {
        try {
          await s3.send(
            new DeleteObjectCommand({
              Bucket: "mavsmart-images",
              Key: req.file.key,
            })
          );
        } catch (s3Error) {
          console.error("Error cleaning up uploaded file:", s3Error);
        }
      }

      res.status(500).json({
        error: "Error saving item",
        message: error.message,
      });
    }
  }
);

// Enhanced DELETE item with image cleanup
app.delete("/api/items/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;
  const { uid } = req.user;

  try {
    const itemsCollection = mongoDB.collection("items");

    // First, get the item to check ownership and get image key
    const item = await itemsCollection.findOne({ _id: new ObjectId(id) });

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Check if user owns the item
    if (item.userId !== uid) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You can only delete your own items",
      });
    }

    // Delete the item from database
    const result = await itemsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Clean up image from S3
    if (item.photoKey) {
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: "mavsmart-images",
            Key: item.photoKey,
          })
        );
        console.log(`✅ Deleted image: ${item.photoKey}`);
      } catch (s3Error) {
        console.error("Error deleting image from S3:", s3Error);
        // Don't fail the request if image deletion fails
      }
    }

    res.status(200).json({
      message: "Item deleted successfully",
      deletedItem: {
        id: item._id,
        title: item.title,
      },
    });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({
      error: "Error deleting item",
      message: error.message,
    });
  }
});

// Update item status (mark as sold/unsold)
app.patch("/api/items/:id/status", authenticateUser, async (req, res) => {
  const { id } = req.params;
  const { sold } = req.body;
  const { uid } = req.user;

  try {
    const itemsCollection = mongoDB.collection("items");

    // Check ownership
    const item = await itemsCollection.findOne({ _id: new ObjectId(id) });
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    if (item.userId !== uid) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You can only update your own items",
      });
    }

    const result = await itemsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          sold: Boolean(sold),
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.status(200).json({
      message: `Item marked as ${sold ? "sold" : "available"}`,
      itemId: id,
      sold: Boolean(sold),
    });
  } catch (error) {
    console.error("Error updating item status:", error);
    res.status(500).json({
      error: "Error updating item status",
      message: error.message,
    });
  }
});

// Get user's items
app.get("/api/users/:uid/items", authenticateUser, async (req, res) => {
  const { uid } = req.params;
  const requestingUserUid = req.user.uid;

  // Users can only see their own items
  if (uid !== requestingUserUid) {
    return res.status(403).json({
      error: "Forbidden",
      message: "You can only view your own items",
    });
  }

  try {
    const itemsCollection = mongoDB.collection("items");
    const items = await itemsCollection
      .find({ userId: uid })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      items: items.map((item) => ({
        ...item,
        photo: item.photo || null,
      })),
      totalItems: items.length,
    });
  } catch (error) {
    console.error("Error fetching user items:", error);
    res.status(500).json({
      error: "Error fetching user items",
      message: error.message,
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);

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

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  try {
    await client.close();
    console.log("✅ MongoDB connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
});

// Start the server
connectToMongoDBAndStartServer();
