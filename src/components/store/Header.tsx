// src/components/store/Header.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // ✅ Zustand automatically subscribes to localStorage changes
  const totalQuantity = useCartStore((state) => state.totalQuantity);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="text-2xl font-serif font-bold tracking-tight text-gray-900">
          Ethnic<span className="text-rose-600">Saree</span>
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/collection" className="text-sm font-medium hover:text-rose-600 transition">Shop All</Link>
          <Link href="/collection?gender=Women" className="text-sm font-medium hover:text-rose-600 transition">Women</Link>
          <Link href="/collection?gender=Men" className="text-sm font-medium hover:text-rose-600 transition">Men</Link>
          <Link href="/contact" className="text-sm font-medium hover:text-rose-600 transition">Contact</Link>
        </nav>
        
        {/* Right Side: Cart + Auth */}
        <div className="flex items-center gap-4">
          
          {/* Cart Icon with Badge */}
          <Link href="/cart" className="p-2 hover:bg-gray-100 rounded-full transition relative">
            <ShoppingCart className="w-5 h-5 text-gray-700" />
            
            {/* ✅ Badge shows cart count (updates automatically from localStorage) */}
            {totalQuantity > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border-2 border-white">
                {totalQuantity > 9 ? "9+" : totalQuantity}
              </span>
            )}
          </Link>
          
          {/* Clerk Auth */}
          <Show when="signed-in">
            <UserButton appearance={{ elements: { avatarBox: "w-8 h-8 ring-2 ring-white shadow-sm" } }} />
          </Show>
          
          <Show when="signed-out">
            <div className="flex items-center gap-2">
              <SignInButton mode="modal">
                <button className="text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition">Sign In</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="text-sm font-medium bg-gray-900 text-white px-4 py-1.5 rounded-full hover:bg-gray-800 transition shadow-sm">Sign Up</button>
              </SignUpButton>
            </div>
          </Show>
          
          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      
      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-white/95 backdrop-blur-sm">
          <div className="px-4 py-4 space-y-3">
            <Link href="/collection" className="block py-2 font-medium text-gray-700 hover:text-rose-600" onClick={() => setMobileOpen(false)}>Shop All</Link>
            <Link href="/collection?gender=Women" className="block py-2 font-medium text-gray-700 hover:text-rose-600" onClick={() => setMobileOpen(false)}>Women</Link>
            <Link href="/collection?gender=Men" className="block py-2 font-medium text-gray-700 hover:text-rose-600" onClick={() => setMobileOpen(false)}>Men</Link>
            <Link href="/contact" className="block py-2 font-medium text-gray-700 hover:text-rose-600" onClick={() => setMobileOpen(false)}>Contact</Link>
          </div>
        </div>
      )}
    </header>
  );
}