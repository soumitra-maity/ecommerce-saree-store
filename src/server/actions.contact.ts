// src/server/actions.contact.ts
"use server";

import { z } from "zod";
import { resend } from "@/lib/resend";

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function contactFormAction(prevState: unknown, formData: FormData) {
  try {
    const rawData = {
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    };

    const validated = contactFormSchema.safeParse(rawData);
    if (!validated.success) {
      return { 
        success: false, 
        error: validated.error.errors[0]?.message || "Please fill all fields correctly" 
      };
    }

    const { name, email, subject, message } = validated.data;

    // Skip email if no Resend key (dev mode)
    if (!process.env.RESEND_API_KEY) {
      console.log(`📧 [DEV] Contact form submission from ${email}: ${subject}`);
      return { success: true, message: "Thank you! We'll get back to you soon. (Dev mode: email not sent)" };
    }

    // Send email to store admin
    await resend.emails.send({
      from: "EthnicSaree Contact <contact@resend.dev>",
      to: "admin@ethnicsaree.com", // Replace with your actual admin email
      replyTo: email,
      subject: `🛍️ New Contact: ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #111;">New Message from ${name}</h2>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;" />
          <p style="white-space: pre-wrap;">${message}</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #888; font-size: 12px;">Sent via EthnicSaree Contact Form</p>
        </div>
      `,
    });

    // Optional: Send auto-reply to customer
    await resend.emails.send({
      from: "EthnicSaree <noreply@resend.dev>",
      to: email,
      subject: "We received your message! 🙏",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #111;">Namaste ${name}!</h2>
          <p>Thank you for reaching out to EthnicSaree. We've received your message about:</p>
          <p><strong>"${subject}"</strong></p>
          <p>Our team will respond within 24 hours (during business hours).</p>
          <p>In the meantime, feel free to <a href="${process.env.NEXT_PUBLIC_APP_URL}/collection">browse our collection</a>.</p>
          <p style="margin-top: 30px; color: #888; font-size: 12px;">EthnicSaree • Crafted with ❤️ in India</p>
        </div>
      `,
    });

    return { success: true, message: "Thank you! We'll get back to you within 24 hours." };

  } catch (error) {
    console.error("🔥 Contact Form Error:", error);
    return { success: false, error: "Failed to send message. Please try again or WhatsApp us directly." };
  }
}