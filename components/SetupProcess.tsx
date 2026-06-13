"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { MessageSquare, Layers, Wrench, Shield } from "lucide-react";

interface ProcessStep {
  number: string;
  title: string;
  description: string;
  details: string[];
  icon: React.ComponentType<{ className?: string }>;
}

const steps: ProcessStep[] = [
  {
    number: "01",
    title: "Detailed Consultation",
    description: "We assess your physical space, lighting, structural loading capacity, and overall aesthetic vision.",
    details: [
      "On-site space and dimensions measurement",
      "Structural floor weight-load verification",
      "Aesthetic alignment with home interior",
      "Fish and flora preferences cataloging",
    ],
    icon: MessageSquare,
  },
  {
    number: "02",
    title: "Bespoke 3D Design",
    description: "Our aquascapers and design team draft 3D architectural renders of your aquarium and cabinet structure.",
    details: [
      "Custom 3D CAD modeling of the glass structure",
      "Bespoke layout design for hardscape and wood placement",
      "Filtration flow and plumbing schematics design",
      "Detailed specimen catalog blueprinting",
    ],
    icon: Layers,
  },
  {
    number: "03",
    title: "Professional Installation",
    description: "Our engineering team installs the setup, configures the water parameters, and plants the hardscape elements.",
    details: [
      "Glass placement, leveling, and structural sealing",
      "Silent pump plumbing and custom sump installation",
      "Hardscape setup, soil laying, and plant layout",
      "Initial chemical balance and water cycling monitoring",
    ],
    icon: Shield,
  },
  {
    number: "04",
    title: "Scheduled Maintenance Support",
    description: "We transition the tank into stability. Our team conducts routine health checks, pruning, and water tuning.",
    details: [
      "Weekly water parameters tuning (pH, GH, KH)",
      "Automated lighting and dosing calibration",
      "Plant trimming and detailed algae control",
      "Ongoing marine veterinary support",
    ],
    icon: Wrench,
  },
];

export default function SetupProcess() {
  const containerRef = useRef<HTMLDivElement>(null);

  // We can track scroll progress inside the process section to animate the line height
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="process" ref={containerRef} className="relative py-24 md:py-32 bg-bg z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20 md:mb-24">
          <span className="text-xs font-semibold tracking-widest uppercase text-cyan-500 dark:text-cyan-400">
            Vision To Reality
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-extrabold text-text mt-3">
            Our Aquarium Setup Process
          </h2>
          <p className="text-text-secondary mt-4 text-sm md:text-base">
            How we translate your conceptual ideas into a thriving, self-sustaining luxury underwater masterpiece.
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative mt-16 max-w-5xl mx-auto">
          
          {/* Timeline Center Line (Desktop Only) */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-border hidden md:block">
            <motion.div
              style={{ height: lineHeight }}
              className="absolute top-0 left-0 w-full timeline-line origin-top"
            />
          </div>

          {/* Timeline Mobile Line (Mobile Only) */}
          <div className="absolute left-[15px] top-0 bottom-0 w-[2px] bg-border md:hidden">
            <motion.div
              style={{ height: lineHeight }}
              className="absolute top-0 left-0 w-full timeline-line origin-top"
            />
          </div>

          {/* Steps List */}
          <div className="flex flex-col gap-12 md:gap-16">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;

              return (
                <div
                  key={step.number}
                  className="relative flex flex-col md:flex-row items-stretch w-full"
                >
                  {/* Desktop Timeline Node Point */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-8 w-6 h-6 rounded-full bg-bg border-2 border-border hidden md:flex items-center justify-center z-10">
                    <motion.div 
                      initial={{ scale: 0.8 }}
                      whileInView={{ scale: [0.8, 1.2, 0.8] }}
                      viewport={{ once: true }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2.5 h-2.5 rounded-full bg-cyan-400" 
                    />
                  </div>

                  {/* Mobile Timeline Node Point */}
                  <div className="absolute left-[3px] top-8 w-6 h-6 rounded-full bg-bg border-2 border-border md:hidden flex items-center justify-center z-10">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  </div>

                  {/* Left Side Spacer/Content */}
                  <div className={`w-full md:w-1/2 pl-8 md:pl-0 md:pr-12 md:text-right flex flex-col justify-center ${
                    isEven ? "md:order-1" : "md:order-2 md:pl-12 md:text-left"
                  }`}>
                    <motion.div
                      initial={{ opacity: 0, x: isEven ? -25 : 25 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-150px" }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <span className="text-3xl md:text-4xl font-display font-extrabold text-slate-300 dark:text-slate-800 tracking-tight leading-none block mb-1">
                        Phase {step.number}
                      </span>
                      <h3 className={`text-xl md:text-2xl font-display font-bold text-text mb-3 flex items-center gap-3 justify-start ${
                        isEven ? "md:justify-end" : "md:justify-start"
                      }`}>
                        {!isEven && <Icon className="w-5 h-5 text-cyan-400 md:hidden" />}
                        {step.title}
                        {isEven && <Icon className="w-5 h-5 text-cyan-400 md:hidden" />}
                      </h3>
                      <p className={`text-text-secondary text-sm md:text-base leading-relaxed max-w-md ${
                        isEven ? "md:ml-auto md:mr-0" : "md:ml-0 md:mr-auto"
                      }`}>
                        {step.description}
                      </p>
                    </motion.div>
                  </div>

                  {/* Right Side Content/Spacer (Detailed Card) */}
                  <div className={`w-full md:w-1/2 pl-8 md:pl-12 flex flex-col justify-center ${
                    isEven ? "md:order-2" : "md:order-1 md:pr-12 md:pl-0"
                  }`}>
                    <motion.div
                      initial={{ opacity: 0, x: isEven ? 25 : -25 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-150px" }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="luxury-card p-4 sm:p-6 md:p-8 rounded-2xl text-left"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-cyan-500/10 dark:bg-cyan-950/30 border border-cyan-500/20 text-cyan-500 dark:text-cyan-400">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold tracking-wider text-text-secondary uppercase">
                          Deliverables
                        </span>
                      </div>
                      
                      <ul className="space-y-2.5 text-xs md:text-sm text-text-secondary">
                        {step.details.map((detail, dIdx) => (
                          <li key={dIdx} className="flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 mt-2 shrink-0" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
