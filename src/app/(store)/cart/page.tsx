// src/app/(store)/cart/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useCartStore } from "@/store/useCartStore";
import Link from "next/link";
import Image from "next/image";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  
  // ✅ Read cart state safely
  const { items, totalAmount, totalQuantity, removeItem, updateQuantity, clearCart } = useCartStore();

  // ✅ Ensure numeric values (prevent null/undefined crashes)
  const safeTotalAmount = typeof totalAmount === "number" ? totalAmount : 0;
  const safeTotalQuantity = typeof totalQuantity === "number" ? totalQuantity : 0;

  // ✅ Redirect to sign-in if not logged in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in?redirect_url=/cart");
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading while auth checks
  if (!isLoaded) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center py-16 animate-pulse text-gray-400">Loading your cart...</div>
      </main>
    );
  }

  // If not signed in, don't render (redirect will happen)
  if (!isSignedIn) {
    return null;
  }

  // Show empty state if cart is empty
  if (!items || items.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
            <ShoppingBag className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-3">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Link 
            href="/collection" 
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition"
          >
            Start Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif font-bold mb-8 text-gray-900">
        Shopping Cart ({safeTotalQuantity})
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div 
              key={item.productId} 
              className="flex gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm"
            >
              <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0 relative">
                <Image 
                  src={item.image} 
                  alt={item.title || "Product"} 
                  fill 
                  className="object-cover" 
                />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <Link 
                    href={`/product/${item.productId}`} 
                    className="font-medium text-gray-900 hover:text-rose-600 line-clamp-1"
                  >
                    {item.title || "Product"}
                  </Link>
                  {/* ✅ Safe price display */}
                  <p className="text-sm text-gray-500 mt-1">
                    ₹{((item.price ?? 0)).toLocaleString("en-IN")} each
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)} 
                      className="px-3 py-1 hover:bg-gray-100 text-gray-600 transition"
                    >
                      −
                    </button>
                    <span className="px-3 py-1 font-medium min-w-[2.5rem] text-center">
                      {item.quantity || 1}
                    </span>
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)} 
                      className="px-3 py-1 hover:bg-gray-100 text-gray-600 transition"
                    >
                      +
                    </button>
                  </div>
                  <button 
                    onClick={() => removeItem(item.productId)} 
                    className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 transition"
                  >
                    <Trash2 className="w-4 h-4" /> Remove
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">
                  ₹{(((item.price ?? 0) * (item.quantity || 1))).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          ))}
          <button 
            onClick={() => { if (confirm("Are you sure you want to clear your cart?")) clearCart(); }} 
            className="text-sm text-gray-500 hover:text-red-600 transition underline"
          >
            Clear Cart
          </button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold mb-4 text-gray-900">Order Summary</h2>
            
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({safeTotalQuantity} items)</span>
                {/* ✅ Safe total amount display */}
                <span>₹{safeTotalAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">
                  {safeTotalAmount >= 999 ? "FREE" : "₹99"}
                </span>
              </div>
              {safeTotalAmount < 999 && (
                <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded">
                  Add ₹{(999 - safeTotalAmount).toLocaleString("en-IN")} more for FREE shipping!
                </p>
              )}
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900">Total</span>
                {/* ✅ Safe final total display */}
                <span className="text-2xl font-bold text-gray-900">
                  ₹{(safeTotalAmount >= 999 ? safeTotalAmount : safeTotalAmount + 99).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <button 
              onClick={() => router.push("/checkout")} 
              className="w-full bg-gray-900 text-white py-3 rounded-full font-medium hover:bg-gray-800 transition shadow-lg"
            >
              Proceed to Checkout
            </button>
            
            <Link 
              href="/collection" 
              className="block text-center mt-3 text-sm text-gray-600 hover:text-gray-900 transition"
            >
              or Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}