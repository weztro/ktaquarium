"use client";

import React, { useState } from "react";
import SafeImage from "@/components/SafeImage";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn } from "lucide-react";

interface GalleryItem {
  id: number;
  category: "freshwater" | "marine" | "aquascaping" | "reef" | "monster" | "planted";
  categoryLabel: string;
  title: string;
  image: string;
}

const galleryData: GalleryItem[] = [
  {
    id: 1,
    category: "freshwater",
    categoryLabel: "Freshwater",
    title: "Symphony of Cichlids",
    image: "/gallery/freshwater-1.jpg",
  },
  {
    id: 2,
    category: "marine",
    categoryLabel: "Marine",
    title: "Deep Saltwater Blue",
    image: "/gallery/marine-1.jpg",
  },
  {
    id: 3,
    category: "aquascaping",
    categoryLabel: "Aquascaping",
    title: "Mountain Valley Meadow",
    image: "/gallery/aquascaping-1.jpg",
  },
  {
    id: 4,
    category: "reef",
    categoryLabel: "Reef",
    title: "Acropora Coral Garden",
    image: "/gallery/reef-1.jpg",
  },
  {
    id: 5,
    category: "monster",
    categoryLabel: "Monster Fish",
    title: "Silver Arowana Domain",
    image: "/gallery/monster-1.jpg",
  },
  {
    id: 6,
    category: "planted",
    categoryLabel: "Planted",
    title: "High-Tech Iwagumi Layout",
    image: "/gallery/planted-1.jpg",
  },
  {
    id: 7,
    category: "aquascaping",
    categoryLabel: "Aquascaping",
    title: "Bonsai Driftwood Forest",
    image: "/gallery/aquascaping-2.jpg",
  },
  {
    id: 8,
    category: "reef",
    categoryLabel: "Reef",
    title: "Fluorescent Coral Shelf",
    image: "/gallery/reef-2.jpg",
  },
  {
    id: 9,
    category: "freshwater",
    categoryLabel: "Freshwater",
    title: "Oranda Goldfish Sanctuary",
    image: "/gallery/freshwater-2.jpg",
  },
];

const filterOptions = [
  { value: "all", label: "All Layouts" },
  { value: "freshwater", label: "Freshwater" },
  { value: "marine", label: "Marine" },
  { value: "aquascaping", label: "Aquascaping" },
  { value: "reef", label: "Reef Tanks" },
  { value: "monster", label: "Monster Fish" },
  { value: "planted", label: "Planted" },
];

export default function Gallery() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredItems = activeFilter === "all"
    ? galleryData
    : galleryData.filter(item => item.category === activeFilter);

  return (
    <section id="gallery" className="relative py-24 md:py-32 bg-bg z-30">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold tracking-widest uppercase text-cyan-500 dark:text-cyan-400">
            Showroom Gallery
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-extrabold text-text mt-3">
            Luxury Aquarium Installations
          </h2>
          <p className="text-text-secondary mt-4 text-sm md:text-base">
            Witness the synthesis of architecture, engineering, and biological design across various categories.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap justify-center gap-3 mb-16 max-w-4xl mx-auto">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setActiveFilter(opt.value)}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 relative border ${
                activeFilter === opt.value
                  ? "text-cyan-500 dark:text-cyan-400 border-cyan-500/25 dark:border-cyan-400/25 bg-cyan-500/10 dark:bg-cyan-950/20 shadow-[0_0_15px_rgba(0,191,255,0.1)]"
                  : "text-text-secondary border-transparent hover:text-text"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Grid Container */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                key={item.id}
                className="group relative rounded-3xl overflow-hidden aspect-[4/3] bg-card border border-border cursor-pointer"
              >
                {/* Image */}
                <SafeImage
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Dark overlay & Hover Reveal */}
                <div className="absolute inset-0 bg-black/20 opacity-100 group-hover:bg-black/60 z-10 transition-all duration-500 flex flex-col justify-end p-6 md:p-8" />
                
                {/* Details */}
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 z-20 flex flex-col justify-end translate-y-3 group-hover:translate-y-0 transition-transform duration-500">
                  <span className="text-[9px] font-bold tracking-widest text-cyan-400 uppercase mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75">
                    {item.categoryLabel}
                  </span>
                  
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg md:text-xl font-display font-bold text-white leading-tight">
                      {item.title}
                    </h3>
                    <div className="p-2 rounded-full bg-cyan-500/20 dark:bg-cyan-950/60 border border-cyan-500/20 dark:border-cyan-500/10 text-cyan-600 dark:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <ZoomIn className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

      </div>
    </section>
  );
}
