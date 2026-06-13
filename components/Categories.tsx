"use client";

import React from "react";
import SafeImage from "@/components/SafeImage";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

interface CategoryItem {
  title: string;
  image: string;
  description: string;
  tag: string;
}

const categories: CategoryItem[] = [
  {
    title: "Freshwater Tanks",
    image: "/categories/freshwater.jpg",
    description: "Serene setups featuring natural river rocks, community school fish, and clear freshwater flow.",
    tag: "Calm & Natural",
  },
  {
    title: "Marine Environments",
    image: "/categories/marine.jpg",
    description: "Vibrant saltwater setups mimicking coastal tides, featuring clownfish, tangs, and invertebrates.",
    tag: "Vibrant Saltwater",
  },
  {
    title: "Coral Reef Exhibits",
    image: "/categories/reef.jpg",
    description: "Ultra-premium ecosystems focusing on hard and soft corals (SPS/LPS) requiring exact chemical tuning.",
    tag: "Live Ecosystems",
  },
  {
    title: "Planted Dutch Styles",
    image: "/categories/planted.jpg",
    description: "Bespoke underwater gardens utilizing carbon dioxide dosing and high-PAR LED lighting.",
    tag: "Nature Aquariums",
  },
  {
    title: "Monster Fish Tanks",
    image: "/categories/monster.jpg",
    description: "Robust glass panels hosting apex predators like Arowanas, Oscars, and large cichlid species.",
    tag: "Apex Species",
  },
  {
    title: "Custom Luxury Designs",
    image: "/categories/custom.jpg",
    description: "Architecturally integrated custom designs made of pure low-iron optiwhite glass.",
    tag: "Elite Commissions",
  },
];

export default function Categories() {
  return (
    <section className="relative py-24 md:py-32 bg-bg z-30">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-xs font-semibold tracking-widest uppercase text-cyan-500 dark:text-cyan-400">
            Infinite Configurations
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-extrabold text-text mt-3">
            Aquarium Categories
          </h2>
          <p className="text-text-secondary mt-4 text-sm md:text-base">
            Choose from our specialized environments, each tailored, engineered, and stocked to order.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="relative group rounded-3xl overflow-hidden aspect-[4/3] bg-card border border-border cursor-pointer"
            >
              {/* Image */}
              <SafeImage
                src={cat.image}
                alt={cat.title}
                fill
                className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.04]"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />

              {/* Gradient Mask */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 z-10 transition-opacity group-hover:opacity-90" />

              {/* Card Contents */}
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end z-20">
                <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase mb-2">
                  {cat.tag}
                </span>
                
                <h3 className="text-xl md:text-2xl font-display font-bold text-white mb-2 flex items-center gap-2 justify-between">
                  {cat.title}
                  <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                </h3>
                
                {/* Description - reveals on hover/active */}
                <p className="text-slate-300 text-xs md:text-sm leading-relaxed max-h-0 opacity-0 group-hover:max-h-24 group-hover:opacity-100 transition-all duration-700 ease-in-out overflow-hidden mt-1">
                  {cat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
