"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart } from "./CartProvider";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function CartDrawer() {
  const { cartItems, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    setIsCartOpen(false);
    router.push("/shop/cart");
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.35, ease: "easeInOut" }}
              className="w-screen max-w-md border-l border-slate-200 bg-white shadow-xl flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-purple-650" />
                  <h2 className="text-lg font-display font-bold text-slate-900">Your Cart ({cartCount})</h2>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-slate-50/50">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <span className="text-4xl mb-4">🛒</span>
                    <p className="text-sm font-semibold text-slate-500">Your cart is empty.</p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="mt-4 text-xs font-bold uppercase tracking-widest text-purple-600 hover:underline cursor-pointer"
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-4 p-3 rounded-xl border border-slate-200 bg-white shadow-sm"
                    >
                      {/* Image */}
                      <div className="relative h-16 w-16 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-50">
                        <Image
                          src={item.product.imageBase64 || item.product.image || ""}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{item.product.name}</h4>
                        <p className="text-[10px] text-slate-500 capitalize mb-1">
                          {(item.product.categoryType || item.product.type || "").toLowerCase()} {item.product.category ? `/ ${item.product.category}` : ""}
                        </p>
                        <p className="text-xs font-bold text-purple-650">${item.product.price} each</p>
                      </div>

                      {/* Quantity Selector & Delete */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-0.5">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-semibold text-slate-900">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer Summary */}
              {cartItems.length > 0 && (
                <div className="p-6 border-t border-slate-200 bg-slate-50 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-bold text-slate-900 text-lg">${cartTotal}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Shipping and taxes calculated at checkout.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="py-3 px-4 rounded-xl border border-slate-200 hover:border-slate-300 text-center text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
                    >
                      Keep Browsing
                    </button>
                    <button
                      onClick={handleCheckout}
                      className="py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-center text-xs font-bold uppercase tracking-widest text-white shadow-sm hover:scale-[1.02] transition-all cursor-pointer"
                    >
                      View Cart
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
