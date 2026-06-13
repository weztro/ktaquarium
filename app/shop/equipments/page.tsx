"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { mockProducts } from "@/lib/products";
import { ArrowRight, Settings } from "lucide-react";

export default function EquipmentsCategoriesPage() {
  const getCount = (cat: string) => {
    return mockProducts.filter((p) => p.type === "equipment" && p.category === cat).length;
  };

  const categories = [
    {
      id: "tanks",
      name: "Aquarium Tanks",
      description: "Low-iron, ultra-clear glass tanks with 45-degree mitered joints for seamless optical clearance.",
      image: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=800&auto=format&fit=crop&q=80",
      count: getCount("tanks"),
    },
    {
      id: "filters",
      name: "Filters",
      description: "High-performance canister filters and multi-stage biological filtration modules for crystal water.",
      image: "https://images.unsplash.com/photo-1508962914676-134849a727f0?w=800&auto=format&fit=crop&q=80",
      count: getCount("filters"),
    },
    {
      id: "pumps",
      name: "Air Pumps",
      description: "Shatterproof dual-outlet air pumps engineered for heavy-duty oxygenation with whisper-quiet acoustics.",
      image: "https://images.unsplash.com/photo-1524704654690-b56c05c78a02?w=800&auto=format&fit=crop&q=80",
      count: getCount("pumps"),
    },
    {
      id: "lights",
      name: "Lights",
      description: "Smart Bluetooth WRGB LED light fixtures optimized for rich plant photosynthesis and intense fish glow.",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80",
      count: getCount("lights"),
    },
    {
      id: "heaters",
      name: "Heaters",
      description: "Heavy-duty titanium heaters with electronic thermostats for exact temperature control.",
      image: "https://images.unsplash.com/photo-1571752726101-9f77cf66427d?w=800&auto=format&fit=crop&q=80",
      count: getCount("heaters"),
    },
    {
      id: "accessories",
      name: "Accessories",
      description: "Medical-grade stainless steel tweezers, scissors, cleaning magnets, and aquascaping essentials.",
      image: "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?w=800&auto=format&fit=crop&q=80",
      count: getCount("accessories"),
    },
  ];

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-bg pt-28 pb-16 relative overflow-hidden flex flex-col items-center justify-center">
        {/* Ambient design */}
        <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-cyan-950/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-[30%] right-[-10%] w-[350px] h-[350px] bg-purple-500/5 rounded-full blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full relative z-10">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-semibold tracking-widest uppercase text-cyan-500 dark:text-cyan-400">Hardware & Filtration</span>
            <h1 className="text-4xl md:text-5xl font-display font-black text-text mt-2 leading-tight">
              Equipments Categories
            </h1>
            <p className="text-text-secondary text-sm md:text-base mt-4 leading-relaxed">
              Equip your custom layout with industry-standard hardware. Sourced from globally-recognized brands for maximum reliability and stability.
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
                <Link href={`/shop/equipments/${cat.id}`} className="flex flex-col h-full">
                  <div className="flex-1 relative overflow-hidden rounded-3xl bg-card border border-border hover:border-cyan-500/35 dark:hover:border-cyan-400/35 hover:shadow-[0_0_35px_rgba(34,211,238,0.08)] transition-all duration-500 p-6 flex flex-col justify-between h-full">
                    
                    <div className="absolute top-0 left-0 w-5 h-5 border-t border-l border-border rounded-tl-3xl" />
                    <div className="absolute bottom-0 right-0 w-5 h-5 border-b border-r border-border rounded-br-3xl" />

                    <div>
                      {/* Image Preview */}
                      <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-6 border border-border shadow-inner">
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
                        <h3 className="text-xl font-display font-bold text-text group-hover:text-cyan-505 dark:group-hover:text-cyan-400 transition-colors">
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
                      <span className="flex items-center gap-1.5">
                        <Settings className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
                        Professional Grade
                      </span>
                      <span className="inline-flex items-center gap-1 text-cyan-500 dark:text-cyan-400 group-hover:underline">
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
