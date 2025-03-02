const express = require("express");
const https = require("https");
const fs = require("fs");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");
const cors = require("cors");

const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config(); // Load environment variables first
const { S3Client } = require("@aws-sdk/client-s3");

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
const port = 5002;

const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri);

let mongoDB;
async function connectToMongoDBAndStartServer() {
  try {
    await client.connect();

    // Verify connection
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Connected to MongoDB");

    mongoDB = client.db("Mavs_User");
    app.listen(port, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  }
}

connectToMongoDBAndStartServer();

app.use(cors());

const allowedOrigins = [
  "http://localhost:3000", // Allow local frontend
  "https://mavsmart.uta.cloud", // Allow production frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies and auth headers
  })
);

app.use(
  cors({
    origin: "https://mavsmart.uta.cloud", // Allow your frontend domain
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow relevant methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow headers
  })
);

y;
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads")); // Serve uploaded files

app.get("/api", (req, res) => {
  res.send("Welcome to the API!");
});

// Multer storage configuration for S3
const multerS3 = require("multer-s3");
const multer = require("multer");

const upload = multer({
  storage: multerS3({
    s3: s3, // Ensure this is the correct S3 client
    bucket: "mavsmart-images",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "public-read",
    key: (req, file, cb) => {
      const uniqueFilename = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueFilename);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
});
// Middleware to authenticate Firebase tokens
const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Firebase Authentication error:", error);
    res.status(403).json({ error: "Invalid token" });
  }
};

// API to get all items
app.get("/api/items", authenticateUser, async (req, res) => {
  try {
    const itemsCollection = mongoDB.collection("items");
    const items = await itemsCollection.find({}).toArray();

    res.status(200).json(
      items.map((item) => ({
        ...item,
        photo: item.photo || null, // Ensure S3 URL is returned
      }))
    );
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ error: "Error fetching items" });
  }
});

app.get("/api/UserData", authenticateUser, async (req, res) => {
  try {
    const usersCollection = mongoDB.collection("UserData");
    const users = await usersCollection.find({}).toArray();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Error fetching user data" });
  }
});

// API to fetch all user data
// Add endpoint to get user by UID
app.get("/api/UserData/:uid", authenticateUser, async (req, res) => {
  try {
    const usersCollection = mongoDB.collection("UserData");
    const user = await usersCollection.findOne({ uid: req.params.uid });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({
      uid: user.uid,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching user data" });
  }
});

// API to save user details
app.post("/api/UserData", async (req, res) => {
  const { uid, name, email, phoneNumber, avatar } = req.body;

  if (!uid || !name || !email || !phoneNumber) {
    // Avatar is now optional
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const usersCollection = mongoDB.collection("UserData");
    const newUser = {
      uid,
      name,
      email,
      phoneNumber,
      avatar: avatar || null, // Store avatar if provided
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);
    res.status(201).json({
      message: "User added successfully",
      id: result.insertedId,
    });
  } catch (error) {
    console.error("Error saving user:", error);
    res.status(500).json({ error: "Error saving user details" });
  }
});

// API to post a new item
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

    if (!title || !description || !price || !category || !usedDuration) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const photo = req.file ? req.file.location : null; // S3 file URL

    try {
      const itemsCollection = mongoDB.collection("items");
      const newItem = {
        title,
        description,
        price: parseFloat(price),
        category,
        photo,
        sold: sold === "true",
        usedDuration,
        uploadedBy,
        userId: uid,
        createdAt: new Date(),
      };

      const result = await itemsCollection.insertOne(newItem);
      res.status(201).json({
        message: "Item posted successfully",
        id: result.insertedId,
        photo: photo,
      });
    } catch (error) {
      console.error("Error saving item:", error);
      res.status(500).json({ error: "Error saving item" });
    }
  }
);

app.delete("/api/items/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;

  try {
    const itemsCollection = mongoDB.collection("items");

    // Convert the `id` to a MongoDB ObjectId
    const result = await itemsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ error: "Error deleting item" });
  }
});
