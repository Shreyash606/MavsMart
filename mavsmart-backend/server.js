const express = require("express");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config(); // Load environment variables first

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(
    require("../mavsmart-backend/API Key.json")
  ),
});

const app = express();
const port = 5002;

const mongoUri =
  process.env.MONGO_URI ||
  "mongodb+srv://Mavs_User:d8CL42UtQKEYSlgv@cluster0.td6x8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(mongoUri);

let mongoDB;
async function connectToMongoDBAndStartServer() {
  try {
    await client.connect();

    // Verify connection
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Connected to MongoDB");

    mongoDB = client.db("Mavs_User");
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  }
}

connectToMongoDBAndStartServer();

app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads")); // Serve uploaded files

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
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
    res.status(200).json(items);
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

    // Get uploaded file details
    const photo = req.file
      ? {
          filename: req.file.filename,
          path: `/uploads/${req.file.filename}`,
        }
      : null;

    if (!title || !description || !price || !category || !usedDuration) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const itemsCollection = mongoDB.collection("items");
      const newItem = {
        title,
        description,
        price: parseFloat(price),
        category,
        photo: req.file
          ? {
              filename: req.file.filename,
              path: `/uploads/${req.file.filename}`, // Set the path field
            }
          : null,
        sold: sold === "true",
        usedDuration,
        uploadedBy,
        userId: uid,
        createdAt: new Date(),
      };

      const result = await itemsCollection.insertOne(newItem);
      res.status(201).json({
        id: result.insertedId,
        ...newItem,
        // Include full URL for client access
        photoUrl: photo
          ? `${req.protocol}://${req.get("host")}${photo.path}`
          : null,
      });
    } catch (error) {
      console.error("Error saving item:", error);
      // Cleanup uploaded file if DB operation fails
      if (req.file) fs.promises.unlink(req.file.path).catch(console.error);
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
