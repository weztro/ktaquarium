"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/components/CartProvider";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ArrowLeft, ShieldCheck, CreditCard, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, cartCount, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      showToast("Please login or sign up to proceed to checkout.", "error");
      return;
    }

    setIsCheckingOut(true);
    try {
      const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      const orderRef = doc(db, "orders", orderId);

      const orderItems = cartItems.map(item => ({
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          categoryType: item.product.categoryType || item.product.type || "FISHES"
        },
        quantity: item.quantity
      }));

      const now = new Date().toISOString();
      await setDoc(orderRef, {
        id: orderId,
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email?.split("@")[0] || "Guest",
        items: orderItems,
        totalPrice: cartTotal,
        status: "Pending",
        createdAt: now,
        shippingAddress: "123 Marine Way, Aqua City",
      });

      clearCart();
      showToast("Order placed successfully! Redirecting to orders page.", "success");
      router.push("/admin/orders");
    } catch (err) {
      console.error("Order submission failed:", err);
      showToast("Failed to submit order. Please try again.", "error");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#F8FAFC] pt-28 pb-16 relative overflow-hidden flex flex-col items-center justify-center">
        {/* Ambient background decoration */}
        <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-cyan-100/30 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-[20%] left-[-10%] w-[350px] h-[350px] bg-cyan-500/5 rounded-full blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full relative z-10">
          {/* Header */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <Link
                href="/shop"
                className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500 hover:text-purple-600 transition-colors duration-300"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Showroom
              </Link>
              <h1 className="text-3xl md:text-4xl font-display font-black text-slate-900 mt-1">
                Your Shopping Cart
              </h1>
            </div>
            {cartItems.length > 0 && (
              <button
                onClick={clearCart}
                className="self-start md:self-end text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors cursor-pointer"
              >
                Clear All Items
              </button>
            )}
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-24 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <span className="text-5xl mb-4 block">🛒</span>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Your cart is currently empty</h2>
              <p className="text-sm text-slate-500 mb-6">Browse our categories to discover exotic species and premium hardware.</p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-sm"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            /* Cart Layout */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              
              {/* Items Table / List Column (8 cols) */}
              <div className="lg:col-span-8 space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-slate-300 transition-colors"
                  >
                    {/* Item Details */}
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="relative h-20 w-20 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-50">
                        <Image
                          src={item.product.imageBase64 || item.product.image || ""}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] uppercase tracking-widest font-bold text-purple-600">
                          {(item.product.categoryType || item.product.type || "").toLowerCase()} {item.product.category ? `/ ${item.product.category}` : ""}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 truncate max-w-[200px] sm:max-w-[280px]">
                          {item.product.name}
                        </h3>
                        <p className="text-xs font-bold text-slate-500 mt-1">${item.product.price} each</p>
                      </div>
                    </div>

                    {/* Quantity selectors & pricing */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                      
                      {/* Quantity handles */}
                      <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Total cost for this item */}
                      <div className="text-right min-w-[70px]">
                        <span className="text-sm font-bold text-slate-900">${item.product.price * item.quantity}</span>
                      </div>

                      {/* Remove item */}
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer p-1"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>

                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Checkout Column (4 cols) */}
              <div className="lg:col-span-4">
                <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm flex flex-col gap-6">
                  
                  <h3 className="text-lg font-display font-bold text-slate-900">Order Summary</h3>

                  <div className="space-y-3.5 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Total items</span>
                      <span className="font-semibold text-slate-900">{cartCount}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Insured livestock packing</span>
                      <span className="font-semibold text-emerald-600">FREE</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Shipping estimate</span>
                      <span className="font-semibold text-slate-900">Calculated at next step</span>
                    </div>
                    <div className="h-[1px] bg-slate-100 my-2" />
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Subtotal</span>
                      <span className="text-2xl font-black text-purple-600">${cartTotal}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3.5 mt-4">
                    <button
                      onClick={handleCheckout}
                      disabled={isCheckingOut || cartItems.length === 0}
                      className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-center text-xs font-bold uppercase tracking-widest text-white shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:scale-100"
                    >
                      {isCheckingOut ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 animate-pulse" /> Proceed To Checkout
                        </>
                      )}
                    </button>
                    <Link
                      href="/shop"
                      className="w-full py-4 px-6 rounded-2xl border border-slate-200 hover:border-slate-350 text-center text-xs font-bold uppercase tracking-widest text-slate-650 hover:text-slate-900 hover:bg-slate-50 transition-all"
                    >
                      Continue Shopping
                    </Link>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 tracking-wider uppercase text-center mt-2">
                    <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Quarantine Health Screen Certificate Included</span>
                  </div>

                </div>
              </div>

            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

// Dummy export to clean up trailing lines
