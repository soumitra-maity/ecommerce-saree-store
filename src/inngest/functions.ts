// src/inngest/functions.ts
import { inngest } from "@/lib/inngest";
import { resend } from "@/lib/resend";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";

// ============================================================================
// 🎉 Welcome Email Function
// Triggered when a new user signs up via Clerk
// ============================================================================
export const welcomeEmailFunction = inngest.createFunction(
  {
    id: "send-welcome-email",
    triggers: { event: "clerk/user.created" }, // ✅ Correct v3+ syntax: triggers nested in config
  },
  async ({ event, step }) => {
    const { email, name } = event.data;

    // Skip if Resend API key is missing (development mode)
    if (!process.env.RESEND_API_KEY) {
      console.log(`📧 [DEV] Would send welcome email to: ${email} (${name})`);
      return { skipped: "Missing RESEND_API_KEY" };
    }

    // Use Inngest step for retry logic and observability
    await step.run("send-welcome-email-via-resend", async () => {
      await resend.emails.send({
        from: "EthnicSaree <onboarding@resend.dev>", // Replace with verified domain in production
        to: email as string,
        subject: "Welcome to EthnicSaree! 🪷",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px;">
            <h2 style="color: #111; margin-bottom: 16px;">Namaste ${name}! 👋</h2>
            <p style="color: #666; line-height: 1.6;">
              Welcome to <strong>EthnicSaree</strong> — your destination for handcrafted Banarasi, Silk, and Designer ethnic wear.
            </p>
            <p style="color: #666; line-height: 1.6;">
              ✨ <strong>What's next?</strong><br/>
              • Explore our new arrivals<br/>
              • Get 10% off your first order with code: <code>WELCOME10</code><br/>
              • Free shipping on orders above ₹999
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/collection" 
                 style="background: #e11d48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Start Shopping
              </a>
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="color: #999; font-size: 12px; text-align: center;">
              EthnicSaree • Crafted with ❤️ in India<br/>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #e11d48;">Visit our store</a>
            </p>
          </div>
        `,
      });
    });

    console.log(`✅ Welcome email sent to: ${email}`);
    return { success: true, email };
  }
);

// ============================================================================
// 📦 Order Confirmation Function
// Triggered when payment is successfully verified
// ============================================================================
export const orderConfirmationFunction = inngest.createFunction(
  {
    id: "send-order-confirmation",
    triggers: { event: "order/confirmed" }, // ✅ Correct v3+ syntax
  },
  async ({ event, step }) => {
    const { orderId } = event.data;

    // Skip if Resend API key is missing
    if (!process.env.RESEND_API_KEY) {
      console.log(`📧 [DEV] Would send order confirmation for order: ${orderId}`);
      return { skipped: "Missing RESEND_API_KEY" };
    }

    // Step 1: Fetch order details from database
    const order = await step.run("fetch-order-from-db", async () => {
      await connectDB();
      const foundOrder = await Order.findById(orderId).lean();
      if (!foundOrder) {
        throw new Error(`Order not found: ${orderId}`);
      }
      return foundOrder;
    });

    // Step 2: Fetch customer email from synced User collection
    const customerEmail = await step.run("fetch-customer-email", async () => {
      const user = await User.findOne({ clerkId: order.clerkId }).select("email").lean();
      return user?.email || "unknown@example.com";
    });

    // Step 3: Send confirmation email via Resend
    const emailResult = await step.run("send-confirmation-email-via-resend", async () => {
      const emailRes = await resend.emails.send({
        from: "EthnicSaree <orders@resend.dev>", // Replace with verified domain in production
        to: customerEmail,
        subject: `Order Confirmed: #${order._id.toString().slice(-8)} 🎉`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px;">
            <h2 style="color: #111; margin-bottom: 16px;">Thank you for your order! 🙏</h2>
            
            <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 0; color: #666;"><strong>Order ID:</strong> ${order.razorpayOrderId}</p>
              <p style="margin: 4px 0 0 0; color: #666;"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
              <p style="margin: 4px 0 0 0; color: #666;"><strong>Status:</strong> <span style="color: #059669; font-weight: 600;">Processing</span></p>
            </div>

            <h3 style="color: #333; margin-bottom: 12px;">Order Summary</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="border-bottom: 2px solid #eee;">
                  <th style="text-align: left; padding: 8px 0; color: #666;">Item</th>
                  <th style="text-align: right; padding: 8px 0; color: #666;">Qty</th>
                  <th style="text-align: right; padding: 8px 0; color: #666;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map((item: any) => `
                  <tr style="border-bottom: 1px solid #f3f4f6;">
                    <td style="padding: 12px 0; color: #333;">${item.title}</td>
                    <td style="text-align: right; padding: 12px 0; color: #666;">${item.quantity}</td>
                    <td style="text-align: right; padding: 12px 0; color: #333;">₹${(item.price * item.quantity).toLocaleString("en-IN")}</td>
                  </tr>
                `).join("")}
              </tbody>
              <tfoot>
                <tr style="border-top: 2px solid #333;">
                  <td colspan="2" style="padding: 12px 0; font-weight: 600; color: #111;">Total</td>
                  <td style="text-align: right; padding: 12px 0; font-weight: 700; color: #e11d48; font-size: 18px;">
                    ₹${order.totalAmount.toLocaleString("en-IN")}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin-bottom: 20px;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                📦 <strong>What's next?</strong><br/>
                We're handpicking your items now. You'll receive a shipping confirmation email with tracking details within 24-48 hours.
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders" 
                 style="background: #e11d48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Track Your Order
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="color: #999; font-size: 12px; text-align: center;">
              EthnicSaree • Crafted with ❤️ in India<br/>
              Need help? <a href="${process.env.NEXT_PUBLIC_APP_URL}/contact" style="color: #e11d48;">Contact us</a>
            </p>
          </div>
        `,
      });
      return { messageId: emailRes.data?.id };
    });

    console.log(`✅ Order confirmation email sent to: ${customerEmail} (Message ID: ${emailResult.messageId})`);
    return { success: true, email: customerEmail, messageId: emailResult.messageId };
  }
);