// src/app/api/webhooks/razorpay/route.ts
import { headers } from "next/headers";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { inngest } from "@/lib/inngest";

export async function POST(req: Request) {
  try {
    // Next.js 15: headers() returns a Promise
    const headerPayload = await headers();
    const razorpaySignature = headerPayload.get("x-razorpay-signature");
    const body = await req.text();

    if (!razorpaySignature) {
      return new Response("Missing signature header", { status: 400 });
    }

    // 🔐 Cryptographically verify webhook payload
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return new Response("Invalid webhook signature", { status: 403 });
    }

    const event = JSON.parse(body);

    // Handle successful payment capture
    if (event.event === "payment.captured") {
      const { order_id, payment_id } = event.payload.payment.entity;

      await connectDB();
      const order = await Order.findOne({ razorpayOrderId: order_id });

      // Idempotency check: prevent double-processing
      if (order && order.paymentStatus !== "paid") {
        order.paymentStatus = "paid";
        order.status = "processing";
        order.razorpayPaymentId = payment_id;
        await order.save();

        // 📦 Decrement stock for each item atomically
        for (const item of order.items) {
          await Product.updateOne(
            { _id: item.productId },
            { $inc: { stock: -item.quantity } }
          );
        }

        // 📧 Trigger background email job via Inngest
        await inngest.send({
          name: "order/confirmed",
          data: { orderId: order._id.toString() },
        });

        console.log(`✅ Order ${order_id} processed & email triggered.`);
      }
    }

    return new Response("Webhook processed successfully", { status: 200 });
  } catch (error) {
    console.error("🔥 Razorpay Webhook Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}