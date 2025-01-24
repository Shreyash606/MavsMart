const express = require("express");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");
const cors = require("cors");

// Initialize Firebase Admin SDK with your service account key
admin.initializeApp({
  credential: admin.credential.cert(
    require("../mavsmart-backend/API Key.json")
  ),
});

const app = express();
const db = admin.firestore();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// API to get all items (BuyPage)
app.get("/api/items", async (req, res) => {
  try {
    const snapshot = await db.collection("items").get();
    const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: "Error fetching items" });
  }
});

// API to post a new item (SellPage)
app.post("/api/items", async (req, res) => {
  const { name, description, price, category, photo } = req.body;

  if (!name || !description || !price || !category) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const newItem = {
      name,
      description,
      price,
      category,
      photo, // For image URLs, you can store them as strings
    };

    const docRef = await db.collection("items").add(newItem);
    res.status(201).json({ id: docRef.id, ...newItem });
  } catch (error) {
    res.status(500).json({ error: "Error posting item" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
