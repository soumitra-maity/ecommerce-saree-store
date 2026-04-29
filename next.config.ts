// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/dprwjsqmt/**", // Your cloud name
      },
      {
        protocol: "https",
        hostname: "img.clerk.com", // For Clerk avatars
      },
    ],
  },
};

export default nextConfig;