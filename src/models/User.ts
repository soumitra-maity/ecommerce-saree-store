// src/models/User.ts
import mongoose, { Schema, models } from 'mongoose';

const userSchema = new Schema(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    address: {
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

// Prevent "OverwriteModelError" in Next.js dev mode
const User = models.User || mongoose.model('User', userSchema);
export type UserDocument = mongoose.InferSchemaType<typeof userSchema>;
export default User;