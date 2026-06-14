"use client";

import React, { use, useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/components/CartProvider";
import {
  ShoppingCart,
  ArrowLeft,
  ShieldCheck,
  Info,
  Plus,
  Minus,
  Loader2,
  Globe,
  Scale,
  Utensils,
  Tag,
  Hash,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { doc, getDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { subscribeToCollection } from "@/lib/firestoreService";

export default function ProductDetailsPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = use(params);
  const { addToCart, setIsCartOpen } = useCart();
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Gallery zoom states
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Button simulated loading states
  const [isAdding, setIsAdding] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  // Related products state
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  // Check if viewport is desktop for hover zoom
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  // Fetch product from Firestore
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", productId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data: any = { id: docSnap.id, ...docSnap.data() };
          setProduct(data);
          setActiveImage(data.imageBase64 || data.image || "");
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  // Fetch related products of same category in real-time
  useEffect(() => {
    if (!product || !product.categoryType) return;
    
    const unsubscribe = subscribeToCollection(
      "products",
      [where("categoryType", "==", product.categoryType)],
      (list) => {
        // Filter out active product and show up to 4 specimens
        const filtered = list.filter((p) => p.id !== product.id).slice(0, 4);
        setRelatedProducts(filtered);
      },
      (err) => {
        console.error("Related products fetch failed:", err);
      }
    );

    return () => unsubscribe();
  }, [product]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg text-text transition-colors duration-300">
        <Loader2 className="h-10 w-10 animate-spin text-accent-purple mb-2" />
        <span className="mt-2 text-xs text-text-secondary font-black tracking-wider uppercase animate-pulse">
          Loading specimen details...
        </span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg text-text text-center p-8 transition-colors duration-300">
        <span className="text-5xl mb-4 block" role="img" aria-label="Magnifying glass">🔍</span>
        <h3 className="text-xl font-bold text-text mb-2">Specimen Not Found</h3>
        <p className="text-text-secondary text-sm mb-6 max-w-xs font-medium">
          The product ID matches no active registry.
        </p>
        <Link
          href="/shop"
          className="px-6 py-2.5 rounded-full bg-card border border-border text-xs font-bold uppercase tracking-widest text-accent-purple hover:text-accent-purple/80 hover:bg-card-secondary transition-all cursor-pointer shadow-sm focus-visible:ring-2 focus-visible:ring-accent-purple outline-none"
        >
          Return to Showroom
        </Link>
      </div>
    );
  }

  const availableStock = product.quantity ?? product.stock ?? 0;
  
  // Show specifications checks for fishes
  const showSpecs = ["monster", "exotic", "normal"].includes(product.categoryType) || product.type === "fish" || product.type === "FISHES";

  const handleBuyNow = () => {
    addToCart(product, quantity);
    setIsCartOpen(true);
  };

  const incrementQty = () => {
    if (quantity < availableStock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQty = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Build gallery array
  const gallery = product.gallery && product.gallery.length > 0 
    ? product.gallery 
    : [product.imageBase64 || product.image || ""];

  // Mouse move handler for premium panning zoom
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDesktop) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  // Simulate Add To Cart Action
  const handleAddToCart = () => {
    if (availableStock <= 0) return;
    setIsAdding(true);
    setTimeout(() => {
      addToCart(product, quantity);
      setIsAdding(false);
    }, 800);
  };

  // Simulate Buy Now Action
  const handleBuyNowClick = () => {
    if (availableStock <= 0) return;
    setIsBuying(true);
    setTimeout(() => {
      handleBuyNow();
      setIsBuying(false);
    }, 800);
  };

  // Dynamic Specifications Getter
  const getSpecifications = () => {
    const sku = product.sku || `KT-${product.id?.slice(0, 8).toUpperCase() || "SPECIMEN"}`;
    const origin = product.origin || (showSpecs ? "Indo-Pacific Waters" : "Premium Sourced");
    const diet = product.diet || (showSpecs ? (product.feedingInfo?.split(":")[0] || "Omnivore") : "N/A");
    const size = product.size || product.weight || "N/A";
    const availability = availableStock > 0 ? `In Stock (${availableStock})` : "Out of Stock";
    
    // Normalize category label
    let categoryLabel = product.categoryType;
    if (product.categoryType === "monster") categoryLabel = "Monster Fish";
    else if (product.categoryType === "exotic") categoryLabel = "Exotic Fish";
    else if (product.categoryType === "normal") categoryLabel = "Normal Fish";
    const category = (categoryLabel || product.type || "Fishes").toLowerCase();

    const waterParams = product.waterParams || (showSpecs ? "pH 6.5-7.5 | 24-28°C" : "N/A");
    const careLevel = product.careLevel || (showSpecs ? "Moderate" : "N/A");
    const tankSize = product.tankSize || (showSpecs ? "50G+" : "N/A");

    const specs = [
      { label: "Category", value: category, icon: Tag, className: "capitalize" },
      { label: "Size/Weight", value: size, icon: Scale },
      { label: "Diet", value: diet, icon: Utensils },
      { label: "Origin", value: origin, icon: Globe },
      { label: "Availability", value: availability, icon: availableStock > 0 ? CheckCircle2 : AlertCircle, valueClassName: availableStock > 0 ? "text-emerald-500" : "text-rose-500" },
      { label: "SKU", value: sku, icon: Hash },
    ];

    if (showSpecs) {
      specs.push(
        { label: "Care Level", value: careLevel, icon: Sparkles },
        { label: "Tank Size", value: tankSize, icon: Info },
        { label: "Water Parameters", value: waterParams, icon: Info }
      );
    }

    return specs;
  };

  return (
    <>
      <Navbar />

      <main className={`min-h-screen bg-bg text-text pt-28 pb-16 relative overflow-hidden flex items-center justify-center transition-colors duration-300 ${availableStock > 0 ? "pb-24 md:pb-16" : ""}`}>
        {/* Undersea theme gradients */}
        <div className="absolute top-0 left-0 right-0 h-[450px] bg-gradient-to-b from-accent/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-[25%] left-[-15%] w-[400px] h-[400px] bg-accent/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[25%] right-[-15%] w-[400px] h-[400px] bg-accent-purple/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full relative z-10">
          
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="mb-8 group flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-accent-purple transition-colors duration-300 cursor-pointer focus-visible:ring-2 focus-visible:ring-accent-purple rounded-lg px-2 py-1 outline-none"
            aria-label="Go back to catalog"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> Back
          </button>

          {/* Product Container: 60/40 Split Layout on Desktop, Stacks on Mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            
            {/* Gallery Column (60% Desktop width / col-span-7) */}
            <div className="lg:col-span-7 flex flex-col gap-6 w-full">
              
              {/* Main Image Viewport with Premium Coordinates Zoom */}
              <div
                className="relative h-[300px] sm:h-[400px] md:h-[480px] w-full rounded-3xl overflow-hidden border border-border bg-card shadow-xl dark:shadow-black/40 group cursor-zoom-in transition-all duration-300"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => {
                  setIsHovered(false);
                  setZoomPos({ x: 0, y: 0 });
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeImage}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full relative"
                  >
                    {activeImage ? (
                      <Image
                        src={activeImage}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-200 ease-out select-none"
                        style={{
                          transformOrigin: isHovered && isDesktop ? `${zoomPos.x}% ${zoomPos.y}%` : "center",
                          transform: isHovered && isDesktop ? "scale(1.5)" : "scale(1)",
                        }}
                        priority
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-card-secondary flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-accent-purple" />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Hover Zoom Instructions Banner */}
                {isDesktop && (
                  <div className="absolute bottom-4 right-4 bg-card/60 backdrop-blur-md border border-border px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-text opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none select-none">
                    Hover to Zoom
                  </div>
                )}
              </div>

              {/* Thumbnails Gallery Slider */}
              {gallery.length > 1 && (
                <div className="flex flex-wrap items-center gap-3">
                  {gallery.map((img: string, idx: number) => {
                    const isActive = activeImage === img;
                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(img)}
                        className={`relative h-20 w-20 rounded-2xl overflow-hidden border transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent-purple ${
                          isActive
                            ? "border-accent-purple ring-4 ring-accent-purple/10 scale-95 opacity-100 shadow-md"
                            : "border-border opacity-70 hover:opacity-100 hover:scale-105"
                        }`}
                        aria-label={`Switch to product image ${idx + 1}`}
                      >
                        <Image
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Info Column (40% Desktop width / col-span-5) */}
            {/* Structured with flexbox ordering for specific Mobile sequencing */}
            <div className="lg:col-span-5 flex flex-col gap-8 w-full">
              
              {/* 1. Title and Scientific Name (order-1) */}
              <div className="flex flex-col gap-1.5 order-1">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-black text-text tracking-tight leading-tight">
                  {product.name}
                </h1>
                {product.scientificName && (
                  <span className="text-sm italic text-text-secondary/80 font-medium">
                    {product.scientificName}
                  </span>
                )}
              </div>

              {/* 2. Price (order-2 on mobile, order-3 on desktop) */}
              <div className="p-5 rounded-2xl bg-card/50 backdrop-blur-md border border-border flex items-center justify-between shadow-lg order-2 lg:order-3">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Premium Offering</span>
                <span className="text-3xl font-black text-accent-purple tracking-tight">${product.price}</span>
              </div>

              {/* 3. Badges Section (order-3 on mobile, order-2 on desktop) */}
              <div className="flex flex-wrap items-center gap-2 order-3 lg:order-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-card-secondary border border-border text-accent-purple shadow-sm capitalize">
                  {product.categoryType === "monster" || product.categoryType === "exotic" || product.categoryType === "normal"
                    ? `${product.categoryType} Fish` 
                    : (product.categoryType || product.type || "").toLowerCase()} {product.category ? `/ ${product.category}` : ""}
                </span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border shadow-sm ${
                  availableStock > 0 
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500" 
                    : "border-rose-500/30 bg-rose-500/10 text-rose-500"
                }`}>
                  {availableStock > 0 ? `In Stock (${availableStock})` : "Sold Out"}
                </span>
              </div>

              {/* 4. Description (order-4) */}
              <div className="flex flex-col gap-2 order-4">
                <h3 className="text-xs uppercase font-black tracking-widest text-text-secondary/80">Overview</h3>
                <p className="text-text-secondary text-sm leading-relaxed font-normal">
                  {product.description || "No overview description recorded for this specimen."}
                </p>
              </div>

              {/* 5. Specifications (order-5) */}
              <div className="flex flex-col gap-4 order-5">
                <h3 className="text-xs uppercase font-black tracking-widest text-text-secondary/80">Specifications</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {getSpecifications().map((spec, idx) => {
                    const IconComponent = spec.icon;
                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl border border-border bg-card shadow-sm hover:border-accent-purple/35 transition-all duration-300 flex flex-col gap-1.5"
                      >
                        <div className="flex items-center gap-1.5 text-text-secondary/70">
                          <IconComponent className="w-3.5 h-3.5 text-accent-purple" />
                          <span className="text-[10px] uppercase font-bold tracking-wider">{spec.label}</span>
                        </div>
                        <p className={`text-xs font-black text-text truncate ${spec.className || ""} ${spec.valueClassName || ""}`} title={spec.value}>
                          {spec.value}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Fish Specific Feeding Details (if applicable) */}
                {showSpecs && product.feedingInfo && (
                  <div className="p-4 rounded-2xl border border-accent-purple/20 bg-accent-purple/5 flex items-start gap-3 text-xs leading-relaxed text-text-secondary shadow-inner">
                    <Info className="w-4 h-4 text-accent-purple shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-text font-black">Feeding Instructions:</strong> {product.feedingInfo}
                    </div>
                  </div>
                )}
              </div>

              {/* 6. Purchase & Quantity Controls (order-6) */}
              <div className="pt-6 border-t border-border flex flex-col gap-6 order-6">
                {availableStock > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Select Quantity</span>
                    <div className="flex items-center border border-border rounded-xl bg-card-secondary p-1 shadow-sm">
                      <button
                        onClick={decrementQty}
                        className="p-2 text-text-secondary hover:text-text hover:bg-card rounded-lg transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent-purple"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 font-black text-sm text-text min-w-[24px] text-center">{quantity}</span>
                      <button
                        onClick={incrementQty}
                        className="p-2 text-text-secondary hover:text-text hover:bg-card rounded-lg transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent-purple"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* CTA Action Buttons */}
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Add To Cart */}
                    <button
                      onClick={handleAddToCart}
                      disabled={availableStock <= 0 || isAdding}
                      className="relative flex items-center justify-center gap-2 py-4 px-6 rounded-2xl border border-border bg-card text-center text-xs font-black uppercase tracking-widest text-text-secondary hover:text-text hover:bg-card-secondary hover:border-text/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed outline-none focus-visible:ring-2 focus-visible:ring-accent-purple hover:shadow-[0_0_20px_rgba(124,58,237,0.08)] active:scale-[0.98] select-none"
                    >
                      {isAdding ? (
                        <Loader2 className="w-4 h-4 animate-spin text-accent-purple" />
                      ) : (
                        <ShoppingCart className="w-4 h-4 text-accent-purple" />
                      )}
                      {isAdding ? "Adding..." : "Add To Cart"}
                    </button>

                    {/* Buy Now */}
                    <button
                      onClick={handleBuyNowClick}
                      disabled={availableStock <= 0 || isBuying}
                      className="relative flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-center text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 active:scale-[0.98] hover:scale-[1.02] transition-all cursor-pointer disabled:opacity-50 disabled:scale-100 disabled:shadow-none disabled:cursor-not-allowed outline-none focus-visible:ring-2 focus-visible:ring-accent-purple select-none"
                    >
                      {isBuying ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <span>Buy Now</span>
                      )}
                    </button>
                  </div>

                  {/* Insured Delivery Badge */}
                  <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-text-secondary/70 tracking-wider uppercase text-center mt-2">
                    <ShieldCheck className="w-4 h-4 text-accent-purple" />
                    <span>Secure SSL Checkout & Insured Living Delivery</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Related Specimens Section */}
          {relatedProducts.length > 0 && (
            <section className="mt-24 border-t border-border pt-16">
              <span className="text-xs font-bold tracking-widest uppercase text-accent block mb-2 select-none">Selected Replacements</span>
              <h2 className="text-2xl md:text-3xl font-display font-black text-text mb-8">Related Specimens</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((rel) => {
                  const relStock = rel.quantity !== undefined ? rel.quantity : (rel.stock || 0);
                  const hasRelStock = relStock > 0;
                  return (
                    <Link
                      href={`/shop/product/${rel.id}`}
                      key={rel.id}
                      className="group flex flex-col h-full rounded-2xl border border-border bg-card overflow-hidden hover:border-accent-purple/35 shadow-sm hover:shadow-md transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-accent-purple"
                    >
                      <div className="relative h-44 w-full overflow-hidden bg-card-secondary border-b border-border/60">
                        <Image
                          src={rel.imageBase64 || rel.image || ""}
                          alt={rel.name}
                          fill
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 select-none"
                          unoptimized
                        />
                        <div className="absolute top-3 left-3 select-none">
                          {hasRelStock ? (
                            <span className="px-2 py-0.5 rounded-full text-[8px] font-bold tracking-widest uppercase bg-black/60 backdrop-blur-md text-emerald-400 border border-emerald-500/20">
                              In Stock
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[8px] font-bold tracking-widest uppercase bg-black/60 backdrop-blur-md text-rose-400 border border-rose-500/20">
                              Sold Out
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between gap-3 text-xs">
                        <div>
                          <h4 className="font-bold text-text truncate group-hover:text-accent-purple transition-colors">{rel.name}</h4>
                          {rel.scientificName && <span className="text-[9px] italic text-text-secondary/70 truncate block mt-0.5">{rel.scientificName}</span>}
                        </div>
                        <div className="flex items-center justify-between border-t border-border/50 pt-2.5">
                          <span className="font-black text-text">${rel.price}</span>
                          <span className="text-[9px] font-bold text-accent-purple uppercase tracking-wider group-hover:underline">Explore →</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

        </div>
      </main>

      {/* Mobile Sticky Add to Cart Action Bar */}
      {availableStock > 0 && (
        <div className="fixed bottom-0 left-0 right-0 md:hidden bg-card/85 backdrop-blur-lg border-t border-border p-4 flex items-center justify-between z-40 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] dark:shadow-black/40">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-border bg-card shrink-0">
              {activeImage && (
                <Image
                  src={activeImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              )}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-black text-text truncate max-w-[120px]">{product.name}</h4>
              <p className="text-sm font-black text-accent-purple">${product.price}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Compact Quantity Selector */}
            <div className="flex items-center border border-border rounded-xl bg-card-secondary p-0.5 scale-90">
              <button
                onClick={decrementQty}
                className="p-1 text-text-secondary hover:text-text hover:bg-card rounded-md transition-all"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-black text-xs text-text min-w-[16px] text-center">{quantity}</span>
              <button
                onClick={incrementQty}
                className="p-1 text-text-secondary hover:text-text hover:bg-card rounded-md transition-all"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Compact Add to Cart button */}
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-[10px] font-black uppercase tracking-widest shadow-md hover:shadow-cyan-500/10 active:scale-95 transition-all disabled:opacity-50 shrink-0"
            >
              {isAdding ? (
                <Loader2 className="w-3 h-3 animate-spin text-white" />
              ) : (
                "Add"
              )}
            </button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
