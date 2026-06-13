"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "@/lib/products";
import { useToast } from "./Toast";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const storedCart = localStorage.getItem("kt_aquarium_cart");
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (err) {
        console.error("Failed to parse cart data:", err);
      }
    }
  }, []);

  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    localStorage.setItem("kt_aquarium_cart", JSON.stringify(items));
  };

  const addToCart = (product: Product, quantity = 1) => {
    const existingIndex = cartItems.findIndex((item) => item.product.id === product.id);
    let newItems = [...cartItems];
    const availableStock = product.quantity ?? product.stock ?? 999;

    if (existingIndex > -1) {
      const newQty = newItems[existingIndex].quantity + quantity;
      if (newQty > availableStock) {
        showToast(`Cannot add more. Only ${availableStock} items in stock.`, "error");
        return;
      }
      newItems[existingIndex].quantity = newQty;
    } else {
      if (quantity > availableStock) {
        showToast(`Cannot add. Only ${availableStock} items in stock.`, "error");
        return;
      }
      newItems.push({ product, quantity });
    }

    saveCart(newItems);
    showToast(`${product.name} added to cart!`, "success");
  };

  const removeFromCart = (productId: string) => {
    const itemToRemove = cartItems.find((item) => item.product.id === productId);
    const newItems = cartItems.filter((item) => item.product.id !== productId);
    saveCart(newItems);
    if (itemToRemove) {
      showToast(`${itemToRemove.product.name} removed from cart.`, "info");
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const item = cartItems.find((item) => item.product.id === productId);
    if (item) {
      const availableStock = item.product.quantity ?? item.product.stock ?? 999;
      if (quantity > availableStock) {
        showToast(`Only ${availableStock} items in stock.`, "error");
        return;
      }
    }

    const newItems = cartItems.map((item) => {
      if (item.product.id === productId) {
        return { ...item, quantity };
      }
      return item;
    });
    saveCart(newItems);
  };

  const clearCart = () => {
    saveCart([]);
    showToast("Cart cleared.", "info");
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
