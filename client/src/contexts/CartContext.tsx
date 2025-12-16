import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { CartItemWithProduct, CartState } from "@/lib/types";

interface CartContextType extends CartState {
  addItem: (productId: string, quantity?: number, variantId?: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  isLoading: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const refreshCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/cart", { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
      }
    } catch {
      console.error("Failed to fetch cart");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = async (productId: string, quantity = 1, variantId?: string) => {
    const response = await fetch("/api/cart/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity, variantId }),
      credentials: "include",
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to add item");
    }
    
    await refreshCart();
    setIsOpen(true);
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    const response = await fetch(`/api/cart/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
      credentials: "include",
    });
    
    if (!response.ok) {
      throw new Error("Failed to update quantity");
    }
    
    await refreshCart();
  };

  const removeItem = async (itemId: string) => {
    const response = await fetch(`/api/cart/items/${itemId}`, {
      method: "DELETE",
      credentials: "include",
    });
    
    if (!response.ok) {
      throw new Error("Failed to remove item");
    }
    
    await refreshCart();
  };

  const clearCart = async () => {
    const response = await fetch("/api/cart", {
      method: "DELETE",
      credentials: "include",
    });
    
    if (!response.ok) {
      throw new Error("Failed to clear cart");
    }
    
    setItems([]);
  };

  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      subtotal,
      itemCount,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      refreshCart,
      isLoading,
      isOpen,
      setIsOpen,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
