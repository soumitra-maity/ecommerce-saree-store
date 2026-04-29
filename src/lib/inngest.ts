// src/lib/inngest.ts
import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "ethnic-saree-store",
  eventKey: process.env.INNGEST_EVENT_KEY, // Optional but recommended for prod
});