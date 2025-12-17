const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customerName: String,
  items: [
    {
      name: String,
      quantity: Number
    }
  ],
  totalAmount: Number,
  status: {
    type: String,
    default: "pending"
  },
  orderTime: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Order", orderSchema);
