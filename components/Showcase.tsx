"use client";

import React, { useState } from "react";
import SafeImage from "@/components/SafeImage";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";

interface ShowcaseItem {
  title: string;
  subtitle: string;
  image: string;
  volume?: string;
  description: string;
}

const items: ShowcaseItem[] = [
  {
    title: "The Oceanic Cube",
    subtitle: "Marine Reef",
    image: "/showcase/oceanic-cube.jpg",
    volume: "350 Gallons",
    description: "An isolated cube showcase optimized for SPS corals, showcasing a 360-degree viewing experience with silent bottom-plumbed filtration.",
  },
  {
    title: "Primeval Mountain Valley",
    subtitle: "High-Tech Planted",
    image: "/showcase/primeval-valley.jpg",
    description: "Bespoke hardscaping using premium dragon stone cliffs, moss forest branches, and automated CO2 dosing to sustain high-growth plants.",
  },
  {
    title: "The Atoll Sump Exhibit",
    subtitle: "Apex Marine",
    image: "/showcase/atoll-reef.jpg",
    volume: "500 Gallons",
    description: "A wide, low-profile reef structure replicating natural shallow ocean atolls, allowing top-down viewing of corals and clams.",
  },
];

export default function Showcase() {
  const [scrollIndex, setScrollIndex] = useState(0);

  const slideLeft = () => {
    if (scrollIndex > 0) {
      setScrollIndex(scrollIndex - 1);
    }
  };

  const slideRight = () => {
    if (scrollIndex < items.length - 1) {
      setScrollIndex(scrollIndex + 1);
    }
  };

  return (
    <section className="relative py-24 md:py-32 bg-bg z-30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16">
          <div className="max-w-xl">
            <span className="text-xs font-semibold tracking-widest uppercase text-cyan-500 dark:text-cyan-400">
              Architectural Exhibits
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-extrabold text-text mt-3">
              Premium Aquarium Showcase
            </h2>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-6 md:mt-0">
            <button
              onClick={slideLeft}
              disabled={scrollIndex === 0}
              className={`p-3.5 rounded-full border border-border transition-all duration-300 ${
                scrollIndex === 0
                  ? "text-text-secondary/30 border-border/50 cursor-not-allowed"
                  : "text-text hover:text-cyan-500 dark:hover:text-cyan-400 hover:border-cyan-500/40 dark:hover:border-cyan-400/40 bg-card"
              }`}
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={slideRight}
              disabled={scrollIndex === items.length - 1}
              className={`p-3.5 rounded-full border border-border transition-all duration-300 ${
                scrollIndex === items.length - 1
                  ? "text-text-secondary/30 border-border/50 cursor-not-allowed"
                  : "text-text hover:text-cyan-500 dark:hover:text-cyan-400 hover:border-cyan-500/40 dark:hover:border-cyan-400/40 bg-card"
              }`}
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Draggable/Animated Track */}
        <div className="relative overflow-visible">
          <motion.div
            animate={{ x: `-${scrollIndex * 100}%` }}
            transition={{ type: "spring", damping: 25, stiffness: 80 }}
            className="flex gap-8 cursor-grab active:cursor-grabbing"
            style={{ width: `${items.length * 100}%` }}
          >
            {items.map((item) => (
              <div
                key={item.title}
                className="w-full flex-shrink-0"
                style={{ width: "calc(100% / 1)" }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  
                  {/* Large Image Card */}
                  <div className="lg:col-span-8 relative aspect-[16/9] rounded-3xl overflow-hidden group">
                    {/* Shadow border */}
                    <div className="absolute inset-0 border border-border rounded-3xl z-20 pointer-events-none group-hover:border-cyan-400/20 transition-all duration-500" />
                    
                    {/* Glow effect behind */}
                    <div className="absolute inset-0 bg-cyan-500/5 blur-xl group-hover:bg-cyan-500/10 transition-colors duration-500" />

                    <SafeImage
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover relative z-10 transition-transform duration-[1500ms] ease-out group-hover:scale-[1.04]"
                      sizes="(max-width: 1024px) 100vw, 70vw"
                    />

                    {/* Draggable indicator hint */}
                    <div className="absolute inset-0 bg-black/20 z-15 group-hover:bg-black/40 transition-colors duration-500 flex items-center justify-center">
                      <div className="p-4 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 text-white scale-0 group-hover:scale-100 transition-transform duration-500">
                        <Eye className="w-6 h-6 text-cyan-400" />
                      </div>
                    </div>
                  </div>

                  {/* Sidebar stats & info */}
                  <div className="lg:col-span-4 flex flex-col justify-center">
                    <span className="text-xs font-bold tracking-widest text-cyan-500 dark:text-cyan-400 uppercase">
                      {item.subtitle}
                    </span>
                    <h3 className="text-3xl font-display font-extrabold text-text mt-2 mb-4">
                      {item.title}
                    </h3>
                    <p className="text-text-secondary text-sm leading-relaxed mb-6">
                      {item.description}
                    </p>
                    
                    <div className="py-4 border-t border-border mt-2">
                      <span className="text-[10px] uppercase tracking-widest font-semibold text-text-secondary block mb-1">
                        System capacity
                      </span>
                      <span className="text-base font-bold text-text">
                        {item.volume ? item.volume : "Custom dimension"}
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </motion.div>
        </div>

      </div>
    </section>
  );
}
