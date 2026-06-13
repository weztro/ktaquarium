"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RouteGuard from "@/components/RouteGuard";
import { useAuth } from "@/components/AuthProvider";
import { 
  collection, query, doc, setDoc, 
  updateDoc, deleteDoc, getDocs, writeBatch 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { mockProducts } from "@/lib/products";
import { 
  Plus, Edit, Trash2, Package, X, Loader2, 
  DollarSign, Archive, Layers, Upload, Info, ShieldAlert
} from "lucide-react";
import { useToast } from "@/components/Toast";
import { motion, AnimatePresence } from "framer-motion";
import { convertImageToBase64 } from "@/lib/image";
import { subscribeToCollection } from "@/lib/firestoreService";

type ProductTab = "FISHES" | "EQUIPMENTS" | "FOOD";

// Default SVG illustrations to fallback/seeding
const fishesBase64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgNDAwIDMwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0UwRjJGRSIvPjxwYXRoIGQ9Ik0xMDAsMTUwIEMxNTAsMTAwIDI1MCwxMDAgMzAwLDE1MCBDMjUwLDIwMCAxNTAsMjAwIDEwMCwxNTAgWiIgZmlsbD0iIzAyODRCNyIvPjxwYXRoIGQ9Ik0zMDAsMTUwIEwzNDAsMTIwIEwzMzAsMTUwIEwzNDAsMTgwIFoiIGZpbGw9IiMwMjg0QzciLz48Y2lyY2xlIGN4PSIxNTAiIGN5PSIxNDUiIHI9IjUiIGZpbGw9IiNGRkZGRkYiLz48L3N2Zz4=";
const equipmentsBase64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgNDAwIDMwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0YzRThGRiIvPjxyZWN0IHg9IjEyMCIgeT0iOTAiIHdpZHRoPSIxNjAiIGhlaWdodD0iMTIwIiByeD0iMTUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzdFMjJDRSIgc3Ryb2tlLXdpZHRoPSI4Ii8+PGxpbmUgeDE9IjEyMCIgeTE9IjEzMCIgeDI9IjI4MCIgeTI9IjEzMCIgc3Ryb2tlPSIjN0UyMkNFIiBzdHJva2Utd2lkdGg9IjQiLz48Y2lyY2xlIGN4PSIyMDAiIGN5PSIxNTAiIHI9IjEwIiBmaWxsPSIjN0UyMkNFIi8+PC9zdmc+";
const foodBase64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgNDAwIDMwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0ZDRTdGMyIvPjxyZWN0IHg9IjE1MCIgeT0iODAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTQwIiByeD0iMTAiIGZpbGw9IiNEQjI3NzciLz48cmVjdCB4PSIxNjAiIHk9IjEyMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRkZGRkZGIi8+PHRleHQgeD0iMjAwIiB5PSIxNDUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iI0RCMjc3NyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Rk9PRDwvdGV4dD48L3N2Zz4=";

export default function ProductManagementPage() {
  return (
    <RouteGuard allowedRoles={["Admin", "Employee"]}>
      <Navbar />
      <ProductManagementContent />
      <Footer />
    </RouteGuard>
  );
}

function ProductManagementContent() {
  const { userRole } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<ProductTab>("FISHES");
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitRunning, setIsSubmitRunning] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formCategoryType, setFormCategoryType] = useState<ProductTab>("FISHES");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formQuantity, setFormQuantity] = useState<number>(0);
  const [formImageBase64, setFormImageBase64] = useState("");
  const [formStatus, setFormStatus] = useState("Active");

  // Editing state
  const [editingItem, setEditingItem] = useState<any>(null);

  // Fetch products & categories in real-time
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
        console.error("ProductManagementContent listen error in 'products' collection:", err);
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
        console.error("ProductManagementContent listen error in 'categories' collection:", err);
        showToast("Insufficient permissions to load categories.", "error");
      }
    );

    return () => {
      unsubProducts();
      unsubCats();
    };
  }, []);

  // Seeding catalogTypes and products with base64 images
  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const batch = writeBatch(db);

      // Seed catalogTypes
      const initialCatalogTypes = [
        {
          id: "FISHES",
          name: "Fishes",
          description: "Premium exotic and monster fishes",
          imageBase64: fishesBase64,
          displayOrder: 1,
          isActive: true
        },
        {
          id: "EQUIPMENTS",
          name: "Equipments",
          description: "Aquarium tanks, filters and accessories",
          imageBase64: equipmentsBase64,
          displayOrder: 2,
          isActive: true
        },
        {
          id: "FOOD",
          name: "Fish Food",
          description: "Premium nutrition products",
          imageBase64: foodBase64,
          displayOrder: 3,
          isActive: true
        }
      ];

      initialCatalogTypes.forEach((c) => {
        batch.set(doc(db, "catalogTypes", c.id), c);
      });

      // Map mock products to the new schema
      mockProducts.forEach((p) => {
        let typeVal: ProductTab = "FISHES";
        let defaultImg = fishesBase64;
        if (p.type === "equipment") {
          typeVal = "EQUIPMENTS";
          defaultImg = equipmentsBase64;
        } else if (p.type === "food") {
          typeVal = "FOOD";
          defaultImg = foodBase64;
        }

        const newProd = {
          id: p.id,
          name: p.name,
          description: p.description,
          categoryType: typeVal,
          price: Number(p.price) || 0,
          quantity: Number(p.stock ?? 0) || 0,
          imageBase64: defaultImg,
          status: (p.stock ?? 0) > 0 ? "Active" : "Inactive",
          createdDate: new Date().toISOString()
        };
        batch.set(doc(db, "products", p.id), newProd);
      });

      await batch.commit();
      showToast("Database seeded successfully with Base64 products and categories!", "success");
    } catch (err) {
      console.error("Database seeding failed:", err);
      showToast("Database seeding failed.", "error");
    } finally {
      setIsSeeding(false);
    }
  };

  const handleOpenAdd = () => {
    setFormName("");
    setFormCategoryType(activeTab);
    setFormDescription("");
    setFormPrice(0);
    setFormQuantity(0);
    setFormImageBase64(activeTab === "FISHES" ? fishesBase64 : activeTab === "EQUIPMENTS" ? equipmentsBase64 : foodBase64);
    setFormStatus("Active");
    setIsAddOpen(true);
  };

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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 512000) { // 500KB limit warning for Firestore doc size safety
        showToast("Image is too large. Keep it under 500KB.", "error");
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
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
      const generatedId = formName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const docRef = doc(db, "products", generatedId);
      
      const payload = {
        id: generatedId,
        name: formName,
        description: formDescription,
        categoryType: formCategoryType,
        price: Number(formPrice),
        quantity: Number(formQuantity),
        imageBase64: formImageBase64 || (formCategoryType === "FISHES" ? fishesBase64 : formCategoryType === "EQUIPMENTS" ? equipmentsBase64 : foodBase64),
        status: formStatus,
        createdDate: new Date().toISOString()
      };

      await setDoc(docRef, payload);
      showToast(`${formName} created successfully!`, "success");
      setIsAddOpen(false);
    } catch (err) {
      console.error("Create product failed:", err);
      showToast("Failed to create product.", "error");
    } finally {
      setIsSubmitRunning(false);
    }
  };

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
        // Employees can only edit Price and Stock (Quantity)
        payload = {
          price: Number(formPrice),
          quantity: Number(formQuantity),
          status: formQuantity > 0 ? "Active" : "Inactive"
        };
      } else {
        // Admins have full rights
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
      console.error("Update product failed:", err);
      showToast("Failed to update product.", "error");
    } finally {
      setIsSubmitRunning(false);
    }
  };

  const handleDelete = async (itemId: string, itemName: string) => {
    if (confirm(`Are you sure you want to delete ${itemName}?`)) {
      try {
        await deleteDoc(doc(db, "products", itemId));
        showToast("Product deleted successfully.", "success");
      } catch (err) {
        console.error("Delete product failed:", err);
        showToast("Failed to delete product.", "error");
      }
    }
  };

  const renderTabLinks = () => {
    const tabs: ProductTab[] = ["FISHES", "EQUIPMENTS", "FOOD"];
    return (
      <div className="flex border-b border-slate-200 bg-slate-100 p-1.5 rounded-xl mb-8 overflow-x-auto gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab 
                ? "bg-white text-cyan-600 shadow-sm border border-slate-200" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    );
  };

  const filteredItems = products.filter((p) => p.categoryType === activeTab);

  return (
    <main className="min-h-screen bg-bg pt-28 pb-16 relative overflow-hidden text-text transition-colors duration-300">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-border/40 via-transparent to-transparent pointer-events-none" />
 
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-border pb-6">
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-accent">Inventory Catalog</span>
            <h1 className="text-3xl md:text-4xl font-display font-black text-text mt-1">
              Product Management
            </h1>
          </div>
          <div className="flex gap-3 self-start md:self-end">
            {products.length === 0 && !loading && !error && (
              <button
                onClick={handleSeedData}
                disabled={isSeeding}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-dashed border-accent hover:border-accent/80 text-xs font-bold uppercase tracking-widest text-accent transition-all cursor-pointer disabled:opacity-50"
              >
                {isSeeding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Seeding...</span>
                  </>
                ) : (
                  <span>Seed Mock Products</span>
                )}
              </button>
            )}
            {userRole === "Admin" && (
              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent to-accent-purple text-xs font-bold uppercase tracking-widest text-white shadow-md hover:scale-[1.02] transition-all cursor-pointer"
              >
                <Plus className="w-4.5 h-4.5" /> Add Product
              </button>
            )}
          </div>
        </div>
 
        {/* Tab Selection */}
        {renderTabLinks()}
 
        {/* Dynamic Card Grid (Desktop: 4 cols, Tablet: 2 cols, Mobile: 1 col) */}
        <div className="min-h-[400px]">
          {error ? (
            <div className="text-center py-20 rounded-3xl border border-border bg-card p-8 shadow-sm flex flex-col items-center justify-center">
              <ShieldAlert className="w-12 h-12 text-red-500 mb-4 animate-pulse" />
              <h3 className="text-lg font-bold text-text mb-2">Access Restrained</h3>
              <p className="text-muted text-sm max-w-sm mb-6">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 rounded-full bg-accent hover:bg-accent/80 text-white text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                Retry Connection
              </button>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-8 h-8 animate-spin text-accent mb-2" />
              <span className="text-xs text-muted font-bold uppercase tracking-wider">Loading items...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-24 rounded-3xl border border-border bg-card p-8 shadow-sm">
              <span className="text-4xl mb-4 block">📦</span>
              <h3 className="text-lg font-bold text-text mb-2">No products found</h3>
              <p className="text-sm text-muted">
                You haven't added any products in this category yet. Click 'Add Product' to start.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <div 
                  key={item.id}
                  className="rounded-2xl border border-border bg-card shadow-sm flex flex-col justify-between h-full overflow-hidden hover:shadow-md transition-all duration-300 relative group"
                >
                  {/* Product Image */}
                  <div className="relative h-48 w-full border-b border-border bg-bg overflow-hidden">
                    <img
                      src={item.imageBase64}
                      alt={item.name}
                      className="object-cover h-full w-full"
                    />
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase border ${
                        item.quantity > 0 && item.status === "Active"
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      }`}>
                        {item.quantity > 0 && item.status === "Active" ? "In Stock" : "Inactive / Out"}
                      </span>
                    </div>
                  </div>
 
                  {/* Body details */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider font-bold text-muted block mb-1">
                        {item.categoryType}
                      </span>
                      <h3 className="font-bold text-text text-sm truncate mb-1" title={item.name}>
                        {item.name}
                      </h3>
                      <p className="text-xs text-muted line-clamp-2 mb-3">
                        {item.description || "No description provided."}
                      </p>
                    </div>
 
                    <div className="flex items-center justify-between border-t border-border pt-3">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-muted block">Price</span>
                        <span className="text-sm font-black text-accent">${item.price}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] uppercase font-bold text-muted block">Quantity</span>
                        <span className="text-xs font-semibold text-text">{item.quantity} items</span>
                      </div>
                    </div>
                  </div>
 
                  {/* Actions overlay / footer based on user role */}
                  <div className="bg-bg border-t border-border px-4 py-3 flex items-center justify-end gap-3.5">
                    {userRole === "Admin" ? (
                      <>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="flex items-center gap-1 text-[11px] font-bold text-text hover:text-accent transition-colors cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          className="flex items-center gap-1 text-[11px] font-bold text-text hover:text-red-500 transition-colors cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </>
                    ) : userRole === "Employee" ? (
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="flex items-center gap-1 text-[11px] font-bold text-text hover:text-accent transition-colors cursor-pointer"
                        title="Edit Stock & Price"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit Stock/Price
                      </button>
                    ) : (
                      <span className="text-[10px] text-muted font-semibold tracking-wider uppercase">View Only</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ==================== ADD PRODUCT MODAL ==================== */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitRunning && setIsAddOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md overflow-y-auto max-h-[85vh] rounded-2xl border border-slate-200 bg-white p-6 shadow-xl z-10"
            >
              <button
                onClick={() => setIsAddOpen(false)}
                disabled={isSubmitRunning}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 cursor-pointer disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-display font-black text-slate-900 mb-5">Add New Product</h2>

              <form onSubmit={handleCreate} className="flex flex-col gap-4 text-xs">
                
                {/* Product Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-wider text-slate-450 font-bold">Product Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    disabled={isSubmitRunning}
                    className="w-full rounded-xl px-4 py-3"
                    placeholder="e.g. Red Sea Max 300"
                  />
                </div>

                {/* Category Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-wider text-slate-450 font-bold">Category Type</label>
                  <select
                    value={formCategoryType}
                    onChange={(e) => setFormCategoryType(e.target.value as ProductTab)}
                    disabled={isSubmitRunning}
                    className="w-full rounded-xl px-4 py-3 cursor-pointer"
                  >
                    <option value="FISHES">Fishes</option>
                    <option value="EQUIPMENTS">Equipments</option>
                    <option value="FOOD">Fish Food</option>
                  </select>
                </div>

                {/* Price & Quantity Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase tracking-wider text-slate-450 font-bold">Price ($)</label>
                    <input
                      type="number"
                      required
                      min="0.01"
                      step="0.01"
                      value={formPrice || ""}
                      onChange={(e) => setFormPrice(Number(e.target.value))}
                      disabled={isSubmitRunning}
                      className="w-full rounded-xl px-4 py-3"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase tracking-wider text-slate-450 font-bold">Quantity</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formQuantity || "0"}
                      onChange={(e) => setFormQuantity(Number(e.target.value))}
                      disabled={isSubmitRunning}
                      className="w-full rounded-xl px-4 py-3"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-wider text-slate-450 font-bold">Description</label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    disabled={isSubmitRunning}
                    className="w-full rounded-xl px-4 py-3 h-20 resize-none"
                    placeholder="Enter short details..."
                  />
                </div>

                {/* Image Upload */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-wider text-slate-450 font-bold">Product Image</label>
                  <div className="flex items-center gap-3 border border-dashed border-slate-200 p-3 rounded-xl bg-slate-50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={isSubmitRunning}
                      className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer"
                    />
                  </div>
                  {/* Base64 Image Preview */}
                  {formImageBase64 && (
                    <div className="relative h-20 w-20 rounded-xl overflow-hidden border border-slate-200 mt-2">
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
                  <label className="text-[9px] uppercase tracking-wider text-slate-450 font-bold">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    disabled={isSubmitRunning}
                    className="w-full rounded-xl px-4 py-3 cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitRunning}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 py-3.5 px-4 font-bold text-white uppercase tracking-wider cursor-pointer shadow-md mt-2 disabled:opacity-50"
                >
                  {isSubmitRunning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Add Product</span>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== EDIT PRODUCT MODAL ==================== */}
      <AnimatePresence>
        {isEditOpen && editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitRunning && setIsEditOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md overflow-y-auto max-h-[85vh] rounded-2xl border border-slate-200 bg-white p-6 shadow-xl z-10"
            >
              <button
                onClick={() => setIsEditOpen(false)}
                disabled={isSubmitRunning}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 cursor-pointer disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-display font-black text-slate-900 mb-2">Edit Product</h2>
              <p className="text-[10px] text-slate-450 uppercase font-semibold tracking-wider mb-5">
                Role Permissions: <strong className="text-cyan-600">{userRole}</strong>
              </p>

              {userRole === "Employee" && (
                <div className="flex items-center gap-2 p-3 bg-cyan-50 border border-cyan-100 rounded-xl mb-4 text-[10px] text-cyan-800 leading-relaxed">
                  <Info className="w-4 h-4 shrink-0 text-cyan-600" />
                  <span>Employees can only modify pricing and inventory stock levels. Description and media files are locked.</span>
                </div>
              )}

              <form onSubmit={handleUpdate} className="flex flex-col gap-4 text-xs">
                
                {/* Product Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-wider text-slate-450 font-bold">Product Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    disabled={isSubmitRunning || userRole === "Employee"}
                    className="w-full rounded-xl px-4 py-3 disabled:opacity-60"
                  />
                </div>

                {/* Category Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-wider text-slate-450 font-bold">Category Type</label>
                  <select
                    value={formCategoryType}
                    onChange={(e) => setFormCategoryType(e.target.value as ProductTab)}
                    disabled={isSubmitRunning || userRole === "Employee"}
                    className="w-full rounded-xl px-4 py-3 cursor-pointer disabled:opacity-60"
                  >
                    <option value="FISHES">Fishes</option>
                    <option value="EQUIPMENTS">Equipments</option>
                    <option value="FOOD">Fish Food</option>
                  </select>
                </div>

                {/* Price & Quantity Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase tracking-wider text-slate-450 font-bold">Price ($)</label>
                    <input
                      type="number"
                      required
                      min="0.01"
                      step="0.01"
                      value={formPrice || ""}
                      onChange={(e) => setFormPrice(Number(e.target.value))}
                      disabled={isSubmitRunning}
                      className="w-full rounded-xl px-4 py-3"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase tracking-wider text-slate-450 font-bold">Quantity</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formQuantity || "0"}
                      onChange={(e) => setFormQuantity(Number(e.target.value))}
                      disabled={isSubmitRunning}
                      className="w-full rounded-xl px-4 py-3"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-wider text-slate-450 font-bold">Description</label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    disabled={isSubmitRunning || userRole === "Employee"}
                    className="w-full rounded-xl px-4 py-3 h-20 resize-none disabled:opacity-60"
                  />
                </div>

                {/* Image Upload */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-wider text-slate-450 font-bold">Product Image</label>
                  <div className="flex items-center gap-3 border border-dashed border-slate-200 p-3 rounded-xl bg-slate-50 opacity-100 disabled:opacity-60">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={isSubmitRunning || userRole === "Employee"}
                      className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer disabled:cursor-not-allowed"
                    />
                  </div>
                  {formImageBase64 && (
                    <div className="relative h-20 w-20 rounded-xl overflow-hidden border border-slate-200 mt-2">
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
                  <label className="text-[9px] uppercase tracking-wider text-slate-450 font-bold">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    disabled={isSubmitRunning || userRole === "Employee"}
                    className="w-full rounded-xl px-4 py-3 cursor-pointer disabled:opacity-60"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitRunning}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 py-3.5 px-4 font-bold text-white uppercase tracking-wider cursor-pointer shadow-md mt-2 disabled:opacity-50"
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
