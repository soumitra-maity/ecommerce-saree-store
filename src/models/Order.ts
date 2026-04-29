// src/models/Order.ts
import mongoose, { Schema, models } from 'mongoose';

const orderItemSchema = new Schema(
  {
    productId: { type: String, required: true }, // Store as string to avoid population issues with caching
    title: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false } // Don't auto-generate _id for subdocuments
);

const orderSchema = new Schema(
  {
    clerkId: { type: String, required: true, index: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },
    razorpayOrderId: { type: String, unique: true, sparse: true },
    razorpayPaymentId: { type: String },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    shippingAddress: {
      fullName: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },
  },
  { timestamps: true }
);

const Order = models.Order || mongoose.model('Order', orderSchema);
export type OrderDocument = mongoose.InferSchemaType<typeof orderSchema>;
export default Order;