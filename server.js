const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// --------------------
// MongoDB Connection
// --------------------
mongoose
  .connect("mongodb://127.0.0.1:27017/restaurantDB")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// --------------------
// Models
// --------------------
const Menu = mongoose.model("Menu", {
  name: String,
  price: Number
});

const Order = mongoose.model("Order", {
  customerName: String,
  items: [{ name: String, quantity: Number }],
  totalAmount: Number,
  status: { type: String, default: "pending" },
  orderTime: { type: Date, default: Date.now }
});

// --------------------
// Admin
// --------------------
const ADMIN = {
  username: "admin",
  password: "admin123",
  token: "admin-token"
};

function adminAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(403).json({ error: "No token" });

  const token = auth.replace("Bearer ", "");
  if (token === ADMIN.token) next();
  else res.status(403).json({ error: "Unauthorized" });
}

// --------------------
// Preload Menu
// --------------------
async function preloadMenu() {
  const count = await Menu.countDocuments();
  if (count === 0) {
    await Menu.insertMany([
      { name: "Dosa", price: 50 },
      { name: "Vada", price: 35 },
      { name: "Pongal", price: 45 },
      { name: "Uttapam", price: 55 },
      { name: "Veg Biryani", price: 90 },
      { name: "Chicken Biryani", price: 160 },
      { name: "Fried Rice", price: 70 },
      { name: "Paneer Butter Masala", price: 120 },
      { name: "Tea", price: 20 }
    ]);
    console.log("🍽️ Menu preloaded");
  }
}
preloadMenu();

// --------------------
// Routes
// --------------------
app.get("/", (req, res) => {
  res.send("🍽️ Restaurant Backend running");
});

// Admin Login
app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN.username && password === ADMIN.password) {
    res.json({ token: ADMIN.token });
  } else {
    res.status(401).json({ error: "Invalid login" });
  }
});

// Menu
app.get("/menu", async (req, res) => {
  res.json(await Menu.find());
});

// Place Order
app.post("/order", async (req, res) => {
  const order = await Order.create(req.body);
  res.json({
    orderId: order._id,
    customerName: order.customerName,
    items: order.items,
    totalAmount: order.totalAmount,
    status: order.status
  });
});

// Order Status
app.get("/order/:id", async (req, res) => {
  res.json(await Order.findById(req.params.id));
});

// Admin Orders
app.get("/admin/orders", adminAuth, async (req, res) => {
  res.json(await Order.find());
});

// Update Status
app.patch("/admin/order/:id", adminAuth, async (req, res) => {
  res.json(
    await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    )
  );
});

// --------------------
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
