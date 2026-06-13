"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/AuthProvider";
import { useCart } from "@/components/CartProvider";
import { useToast } from "@/components/Toast";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  Search, Filter, ShoppingBag, Edit, Trash2, 
  X, Loader2, DollarSign, Info 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { convertImageToBase64 } from "@/lib/image";
import { subscribeToCollection } from "@/lib/firestoreService";

const fishesBase64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgNDAwIDMwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0UwRjJGRSIvPjxwYXRoIGQ9Ik0xMDAsMTUwIEMxNTAsMTAwIDI1MCwxMDAgMzAwLDE1MCBDMjUwLDIwMCAxNTAsMjAwIDEwMCwxNTAgWiIgZmlsbD0iIzAyODRCNyIvPjxwYXRoIGQ9Ik0zMDAsMTUwIEwzNDAsMTIwIEwzMzAsMTUwIEwzNDAsMTgwIFoiIGZpbGw9IiMwMjg0QzciLz48Y2lyY2xlIGN4PSIxNTAiIGN5PSIxNDUiIHI9IjUiIGZpbGw9IiNGRkZGRkYiLz48L3N2Zz4=";
const equipmentsBase64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgNDAwIDMwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0YzRThGRiIvPjxyZWN0IHg9IjEyMCIgeT0iOTAiIHdpZHRoPSIxNjAiIGhlaWdodD0iMTIwIiByeD0iMTUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzdFMjJDRSIgc3Ryb2tlLXdpZHRoPSI4Ii8+PGxpbmUgeDE9IjEyMCIgeTE9IjEzMCIgeDI9IjI4MCIgeTI9IjEzMCIgc3Ryb2tlPSIjN0UyMkNFIiBzdHJva2Utd2lkdGg9IjQiLz48Y2lyY2xlIGN4PSIyMDAiIGN5PSIxNTAiIHI9IjEwIiBmaWxsPSIjN0UyMkNFIi8+PC9zdmc+";
const foodBase64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgNDAwIDMwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0ZDRTdGMyIvPjxyZWN0IHg9IjE1MCIgeT0iODAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTQwIiByeD0iMTAiIGZpbGw9IiNEQjI3NzciLz48cmVjdCB4PSIxNjAiIHk9IjEyMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRkZGRkZGIi8+PHRleHQgeD0iMjAwIiB5PSIxNDUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iI0RCMjc3NyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Rk9PRDwvdGV4dD48L3N2Zz4=";

const getFallbackImage = (categoryType: string) => {
  if (categoryType === "EQUIPMENTS") return equipmentsBase64;
  if (categoryType === "FOOD") return foodBase64;
  return fishesBase64;
};

type CategoryFilter = "ALL" | "FISHES" | "EQUIPMENTS" | "FOOD";
type SortOption = "name-asc" | "price-asc" | "price-desc" | "stock-desc";

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg">
        <Loader2 className="h-10 w-10 animate-spin text-accent" />
        <span className="mt-2 text-xs text-muted font-semibold tracking-wider uppercase">Loading Shop...</span>
      </div>
    }>
      <Navbar />
      <ShopContent />
      <Footer />
    </Suspense>
  );
}

