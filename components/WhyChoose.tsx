"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Heart, 
  PenTool, 
  Cpu, 
  Clock, 
  Coins 
} from "lucide-react";

interface FeatureItem {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const features: FeatureItem[] = [
  {
    title: "Expert Biological Team",
    description: "Our staff includes certified marine biologists and seasoned aquascapers who understand aquatic chemistry and behavior.",
    icon: Users,
  },
  {
    title: "Vetted Healthy Specimen",
    description: "Every fish is quarantined for 14 days and treated proactively. We only sell active, disease-free specimens.",
    icon: Heart,
  },
  {
    title: "Custom Tailored Designs",
    description: "We don't do pre-made molds. Each aquarium is custom designed to perfectly blend with your interior architecture.",
    icon: PenTool,
  },
  {
    title: "Premium Engineering",
    description: "We utilize low-iron glass, silent double-bearing pumps, and state-of-the-art biological sump filtration.",
    icon: Cpu,
  },
  {
    title: "24/7 Emergency Support",
    description: "Continuous telemetry and physical response systems. We monitor water parameters remotely and respond to anomalies.",
    icon: Clock,
  },
  {
    title: "Fair Value Pricing",
    description: "Luxury quality does not mean over-inflated quotes. We provide clear, itemized budgets for every project.",
    icon: Coins,
  },
];

export default function WhyChoose() {
  return (
    <section className="relative py-24 md:py-32 bg-bg z-30">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-20">
          <div className="max-w-xl">
            <span className="text-xs font-semibold tracking-widest uppercase text-cyan-500 dark:text-cyan-400">
              The K.T Advantage
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-extrabold text-text mt-3">
              Why Choose K.T Aquarium
            </h2>
          </div>
          <p className="text-text-secondary max-w-sm mt-4 md:mt-0 text-sm md:text-base">
            We combine biological expertise with engineering precision to deliver a premium aquarium experience.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="luxury-card p-6 md:p-8 rounded-2xl"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-cyan-500/10 dark:bg-cyan-950/20 border border-cyan-500/20 text-cyan-500 dark:text-cyan-400 mb-6">
                  <Icon className="w-5 h-5" />
                </div>

                <h3 className="text-lg md:text-xl font-display font-bold text-text mb-2">
                  {feature.title}
                </h3>
                
                <p className="text-text-secondary text-xs md:text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
