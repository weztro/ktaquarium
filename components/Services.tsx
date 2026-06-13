"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Compass, 
  Wrench, 
  Heart, 
  Droplet, 
  Hammer, 
  Sparkles,
  ArrowUpRight 
} from "lucide-react";

interface ServiceItem {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const servicesData: ServiceItem[] = [
  {
    title: "Custom Aquarium Design",
    description: "Tailored to align with your interior space, lighting, and acoustics. We create architectural masterpieces from raw glass and metal.",
    icon: Compass,
  },
  {
    title: "Aquarium Installation",
    description: "Flawless engineering and structure setup. We manage plumbing, custom filtration integrations, and silent pump mountings.",
    icon: Hammer,
  },
  {
    title: "Bespoke Aquascaping",
    description: "Creating natural underwater landscapes using exotic driftwood, dragon stone, premium soil, and rare aquatic plant life.",
    icon: Sparkles,
  },
  {
    title: "Scheduled Maintenance",
    description: "Worry-free preservation of your exhibit. We clean algae, maintain filtration flow, prune plants, and perform water changes.",
    icon: Wrench,
  },
  {
    title: "Fish Health Care",
    description: "Professional biological monitoring. We diagnose parasites, manage quarantine systems, and supply optimal specialized diets.",
    icon: Heart,
  },
  {
    title: "Water Quality Management",
    description: "Scientific monitoring of chemical levels. We adjust pH, GH, KH, salinity, ammonia, nitrites, and nitrates using lab-grade testing.",
    icon: Droplet,
  },
];

export default function Services() {
  return (
    <section id="services" className="relative py-24 md:py-32 bg-bg z-30">
      {/* Background glow overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(139,92,246,0.05)_0%,transparent_50%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Left Column: Text Content */}
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <span className="text-xs font-semibold tracking-widest uppercase text-cyan-500 dark:text-cyan-400">
              Elite Aquatic Services
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-extrabold text-text mt-3 leading-tight">
              Bespoke Maintenance & Architectural Setup
            </h2>
            <p className="text-text-secondary mt-6 leading-relaxed text-sm md:text-base">
              At K.T Aquarium, we believe aquariums are live, breathing works of fine art. Our engineers, biologists, and aquascapers ensure your underwater showroom remains a pristine, healthy environment for decades.
            </p>
            <p className="text-text-secondary/70 mt-4 leading-relaxed text-sm">
              We offer comprehensive residential and commercial services, including automated dosing controls and custom cabinet design matching high-end furniture aesthetics.
            </p>
            
            <div className="mt-10">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 group text-sm font-semibold tracking-widest uppercase text-cyan-500 dark:text-cyan-400 hover:text-text transition-colors duration-300"
              >
                Inquire About Services
                <span className="p-2.5 rounded-full bg-cyan-500/10 dark:bg-cyan-950/40 border border-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </a>
            </div>
          </div>

          {/* Right Column: Grid of Service Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {servicesData.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="luxury-card p-6 md:p-8 rounded-2xl flex flex-col justify-between"
                >
                  <div>
                    {/* Icon Container with Glow */}
                    <div className="relative w-12 h-12 rounded-xl flex items-center justify-center bg-cyan-500/10 dark:bg-cyan-950/30 border border-cyan-500/20 text-cyan-500 dark:text-cyan-400 mb-6 transition-colors">
                      <div className="absolute inset-0 rounded-xl bg-cyan-500/5 blur-md" />
                      <Icon className="w-6 h-6 relative z-10" />
                    </div>

                    <h3 className="text-lg md:text-xl font-display font-bold text-text mb-3">
                      {service.title}
                    </h3>
                    <p className="text-text-secondary text-xs md:text-sm leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
