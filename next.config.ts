// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/dprwjsqmt/**", // Your Cloudinary cloud name
      },
      {
        protocol: "https",
        hostname: "img.clerk.com", // For Clerk avatars
      },
    ],
  },
  // ✅ This tells Vercel to ignore TypeScript errors and build anyway
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;