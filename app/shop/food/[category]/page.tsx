"use client";

import React, { use } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/CartProvider";
import { getProductsByCategory } from "@/lib/products";
import { ShoppingCart, ArrowLeft, Eye } from "lucide-react";
import { motion } from "framer-motion";

export default function FoodListingPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = use(params);
  const products = getProductsByCategory("food", category);
  const { addToCart } = useCart();

  const categoryNames: Record<string, string> = {
    pellet: "Pellet Foods",
    flake: "Flake Foods",
    frozen: "Sterilized Frozen Foods",
    live: "Live Cultures",
    premium: "Premium Nutritional Blends",
  };

  const categoryName = categoryNames[category] || "Fish Food Catalog";

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#020817] pt-28 pb-16 relative overflow-hidden">
        {/* Ambient background decoration */}
        <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-cyan-950/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-[30%] left-[-10%] w-[350px] h-[350px] bg-cyan-500/5 rounded-full blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          {/* Back Link */}
          <Link
            href="/shop/food"
            className="mb-8 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-slate-400 hover:text-cyan-400 transition-colors duration-300"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Categories
          </Link>

          <div className="mb-12">
            <span className="text-xs font-semibold tracking-widest uppercase text-cyan-400">Specimen Nutrition</span>
            <h1 className="text-3xl md:text-4xl font-display font-black text-white mt-1 capitalize">
              {categoryName}
            </h1>
            <p className="text-slate-400 text-xs md:text-sm mt-3 max-w-xl leading-relaxed">
              Maintain active vitality and bright pigments. Enriched with natural ingredients and raw trace elements to support balanced development.
            </p>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20 rounded-3xl border border-white/5 bg-[#030B2A]/25 backdrop-blur-md p-8">
              <span className="text-4xl mb-4 block">🍂</span>
              <h3 className="text-lg font-bold text-white mb-2">No food items available</h3>
              <p className="text-sm text-slate-400">We currently do not have any items listed in this category.</p>
            </div>
          ) : (
            /* Product Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.08 }}
                  className="group luxury-card rounded-2xl overflow-hidden flex flex-col h-full bg-[#030B2A]/30 border border-cyan-500/5 hover:border-cyan-500/20 hover:shadow-[0_0_25px_rgba(236,72,153,0.05)]"
                >
                  {/* Image */}
                  <div className="relative h-64 w-full overflow-hidden border-b border-white/5 bg-slate-950">
                    <Image
                      src={product.image || ""}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      unoptimized
                    />
                                      {/* Stock badge */}
                    <div className="absolute top-4 left-4">
                      {(product.stock ?? 0) > 0 ? (
                        <span className="px-2.5 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/20">
                          {product.stock ?? 0} Available
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase bg-slate-950/80 backdrop-blur-md text-rose-400 border border-rose-500/20">
                          Out Of Stock
                        </span>
                      )}
                    </div>

                    {product.weight && (
                      <div className="absolute top-4 right-4">
                        <span className="px-2.5 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase bg-slate-950/80 backdrop-blur-md text-cyan-400 border border-cyan-500/20">
                          {product.weight}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Details */}
                  <div className="p-6 flex flex-col flex-1 justify-between gap-5">
                    <div>
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors truncate">
                          {product.name}
                        </h3>
                        <span className="text-base font-black text-cyan-400">${product.price}</span>
                      </div>

                      <p className="text-slate-400 text-xs leading-relaxed mt-4 line-clamp-3">
                        {product.description}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-4 border-t border-white/5 flex flex-col gap-2.5">
                      <div className="grid grid-cols-2 gap-3">
                        <Link
                          href={`/shop/product/${product.id}`}
                          className="flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl border border-white/5 hover:border-cyan-500/30 text-center text-xs font-bold uppercase tracking-wider text-slate-350 hover:text-white transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> Details
                        </Link>
                        <button
                          onClick={() => addToCart(product)}
                          disabled={(product.stock ?? 0) <= 0}
                          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-center text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_10px_rgba(34,211,238,0.1)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none cursor-pointer"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" /> Add
                        </button>
                      </div>
                    </div>
                  </div>

                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
