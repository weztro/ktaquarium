"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { mockProducts } from "@/lib/products";
import { ArrowRight, Info, ShieldAlert } from "lucide-react";

export default function FishesCategoriesPage() {
  const getCount = (cat: string) => {
    return mockProducts.filter((p) => p.type === "fish" && p.category === cat).length;
  };

  const fishCategories = [
    {
      id: "monster",
      name: "Monster Fish",
      description: "Apex predators and ancient freshwater giants. Ideal for massive showpiece aquariums. Includes Arowanas, Gars, and stingrays.",
      image: "https://images.unsplash.com/photo-1560275669-46c5a88d6a4c?w=800&auto=format&fit=crop&q=80",
      badge: "Prehistoric Giants",
      count: getCount("monster"),
      glow: "hover:shadow-[0_0_35px_rgba(34,211,238,0.08)] border-border hover:border-cyan-500/30 dark:hover:border-cyan-400/30",
    },
    {
      id: "exotic",
      name: "Exotic Fish",
      description: "Highly colorful, interactive, and premium specimen fish. Hand-selected for intense pigmentation. Includes Bettas, Flowerhorns, and Discus.",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80",
      badge: "Prized Specimens",
      count: getCount("exotic"),
      glow: "hover:shadow-[0_0_35px_rgba(139,92,246,0.08)] border-border hover:border-purple-500/30 dark:hover:border-purple-400/30",
    },
    {
      id: "normal",
      name: "Normal Fish",
      description: "Lively community species, perfect for active planted aquariums and peaceful reef tanks. Includes Goldfish, Guppies, and Platies.",
      image: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=800&auto=format&fit=crop&q=80",
      badge: "Community Starters",
      count: getCount("normal"),
      glow: "hover:shadow-[0_0_35px_rgba(236,72,153,0.08)] border-border hover:border-pink-500/30 dark:hover:border-pink-400/30",
    },
  ];

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-bg pt-28 pb-16 relative overflow-hidden flex flex-col items-center justify-center">
        {/* Undersea ambient design */}
        <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-cyan-950/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-[30%] left-[-10%] w-[350px] h-[350px] bg-cyan-500/5 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[-10%] w-[350px] h-[350px] bg-purple-500/5 rounded-full blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full relative z-10">
          {/* Header */}
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-semibold tracking-widest uppercase text-cyan-550 dark:text-cyan-400">Specimen Shop</span>
            <h1 className="text-4xl md:text-5xl font-display font-black text-text mt-2 leading-tight">
              Fishes Collections
            </h1>
            <p className="text-text-secondary text-sm md:text-base mt-4 leading-relaxed">
              Explore our hand-selected freshwater specimens. All livestock undergo a strict quarantine and conditioning protocol before dispatch.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {fishCategories.map((cat, index) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group flex flex-col h-full"
              >
                <Link href={`/shop/fishes/${cat.id}`} className="flex flex-col h-full">
                  <div className={`flex-1 relative overflow-hidden rounded-3xl bg-card border ${cat.glow} transition-all duration-500 p-6 flex flex-col justify-between h-full`}>
                    
                    {/* Corner decorators */}
                    <div className="absolute top-0 left-0 w-5 h-5 border-t border-l border-border rounded-tl-3xl" />
                    <div className="absolute bottom-0 right-0 w-5 h-5 border-b border-r border-border rounded-br-3xl" />

                    <div>
                      {/* Image background wrapper with zoom */}
                      <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-6 border border-border shadow-inner">
                        <Image
                          src={cat.image}
                          alt={cat.name}
                          fill
                          className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 33vw"
                          unoptimized
                        />
                        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase bg-black/60 border border-white/10 text-slate-200">
                          {cat.badge}
                        </div>
                      </div>

                      <div className="flex justify-between items-baseline mb-2">
                        <h3 className="text-xl md:text-2xl font-display font-bold text-text group-hover:text-cyan-505 dark:group-hover:text-cyan-400 transition-colors">
                          {cat.name}
                        </h3>
                        <span className="text-xs font-semibold text-text-secondary">
                          {cat.count} items
                        </span>
                      </div>

                      <p className="text-text-secondary text-xs leading-relaxed mt-2">
                        {cat.description}
                      </p>
                    </div>

                    <div className="mt-8 pt-4 border-t border-border flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-text-secondary group-hover:text-text transition-colors">
                      <span className="flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
                        14-day Quarantine Guarantee
                      </span>
                      <span className="inline-flex items-center gap-1 text-cyan-500 dark:text-cyan-400 group-hover:underline">
                        Explore
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>

                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
