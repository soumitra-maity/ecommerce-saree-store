// src/app/api/webhooks/clerk/route.ts
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { inngest } from "@/lib/inngest";

export async function POST(req: Request) {
  try {
    // Next.js 15: headers() is async
    const headerPayload = await headers();
    const svixId = headerPayload.get("svix-id");
    const svixTimestamp = headerPayload.get("svix-timestamp");
    const svixSignature = headerPayload.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing Svix headers", { status: 400 });
    }

    const payload = await req.text();
    const body = JSON.parse(payload);

    // Verify webhook signature
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(payload, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("❌ Clerk Webhook verification failed:", err);
      return new Response("Verification error", { status: 400 });
    }

    const { id } = evt.data;
    const eventType = evt.type;

    // Handle User Creation
    if (eventType === "user.created") {
      await connectDB();
      
      const { email_addresses, first_name, last_name, image_url } = evt.data;
      const email = email_addresses[0].email_address;
      const name = `${first_name || ""} ${last_name || ""}`.trim() || email.split("@")[0];

      await User.create({
        clerkId: id,
        name,
        email,
        role: "user", // Default role
      });

      // Emit event for background job (welcome email)
      await inngest.send({
        name: "clerk/user.created",
        data: { email, name, userId: id },
      });
    }

    // Handle User Deletion (cleanup DB)
    if (eventType === "user.deleted") {
      await connectDB();
      await User.deleteOne({ clerkId: id });
    }

    return new Response("Webhook processed successfully", { status: 200 });
  } catch (error) {
    console.error("🔥 Clerk Webhook handler error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}