// src/app/(store)/product/[id]/page.tsx
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import AddToCartButton from "@/components/store/AddToCartButton";
import type { Metadata } from "next";

const serialize = (doc: any) => JSON.parse(JSON.stringify(doc));

// 🌐 SEO & OpenGraph Metadata for this specific product
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  await connectDB();
  const product = await Product.findById(id).lean();
  
  if (!product) return {};

  return {
    title: product.title,
    description: product.description.slice(0, 155) + (product.description.length > 155 ? "..." : ""),
    openGraph: {
      title: product.title,
      description: product.description.slice(0, 155),
      images: [{ url: product.images[0], width: 1200, height: 630, alt: product.title }],
      type: "website", // ✅ Use "website" instead of "product"
      url: `${process.env.NEXT_PUBLIC_APP_URL}/product/${product._id}`,
      siteName: "EthnicSaree",
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: product.description.slice(0, 155),
      images: [product.images[0]],
    },
    // ✅ Add product-specific metadata using "other" namespace
    other: {
      "product:price:amount": product.price.toString(),
      "product:price:currency": "INR",
      "product:availability": product.stock > 0 ? "in stock" : "out of stock",
      "product:condition": "new",
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDB();
  
  const product = serialize(await Product.findById(id).lean());
  if (!product || !product.isActive) notFound();

  const discount = product.compareAtPrice 
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) 
    : 0;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative">
            <Image 
              src={product.images[0]} 
              alt={product.title} 
              fill 
              className="object-cover" 
              sizes="(max-width: 768px) 100vw, 50vw" 
              priority 
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img: string, i: number) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative border-2 border-transparent hover:border-rose-600 cursor-pointer transition">
                  <Image src={img} alt={`Thumbnail ${i}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center space-y-5">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">{product.gender} • {product.category}</span>
            <h1 className="text-3xl lg:text-4xl font-serif font-bold mt-2 text-gray-900">{product.title}</h1>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-rose-600">₹{product.price.toLocaleString("en-IN")}</span>
            {product.compareAtPrice && (
              <>
                <span className="text-xl text-gray-400 line-through">₹{product.compareAtPrice.toLocaleString("en-IN")}</span>
                {discount > 0 && <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">{discount}% OFF</span>}
              </>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed text-sm md:text-base whitespace-pre-line">{product.description}</p>

          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg w-fit">
            <ShieldCheck className="w-4 h-4" /> 
            {product.stock > 0 ? `${product.stock} in stock • Ready to ship` : <span className="text-red-500">Out of Stock</span>}
          </div>

          <div className="pt-4 border-t border-gray-100">
            <AddToCartButton product={product} />
          </div>

          <div className="pt-6 border-t border-gray-100 space-y-3 text-sm text-gray-600">
            <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-rose-600" /><span>Secure Payment via Razorpay</span></div>
            <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-rose-600" /><span>Free Shipping on orders above ₹999</span></div>
            <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-rose-600" /><span>Easy Returns & Exchanges</span></div>
          </div>
        </div>
      </div>
    </main>
  );
}