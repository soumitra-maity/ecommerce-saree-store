// src/server/actions.cart.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Cart from "@/models/Cart";
import Product from "@/models/Product";

// ✅ Helper: Convert Mongoose doc to plain JSON object
const serialize = (doc: any) => JSON.parse(JSON.stringify(doc));

// ✅ Fetch User Cart with FULL Product Details
export async function getFullCart() {
  const { userId } = await auth();
  if (!userId) return { items: [] };

  await connectDB();
  const cart = await Cart.findOne({ userId }).lean();
  if (!cart || cart.items.length === 0) return { items: [] };

  const productIds = cart.items.map((item: any) => item.productId);
  const products = await Product.find({ _id: { $in: productIds } }).lean();

  const fullItems = cart.items.map((cartItem: any) => {
    const product = products.find((p: any) => p._id.toString() === cartItem.productId);
    if (!product) return null;

    return {
      productId: product._id.toString(),
      title: product.title,
      price: product.price,
      quantity: cartItem.quantity,
      image: product.images[0],
      slug: product.slug,
    };
  }).filter(Boolean);

  // ✅ Serialize before returning to client
  return serialize({ items: fullItems });
}

// ✅ Sync Cart Quantities to DB
export async function syncUserCart(items: Array<{ productId: string; quantity: number }>) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Not authenticated" };

  await connectDB();
  
  await Cart.findOneAndUpdate(
    { userId },
    { items, updatedAt: new Date() },
    { upsert: true, returnDocument: "after" }
  );

  return { success: true };
}

// ✅ Clear Cart in DB
export async function clearUserCart() {
  const { userId } = await auth();
  if (!userId) return { success: false };

  await connectDB();
  await Cart.deleteOne({ userId });
  return { success: true };
}