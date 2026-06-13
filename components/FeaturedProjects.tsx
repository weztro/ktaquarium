"use client";

import React from "react";
import SafeImage from "@/components/SafeImage";
import { motion } from "framer-motion";
import { ArrowUpRight, Scale, Droplets, Lightbulb } from "lucide-react";

interface ProjectItem {
  title: string;
  category: string;
  image: string;
  description: string;
  specs: {
    volume: string;
    type: string;
    lighting: string;
  };
}

const projects: ProjectItem[] = [
  {
    title: "The Penthouse Marine Wall",
    category: "Reef Tank",
    image: "/projects/reef-wall.jpg",
    description: "A breathtaking custom 1,200-gallon marine reef installation integrated as a room divider in a luxury penthouse overlooking the skyline.",
    specs: {
      volume: "1,200 Gallons",
      type: "Custom Marine Sump",
      lighting: "Premium Radion XR30 LED Array",
    },
  },
  {
    title: "Zen Forest Aquascape",
    category: "Planted Tank",
    image: "/projects/zen-forest.jpg",
    description: "Inspired by Japanese Ryoboku styling, featuring fossilized wood, dwarf hairgrass, and over 300 schooling neon tetras in a balanced ecosystem.",
    specs: {
      volume: "450 Gallons",
      type: "Planted Freshwater",
      lighting: "Bespoke Pendant LED Bar",
    },
  },
  {
    title: "The Corporate Coral Sump",
    category: "Marine Reef",
    image: "/projects/corporate-reef.jpg",
    description: "A striking architectural marine display in a high-tech lobby, featuring automated dosing, remote telemetry, and vibrant soft corals.",
    specs: {
      volume: "800 Gallons",
      type: "Remote Sump Filter",
      lighting: "SPS-Optimized Hybrid Array",
    },
  },
];

export default function FeaturedProjects() {
  return (
    <section id="showcase" className="relative py-24 md:py-32 bg-bg z-30">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-20">
          <div className="max-w-xl">
            <span className="text-xs font-semibold tracking-widest uppercase text-cyan-500 dark:text-cyan-400">
              Masterpieces in Glass
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-extrabold text-text mt-3">
              Featured Projects
            </h2>
          </div>
          <p className="text-text-secondary max-w-sm mt-4 md:mt-0 text-sm md:text-base">
            A selection of our custom engineered residential and commercial aquatic exhibits.
          </p>
        </div>

        {/* Projects List */}
        <div className="flex flex-col gap-24">
          {projects.map((project, index) => {
            const isEven = index % 2 === 0;

            return (
              <div
                key={project.title}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center"
              >
                {/* Text Content */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className={`lg:col-span-5 ${isEven ? "lg:order-1" : "lg:order-2"}`}
                >
                  <span className="text-xs font-bold tracking-widest uppercase text-cyan-500 dark:text-cyan-400">
                    {project.category}
                  </span>
                  
                  <h3 className="text-3xl md:text-4xl font-display font-bold text-text mt-3 mb-6">
                     {project.title}
                  </h3>
                  
                  <p className="text-text-secondary text-sm md:text-base leading-relaxed mb-8">
                    {project.description}
                  </p>

                  {/* Specifications Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-y border-border mb-8">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-text-secondary mb-1">
                        <Scale className="w-3.5 h-3.5 text-cyan-500" />
                        Volume
                      </div>
                      <span className="text-xs font-bold text-text">
                        {project.specs.volume}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-text-secondary mb-1">
                        <Droplets className="w-3.5 h-3.5 text-cyan-500" />
                        Filtration
                      </div>
                      <span className="text-xs font-bold text-text truncate block">
                        {project.specs.type}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-text-secondary mb-1">
                        <Lightbulb className="w-3.5 h-3.5 text-cyan-500" />
                        Lighting
                      </div>
                      <span className="text-xs font-bold text-text truncate block">
                        {project.specs.lighting}
                      </span>
                    </div>
                  </div>

                  <a
                    href="#contact"
                    className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-cyan-500 dark:text-cyan-400 hover:text-text transition-colors duration-300"
                  >
                    Discuss Custom Project
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </motion.div>

                {/* Image Showcase */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                  className={`lg:col-span-7 ${isEven ? "lg:order-2" : "lg:order-1"} relative rounded-3xl overflow-hidden aspect-[16/10] group`}
                >
                  {/* Subtle Glow Layer */}
                  <div className="absolute inset-0 z-0 bg-cyan-500/5 blur-xl group-hover:bg-cyan-500/10 transition-colors duration-500" />
                  
                  {/* Border Mask */}
                  <div className="absolute inset-0 border border-white/5 rounded-3xl z-20 pointer-events-none group-hover:border-cyan-400/20 transition-all duration-500" />
                  
                  {/* Project Image */}
                  <SafeImage
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover relative z-10 transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, 55vw"
                  />
                  
                  {/* Dark Vignette overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent z-15 pointer-events-none" />
                </motion.div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
