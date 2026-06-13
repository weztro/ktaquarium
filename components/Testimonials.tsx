"use client";

import React from "react";
import SafeImage from "@/components/SafeImage";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface TestimonialItem {
  name: string;
  role: string;
  avatar: string;
  comment: string;
  rating: number;
}

const testimonials: TestimonialItem[] = [
  {
    name: "Dr. Alexander Sterling",
    role: "Collector & Homeowner",
    avatar: "/avatars/avatar-1.jpg",
    comment: "K.T Aquarium turned my home study into a peaceful underwater haven. Their biological team's knowledge is unparalleled; the corals have doubled in size in just six months.",
    rating: 5,
  },
  {
    name: "Genevieve Vance",
    role: "Lead Architect, NV Design",
    avatar: "/avatars/avatar-2.jpg",
    comment: "We commissioned a 10-foot room divider tank for a corporate client. K.T Aquarium managed the plumbing engineering and glass installation flawlessly. Truly high-end custom service.",
    rating: 5,
  },
  {
    name: "Marcus Thorne",
    role: "Private Art Curator",
    avatar: "/avatars/avatar-3.jpg",
    comment: "The custom aquascaping layout they designed is a literal work of live art. From consultation to weekly water cleaning, their attention to detail is absolute.",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="relative py-24 md:py-32 bg-bg z-30">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-xs font-semibold tracking-widest uppercase text-cyan-500 dark:text-cyan-400">
            Client Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-extrabold text-text mt-3">
            What Our Collectors Say
          </h2>
          <p className="text-text-secondary mt-4 text-sm md:text-base">
            Read stories of how we bring peace, beauty, and biological wonders into high-end residential and corporate environments.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((test, index) => (
            <motion.div
              key={test.name}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="luxury-card p-8 rounded-2xl flex flex-col justify-between h-full"
            >
              <div>
                {/* Stars */}
                <div className="flex gap-1 mb-6 text-yellow-500">
                  {Array.from({ length: test.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-500" />
                  ))}
                </div>

                <p className="text-text-secondary text-sm md:text-base italic leading-relaxed mb-8">
                  &ldquo;{test.comment}&rdquo;
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-4 pt-4 border-t border-border">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-cyan-500/20 bg-card-secondary">
                  <SafeImage
                    src={test.avatar}
                    alt={test.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text leading-none">
                    {test.name}
                  </h4>
                  <span className="text-xs text-text-secondary/70 font-medium mt-1.5 block">
                    {test.role}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
