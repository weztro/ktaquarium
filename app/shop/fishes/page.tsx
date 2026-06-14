"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Info, Loader2 } from "lucide-react";
import { subscribeToCollection } from "@/lib/firestoreService";

interface Category {
  id: string;
  name: string;
  type: string;
}

const DEFAULT_CATEGORIES = [
  { id: "monster", name: "Monster Fish", type: "monster" },
  { id: "exotic", name: "Exotic Fish", type: "exotic" },
  { id: "normal", name: "Normal Fish", type: "normal" }
];

export default function FishesCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Default images, badges, and glows for the 3 main category types
  const categoryMeta: Record<string, { description: string; image: string; badge: string; glow: string }> = {
    monster: {
      description: "Apex predators and ancient freshwater giants. Ideal for massive showpiece aquariums. Includes Arowanas, Gars, and stingrays.",
      image: "https://images.unsplash.com/photo-1560275669-46c5a88d6a4c?w=800&auto=format&fit=crop&q=80",
      badge: "Prehistoric Giants",
      glow: "hover:shadow-[0_0_35px_rgba(34,211,238,0.08)] border-border hover:border-cyan-500/30 dark:hover:border-cyan-400/30",
    },
    exotic: {
      description: "Highly colorful, interactive, and premium specimen fish. Hand-selected for intense pigmentation. Includes Bettas, Flowerhorns, and Discus.",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80",
      badge: "Prized Specimens",
      glow: "hover:shadow-[0_0_35px_rgba(139,92,246,0.08)] border-border hover:border-purple-500/30 dark:hover:border-purple-400/30",
    },
    normal: {
      description: "Lively community species, perfect for active planted aquariums and peaceful reef tanks. Includes Goldfish, Guppies, and Platies.",
      image: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=800&auto=format&fit=crop&q=80",
      badge: "Community Starters",
      glow: "hover:shadow-[0_0_35px_rgba(236,72,153,0.08)] border-border hover:border-pink-500/30 dark:hover:border-pink-400/30",
    },
  };

  useEffect(() => {
    setLoading(true);

    // 1. Real-time categories listener
    const unsubscribeCats = subscribeToCollection(
      "categories",
      [],
      (list) => {
        if (list.length === 0) {
          // Fall back to default structure if DB collection is empty
          setCategories(DEFAULT_CATEGORIES);
        } else {
          // Normalize documents to ensure id/type format is standardized
          const formatted = list.map((c) => ({
            id: c.id || c.type || "",
            name: c.name || "",
            type: c.type || c.id || ""
          }));
          setCategories(formatted);
        }
      },
      (err) => {
        console.error("[FishesCategoryPage] Categories subscription failed:", err);
        setCategories(DEFAULT_CATEGORIES);
      }
    );

    // 2. Real-time products listener to calculate dynamic counts
    const unsubscribeProds = subscribeToCollection(
      "products",
      [],
      (list) => {
        setProducts(list);
        setLoading(false);
      },
      (err) => {
        console.error("[FishesCategoryPage] Products subscription failed:", err);
        setLoading(false);
      }
    );

    return () => {
      unsubscribeCats();
      unsubscribeProds();
    };
  }, []);

  const getCount = (categoryType: string) => {
    return products.filter((p) => p.categoryType === categoryType).length;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg text-text">
        <Loader2 className="h-8 w-8 animate-spin text-accent-purple mb-2" />
        <span className="text-xs text-text-secondary font-black tracking-wider uppercase animate-pulse">
          Loading aquatic records...
        </span>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-bg pt-28 pb-16 relative overflow-hidden flex flex-col items-center justify-center transition-colors duration-300">
        {/* Undersea ambient overlay glows */}
        <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-cyan-950/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-[30%] left-[-10%] w-[350px] h-[350px] bg-cyan-500/5 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[-10%] w-[350px] h-[350px] bg-purple-500/5 rounded-full blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full relative z-10">
          
          {/* Header Description */}
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-bold tracking-widest uppercase text-accent">Specimen Showroom</span>
            <h1 className="text-4xl md:text-5xl font-display font-black text-text mt-2 leading-tight">
              Fishes Categories
            </h1>
            <p className="text-text-secondary text-sm md:text-base mt-4 leading-relaxed font-normal">
              Explore our hand-selected freshwater specimens. All livestock undergo a strict quarantine and conditioning protocol before dispatch to ensure optimal acclimatization.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((cat, index) => {
              // Get details from our mapping metadata, fallback to generic if type is custom
              const meta = categoryMeta[cat.type] || {
                description: `Exotic selection of ${cat.name} aquatic specimen life.`,
                image: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=800&auto=format&fit=crop&q=80",
                badge: "Specimen Selection",
                glow: "hover:shadow-[0_0_35px_rgba(124,58,237,0.08)] border-border hover:border-accent-purple/30",
              };
              
              const count = getCount(cat.type);

              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="group flex flex-col h-full"
                >
                  <Link href={`/shop/fishes/${cat.type}`} className="flex flex-col h-full outline-none">
                    <div className={`flex-1 relative overflow-hidden rounded-3xl bg-card border ${meta.glow} transition-all duration-500 p-6 flex flex-col justify-between h-full shadow-sm`}>
                      
                      {/* Corner decorators for luxury styling */}
                      <div className="absolute top-0 left-0 w-5 h-5 border-t border-l border-border rounded-tl-3xl" />
                      <div className="absolute bottom-0 right-0 w-5 h-5 border-b border-r border-border rounded-br-3xl" />

                      <div>
                        {/* Image preview box */}
                        <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-6 border border-border shadow-inner">
                          <Image
                            src={meta.image}
                            alt={cat.name}
                            fill
                            className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105 select-none"
                            sizes="(max-width: 768px) 100vw, 33vw"
                            unoptimized
                          />
                          <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase bg-black/60 backdrop-blur-md border border-white/10 text-slate-200">
                            {meta.badge}
                          </div>
                        </div>

                        {/* Title and counts */}
                        <div className="flex justify-between items-baseline mb-2">
                          <h3 className="text-xl md:text-2xl font-display font-bold text-text group-hover:text-accent-purple transition-colors">
                            {cat.name}
                          </h3>
                          <span className="text-xs font-black text-text-secondary">
                            {count} item{count !== 1 ? "s" : ""}
                          </span>
                        </div>

                        <p className="text-text-secondary text-xs leading-relaxed mt-2 font-normal">
                          {meta.description}
                        </p>
                      </div>

                      {/* Bottom guarantees */}
                      <div className="mt-8 pt-4 border-t border-border flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-text-secondary group-hover:text-text transition-colors">
                        <span className="flex items-center gap-1.5 select-none">
                          <Info className="w-3.5 h-3.5 text-accent-purple shrink-0" />
                          14-Day Quarantine Guarantee
                        </span>
                        <span className="inline-flex items-center gap-1 text-accent-purple group-hover:underline">
                          Explore
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>

                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
