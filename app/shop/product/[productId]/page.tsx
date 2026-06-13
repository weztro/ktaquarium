"use client";

import React, { use, useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/components/CartProvider";
import { ShoppingCart, ArrowLeft, ShieldCheck, Info, Plus, Minus, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ProductDetailsPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = use(params);
  const { addToCart, setIsCartOpen } = useCart();
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState("");
  const [quantity, setQuantity] = useState(1);

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

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
        <span className="mt-2 text-xs text-slate-500 font-semibold tracking-wider uppercase animate-pulse">Loading details...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] text-center p-8">
        <span className="text-5xl mb-4 block">🔍</span>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Specimen Not Found</h3>
        <p className="text-slate-500 text-sm mb-6 max-w-xs">The product ID matches no active registry.</p>
        <Link
          href="/shop"
          className="px-6 py-2.5 rounded-full bg-white border border-slate-200 text-xs font-bold uppercase tracking-widest text-purple-600 hover:text-purple-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-sm"
        >
          Return to Showroom
        </Link>
      </div>
    );
  }

  const availableStock = product.quantity ?? product.stock ?? 0;
  const showSpecs = product.categoryType === "FISHES" || product.type === "fish" || product.type === "FISHES";

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

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#F8FAFC] pt-28 pb-16 relative overflow-hidden flex items-center justify-center">
        {/* Undersea glows */}
        <div className="absolute top-0 left-0 right-0 h-[450px] bg-gradient-to-b from-cyan-100/30 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-[25%] left-[-15%] w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[25%] right-[-15%] w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full relative z-10">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="mb-8 group flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500 hover:text-purple-600 transition-colors duration-300 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> Back to Catalog
          </button>

          {/* Product Container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            
            {/* Gallery Column (6 cols) */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              {/* Main Image Frame */}
              <div className="relative h-[350px] md:h-[480px] w-full rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                {activeImage && (
                  <Image
                    src={activeImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                    unoptimized
                  />
                )}
              </div>

              {/* Thumbnails list */}
              {gallery.length > 1 && (
                <div className="flex items-center gap-3">
                  {gallery.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`relative h-20 w-20 rounded-xl overflow-hidden border transition-all cursor-pointer ${
                        activeImage === img ? "border-purple-600 ring-2 ring-purple-600/20" : "border-slate-200 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info Column (6 cols) */}
            <div className="lg:col-span-6 flex flex-col justify-between gap-8">
              <div className="flex flex-col gap-6">
                
                {/* Title and Badges */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase bg-slate-50 border border-slate-200 text-purple-600">
                      {(product.categoryType || product.type || "").toLowerCase()} {product.category ? `/ ${product.category}` : ""}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase border ${
                      availableStock > 0 ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"
                    }`}>
                      {availableStock > 0 ? `In Stock (${availableStock})` : "Sold Out"}
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-display font-black text-slate-900 leading-tight">
                    {product.name}
                  </h1>
                  {product.scientificName && (
                    <span className="text-xs italic text-slate-550 mt-1 block font-medium">
                      {product.scientificName}
                    </span>
                  )}
                </div>

                {/* Price Display */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between shadow-sm">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Premium Offering</span>
                  <span className="text-3xl font-black text-purple-650">${product.price}</span>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-[10px] uppercase font-bold tracking-wider text-slate-450 mb-2">Overview</h3>
                  <p className="text-slate-650 text-sm leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Fish Specific Specs Grid */}
                {showSpecs && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                      <span className="text-[9px] uppercase tracking-wider text-slate-450 font-bold">Care Level</span>
                      <p className="text-xs font-bold text-slate-800 mt-1">{product.careLevel || "Moderate"}</p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                      <span className="text-[9px] uppercase tracking-wider text-slate-450 font-bold">Tank size</span>
                      <p className="text-xs font-bold text-slate-800 mt-1">{product.tankSize || "50G+"}</p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                      <span className="text-[9px] uppercase tracking-wider text-slate-450 font-bold">Feeding</span>
                      <p className="text-xs font-bold text-slate-800 mt-1 truncate">{product.feedingInfo?.split(":")[0] || "Omnivore"}</p>
                    </div>
                  </div>
                )}

                {/* Fish Feeding Detailed Info */}
                {showSpecs && product.feedingInfo && (
                  <div className="p-4 rounded-xl border border-purple-100 bg-purple-50 flex items-start gap-3 text-xs leading-relaxed text-slate-700">
                    <Info className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-purple-750">Feeding Instructions:</strong> {product.feedingInfo}
                    </div>
                  </div>
                )}

                {/* General Equipment/Food Specs */}
                {product.brand && (
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Brand:</span>
                    <strong className="text-slate-800">{product.brand}</strong>
                  </div>
                )}
                {product.weight && (
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Size/Weight:</span>
                    <strong className="text-slate-800">{product.weight}</strong>
                  </div>
                )}
              </div>

              {/* Purchase Controls Section */}
              <div className="pt-6 border-t border-slate-200 flex flex-col gap-4">
                {availableStock > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-550 uppercase tracking-widest">Select Quantity</span>
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                      <button
                        onClick={decrementQty}
                        className="p-1.5 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 font-bold text-sm text-slate-800">{quantity}</span>
                      <button
                        onClick={incrementQty}
                        className="p-1.5 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Buttons row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={() => addToCart(product, quantity)}
                    disabled={availableStock <= 0}
                    className="flex items-center justify-center gap-2 py-4 px-6 rounded-2xl border border-slate-200 hover:border-slate-350 text-center text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-50 disabled:scale-100"
                  >
                    <ShoppingCart className="w-4.5 h-4.5" /> Add To Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={availableStock <= 0}
                    className="flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-center text-xs font-bold uppercase tracking-widest text-white shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
                  >
                    Buy Now
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-450 tracking-wider uppercase text-center mt-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Secure SSL Checkout & Insured Living Delivery</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
