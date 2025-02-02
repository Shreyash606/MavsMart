const express = require("express");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");
const cors = require("cors");
const { MongoClient } = require("mongodb");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(
    require("../mavsmart-backend/API Key.json")
  ),
});

const app = express();
const port = 5000;

const mongoUri = process.env.MONGO_URI;
 // MongoDB URI
const client = new MongoClient(mongoUri);
let mongoDB;

async function connectToMongoDB() {
  try {
    await client.connect();
    mongoDB = client.db("MavsMart"); // Database name
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }
}

connectToMongoDB();

app.use(cors());
app.use(bodyParser.json());

// Middleware to authenticate Firebase tokens
const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // Attach user info to the request
    next();
  } catch (error) {
    console.error("Firebase Authentication error:", error);
    res.status(403).json({ error: "Invalid token" });
  }
};

// API to get all items (BuyPage)
app.get("/api/items", authenticateUser, async (req, res) => {
  console.log("Request body received:", req.body);
  try {
    const itemsCollection = mongoDB.collection("items");
    const items = await itemsCollection.find({}).toArray();
    res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ error: "Error fetching items" });
  }
});

// API to save user details (Signup Page)
app.post("/api/UserData", async (req, res) => {
  const { uid, name, email, phoneNumber, avatar } = req.body;

  if (!uid || !name || !email || !phoneNumber) {
    console.error("Missing fields:", req.body);
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const usersCollection = mongoDB.collection("UserData");
    const newUser = {
      uid,
      name,
      email,
      phoneNumber,
      avatar,
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);
    console.log("User added with ID:", result.insertedId);
    res
      .status(201)
      .json({ message: "User added successfully", id: result.insertedId });
  } catch (error) {
    console.error("Error saving user to database:", error);
    res
      .status(500)
      .json({ error: "Error saving user details in the database" });
  }
});

// API to post a new item (SellPage)
app.post("/api/items", authenticateUser, async (req, res) => {
  const { uid } = req.user; // Extracted from Firebase Authentication token
  const { title, description, price, category, photo, sold } = req.body;

  if (!title || !description || !price || !category) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const itemsCollection = mongoDB.collection("items");
    const newItem = {
      title,
      description,
      price,
      category,
      photo,
      sold,
      createdAt: new Date(),
    };

    const result = await itemsCollection.insertOne(newItem);
    res.status(201).json({ id: result.insertedId, ...newItem });
  } catch (error) {
    console.error("Error saving item to database:", error);
    res.status(500).json({ error: "Error saving item to database." });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
