// src/components/store/AddToCartButton.tsx
"use client";

import { useCartStore, type CartItem } from "@/store/useCartStore";
import { useState } from "react";
import { Check, ShoppingCart, Lock } from "lucide-react";
import { SignInButton, useAuth } from "@clerk/nextjs";

interface AddToCartButtonProps {
  product: {
    _id: string;
    title: string;
    price: number;
    images: string[];
    slug: string;
    stock: number;
  };
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCartStore();
  const { isSignedIn } = useAuth();
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (!isSignedIn) return;
    setIsAdding(true);
    
    const itemToAdd: CartItem = {
      productId: product._id,
      title: product.title,
      price: product.price,
      quantity: 1,
      image: product.images[0],
      slug: product.slug,
    };

    addItem(itemToAdd);
    setTimeout(() => setIsAdding(false), 2000);
  };

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <button className="flex items-center justify-center w-full gap-2 h-12 px-6 rounded-xl font-medium text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition cursor-pointer" type="button">
          <Lock className="w-5 h-5" /> Sign In to Add to Cart
        </button>
      </SignInButton>
    );
  }

  return (
    <button
      onClick={handleAdd}
      disabled={isAdding || product.stock === 0}
      className={`flex items-center justify-center w-full gap-2 h-12 px-6 rounded-xl font-medium text-sm transition-all
        ${product.stock === 0 
          ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
          : isAdding 
            ? "bg-green-600 text-white" 
            : "bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98]"
        }
      `}
    >
      {isAdding ? (
        <><Check className="w-5 h-5" /> Added!</>
      ) : product.stock > 0 ? (
        <><ShoppingCart className="w-5 h-5" /> Add to Cart</>
      ) : (
        "Out of Stock"
      )}
    </button>
  );
}