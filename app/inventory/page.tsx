"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RouteGuard from "@/components/RouteGuard";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  Package, Layers, ShieldAlert, Archive, 
  AlertTriangle, Plus, Minus, Check, Loader2, 
  DollarSign, Eye, EyeOff
} from "lucide-react";
import Image from "next/image";
import { useToast } from "@/components/Toast";
import { motion } from "framer-motion";
import { subscribeToCollection } from "@/lib/firestoreService";

export default function InventoryDashboardPage() {
  return (
    <RouteGuard allowedRoles={["Admin", "Employee"]}>
      <Navbar />
      <InventoryDashboardContent />
      <Footer />
    </RouteGuard>
  );
}

function InventoryDashboardContent() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Quick Edit States
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [tempStockValue, setTempStockValue] = useState<number>(0);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Fetch real-time products and categories
  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubProducts = subscribeToCollection(
      "products",
      [],
      (list) => {
        setProducts(list);
        setLoading(false);
      },
      (err) => {
        console.error("[Inventory] Failed to subscribe to products:", err);
        setError("Missing or insufficient permissions to access products.");
        setLoading(false);
      }
    );

    const unsubCats = subscribeToCollection(
      "categories",
      [],
      (list) => {
        setCategories(list);
      },
      (err) => {
        console.error("[Inventory] Failed to subscribe to categories:", err);
        showToast("Missing permissions to load categories.", "error");
      }
    );

    return () => {
      unsubProducts();
      unsubCats();
    };
  }, [showToast]);

  // Statistics calculations
  const totalProducts = products.length;
  const fishProducts = products.filter((p) => p.categoryType === "FISHES" || p.type === "fish" || p.type === "FISHES");
  const equipmentProducts = products.filter((p) => p.categoryType === "EQUIPMENTS" || p.type === "equipment" || p.type === "EQUIPMENTS");
  const foodProducts = products.filter((p) => p.categoryType === "FOOD" || p.type === "food" || p.type === "FOOD");

  const getProductStock = (p: any) => p.quantity ?? p.stock ?? 0;

  const lowStockItems = products.filter((p) => {
    const stock = getProductStock(p);
    return stock > 0 && stock <= 2;
  });
  const outOfStockItems = products.filter((p) => getProductStock(p) === 0);
  const criticalItems = [...outOfStockItems, ...lowStockItems];

  // Calculate total inventory value
  const totalValue = products.reduce((acc, curr) => acc + (Number(curr.price) || 0) * (Number(getProductStock(curr)) || 0), 0);

  // Group products by category counts
  const categoryCounts = categories.map((cat) => {
    const count = products.filter((p) => p.category === cat.id).length;
    return {
      id: cat.id,
      name: cat.name,
      type: cat.type,
      count
    };
  }).sort((a, b) => b.count - a.count);

  // Quick adjust stock handler
  const handleQuickStockAdjust = async (prodId: string, currentStock: number, adjustment: number) => {
    const newStock = Math.max(0, currentStock + adjustment);
    setUpdatingId(prodId);
    try {
      const prodRef = doc(db, "products", prodId);
      await updateDoc(prodRef, { 
        quantity: newStock,
        stock: newStock
      });
      showToast(`Stock updated to ${newStock}.`, "success");
    } catch (err) {
      console.error("Failed to update stock:", err);
      showToast("Stock update failed.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  // Direct save stock handler
  const handleSaveDirectStock = async (prodId: string) => {
    if (tempStockValue < 0) {
      showToast("Stock cannot be negative.", "error");
      return;
    }
    setUpdatingId(prodId);
    try {
      const prodRef = doc(db, "products", prodId);
      await updateDoc(prodRef, { 
        quantity: tempStockValue,
        stock: tempStockValue
      });
      showToast(`Stock updated to ${tempStockValue}.`, "success");
      setEditingStockId(null);
    } catch (err) {
      console.error("Failed to save stock:", err);
      showToast("Stock update failed.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  // Toggle active/inactive product status
  const handleToggleStatus = async (prodId: string, currentStatus: string) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    setUpdatingId(prodId);
    try {
      const prodRef = doc(db, "products", prodId);
      await updateDoc(prodRef, { status: newStatus });
      showToast(`Product set to ${newStatus}.`, "success");
    } catch (err) {
      console.error("Failed to update product status:", err);
      showToast("Status update failed.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg">
        <div className="relative flex items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-accent-purple filter drop-shadow-[0_0_15px_rgba(167,139,250,0.2)]" />
          <span className="absolute text-xs font-semibold tracking-wider text-accent-purple">K.T</span>
        </div>
        <p className="mt-4 text-sm tracking-widest uppercase text-muted animate-pulse">Loading Inventory...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 text-center">
        <div className="rounded-2xl border border-rose-500/20 bg-card p-6 max-w-md shadow-sm">
          <span className="text-4xl mb-4 block">⚠️</span>
          <h3 className="text-lg font-bold text-text mb-1">Failed to load inventory</h3>
          <p className="text-xs text-muted mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-accent to-accent-purple hover:opacity-90 text-white font-semibold text-xs uppercase tracking-wider"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-bg pt-28 pb-16 relative overflow-hidden text-text">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-accent/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-accent-purple/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-5%] w-[350px] h-[350px] bg-accent/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-border pb-6">
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-accent-purple">Dashboard & Operations</span>
            <h1 className="text-3xl md:text-4xl font-display font-black text-text mt-1">
              Live Inventory
            </h1>
          </div>
          <div className="text-xs text-text bg-card border border-border rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Real-time Database Connection Active
          </div>
        </div>

        {/* Analytics Cards Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8"
        >
          {/* Card: Total Products */}
          <motion.div 
            variants={itemVariants}
            className="rounded-2xl border border-border bg-card p-4 flex flex-col justify-between relative overflow-hidden group hover:border-accent-purple/50 transition-all duration-300 shadow-sm"
          >
            <div className="absolute top-0 right-0 w-12 h-12 bg-accent-purple/10 rounded-bl-3xl flex items-center justify-center text-accent-purple group-hover:bg-accent-purple/20 transition-colors">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted">Total Products</span>
              <h2 className="text-3xl font-black text-text mt-2 font-display">{totalProducts}</h2>
            </div>
            <div className="text-[10px] text-muted mt-4 border-t border-border pt-2 flex justify-between">
              <span>Catalog size</span>
              <span className="text-accent-purple font-semibold">100%</span>
            </div>
          </motion.div>

          {/* Card: Fishes count */}
          <motion.div 
            variants={itemVariants}
            className="rounded-2xl border border-border bg-card p-4 flex flex-col justify-between relative overflow-hidden group hover:border-accent/50 transition-all duration-300 shadow-sm"
          >
            <div className="absolute top-0 right-0 w-12 h-12 bg-accent/10 rounded-bl-3xl flex items-center justify-center text-accent group-hover:bg-accent/20 transition-colors">
              <span className="text-sm font-bold">🐟</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted">Fishes</span>
              <h2 className="text-3xl font-black text-text mt-2 font-display">{fishProducts.length}</h2>
            </div>
            <div className="text-[10px] text-muted mt-4 border-t border-border pt-2 flex justify-between">
              <span>Ratio</span>
              <span className="text-accent font-semibold">
                {totalProducts > 0 ? Math.round((fishProducts.length / totalProducts) * 100) : 0}%
              </span>
            </div>
          </motion.div>

          {/* Card: Equipments count */}
          <motion.div 
            variants={itemVariants}
            className="rounded-2xl border border-border bg-card p-4 flex flex-col justify-between relative overflow-hidden group hover:border-accent-purple/50 transition-all duration-300 shadow-sm"
          >
            <div className="absolute top-0 right-0 w-12 h-12 bg-accent-purple/10 rounded-bl-3xl flex items-center justify-center text-accent-purple group-hover:bg-accent-purple/20 transition-colors">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted">Equipments</span>
              <h2 className="text-3xl font-black text-text mt-2 font-display">{equipmentProducts.length}</h2>
            </div>
            <div className="text-[10px] text-muted mt-4 border-t border-border pt-2 flex justify-between">
              <span>Ratio</span>
              <span className="text-accent-purple font-semibold">
                {totalProducts > 0 ? Math.round((equipmentProducts.length / totalProducts) * 100) : 0}%
              </span>
            </div>
          </motion.div>

          {/* Card: Food count */}
          <motion.div 
            variants={itemVariants}
            className="rounded-2xl border border-border bg-card p-4 flex flex-col justify-between relative overflow-hidden group hover:border-accent-pink/50 transition-all duration-300 shadow-sm"
          >
            <div className="absolute top-0 right-0 w-12 h-12 bg-accent-pink/10 rounded-bl-3xl flex items-center justify-center text-accent-pink group-hover:bg-accent-pink/20 transition-colors">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted">Fish Food</span>
              <h2 className="text-3xl font-black text-text mt-2 font-display">{foodProducts.length}</h2>
            </div>
            <div className="text-[10px] text-muted mt-4 border-t border-border pt-2 flex justify-between">
              <span>Ratio</span>
              <span className="text-accent-pink font-semibold">
                {totalProducts > 0 ? Math.round((foodProducts.length / totalProducts) * 100) : 0}%
              </span>
            </div>
          </motion.div>

          {/* Card: Low Stock Warnings */}
          <motion.div 
            variants={itemVariants}
            className={`rounded-2xl border p-4 flex flex-col justify-between relative overflow-hidden group transition-all duration-300 shadow-sm ${
              lowStockItems.length > 0 
                ? "border-amber-300 bg-amber-500/10 hover:border-amber-400" 
                : "border-border bg-card"
            }`}
          >
            <div className={`absolute top-0 right-0 w-12 h-12 rounded-bl-3xl flex items-center justify-center ${lowStockItems.length > 0 ? "bg-amber-500/20 text-amber-500" : "bg-bg text-muted"}`}>
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted">Low Stock</span>
              <h2 className={`text-3xl font-black mt-2 font-display ${lowStockItems.length > 0 ? "text-amber-500" : "text-text"}`}>
                {lowStockItems.length}
              </h2>
            </div>
            <div className="text-[10px] text-muted mt-4 border-t border-border pt-2 flex justify-between">
              <span>Alert thresholds</span>
              <span className="font-semibold text-amber-500">≤ 2 units</span>
            </div>
          </motion.div>

          {/* Card: Out of Stock Warnings */}
          <motion.div 
            variants={itemVariants}
            className={`rounded-2xl border p-4 flex flex-col justify-between relative overflow-hidden group transition-all duration-300 shadow-sm ${
              outOfStockItems.length > 0 
                ? "border-rose-300 bg-rose-500/10 hover:border-rose-400 animate-pulse-glow" 
                : "border-border bg-card"
            }`}
          >
            <div className={`absolute top-0 right-0 w-12 h-12 rounded-bl-3xl flex items-center justify-center ${outOfStockItems.length > 0 ? "bg-rose-500/20 text-rose-500" : "bg-bg text-muted"}`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted">Out of Stock</span>
              <h2 className={`text-3xl font-black mt-2 font-display ${outOfStockItems.length > 0 ? "text-rose-500" : "text-text"}`}>
                {outOfStockItems.length}
              </h2>
            </div>
            <div className="text-[10px] text-muted mt-4 border-t border-border pt-2 flex justify-between">
              <span>Status</span>
              <span className="font-semibold text-rose-550">Critical</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Mid Section: Financial Valuation Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 md:p-6 rounded-2xl border border-border bg-card shadow-sm bg-gradient-to-r from-accent/5 to-accent-purple/5 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
        >
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent/10 to-accent-purple/10 border border-accent-purple/20 flex items-center justify-center text-accent-purple">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-text font-bold block">Estimated Inventory Assets Valuation</span>
              <span className="text-muted">Accumulated cost value of all currently stored physical stock items.</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[9px] uppercase font-bold text-muted block">Total Net Assets Value</span>
            <span className="text-2xl font-black text-accent-purple font-display">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </motion.div>

        {/* Main Grid: Stock Warnings & Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Stock Alert Center & Editor (8 cols) */}
          <div className="lg:col-span-8 rounded-2xl border border-border bg-card shadow-sm relative min-h-[400px] overflow-hidden">
            
            {/* Header */}
            <div className="p-5 border-b border-border bg-bg/50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-text uppercase tracking-wider flex items-center gap-2">
                <span>Stock Alert Center</span>
                <span className="text-[10px] font-normal text-muted capitalize">({criticalItems.length} alerts pending)</span>
              </h3>
              {criticalItems.length > 0 && (
                <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase border border-rose-500/20 bg-rose-500/10 text-rose-500 animate-pulse">
                  Restock Required
                </span>
              )}
            </div>

            {/* Alert Items List */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-bg text-muted font-bold uppercase tracking-wider">
                    <th className="p-4 pl-6">Specimen</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 w-[140px]">Stock Level</th>
                    <th className="p-4 text-center">Visibility</th>
                    <th className="p-4 text-right pr-6 w-[160px]">Quick Adjust</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {criticalItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-24 text-muted font-semibold">
                        🎉 All catalog items are sufficiently stocked!
                      </td>
                    </tr>
                  ) : (
                    criticalItems.map((prod) => {
                       const stockVal = getProductStock(prod);
                       const isOutOfStock = stockVal === 0;
                       const isEditing = editingStockId === prod.id;

                       return (
                        <tr key={prod.id} className="hover:bg-bg/40 transition-colors">
                          {/* Image & Name */}
                          <td className="p-4 pl-6 flex items-center gap-3">
                            <div className="relative h-9 w-9 rounded-lg overflow-hidden border border-border shrink-0 bg-bg">
                              <Image
                                src={prod.imageBase64 || prod.image || ""}
                                alt={prod.name}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                            <div className="max-w-[150px] md:max-w-[180px]">
                              <span className="font-semibold text-text block truncate">{prod.name}</span>
                              <span className="text-[10px] text-muted block truncate capitalize">ID: {prod.id}</span>
                            </div>
                          </td>

                          {/* Type */}
                          <td className="p-4 text-text/80 capitalize">{(prod.categoryType || prod.type || "").toLowerCase()}</td>

                          {/* Status */}
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                              isOutOfStock 
                                ? "border-rose-500/20 bg-rose-500/10 text-rose-500"
                                : "border-amber-500/25 bg-amber-500/10 text-amber-500"
                            }`}>
                              {isOutOfStock ? "Out of Stock" : "Low Stock"}
                            </span>
                          </td>

                          {/* Stock Level Editor */}
                          <td className="p-4">
                            {isEditing ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  value={tempStockValue}
                                  onChange={(e) => setTempStockValue(Math.max(0, parseInt(e.target.value) || 0))}
                                  className="w-14 bg-bg border border-border focus:border-accent-purple rounded px-1.5 py-1 text-center text-xs text-text focus:outline-none font-bold"
                                  disabled={updatingId === prod.id}
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleSaveDirectStock(prod.id)}
                                  disabled={updatingId === prod.id}
                                  className="p-1 rounded bg-accent-purple/10 text-accent-purple border border-accent-purple/20 hover:bg-accent-purple/20 cursor-pointer disabled:opacity-50"
                                  title="Save Stock"
                                >
                                  {updatingId === prod.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingStockId(prod.id);
                                  setTempStockValue(stockVal);
                                }}
                                className="font-bold text-text hover:text-accent-purple border-b border-dashed border-border hover:border-accent-purple pb-0.5 cursor-pointer"
                                title="Click to edit stock level directly"
                              >
                                {stockVal} units
                              </button>
                            )}
                          </td>

                          {/* Visibility status */}
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleToggleStatus(prod.id, prod.status)}
                              disabled={updatingId === prod.id}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer disabled:opacity-50 ${
                                prod.status === "Active"
                                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                                  : "border-rose-500/20 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                              }`}
                              title={prod.status === "Active" ? "Set Inactive (Hide from Shop)" : "Set Active (Show in Shop)"}
                            >
                              {prod.status === "Active" ? (
                                <Eye className="w-3.5 h-3.5" />
                              ) : (
                                <EyeOff className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </td>

                          {/* Quick Increment/Decrement */}
                          <td className="p-4 text-right pr-6">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleQuickStockAdjust(prod.id, stockVal, -1)}
                                disabled={updatingId === prod.id || stockVal <= 0}
                                className="h-7 w-7 rounded-lg border border-border bg-card text-muted hover:text-text hover:bg-bg transition-all cursor-pointer flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                                title="Decrease stock by 1"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleQuickStockAdjust(prod.id, stockVal, 1)}
                                disabled={updatingId === prod.id}
                                className="h-7 w-7 rounded-lg border border-border bg-card text-muted hover:text-text hover:bg-bg transition-all cursor-pointer flex items-center justify-center disabled:opacity-30 shadow-sm"
                                title="Increase stock by 1"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>

          {/* Right Side: Category Metrics Breakdown (4 cols) */}
          <div className="lg:col-span-4 rounded-2xl border border-border bg-card p-5 shadow-sm relative overflow-hidden">
            
            <h3 className="text-xs uppercase font-bold tracking-widest text-muted mb-5 pb-3 border-b border-border">
              Category Distribution
            </h3>

            {categoryCounts.length === 0 ? (
              <div className="py-12 text-center text-muted font-semibold text-xs">
                No categories defined.
              </div>
            ) : (
              <div className="flex flex-col gap-4 text-xs">
                {categoryCounts.map((cat) => {
                  // Find relative percentage for progress bar
                  const maxCount = Math.max(...categoryCounts.map((c) => c.count), 1);
                  const percentage = Math.min(100, Math.max(5, (cat.count / maxCount) * 100));

                  return (
                    <div key={cat.id} className="relative">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-semibold text-text">{cat.name}</span>
                        <span className="text-muted bg-bg px-1.5 py-0.5 rounded text-[9px] border border-border uppercase shrink-0">
                          {cat.count} items
                        </span>
                      </div>

                      {/* Bar indicator wrapper */}
                      <div className="w-full h-1.5 bg-bg border border-border rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            cat.type === "fish"
                              ? "bg-gradient-to-r from-accent to-blue-500"
                              : cat.type === "equipment"
                              ? "bg-gradient-to-r from-accent-purple to-purple-600"
                              : "bg-gradient-to-r from-accent-pink to-rose-500"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      
                      <span className="text-[8px] uppercase tracking-wider text-muted block mt-1">
                        Catalog Group: {cat.type}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

      </div>
    </main>
  );
}
