"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Waves, ShieldCheck, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { where } from "firebase/firestore";
import { subscribeToCollection } from "@/lib/firestoreService";

export default function FeaturedCollection() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToCollection(
      "catalogTypes",
      [where("isActive", "==", true)],
      async (list) => {
        if (list.length === 0) {
          // Auto-seed if database is empty so the homepage looks beautiful immediately!
          try {
            const { writeBatch, doc } = await import("firebase/firestore");
            const { db } = await import("@/lib/firebase");
            const batch = writeBatch(db);
            const seedData = [
              {
                id: "FISHES",
                name: "Fishes",
                description: "Premium exotic and monster fishes hand-selected for pristine health and coloration.",
                imageBase64: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgNDAwIDMwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0UwRjJGRSIvPjxwYXRoIGQ9Ik0xMDAsMTUwIEMxNTAsMTAwIDI1MCwxMDAgMzAwLDE1MCBDMjUwLDIwMCAxNTAsMjAwIDEwMCwxNTAgWiIgZmlsbD0iIzAyODRCNyIvPjxwYXRoIGQ9Ik0zMDAsMTUwIEwzNDAsMTIwIEwzMzAsMTUwIEwzNDAsMTgwIFoiIGZpbGw9IiMwMjg0QzciLz48Y2lyY2xlIGN4PSIxNTAiIGN5PSIxNDUiIHI9IjUiIGZpbGw9IiNGRkZGRkYiLz48L3N2Zz4=",
                displayOrder: 1,
                isActive: true,
              },
              {
                id: "EQUIPMENTS",
                name: "Equipments",
                description: "High-end rimless glass tanks, quiet canister filters, app-controlled WRGB LED lights, and scaping tools.",
                imageBase64: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgNDAwIDMwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0YzRThGRiIvPjxyZWN0IHg9IjEyMCIgeT0iOTAiIHdpZHRoPSIxNjAiIGhlaWdodD0iMTIwIiByeD0iMTUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzdFMjJDRSIgc3Ryb2tlLXdpZHRoPSI4Ii8+PGxpbmUgeDE9IjEyMCIgeTE9IjEzMCIgeDI9IjI4MCIgeTI9IjEzMCIgc3Ryb2tlPSIjN0UyMkNFIiBzdHJva2Utd2lkdGg9IjQiLz48Y2lyY2xlIGN4PSIyMDAiIGN5PSIxNTAiIHI9IjEwIiBmaWxsPSIjN0UyMkNFIi8+PC9zdmc+",
                displayOrder: 2,
                isActive: true,
              },
              {
                id: "FOOD",
                name: "Fish Food",
                description: "Maintain vibrant health and rapid growth with organic krill pellets, flakes, and immunity booster formulas.",
                imageBase64: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgNDAwIDMwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0ZDRTdGMyIvPjxyZWN0IHg9IjE1MCIgeT0iODAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTQwIiByeD0iMTAiIGZpbGw9IiNEQjI3NzciLz48cmVjdCB4PSIxNjAiIHk9IjEyMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRkZGRkZGIi8+PHRleHQgeD0iMjAwIiB5PSIxNDUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iI0RCMjc3NyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Rk9PRDwvdGV4dD48L3N2Zz4=",
                displayOrder: 3,
                isActive: true,
              }
            ];
            seedData.forEach(item => {
              batch.set(doc(db, "catalogTypes", item.id), item);
            });
            await batch.commit();
          } catch (err) {
            console.error("Auto-seeding catalogTypes failed:", err);
          }
        } else {
          const sortedList = [...list].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          setCategories(sortedList);
          setLoading(false);
        }
      },
      (err) => {
        console.error("FeaturedCollection load error in 'catalogTypes' collection:", err);
        setError("Missing or insufficient permissions to access the catalog.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const getGlowStyles = (title: string) => {
    switch (title.toUpperCase()) {
      case "FISHES":
        return "hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] border-cyan-500/10 hover:border-cyan-500/35";
      case "EQUIPMENTS":
        return "hover:shadow-[0_0_30px_rgba(124,58,237,0.15)] border-purple-500/10 hover:border-purple-500/35";
      case "FOOD":
      default:
        return "hover:shadow-[0_0_30px_rgba(219,39,119,0.15)] border-pink-500/10 hover:border-pink-500/35";
    }
  };

  const getTitleSubtitle = (title: string) => {
    switch (title.toUpperCase()) {
      case "FISHES":
        return "Exotic & Monster Specimens";
      case "EQUIPMENTS":
        return "High-End Aquascaping Gear";
      case "FOOD":
      default:
        return "Premium Nutrient Formulas";
    }
  };

  if (error) {
    return (
      <section id="collection" className="relative py-24 md:py-32 bg-bg z-30 overflow-hidden flex items-center justify-center min-h-[400px]">
        <div className="max-w-md mx-auto px-6 text-center">
          <div className="inline-flex p-3 rounded-full bg-red-100 dark:bg-red-900/20 text-red-650 dark:text-red-400 mb-4 border border-red-200 dark:border-red-800">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-text mb-2">Access Restrained</h3>
          <p className="text-muted text-sm mb-6">{error}</p>
          <button 
            onClick={() => { setLoading(true); setError(null); window.location.reload(); }}
            className="px-6 py-2.5 rounded-full bg-accent hover:bg-accent/80 text-white text-xs font-semibold tracking-wider uppercase transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section id="collection" className="relative py-24 md:py-32 bg-bg z-30 overflow-hidden flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          <span className="text-xs text-muted font-semibold uppercase tracking-wider">Loading collection...</span>
        </div>
      </section>
    );
  }

  return (
    <section id="collection" className="relative py-24 md:py-32 bg-bg z-30 overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-[40%] left-[-10%] w-[350px] h-[350px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[350px] h-[350px] bg-accent-purple/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-20">
          <div className="max-w-xl">
            <span className="text-xs font-semibold tracking-widest uppercase text-accent flex items-center gap-1.5">
              <Waves className="w-4.5 h-4.5 animate-pulse" /> Curated Specimen Catalog
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-extrabold text-text mt-3 leading-tight">
              Explore Our Collection
            </h2>
          </div>
          <p className="text-muted max-w-sm mt-4 md:mt-0 text-sm md:text-base">
            Bespoke components, rare specimens, and premium nutrition acclimated for high-end residential and commercial exhibits.
          </p>
        </div>

        {/* Dynamic Category Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="group flex flex-col h-full"
            >
              <Link
                href={category.id.toUpperCase() === "FISHES" ? "/shop/fishes" : `/shop?type=${category.id.toUpperCase()}`}
                className="flex flex-col h-full"
              >
                <div className={`flex-1 relative overflow-hidden rounded-3xl bg-card border border-border ${getGlowStyles(category.id)} transition-all duration-500 p-6 md:p-8 flex flex-col justify-between h-full shadow-sm`}>
                  
                  {/* Decorative Borders */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-border rounded-tl-3xl" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-border rounded-br-3xl" />

                  {/* Top Info */}
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-bg border border-border text-muted">
                        Active Catalog
                      </span>
                    </div>

                    {/* Image Container */}
                    <div className="relative h-56 w-full rounded-2xl overflow-hidden mb-6 border border-border shadow-inner bg-bg">
                      <img
                        src={category.imageBase64}
                        alt={category.name}
                        className="object-cover h-full w-full transition-transform duration-1000 ease-out group-hover:scale-105"
                      />
                    </div>

                    <span className="text-xs font-bold tracking-widest text-accent uppercase">
                      {getTitleSubtitle(category.id)}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-display font-black text-text mt-1.5 group-hover:text-accent transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-muted text-sm mt-3 leading-relaxed">
                      {category.description}
                    </p>
                  </div>

                  {/* Actions footer */}
                  <div className="mt-8 pt-5 border-t border-border flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted group-hover:text-text transition-colors">
                    <span className="flex items-center gap-1.5 text-muted">
                      <ShieldCheck className="w-4 h-4 text-accent" />
                      Certified Quality
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-accent group-hover:underline">
                      Shop Now
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>

                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
