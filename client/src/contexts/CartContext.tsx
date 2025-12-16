import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { CartItemWithProduct, CartState } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";

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
      const response = await apiRequest("GET", "/api/cart");
      const data = await response.json();
      setItems(data.items || []);
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
    const response = await apiRequest("POST", "/api/cart/items", { productId, quantity, variantId });
    
    const data = await response.json();
    setItems(data.items || []);
    setIsOpen(true);
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    const response = await apiRequest("PATCH", `/api/cart/items/${itemId}`, { quantity });
    const data = await response.json();
    setItems(data.items || []);
  };

  const removeItem = async (itemId: string) => {
    const response = await apiRequest("DELETE", `/api/cart/items/${itemId}`);
    const data = await response.json();
    setItems(data.items || []);
  };

  const clearCart = async () => {
    const response = await apiRequest("DELETE", "/api/cart");
    const data = await response.json();
    setItems(data.items || []);
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
