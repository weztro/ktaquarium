"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle2 } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("submitting");
    setTimeout(() => {
      setStatus("success");
      setEmail("");
    }, 1200);
  };

  return (
    <section className="relative py-24 md:py-32 bg-bg z-30 overflow-hidden">
      {/* Glow rings in the background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-purple-500/5 blur-[80px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="luxury-card p-10 md:p-16 rounded-3xl text-center relative overflow-hidden"
        >
          {/* Subtle line decoration */}
          <div className="absolute inset-0 border border-cyan-500/10 rounded-3xl pointer-events-none" />

          <span className="text-xs font-semibold tracking-widest uppercase text-cyan-500 dark:text-cyan-400">
            Newsletter
          </span>
          
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-text mt-3 mb-6 max-w-xl mx-auto leading-tight">
            Stay Updated With The Aquarium World
          </h2>
          
          <p className="text-text-secondary text-sm md:text-base max-w-lg mx-auto mb-10 leading-relaxed">
            Join our private mailing list to receive guides on rare species care, aquascaping design layouts, and invitations to showroom exhibitions.
          </p>

          {status !== "success" ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto relative z-10">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 rounded-full text-sm bg-card-secondary border border-border text-text placeholder-text-secondary/60 focus:outline-none focus:border-cyan-500 transition-colors"
                disabled={status === "submitting"}
              />
              <button
                type="submit"
                disabled={status === "submitting"}
                className="px-8 py-4 rounded-full text-xs font-semibold tracking-widest uppercase bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(0,191,255,0.25)] cursor-pointer"
              >
                {status === "submitting" ? (
                  "Subscribing..."
                ) : (
                  <>
                    Subscribe
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center gap-3 text-cyan-500 dark:text-cyan-400 text-sm font-semibold"
            >
              <CheckCircle2 className="w-8 h-8 text-cyan-500 dark:text-cyan-400" />
              <span>Thank you for subscribing to our newsletter catalog!</span>
            </motion.div>
          )}

        </motion.div>
      </div>
    </section>
  );
}
