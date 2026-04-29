// src/lib/test-db.ts
// ✅ Load environment variables from .env.local FIRST
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

// Now import your DB module
import { connectDB } from "./db";

async function test() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    console.log("📍 URI exists:", !!process.env.MONGODB_URI); // Debug log
    
    await connectDB();
    console.log("✅ Connected successfully!");
    process.exit(0);
  } catch (err: any) {
    console.error("❌ Connection failed:", err.message);
    process.exit(1);
  }
}
test();