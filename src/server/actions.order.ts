// src/server/actions.order.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { checkoutAddressSchema } from "@/lib/validators/checkout";
import Razorpay from "razorpay";
import crypto from "crypto";

// Initialize Razorpay with test keys
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function createOrderAction(prevState: unknown, formData: FormData) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Please sign in to checkout." };

    // 1. Validate Address
    const addressData = Object.fromEntries(formData.entries());
    const validatedAddress = checkoutAddressSchema.safeParse(addressData);
    if (!validatedAddress.success) {
      return { success: false, error: validatedAddress.error.errors[0].message };
    }

    // 2. Extract Cart Items from hidden form input
    const cartItemsStr = formData.get("cartItems") as string;
    if (!cartItemsStr) return { success: false, error: "Cart is empty." };
    
    const cartItems = JSON.parse(cartItemsStr);
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return { success: false, error: "Cart is empty." };
    }

    // 3. Calculate Total
    const totalAmount = cartItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    if (totalAmount <= 0) return { success: false, error: "Invalid order total." };

    // 4. Create Razorpay Order (Amount must be in PAISE)
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `rcpt_${userId.slice(0, 8)}_${Date.now()}`,
      notes: { userId, itemCount: cartItems.length },
    });

    // 5. Save Order to MongoDB (Status: Pending)
    await connectDB();
    const dbOrder = await Order.create({
      clerkId: userId,
      items: cartItems.map((item: any) => ({
        productId: item.productId,
        title: item.title,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      })),
      totalAmount,
      razorpayOrderId: razorpayOrder.id,
      paymentStatus: "pending",
      status: "pending",
      shippingAddress: validatedAddress.data,
    });

    return {
      success: true,
      orderId: razorpayOrder.id,
      amount: totalAmount,
      dbOrderId: dbOrder._id.toString(),
    };
  } catch (error) {
    console.error("🔥 Create Order Error:", error);
    return { success: false, error: "Failed to initiate payment. Please try again." };
  }
}

export async function verifyPaymentAction(
  orderId: string,
  paymentId: string,
  signature: string
) {
  try {
    // Cryptographically verify Razorpay signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    if (expectedSignature !== signature) {
      return { success: false, error: "Payment verification failed." };
    }

    // Update DB: Mark as Paid & Processing
    await connectDB();
    await Order.findOneAndUpdate(
      { razorpayOrderId: orderId },
      {
        razorpayPaymentId: paymentId,
        paymentStatus: "paid",
        status: "processing",
      }
    );

    return { success: true };
  } catch (error) {
    console.error("🔥 Verify Payment Error:", error);
    return { success: false, error: "Internal verification error." };
  }
}