"use client";

import React, { use, useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/CartProvider";
import { ShoppingCart, ArrowLeft, Eye, CheckCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { subscribeToCollection } from "@/lib/firestoreService";
import { where } from "firebase/firestore";

export default function FishListingPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = use(params);
  const { addToCart } = useCart();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categoryNames: Record<string, string> = {
    monster: "Monster Fish Collection",
    exotic: "Exotic Fish Collection",
    normal: "Normal Fish Collection",
  };

  const categoryName = categoryNames[category] || "Fish Collection";

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Subscribe to products of this specific fish categoryType in real-time
    const unsubscribe = subscribeToCollection(
      "products",
      [where("categoryType", "==", category)],
      (list) => {
        setProducts(list);
        setLoading(false);
      },
      (err) => {
        console.error(`[FishListingPage] Subscription failed for categoryType "${category}":`, err);
        setError("Missing or insufficient permissions to fetch products.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [category]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg text-text">
        <Loader2 className="h-8 w-8 animate-spin text-accent-purple mb-2" />
        <span className="text-xs text-text-secondary font-black tracking-wider uppercase animate-pulse">
          Loading specimens catalog...
        </span>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-bg pt-28 pb-16 relative overflow-hidden transition-colors duration-300">
        {/* Undersea ambient design glows */}
        <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-cyan-950/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-[30%] left-[-10%] w-[350px] h-[350px] bg-cyan-500/5 rounded-full blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          {/* Back Navigation Button */}
          <Link
            href="/shop/fishes"
            className="mb-8 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-accent-purple transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-accent-purple rounded px-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Categories
          </Link>

          {/* Header Details */}
          <div className="mb-12">
            <span className="text-xs font-bold tracking-widest uppercase text-accent">Specimen Catalog</span>
            <h1 className="text-3xl md:text-4xl font-display font-black text-text mt-1 capitalize leading-tight">
              {categoryName}
            </h1>
            <p className="text-text-secondary text-xs md:text-sm mt-3 max-w-xl leading-relaxed font-normal">
              Premium quality aquatic life acclimated and certified for high-end aquariums. Browse our currently active database inventory.
            </p>
          </div>

          {/* Error alert */}
          {error ? (
            <div className="text-center py-12 rounded-3xl border border-border bg-card p-8 shadow-sm">
              <span className="text-3xl mb-4 block" role="img" aria-label="Shield warning">🛡️</span>
              <h3 className="text-lg font-bold text-text mb-1">Access Restrained</h3>
              <p className="text-sm text-text-secondary">{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 rounded-3xl border border-border bg-card p-8 shadow-sm">
              <span className="text-4xl mb-4 block" role="img" aria-label="Fish emoji">🐠</span>
              <h3 className="text-lg font-bold text-text mb-2">No specimens available</h3>
              <p className="text-sm text-text-secondary">We currently do not have any items listed in this category.</p>
            </div>
          ) : (
            /* Products Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product, index) => {
                const stock = product.quantity !== undefined ? product.quantity : (product.stock || 0);
                const hasStock = stock > 0;
                
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.08 }}
                    className="group luxury-card rounded-3xl overflow-hidden flex flex-col h-full bg-card border border-border hover:border-accent-purple/30 shadow-sm"
                  >
                    {/* Image frame */}
                    <div className="relative h-64 w-full overflow-hidden border-b border-border bg-card-secondary">
                      <Image
                        src={product.imageBase64 || product.image || ""}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 select-none"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        unoptimized
                      />
                      
                      {/* Stock status indicator badge */}
                      <div className="absolute top-4 left-4">
                        {hasStock ? (
                          <span className="px-2.5 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase bg-black/60 backdrop-blur-md text-emerald-400 border border-emerald-500/25 flex items-center gap-1 select-none">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            In Stock ({stock})
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase bg-black/60 backdrop-blur-md text-rose-400 border border-rose-500/25 select-none">
                            Out Of Stock
                          </span>
                        )}
                      </div>

                      {/* Care level badge */}
                      <div className="absolute top-4 right-4">
                        <span className="px-2.5 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase bg-black/60 backdrop-blur-md text-accent border border-accent/25 select-none">
                          {product.careLevel || "Easy"}
                        </span>
                      </div>
                    </div>

                    {/* Card Content body */}
                    <div className="p-6 flex flex-col flex-1 justify-between gap-5">
                      <div>
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="text-lg font-bold text-text group-hover:text-accent-purple transition-colors truncate pr-2" title={product.name}>
                            {product.name}
                          </h3>
                          <span className="text-base font-black text-accent-purple tracking-tight shrink-0">${product.price}</span>
                        </div>

                        {product.scientificName && (
                          <span className="text-[10px] italic text-text-secondary/80 font-medium block mb-3">
                            {product.scientificName}
                          </span>
                        )}

                        <p className="text-text-secondary text-xs leading-relaxed line-clamp-3 font-normal">
                          {product.description || "No descriptions registered for this specimen."}
                        </p>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-4 border-t border-border flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-[10px] font-semibold text-text-secondary select-none">
                          <CheckCircle className="w-3.5 h-3.5 text-accent-purple shrink-0" />
                          <span>Tank Recommendation: {product.tankSize || "50G+"}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          {/* Details Button */}
                          <Link
                            href={`/shop/product/${product.id}`}
                            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-border hover:border-accent-purple/35 text-center text-xs font-bold uppercase tracking-wider text-text hover:text-accent-purple hover:bg-card-secondary transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent-purple"
                          >
                            <Eye className="w-3.5 h-3.5 text-accent-purple" /> Details
                          </Link>
                          
                          {/* Quick Add Button */}
                          <button
                            onClick={() => addToCart(product)}
                            disabled={!hasStock}
                            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-center text-xs font-bold uppercase tracking-wider text-white shadow-[0_4px_12px_rgba(34,211,238,0.1)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none cursor-pointer disabled:cursor-not-allowed outline-none focus-visible:ring-2 focus-visible:ring-accent-purple"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" /> Add
                          </button>
                        </div>
                      </div>
                    </div>

                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
