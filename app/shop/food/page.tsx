"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { mockProducts } from "@/lib/products";
import { ArrowRight, Apple } from "lucide-react";

export default function FoodCategoriesPage() {
  const getCount = (cat: string) => {
    return mockProducts.filter((p) => p.type === "food" && p.category === cat).length;
  };

  const categories = [
    {
      id: "pellet",
      name: "Pellet Food",
      description: "Sinking and floating pellets packed with vitamins and minerals to foster rapid growth and coloration.",
      image: "https://images.unsplash.com/photo-1609142588383-8a3070b4317f?w=800&auto=format&fit=crop&q=80",
      count: getCount("pellet"),
    },
    {
      id: "flake",
      name: "Flake Food",
      description: "Classic tropical flakes featuring prebiotic immunity support, formulated to prevent tank clouding.",
      image: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=800&auto=format&fit=crop&q=80",
      count: getCount("flake"),
    },
    {
      id: "frozen",
      name: "Frozen Food",
      description: "Gamma-irradiated frozen bloodworms, brine shrimp, and mysis cubes. Enriched with natural amino acids.",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80",
      count: getCount("frozen"),
    },
    {
      id: "live",
      name: "Live Food",
      description: "Live cultured Daphnia, brine shrimp, and micro-worms to trigger organic predatory feeding instincts.",
      image: "https://images.unsplash.com/photo-1524704796725-9fc3044a58b2?w=800&auto=format&fit=crop&q=80",
      count: getCount("live"),
    },
    {
      id: "premium",
      name: "Premium Food",
      description: "Specialized Astaxanthin-rich krill flakes, beefheart blends, and organic raw mixes for prized show specimens.",
      image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80",
      count: getCount("premium"),
    },
  ];

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#020817] pt-28 pb-16 relative overflow-hidden flex flex-col items-center justify-center">
        {/* Ambient background decoration */}
        <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-cyan-950/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-[20%] left-[-10%] w-[350px] h-[350px] bg-cyan-500/5 rounded-full blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full relative z-10">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-semibold tracking-widest uppercase text-cyan-400">Specimen Nutrition</span>
            <h1 className="text-4xl md:text-5xl font-display font-black text-white mt-2 leading-tight">
              Fish Food Categories
            </h1>
            <p className="text-slate-400 text-sm md:text-base mt-4 leading-relaxed">
              Feed your aquatic pets with professional nutrient recipes. Specially formulated to optimize energy, immune response, and coloration.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat, index) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="group flex flex-col h-full"
              >
                <Link href={`/shop/food/${cat.id}`} className="flex flex-col h-full">
                  <div className="flex-1 relative overflow-hidden rounded-3xl bg-[#030B2A]/45 backdrop-blur-md border border-cyan-500/10 hover:border-cyan-500/30 hover:shadow-[0_0_35px_rgba(236,72,153,0.15)] transition-all duration-500 p-6 flex flex-col justify-between h-full">
                    
                    <div className="absolute top-0 left-0 w-5 h-5 border-t border-l border-white/10 rounded-tl-3xl" />
                    <div className="absolute bottom-0 right-0 w-5 h-5 border-b border-r border-white/10 rounded-br-3xl" />

                    <div>
                      {/* Image Preview */}
                      <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-6 border border-white/5 shadow-inner">
                        <Image
                          src={cat.image}
                          alt={cat.name}
                          fill
                          className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 33vw"
                          unoptimized
                        />
                      </div>

                      <div className="flex justify-between items-baseline mb-2">
                        <h3 className="text-xl font-display font-bold text-white group-hover:text-cyan-400 transition-colors">
                          {cat.name}
                        </h3>
                        <span className="text-xs font-semibold text-slate-400">
                          {cat.count} items
                        </span>
                      </div>

                      <p className="text-slate-400 text-xs leading-relaxed mt-2">
                        {cat.description}
                      </p>
                    </div>

                    <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">
                      <span className="flex items-center gap-1.5">
                        <Apple className="w-3.5 h-3.5 text-cyan-450" />
                        100% Organic Recipes
                      </span>
                      <span className="inline-flex items-center gap-1 text-cyan-400 group-hover:underline">
                        Explore Shop
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
