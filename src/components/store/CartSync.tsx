// src/components/store/CartSync.tsx
"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useCartStore } from "@/store/useCartStore";
import { getFullCart, syncUserCart, clearUserCart } from "@/server/actions.cart";

export default function CartSync() {
  const { isSignedIn, isLoaded } = useAuth();
  const { items, replaceCart } = useCartStore();
  
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncedRef = useRef<string>("");
  const hasInitializedRef = useRef(false);

  // 1️⃣ RESTORE CART ON LOGIN (Replace local with DB to fix doubling)
  useEffect(() => {
    if (!isLoaded || !isSignedIn || hasInitializedRef.current) return;

    const initCart = async () => {
      try {
        // Fetch full details from DB
        const { items: dbItems } = await getFullCart();
        
        if (dbItems.length > 0) {
          // Replace local cart entirely with DB data
          replaceCart(dbItems);
        }
        hasInitializedRef.current = true;
      } catch (err) {
        console.error("❌ Cart restore failed:", err);
      }
    };

    initCart();
  }, [isLoaded, isSignedIn, replaceCart]);

  // 2️⃣ SYNC CHANGES TO DB (Debounced)
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !hasInitializedRef.current) return;

    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);

    // Check if data actually changed to prevent loops
    const currentHash = JSON.stringify(items.map(i => ({ id: i.productId, qty: i.quantity })));
    if (currentHash === lastSyncedRef.current) return;

    syncTimerRef.current = setTimeout(async () => {
      await syncUserCart(items.map(i => ({ productId: i.productId, quantity: i.quantity })));
      lastSyncedRef.current = currentHash;
    }, 1000);

    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [items, isSignedIn, isLoaded]);

  // 3️⃣ CLEAR ON LOGOUT
  useEffect(() => {
    if (isLoaded && !isSignedIn && hasInitializedRef.current) {
      useCartStore.persist.clearStorage();
      replaceCart([]);
      clearUserCart();
      hasInitializedRef.current = false;
      lastSyncedRef.current = "";
    }
  }, [isSignedIn, isLoaded, replaceCart]);

  return null;
}