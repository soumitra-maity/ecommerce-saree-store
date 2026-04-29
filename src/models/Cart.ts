// src/models/Cart.ts
import mongoose, { Schema, models } from "mongoose";

const cartItemSchema = new Schema({
  productId: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1, min: 1 },
}, { _id: false });

const cartSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

const Cart = models.Cart || mongoose.model("Cart", cartSchema);
export default Cart;