// src/store/useCartStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  slug: string;
}

interface CartStore {
  items: CartItem[];
  totalQuantity: number;
  totalAmount: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  // ✅ New: Replace entire cart (used for DB sync)
  replaceCart: (items: CartItem[]) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalQuantity: 0,
      totalAmount: 0,

      addItem: (newItem) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.productId === newItem.productId);
          let newItems: CartItem[];
          if (existingItem) {
            newItems = state.items.map((item) =>
              item.productId === newItem.productId
                ? { ...item, quantity: item.quantity + newItem.quantity }
                : item
            );
          } else {
            newItems = [...state.items, newItem];
          }
          const newTotalQuantity = newItems.reduce((total, item) => total + item.quantity, 0);
          const newTotalAmount = newItems.reduce((total, item) => total + item.price * item.quantity, 0);
          return { items: newItems, totalQuantity: newTotalQuantity, totalAmount: newTotalAmount };
        });
      },

      removeItem: (id) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.productId !== id);
          const newTotalQuantity = newItems.reduce((total, item) => total + item.quantity, 0);
          const newTotalAmount = newItems.reduce((total, item) => total + item.price * item.quantity, 0);
          return { items: newItems, totalQuantity: newTotalQuantity, totalAmount: newTotalAmount };
        });
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          get().removeItem(id);
          return;
        }
        set((state) => {
          const newItems = state.items.map((item) =>
            item.productId === id ? { ...item, quantity } : item
          );
          const newTotalQuantity = newItems.reduce((total, item) => total + item.quantity, 0);
          const newTotalAmount = newItems.reduce((total, item) => total + item.price * item.quantity, 0);
          return { items: newItems, totalQuantity: newTotalQuantity, totalAmount: newTotalAmount };
        });
      },

      clearCart: () => set({ items: [], totalQuantity: 0, totalAmount: 0 }),

      // ✅ Replace entire cart & recalculate totals
      replaceCart: (items) => {
        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        set({ items, totalQuantity, totalAmount });
      },
    }),
    {
      name: 'saree-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);