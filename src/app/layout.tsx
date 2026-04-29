// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "EthnicSaree | Premium Indian Ethnic Wear",
    template: "%s | EthnicSaree",
  },
  description: "Handcrafted Banarasi, Silk & Designer Sarees, Kurtis & Lehengas. Authentic Indian ethnic wear delivered nationwide. Free shipping above ₹999.",
  keywords: ["saree", "banarasi", "silk saree", "kurti", "lehenga", "ethnic wear", "indian clothing"],
  authors: [{ name: "EthnicSaree Team" }],
  creator: "EthnicSaree",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "EthnicSaree | Premium Indian Ethnic Wear",
    description: "Handcrafted Banarasi, Silk & Designer Sarees, Kurtis & Lehengas.",
    siteName: "EthnicSaree",
  },
  twitter: {
    card: "summary_large_image",
    title: "EthnicSaree | Premium Indian Ethnic Wear",
    description: "Handcrafted Banarasi, Silk & Designer Sarees, Kurtis & Lehengas.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export const viewport: Viewport = {
  themeColor: "#e11d48", // Rose-600 matching your brand
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.variable}>
        <body className="bg-white text-gray-900 antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}