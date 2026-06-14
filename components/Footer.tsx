"use client";

import React, { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";

export default function Footer() {
  const [year, setYear] = useState(2026);
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="relative bg-card border-t border-border z-30 pt-16 pb-12 overflow-hidden text-text">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-16 pb-12 mb-12 border-b border-border">
          
          {/* Brand Col */}
          <div className="lg:col-span-4">
            <span className="text-lg font-display font-extrabold tracking-widest bg-gradient-to-r from-text via-accent to-accent-purple bg-clip-text text-transparent block mb-4">
              K.T AQUARIUM
            </span>
            <p className="text-muted text-xs md:text-sm leading-relaxed max-w-sm mb-6">
              Engineering pristine marine ecosystems and living works of art for residential and commercial displays worldwide.
            </p>
            
            {/* Social Icons */}
            <div className="flex gap-3 text-muted">
              <a href="#" className="p-2.5 rounded-full bg-bg border border-border hover:text-accent hover:border-accent/20 transition-all duration-300" aria-label="Instagram">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="#" className="p-2.5 rounded-full bg-bg border border-border hover:text-accent hover:border-accent/20 transition-all duration-300" aria-label="Facebook">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" className="p-2.5 rounded-full bg-bg border border-border hover:text-accent hover:border-accent/20 transition-all duration-300" aria-label="Twitter">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              <a href="#" className="p-2.5 rounded-full bg-bg border border-border hover:text-accent hover:border-accent/20 transition-all duration-300" aria-label="WhatsApp">
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2.5 col-span-1">
            <h4 className="text-xs font-bold text-text uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-2 text-xs md:text-sm text-muted">
              <li>
                <a href="#showcase" className="hover:text-accent transition-colors">Showrooms</a>
              </li>
              <li>
                <a href="#process" className="hover:text-accent transition-colors">Our Process</a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-accent transition-colors">Gallery</a>
              </li>
              <li>
                <a href="#contact" className="hover:text-accent transition-colors">Inquiries</a>
              </li>
            </ul>
          </div>

          {/* Services Col */}
          <div className="lg:col-span-2.5 col-span-1">
            <h4 className="text-xs font-bold text-text uppercase tracking-wider mb-4">
              Services
            </h4>
            <ul className="space-y-2 text-xs md:text-sm text-muted">
              <li>
                <a href="#services" className="hover:text-accent transition-colors">Custom Design</a>
              </li>
              <li>
                <a href="#services" className="hover:text-accent transition-colors">Installation</a>
              </li>
              <li>
                <a href="#services" className="hover:text-accent transition-colors">Aquascaping</a>
              </li>
              <li>
                <a href="#services" className="hover:text-accent transition-colors">Maintenance</a>
              </li>
            </ul>
          </div>

          {/* Collection Col */}
          <div className="lg:col-span-3 col-span-1">
            <h4 className="text-xs font-bold text-text uppercase tracking-wider mb-4">
              Specimen Catalog
            </h4>
            <ul className="space-y-2 text-xs md:text-sm text-muted">
              <li>
                <a href="#collection" className="hover:text-accent transition-colors">Crown Bettas</a>
              </li>
              <li>
                <a href="#collection" className="hover:text-accent transition-colors">Golden Arowanas</a>
              </li>
              <li>
                <a href="#collection" className="hover:text-accent transition-colors">Amazonian Discus</a>
              </li>
              <li>
                <a href="#collection" className="hover:text-accent transition-colors">Rare Cichlids</a>
              </li>
            </ul>
          </div>

        </div>

        {/* Legal info */}
        <div className="flex flex-col md:flex-row items-center justify-between text-[11px] text-muted font-medium gap-4">
          <div className="flex flex-col md:flex-row items-center gap-3 text-center md:text-left">
            <span>
              &copy; {year} K.T AQUARIUM. Designed & Developed by{" "}
              <a
                href="https://weztro.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline font-extrabold bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent"
              >
                WEZTRO
              </a>
              . All Rights Reserved.
            </span>
            <a
              href="https://weztro.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#F1F5F9] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-white/10 hover:border-cyan-500/30 transition-all duration-350 shadow-sm animate-pulse"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              <span className="text-[10px] font-bold">
                Built by{" "}
                <span className="bg-gradient-to-r from-cyan-550 to-purple-600 bg-clip-text text-transparent font-black">
                  WEZTRO
                </span>
              </span>
            </a>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-accent transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-accent transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-accent transition-colors">Security</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
