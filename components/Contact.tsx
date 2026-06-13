"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Phone, MessageCircle, Mail, MapPin, Send, Check } from "lucide-react";

export default function Contact() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    service: "consultation",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormState({ name: "", email: "", service: "consultation", message: "" });
    }, 1500);
  };

  return (
    <section id="contact" className="relative py-24 md:py-32 bg-bg z-30">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_60%,rgba(0,191,255,0.03)_0%,transparent_50%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Left Column: Contact Details */}
          <div className="lg:col-span-5">
            <span className="text-xs font-semibold tracking-widest uppercase text-cyan-500 dark:text-cyan-400">
              Get In Touch
            </span>
            
            <h2 className="text-4xl md:text-5xl font-display font-extrabold text-text mt-3 mb-6 leading-tight">
              Build Your Dream Aquarium Today
            </h2>
            
            <p className="text-text-secondary text-sm md:text-base leading-relaxed mb-10">
              Schedule an on-site consultation with our senior aquascaping designer. We install worldwide and provide customized biological and structural plans.
            </p>

            <div className="space-y-6">
              {/* Phone */}
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-lg flex items-center justify-center bg-cyan-500/10 dark:bg-cyan-950/30 border border-cyan-500/20 text-cyan-500 dark:text-cyan-400">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-text-secondary block">
                    Phone Support
                  </span>
                  <a href="tel:+18005550199" className="text-sm font-bold text-text hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">
                    +1 (800) 555-0199
                  </a>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-lg flex items-center justify-center bg-cyan-500/10 dark:bg-cyan-950/30 border border-cyan-500/20 text-cyan-500 dark:text-cyan-400">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-text-secondary block">
                    WhatsApp Chat
                  </span>
                  <a href="https://wa.me/18005550199" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-text hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">
                    +1 (800) 555-0199
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-lg flex items-center justify-center bg-cyan-500/10 dark:bg-cyan-950/30 border border-cyan-500/20 text-cyan-500 dark:text-cyan-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-text-secondary block">
                    Direct Email
                  </span>
                  <a href="mailto:showroom@ktaquarium.com" className="text-sm font-bold text-text hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">
                    showroom@ktaquarium.com
                  </a>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-lg flex items-center justify-center bg-cyan-500/10 dark:bg-cyan-950/30 border border-cyan-500/20 text-cyan-500 dark:text-cyan-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-text-secondary block">
                    Luxury Showroom
                  </span>
                  <span className="text-sm font-bold text-text">
                    742 Marine Drive, Suite 100, Coral Gables, FL
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="luxury-card p-8 md:p-10 rounded-3xl relative"
            >
              <h3 className="text-xl md:text-2xl font-display font-bold text-text mb-6">
                Consultation Request
              </h3>

              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center text-cyan-500 dark:text-cyan-400"
                >
                  <div className="w-14 h-14 rounded-full bg-cyan-500/10 dark:bg-cyan-950/40 border border-cyan-500/20 dark:border-cyan-400/30 flex items-center justify-center text-cyan-500 dark:text-cyan-400 mb-4 shadow-[0_0_15px_rgba(0,191,255,0.25)]">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-text mb-2">Request Received</h4>
                  <p className="text-text-secondary text-sm max-w-sm">
                    Our luxury design coordinator will contact you via email within 24 hours to schedule your space review.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-semibold text-text-secondary block mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      placeholder="Alexander Sterling"
                      className="w-full px-5 py-3.5 rounded-xl text-sm bg-card-secondary border border-border focus:border-cyan-500 text-text placeholder-text-secondary/50 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-semibold text-text-secondary block mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      placeholder="alexander@sterlingholdings.com"
                      className="w-full px-5 py-3.5 rounded-xl text-sm bg-card-secondary border border-border focus:border-cyan-500 text-text placeholder-text-secondary/50 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Service */}
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-semibold text-text-secondary block mb-2">
                      Interested In
                    </label>
                    <select
                      value={formState.service}
                      onChange={(e) => setFormState({ ...formState, service: e.target.value })}
                      className="w-full px-5 py-3.5 rounded-xl text-sm bg-card-secondary border border-border focus:border-cyan-500 text-text focus:outline-none transition-colors"
                    >
                      <option value="consultation" className="bg-card text-text">General Consultation</option>
                      <option value="custom-design" className="bg-card text-text">Custom Design & Install</option>
                      <option value="aquascaping" className="bg-card text-text">Bespoke Aquascaping</option>
                      <option value="maintenance" className="bg-card text-text">Scheduled Maintenance</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-semibold text-text-secondary block mb-2">
                      Brief project overview
                    </label>
                    <textarea
                      rows={4}
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                      placeholder="Describe the space dimensions, desired tank type (freshwater/reef), and any design concept in mind."
                      className="w-full px-5 py-3.5 rounded-xl text-sm bg-card-secondary border border-border focus:border-cyan-500 text-text placeholder-text-secondary/50 focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-xl text-xs font-semibold tracking-widest uppercase bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(0,191,255,0.25)] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      "Sending request..."
                    ) : (
                      <>
                        Submit Request
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