function ShopContent() {
  const { user, userRole } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL"); // ALL, Active, Inactive (staff only)
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");

  // Edit Modal States
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isSubmitRunning, setIsSubmitRunning] = useState(false);

  // Edit Form Fields
  const [formName, setFormName] = useState("");
  const [formCategoryType, setFormCategoryType] = useState<"FISHES" | "EQUIPMENTS" | "FOOD">("FISHES");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formQuantity, setFormQuantity] = useState<number>(0);
  const [formImageBase64, setFormImageBase64] = useState("");
  const [formStatus, setFormStatus] = useState("Active");

  // Load type query param from landing page redirect
  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (typeParam) {
      const formatted = typeParam.toUpperCase();
      if (["FISHES", "EQUIPMENTS", "FOOD"].includes(formatted)) {
        setSelectedCategory(formatted as CategoryFilter);
      }
    }
  }, [searchParams]);

  // Real-time products listener using subscribeToCollection
  useEffect(() => {
    setLoading(true);
    setError(null);
    const unsubscribe = subscribeToCollection(
      "products",
      [],
      (list) => {
        setProducts(list);
        setLoading(false);
      },
      (err) => {
        console.error("[ShopPage] Firestore products subscription failed:", err);
        setError("Missing or insufficient permissions to access products.");
        showToast("Failed to fetch products: Permission denied.", "error");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [showToast]);

  // Handle image conversion for edit form
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 512000) {
        showToast("Image size must be less than 500KB.", "error");
        return;
      }
      try {
        const base64 = await convertImageToBase64(file);
        setFormImageBase64(base64);
      } catch (err) {
        showToast("Error processing file to Base64.", "error");
      }
    }
  };

  // Open Edit Dialog
  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setFormName(item.name || "");
    setFormCategoryType(item.categoryType || "FISHES");
    setFormDescription(item.description || "");
    setFormPrice(item.price || 0);
    setFormQuantity(item.quantity || 0);
    setFormImageBase64(item.imageBase64 || "");
    setFormStatus(item.status || "Active");
    setIsEditOpen(true);
  };

  // Save changes
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!formName) {
      showToast("Name is required.", "error");
      return;
    }
    if (formPrice <= 0) {
      showToast("Price must be greater than 0.", "error");
      return;
    }
    if (formQuantity < 0) {
      showToast("Quantity cannot be negative.", "error");
      return;
    }

    setIsSubmitRunning(true);
    try {
      const docRef = doc(db, "products", editingItem.id);
      let payload: any = {};
      
      if (userRole === "Employee") {
        payload = {
          price: Number(formPrice),
          quantity: Number(formQuantity),
          status: formQuantity > 0 ? "Active" : "Inactive"
        };
      } else {
        payload = {
          name: formName,
          description: formDescription,
          categoryType: formCategoryType,
          price: Number(formPrice),
          quantity: Number(formQuantity),
          imageBase64: formImageBase64,
          status: formStatus
        };
      }

      await updateDoc(docRef, payload);
      showToast(`${formName} updated successfully!`, "success");
      setIsEditOpen(false);
      setEditingItem(null);
    } catch (err) {
      console.error("Failed to update product:", err);
      showToast("Failed to save changes.", "error");
    } finally {
      setIsSubmitRunning(false);
    }
  };

  // Delete product
  const handleDelete = async (itemId: string, itemName: string) => {
    if (confirm(`Are you sure you want to delete ${itemName}?`)) {
      try {
        await deleteDoc(doc(db, "products", itemId));
        showToast("Product deleted successfully.", "success");
      } catch (err) {
        console.error("Failed to delete product:", err);
        showToast("Delete operation failed.", "error");
      }
    }
  };

  // Client-Side Filtering & Sorting logic
  const processedProducts = useMemo(() => {
    let list = [...products];

    // 1. Search Query Filter
    if (searchQuery.trim()) {
      const queryLower = searchQuery.toLowerCase();
      list = list.filter(
        (p) => 
          p.name?.toLowerCase().includes(queryLower) || 
          p.description?.toLowerCase().includes(queryLower)
      );
    }

    // 2. Category Type Filter
    if (selectedCategory !== "ALL") {
      list = list.filter((p) => p.categoryType === selectedCategory);
    }

    // 3. Status Filter (Staff can filter, Users only see Active/In Stock)
    const isStaff = userRole === "Admin" || userRole === "Employee";
    if (isStaff) {
      if (selectedStatus !== "ALL") {
        list = list.filter((p) => p.status === selectedStatus);
      }
    } else {
      // Normal customers can only see active items that have quantity > 0
      list = list.filter((p) => p.status === "Active" && p.quantity > 0);
    }

    // 4. Sorting logic
    list.sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "stock-desc":
          return b.quantity - a.quantity;
        case "name-asc":
        default:
          return (a.name || "").localeCompare(b.name || "");
      }
    });

    return list;
  }, [products, searchQuery, selectedCategory, selectedStatus, sortBy, userRole]);

  // Add Item to cart trigger
  const handleAddToCart = (e: React.MouseEvent, item: any) => {
    e.preventDefault();
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.imageBase64,
      type: item.categoryType,
      category: item.categoryType
    });
    showToast(`Added ${item.name} to cart.`, "success");
  };

  const isStaff = userRole === "Admin" || userRole === "Employee";

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg">
        <Loader2 className="h-16 w-16 animate-spin text-accent" />
        <p className="mt-4 text-sm font-semibold tracking-wider uppercase text-muted">Loading catalog...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 text-center">
        <div className="rounded-2xl border border-rose-500/20 bg-card p-6 max-w-md shadow-sm">
          <span className="text-4xl mb-4 block">⚠️</span>
          <h3 className="text-lg font-bold text-text mb-1">Failed to load catalog</h3>
          <p className="text-xs text-muted mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold text-xs uppercase tracking-wider"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-bg pt-28 pb-16 relative overflow-hidden text-text">
      {/* Ambient light gradient background */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-border/20 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <span className="text-xs font-semibold tracking-widest uppercase text-accent">Premium Livestock & Hardware</span>
          <h1 className="text-4xl md:text-5xl font-display font-black text-text mt-1 animate-fade-in">
            Explore Showroom
          </h1>
          <p className="text-muted mt-2 max-w-xl text-sm">
            Acclimated marine systems, professional aquascaping layouts, and bio-pure nutritional supplies.
          </p>
        </div>

        {/* Filter Controls Panel */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm mb-8 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Search Input (5 cols) */}
            <div className="md:col-span-5 relative">
              <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-muted" />
              <input
                type="text"
                placeholder="Search species or equipment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-bg text-text focus:outline-none focus:ring-1 focus:ring-accent text-xs font-medium"
              />
            </div>

            {/* Category Dropdown (3 cols) */}
            <div className="md:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as CategoryFilter)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-text focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer text-xs font-medium"
              >
                <option value="ALL">All Categories</option>
                <option value="FISHES">🐟 Fishes</option>
                <option value="EQUIPMENTS">⚙ Equipments</option>
                <option value="FOOD">📦 Fish Food</option>
              </select>
            </div>

            {/* Sorting (2 cols) */}
            <div className="md:col-span-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-text focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer text-xs font-medium"
              >
                <option value="name-asc">Sort: A-Z</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="stock-desc">Stock: High to Low</option>
              </select>
            </div>

            {/* Status Dropdown (Staff Only - 2 cols) */}
            {isStaff ? (
              <div className="md:col-span-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-accent/20 bg-accent/5 text-accent focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer text-xs font-medium"
                >
                  <option value="ALL">Status: All</option>
                  <option value="Active">Active Only</option>
                  <option value="Inactive">Inactive Only</option>
                </select>
              </div>
            ) : (
              <div className="md:col-span-2 text-right">
                <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">
                  {processedProducts.length} items found
                </span>
              </div>
            )}

          </div>
        </div>

        {/* Product Grid (Desktop: 4 columns, Tablet: 2 columns, Mobile: 1 column) */}
        {processedProducts.length === 0 ? (
          <div className="text-center py-20 rounded-3xl border border-border bg-card p-8 shadow-sm">
            <span className="text-4xl mb-4 block">🐟</span>
            <h3 className="text-lg font-bold text-text mb-1">No items match your filters</h3>
            <p className="text-xs text-muted">
              Try modifying your search text, category selections, or sorting methods.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {processedProducts.map((product) => {
              const isOutOfStock = product.quantity <= 0;

              return (
                <div 
                  key={product.id}
                  className="rounded-2xl border border-border bg-card shadow-sm flex flex-col justify-between h-full overflow-hidden hover:shadow-md transition-all duration-300 relative group"
                >
                  {/* Product Media Container */}
                  <div className="relative h-48 w-full border-b border-border bg-bg/50 overflow-hidden">
                    <img
                      src={product.imageBase64 || getFallbackImage(product.categoryType)}
                      alt={product.name}
                      className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Stock Alert Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                        isOutOfStock || product.status === "Inactive"
                          ? "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          : product.quantity <= 2
                          ? "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      }`}>
                        {product.status === "Inactive" 
                          ? "Inactive" 
                          : isOutOfStock 
                          ? "Out of Stock" 
                          : product.quantity <= 2
                          ? `Low Stock (${product.quantity})`
                          : "In Stock"}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider font-bold text-muted block mb-1">
                        {product.categoryType}
                      </span>
                      <h3 className="font-bold text-text text-sm truncate mb-1" title={product.name}>
                        {product.name}
                      </h3>
                      <p className="text-xs text-muted line-clamp-2 mb-3">
                        {product.description || "No description provided."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-border pt-3">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-muted block">Price</span>
                        <span className="text-sm font-black text-accent">${product.price}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] uppercase font-bold text-muted block">Available</span>
                        <span className="text-xs font-semibold text-text">{product.quantity} units</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="bg-bg/40 border-t border-border px-4 py-3 flex items-center justify-between">
                    <Link
                      href={`/shop/product/${product.id}`}
                      className="text-[10px] uppercase font-bold tracking-widest text-muted hover:text-text transition-colors"
                    >
                      View Details
                    </Link>

                    {userRole === "Admin" ? (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="p-1 text-muted hover:text-accent cursor-pointer transition-colors"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-1 text-muted hover:text-rose-600 cursor-pointer transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : userRole === "Employee" ? (
                      <button
                        onClick={() => handleOpenEdit(product)}
                        className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-accent hover:text-accent/80 cursor-pointer"
                        title="Edit Price & Stock"
                      >
                        <Edit className="w-3.5 h-3.5" /> Adjust
                      </button>
                    ) : (
                      /* Customer / User: Add to Cart button */
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        disabled={isOutOfStock || product.status === "Inactive"}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-accent to-accent-purple hover:opacity-90 text-white font-semibold text-[10px] uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" /> Buy
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ==================== EDIT PRODUCT MODAL (STAFF ONLY) ==================== */}
      <AnimatePresence>
        {isEditOpen && editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitRunning && setIsEditOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md overflow-y-auto max-h-[85vh] rounded-2xl border border-border bg-card p-6 shadow-xl z-10 text-text animate-scale-up"
            >
              <button
                onClick={() => setIsEditOpen(false)}
                disabled={isSubmitRunning}
                className="absolute top-4 right-4 text-muted hover:text-text cursor-pointer disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-display font-black text-text mb-2">Edit Product</h2>
              <p className="text-[10px] text-muted uppercase font-semibold tracking-wider mb-5">
                Staff Credentials: <strong className="text-accent">{userRole}</strong>
              </p>

              {userRole === "Employee" && (
                <div className="flex items-center gap-2 p-3 bg-accent/5 border border-accent/20 rounded-xl mb-4 text-[10px] text-text leading-relaxed">
                  <Info className="w-4 h-4 shrink-0 text-accent" />
                  <span>Employees can only modify pricing and stock levels. Description and media files are locked.</span>
                </div>
              )}

              <form onSubmit={handleUpdate} className="flex flex-col gap-4 text-xs">
                
                {/* Product Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-wider text-muted font-bold">Product Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    disabled={isSubmitRunning || userRole === "Employee"}
                    className="w-full rounded-xl px-4 py-3 bg-bg border border-border text-text disabled:opacity-60 focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>

                {/* Category Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-wider text-muted font-bold">Category Type</label>
                  <select
                    value={formCategoryType}
                    onChange={(e) => setFormCategoryType(e.target.value as any)}
                    disabled={isSubmitRunning || userRole === "Employee"}
                    className="w-full rounded-xl px-4 py-3 bg-bg border border-border text-text cursor-pointer disabled:opacity-60 focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    <option value="FISHES">Fishes</option>
                    <option value="EQUIPMENTS">Equipments</option>
                    <option value="FOOD">Fish Food</option>
                  </select>
                </div>

                {/* Price & Quantity Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase tracking-wider text-muted font-bold">Price ($)</label>
                    <input
                      type="number"
                      required
                      min="0.01"
                      step="0.01"
                      value={formPrice || ""}
                      onChange={(e) => setFormPrice(Number(e.target.value))}
                      disabled={isSubmitRunning}
                      className="w-full rounded-xl px-4 py-3 bg-bg border border-border text-text focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase tracking-wider text-muted font-bold">Quantity</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formQuantity || "0"}
                      onChange={(e) => setFormQuantity(Number(e.target.value))}
                      disabled={isSubmitRunning}
                      className="w-full rounded-xl px-4 py-3 bg-bg border border-border text-text focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-wider text-muted font-bold">Description</label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    disabled={isSubmitRunning || userRole === "Employee"}
                    className="w-full rounded-xl px-4 py-3 h-20 resize-none bg-bg border border-border text-text disabled:opacity-60 focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>

                {/* Image Upload */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-wider text-muted font-bold">Product Image</label>
                  <div className="flex items-center gap-3 border border-dashed border-border p-3 rounded-xl bg-bg opacity-100 disabled:opacity-60">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={isSubmitRunning || userRole === "Employee"}
                      className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-border file:text-text hover:file:bg-border/80 cursor-pointer disabled:cursor-not-allowed"
                    />
                  </div>
                  {formImageBase64 && (
                    <div className="relative h-20 w-20 rounded-xl overflow-hidden border border-border mt-2">
                      <img
                        src={formImageBase64}
                        alt="Preview"
                        className="object-cover h-full w-full"
                      />
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-wider text-muted font-bold">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    disabled={isSubmitRunning || userRole === "Employee"}
                    className="w-full rounded-xl px-4 py-3 bg-bg border border-border text-text cursor-pointer disabled:opacity-60 focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitRunning}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-purple py-3.5 px-4 font-bold text-white uppercase tracking-wider cursor-pointer shadow-md mt-2 disabled:opacity-50"
                >
                  {isSubmitRunning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
