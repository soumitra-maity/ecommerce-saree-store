// src/models/Product.ts
import mongoose, { Schema, models } from 'mongoose';
import { CATEGORIES, GENDERS } from '@/lib/constants';

const productSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 }, // Original price for discounts
    gender: {
      type: String,
      required: true,
      enum: GENDERS,
      index: true, // Fast filtering by Men/Women
    },
    category: {
      type: String,
      required: true,
      // Spreads both Women's & Men's exact categories from constants.ts
      enum: [...CATEGORIES.women, ...CATEGORIES.men],
      index: true, // Fast filtering by specific category
    },
    images: [{ type: String, required: true }], // Cloudinary secure URLs
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    stock: { type: Number, required: true, default: 0, min: 0 },
    isFeatured: { type: Boolean, default: false, index: true },
    isNewArrival: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true }, // Soft delete toggle
  },
  { timestamps: true }
);

const Product = models.Product || mongoose.model('Product', productSchema);
export type ProductDocument = mongoose.InferSchemaType<typeof productSchema>;
export default Product;