import express from "express";
import cors from "cors";
import { db } from "./config/firebase.js";


const app = express();



app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "KrishiConnect backend is running!"
  });
});

app.get("/test-db", async (req, res) => {
  try {
    const snapshot = await db.collection("users").limit(1).get();

    res.json({
      success: true,
      message: "Firestore connection successful!",
      documentsFound: snapshot.size
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Firestore connection failed"
    });
  }
});

// GET ALL ORDERS
app.get("/orders", async (req, res) => {
  try {
    const snapshot = await db.collection("orders").get();

    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch orders"
    });
  }
});

app.get("/api/produce", async (req, res) => {
  try {
    const snapshot = await db.collection("produce").get();

    const produce = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(produce);
  } catch (error) {
    console.error("Error fetching produce:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post("/api/produce", async (req, res) => {
    try {
        const { name, grade, quantity, price, collectionPoint } = req.body;

        const docRef = await db.collection("produce").add({
            name: name,
            grade: grade,
            quantity: Number(quantity),
            price: Number(price),
            collectionPoint: collectionPoint,
            createdAt: new Date()
        });

        res.status(201).json({
            success: true,
            id: docRef.id
        });

    } catch (error) {
        console.error("Error adding produce:", error);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});



