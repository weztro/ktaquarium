"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useTheme } from "@/components/ThemeProvider";
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
  const { theme } = useTheme();
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
  const [formCategoryType, setFormCategoryType] = useState<string>("monster");
  const [formDescription, setFormDescription] = useState("");

  // Fish Specific Form Fields
  const [formScientificName, setFormScientificName] = useState("");
  const [formCareLevel, setFormCareLevel] = useState("Easy");
  const [formTankSize, setFormTankSize] = useState("");
  const [formFeedingInfo, setFormFeedingInfo] = useState("");
  const [formSize, setFormSize] = useState("");
  const [formOrigin, setFormOrigin] = useState("");
  const [formWaterParams, setFormWaterParams] = useState("");
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
    setFormCategoryType(activeTab === "FISHES" ? "monster" : activeTab);
    setFormDescription("");
    setFormPrice(0);
    setFormQuantity(0);
    setFormImageBase64(activeTab === "FISHES" ? fishesBase64 : activeTab === "EQUIPMENTS" ? equipmentsBase64 : foodBase64);
    setFormStatus("Active");
    
    // Reset fish spec states
    setFormScientificName("");
    setFormCareLevel("Easy");
    setFormTankSize("");
    setFormFeedingInfo("");
    setFormSize("");
    setFormOrigin("");
    setFormWaterParams("");
    
    setIsAddOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setFormName(item.name || "");
    setFormCategoryType(item.categoryType || "monster");
    setFormDescription(item.description || "");
    setFormPrice(item.price || 0);
    setFormQuantity(item.quantity || 0);
    setFormImageBase64(item.imageBase64 || "");
    setFormStatus(item.status || "Active");
    
    // Populate fish spec states
    setFormScientificName(item.scientificName || "");
    setFormCareLevel(item.careLevel || "Easy");
    setFormTankSize(item.tankSize || "");
    setFormFeedingInfo(item.feedingInfo || "");
    setFormSize(item.size || item.weight || "");
    setFormOrigin(item.origin || "");
    setFormWaterParams(item.waterParams || "");
    
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
      
      const isFish = ["monster", "exotic", "normal"].includes(formCategoryType);
      const defaultImg = isFish ? fishesBase64 : formCategoryType === "EQUIPMENTS" ? equipmentsBase64 : foodBase64;

      const payload: any = {
        id: generatedId,
        name: formName,
        description: formDescription,
        categoryType: formCategoryType,
        price: Number(formPrice),
        quantity: Number(formQuantity),
        imageBase64: formImageBase64 || defaultImg,
        status: formStatus,
        createdDate: new Date().toISOString()
      };

      if (isFish) {
        payload.scientificName = formScientificName;
        payload.careLevel = formCareLevel;
        payload.tankSize = formTankSize;
        payload.feedingInfo = formFeedingInfo;
        payload.size = formSize;
        payload.origin = formOrigin;
        payload.waterParams = formWaterParams;
      }

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
        // Employees can edit Price, Stock (Quantity) and Status (Availability)
        payload = {
          price: Number(formPrice),
          quantity: Number(formQuantity),
          status: formStatus
        };
      } else {
        // Admins have full rights
        const isFish = ["monster", "exotic", "normal"].includes(formCategoryType);
        payload = {
          name: formName,
          description: formDescription,
          categoryType: formCategoryType,
          price: Number(formPrice),
          quantity: Number(formQuantity),
          imageBase64: formImageBase64,
          status: formStatus,
          scientificName: isFish ? formScientificName : "",
          careLevel: isFish ? formCareLevel : "",
          tankSize: isFish ? formTankSize : "",
          feedingInfo: isFish ? formFeedingInfo : "",
          size: isFish ? formSize : "",
          origin: isFish ? formOrigin : "",
          waterParams: isFish ? formWaterParams : ""
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

  const filteredItems = products.filter((p) => {
    if (activeTab === "FISHES") {
      return ["monster", "exotic", "normal", "FISHES"].includes(p.categoryType);
    }
    return p.categoryType === activeTab;
  });

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
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitRunning && setIsAddOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.form
              onSubmit={handleCreate}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="relative w-full h-full md:h-auto md:max-h-[90vh] md:max-w-[800px] bg-white dark:bg-[#020817] rounded-none md:rounded-3xl border-t border-x md:border border-slate-200 dark:border-white/[0.08] shadow-2xl flex flex-col overflow-hidden z-10"
            >
              {/* Sticky Header */}
              <div className="px-6 py-4 border-b border-slate-200 dark:border-white/[0.08] flex justify-between items-center shrink-0 bg-white dark:bg-[#020817]">
                <div className="flex flex-col">
                  <h2 className="text-lg font-display font-black text-[#0F172A] dark:text-white">Add New Product</h2>
                  <div className="h-0.5 w-12 bg-gradient-to-r from-cyan-500 to-purple-600 rounded mt-1.5 shadow-[0_0_8px_rgba(6,182,212,0.4)]" />
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  disabled={isSubmitRunning}
                  className="p-2 rounded-full bg-[#F1F5F9] dark:bg-[#0F172A] text-slate-400 hover:text-slate-650 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs text-[#0F172A] dark:text-white">
                {/* Product Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-bold">Product Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    disabled={isSubmitRunning}
                    className="w-full rounded-xl px-4 py-3 !bg-white dark:!bg-[#0F172A] !text-[#0F172A] dark:!text-white !border-[#E2E8F0] dark:!border-white/[0.08] placeholder:!text-[#64748B] dark:placeholder:!text-[#94A3B8] focus:!border-cyan-500 focus:!ring-2 focus:!ring-cyan-500/20 focus:!outline-none transition-all"
                    placeholder="e.g. Red Sea Max 300"
                  />
                </div>

                {/* Category Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-bold">Category Type</label>
                  <select
                    value={formCategoryType}
                    onChange={(e) => {
                      setFormCategoryType(e.target.value);
                      if (["monster", "exotic", "normal"].includes(e.target.value)) {
                        setFormImageBase64(fishesBase64);
                      } else if (e.target.value === "EQUIPMENTS") {
                        setFormImageBase64(equipmentsBase64);
                      } else {
                        setFormImageBase64(foodBase64);
                      }
                    }}
                    disabled={isSubmitRunning}
                    className="w-full rounded-xl px-4 py-3 cursor-pointer !bg-white dark:!bg-[#0F172A] !text-[#0F172A] dark:!text-white !border-[#E2E8F0] dark:!border-white/[0.08] focus:!border-cyan-500 focus:!ring-2 focus:!ring-cyan-500/20 focus:!outline-none transition-all"
                  >
                    <option value="monster" className="bg-white dark:bg-[#0F172A]">Monster Fish</option>
                    <option value="exotic" className="bg-white dark:bg-[#0F172A]">Exotic Fish</option>
                    <option value="normal" className="bg-white dark:bg-[#0F172A]">Normal Fish</option>
                    <option value="EQUIPMENTS" className="bg-white dark:bg-[#0F172A]">Equipments</option>
                    <option value="FOOD" className="bg-white dark:bg-[#0F172A]">Fish Food</option>
                  </select>
                </div>

                {/* Price & Quantity Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-bold">Price ($)</label>
                    <input
                      type="number"
                      required
                      min="0.01"
                      step="0.01"
                      value={formPrice || ""}
                      onChange={(e) => setFormPrice(Number(e.target.value))}
                      disabled={isSubmitRunning}
                      className="w-full rounded-xl px-4 py-3 !bg-white dark:!bg-[#0F172A] !text-[#0F172A] dark:!text-white !border-[#E2E8F0] dark:!border-white/[0.08] placeholder:!text-[#64748B] dark:placeholder:!text-[#94A3B8] focus:!border-cyan-500 focus:!ring-2 focus:!ring-cyan-500/20 focus:!outline-none transition-all"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-bold">Quantity</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formQuantity || "0"}
                      onChange={(e) => setFormQuantity(Number(e.target.value))}
                      disabled={isSubmitRunning}
                      className="w-full rounded-xl px-4 py-3 !bg-white dark:!bg-[#0F172A] !text-[#0F172A] dark:!text-white !border-[#E2E8F0] dark:!border-white/[0.08] focus:!border-cyan-500 focus:!ring-2 focus:!ring-cyan-500/20 focus:!outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-bold">Description</label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    disabled={isSubmitRunning}
                    className="w-full rounded-xl px-4 py-3 h-20 resize-none !bg-white dark:!bg-[#0F172A] !text-[#0F172A] dark:!text-white !border-[#E2E8F0] dark:!border-white/[0.08] placeholder:!text-[#64748B] dark:placeholder:!text-[#94A3B8] focus:!border-cyan-500 focus:!ring-2 focus:!ring-cyan-500/20 focus:!outline-none transition-all"
                    placeholder="Enter short details..."
                  />
                </div>

                {/* Fish Specifications Card (conditional) */}
                {["monster", "exotic", "normal"].includes(formCategoryType) && (
                  <div className="p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#071A52] border border-[#E2E8F0] dark:border-white/[0.08] space-y-4 shadow-sm">
                    <span className="text-[10px] uppercase tracking-widest text-[#7C3AED] dark:text-[#a78bfa] font-black block">Fish Specifications</span>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-bold">Scientific Name</label>
                        <input
                          type="text"
                          value={formScientificName}
                          onChange={(e) => setFormScientificName(e.target.value)}
                          className="w-full rounded-lg px-3 py-2.5 !bg-white dark:!bg-[#0F172A] !text-[#0F172A] dark:!text-white !border-[#E2E8F0] dark:!border-white/[0.08] placeholder:!text-[#64748B] dark:placeholder:!text-[#94A3B8] focus:!border-cyan-500 focus:!ring-2 focus:!ring-cyan-500/20 focus:!outline-none transition-all"
                          placeholder="e.g. Osteoglossum bicirrhosum"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-bold">Care Level</label>
                        <select
                          value={formCareLevel}
                          onChange={(e) => setFormCareLevel(e.target.value)}
                          className="w-full rounded-lg px-3 py-2.5 cursor-pointer !bg-white dark:!bg-[#0F172A] !text-[#0F172A] dark:!text-white !border-[#E2E8F0] dark:!border-white/[0.08] focus:!border-cyan-500 focus:!ring-2 focus:!ring-cyan-500/20 focus:!outline-none transition-all"
                        >
                          <option value="Easy" className="bg-white dark:bg-[#0F172A]">Easy</option>
                          <option value="Moderate" className="bg-white dark:bg-[#0F172A]">Moderate</option>
                          <option value="Expert" className="bg-white dark:bg-[#0F172A]">Expert</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-bold">Tank Size Rec.</label>
                        <input
                          type="text"
                          value={formTankSize}
                          onChange={(e) => setFormTankSize(e.target.value)}
                          className="w-full rounded-lg px-3 py-2.5 !bg-white dark:!bg-[#0F172A] !text-[#0F172A] dark:!text-white !border-[#E2E8F0] dark:!border-white/[0.08] placeholder:!text-[#64748B] dark:placeholder:!text-[#94A3B8] focus:!border-cyan-500 focus:!ring-2 focus:!ring-cyan-500/20 focus:!outline-none transition-all"
                          placeholder="e.g. 50G+"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-bold">Diet / Feeding</label>
                        <input
                          type="text"
                          value={formFeedingInfo}
                          onChange={(e) => setFormFeedingInfo(e.target.value)}
                          className="w-full rounded-lg px-3 py-2.5 !bg-white dark:!bg-[#0F172A] !text-[#0F172A] dark:!text-white !border-[#E2E8F0] dark:!border-white/[0.08] placeholder:!text-[#64748B] dark:placeholder:!text-[#94A3B8] focus:!border-cyan-500 focus:!ring-2 focus:!ring-cyan-500/20 focus:!outline-none transition-all"
                          placeholder="e.g. Omnivore"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-bold">Size / Weight</label>
                        <input
                          type="text"
                          value={formSize}
                          onChange={(e) => setFormSize(e.target.value)}
                          className="w-full rounded-lg px-3 py-2.5 !bg-white dark:!bg-[#0F172A] !text-[#0F172A] dark:!text-white !border-[#E2E8F0] dark:!border-white/[0.08] placeholder:!text-[#64748B] dark:placeholder:!text-[#94A3B8] focus:!border-cyan-500 focus:!ring-2 focus:!ring-cyan-500/20 focus:!outline-none transition-all"
                          placeholder="e.g. 15 cm"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-bold">Origin</label>
                        <input
                          type="text"
                          value={formOrigin}
                          onChange={(e) => setFormOrigin(e.target.value)}
                          className="w-full rounded-lg px-3 py-2.5 !bg-white dark:!bg-[#0F172A] !text-[#0F172A] dark:!text-white !border-[#E2E8F0] dark:!border-white/[0.08] placeholder:!text-[#64748B] dark:placeholder:!text-[#94A3B8] focus:!border-cyan-500 focus:!ring-2 focus:!ring-cyan-500/20 focus:!outline-none transition-all"
                          placeholder="e.g. Amazon River"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-bold">Water Parameters</label>
                      <input
                        type="text"
                        value={formWaterParams}
                        onChange={(e) => setFormWaterParams(e.target.value)}
                        className="w-full rounded-lg px-3 py-2.5 !bg-white dark:!bg-[#0F172A] !text-[#0F172A] dark:!text-white !border-[#E2E8F0] dark:!border-white/[0.08] placeholder:!text-[#64748B] dark:placeholder:!text-[#94A3B8] focus:!border-cyan-500 focus:!ring-2 focus:!ring-cyan-500/20 focus:!outline-none transition-all"
                        placeholder="e.g. pH 6.5 - 7.5 | 24-28°C"
                      />
                    </div>
                  </div>
                )}

                {/* Image Upload */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-bold">Product Image</label>
                  <div className="relative border border-dashed border-[#CBD5E1] dark:border-white/15 p-6 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] hover:bg-[#F1F5F9] dark:hover:bg-[#0F172A]/80 transition-colors flex flex-col items-center justify-center gap-2 text-center cursor-pointer">
                    <Upload className="w-5 h-5 text-[#64748B] dark:text-[#94A3B8]" />
                    <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-semibold">
                      Drag and drop or <span className="text-cyan-500">browse</span> product image
                    </span>
                    <span className="text-[9px] text-[#64748B]/70 dark:text-[#94A3B8]/60">Supports PNG, JPG, JPEG</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={isSubmitRunning}
                      className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                  </div>
                  {/* Base64 Image Preview */}
                  {formImageBase64 && (
                    <div className="relative h-20 w-20 rounded-xl overflow-hidden border border-[#E2E8F0] dark:border-white/10 mt-2">
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
                  <label className="text-[10px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-bold">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    disabled={isSubmitRunning}
                    className="w-full rounded-xl px-4 py-3 cursor-pointer !bg-white dark:!bg-[#0F172A] !text-[#0F172A] dark:!text-white !border-[#E2E8F0] dark:!border-white/[0.08] focus:!border-cyan-500 focus:!ring-2 focus:!ring-cyan-500/20 focus:!outline-none transition-all"
                  >
                    <option value="Active" className="bg-white dark:bg-[#0F172A]">Active</option>
                    <option value="Inactive" className="bg-white dark:bg-[#0F172A]">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="px-6 py-4 border-t border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#071A52]/20 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  disabled={isSubmitRunning}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 border border-[#CBD5E1] dark:border-[#1E293B] text-[#475569] dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitRunning}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer shadow-md hover:shadow-cyan-500/20 hover:opacity-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitRunning ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Add Product</span>
                  )}
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
 
      {/* ==================== EDIT PRODUCT MODAL ==================== */}
      <AnimatePresence>
        {isEditOpen && editingItem && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitRunning && setIsEditOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.form
              onSubmit={handleUpdate}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="relative w-full h-full md:h-auto md:max-h-[90vh] md:max-w-[800px] bg-white dark:bg-[#020817] rounded-none md:rounded-3xl border-t border-x md:border border-slate-200 dark:border-white/[0.08] shadow-2xl flex flex-col overflow-hidden z-10"
            >
              {/* Sticky Header */}
              <div className="px-6 py-4 border-b border-slate-200 dark:border-white/[0.08] flex justify-between items-center shrink-0 bg-white dark:bg-[#020817]">
                <div className="flex flex-col">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-display font-black text-[#0F172A] dark:text-white">Edit Product</h2>
                    <span className="text-[9px] uppercase px-2.5 py-0.5 rounded-full font-bold tracking-wider bg-cyan-100 text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-400">
                      {userRole}
                    </span>
                  </div>
                  <div className="h-0.5 w-12 bg-gradient-to-r from-cyan-500 to-purple-600 rounded mt-1.5 shadow-[0_0_8px_rgba(6,182,212,0.4)]" />
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  disabled={isSubmitRunning}
                  className="p-2 rounded-full bg-[#F1F5F9] dark:bg-[#0F172A] text-slate-400 hover:text-slate-650 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs text-[#0F172A] dark:text-white">
                {userRole === "Employee" && (
                  <div className="flex items-center gap-2 p-3 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-100 dark:border-cyan-900/30 rounded-xl text-[10px] text-cyan-800 dark:text-cyan-200 leading-relaxed">
                    <Info className="w-4 h-4 shrink-0 text-cyan-600 dark:text-cyan-400" />
                    <span>Employees can only modify pricing, inventory stock levels, and status. Title, category, specifications, and media files are locked.</span>
                  </div>
                )}

                {/* Product Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-bold">Product Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    disabled={isSubmitRunning || userRole === "Employee"}
                    className="w-full rounded-xl px-4 py-3 !bg-white dark:!bg-[#0F172A] !text-[#0F172A] dark:!text-white !border-[#E2E8F0] dark:!border-white/[0.08] focus:!border-cyan-500 focus:!ring-2 focus:!ring-cyan-500/20 focus:!outline-none transition-all disabled:opacity-60"
                  />
                </div>

                {/* Category Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-bold">Category Type</label>
                  <select
                    value={formCategoryType}
                    onChange={(e) => setFormCategoryType(e.target.value)}
                    disabled={isSubmitRunning || userRole === "Employee"}
                    className="w-full rounded-xl px-4 py-3 cursor-pointer !bg-white dark:!bg-[#0F172A] !text-[#0F172A] dark:!text-white !border-[#E2E8F0] dark:!border-white/[0.08] focus:!border-cyan-500 focus:!ring-2 focus:!ring-cyan-500/20 focus:!outline-none transition-all disabled:opacity-60"
                  >
                    <option value="monster" className="bg-white dark:bg-[#0F172A]">Monster Fish</option>
                    <option value="exotic" className="bg-white dark:bg-[#0F172A]">Exotic Fish</option>
                    <option value="normal" className="bg-white dark:bg-[#0F172A]">Normal Fish</option>
                    <option value="EQUIPMENTS" className="bg-white dark:bg-[#0F172A]">Equipments</option>
                    <option value="FOOD" className="bg-white dark:bg-[#0F172A]">Fish Food</option>
                  </select>
                </div>

                {/* Price & Quantity Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-bold">Price ($)</label>
                    <input
                      type="number"
                      required
                      min="0.01"
                      step="0.01"
                      value={formPrice || ""}
                      onChange={(e) => setFormPrice(Number(e.target.value))}
                      disabled={isSubmitRunning}
                      className="w-full rounded-xl px-4 py-3 !bg-white dark:!bg-[#0F172A] !text-[#0F172A] dark:!text-white !border-[#E2E8F0] dark:!border-white/[0.08] focus:!border-cyan-500 focus:!ring-2 focus:!ring-cyan-500/20 focus:!outline-none transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-bold">Quantity</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formQuantity || "0"}
                      onChange={(e) => setFormQuantity(Number(e.target.value))}
                      disabled={isSubmitRunning}
                      className="w-full rounded-xl px-4 py-3 !bg-white dark:!bg-[#0F172A] !text-[#0F172A] dark:!text-white !border-[#E2E8F0] dark:!border-white/[0.08] focus:!border-cyan-500 focus:!ring-2 focus:!ring-cyan-500/20 focus:!outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-bold">Description</label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    disabled={isSubmitRunning || userRole === "Employee"}
                    className="w-full rounded-xl px-4 py-3 h-20 resize-none !bg-white dark:!bg-[#0F172A] !text-[#0F172A] dark:!text-white !border-[#E2E8F0] dark:!border-white/[0.08] focus:!border-cyan-500 focus:!ring-2 focus:!ring-cyan-500/20 focus:!outline-none transition-all disabled:opacity-60"
                  />
                </div>

                {/* Fish Specifications Card (conditional) */}
                {["monster", "exotic", "normal"].includes(formCategoryType) && (
                  <div className="p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#071A52] border border-[#E2E8F0] dark:border-white/[0.08] space-y-4 shadow-sm">
                    <span className="text-[10px] uppercase tracking-widest text-[#7C3AED] dark:text-[#a78bfa] font-black block">Fish Specifications</span>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-bold">Scientific Name</label>
                        <input
                          type="text"
                          value={formScientificName}
                          onChange={(e) => setFormScientificName(e.target.value)}
                          disabled={isSubmitRunning || userRole === "Employee"}
                          className="w-full rounded-lg px-3 py-2.5 !bg-white dark:!bg-[#0F172A] !text-[#0F172A] dark:!text-white !border-[#E2E8F0] dark:!border-white/[0.08] placeholder:!text-[#64748B] dark:placeholder:!text-[#94A3B8] focus:!border-cyan-500 focus:!ring-2 focus:!ring-cyan-500/20 focus:!outline-none transition-all disabled:opacity-60"
                          placeholder="e.g. Osteoglossum bicirrhosum"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-bold">Care Level</label>
                        <select
                          value={formCareLevel}
                          onChange={(e) => setFormCareLevel(e.target.value)}
                          disabled={isSubmitRunning || userRole === "Employee"}
                          className="w-full rounded-lg px-3 py-2.5 cursor-pointer !bg-white dark:!bg-[#0F172A] !text-[#0F172A] dark:!text-white !border-[#E2E8F0] dark:!border-white/[0.08] focus:!border-cyan-500 focus:!ring-2 focus:!ring-cyan-500/20 focus:!outline-none transition-all disabled:opacity-60"
                        >
                          <option value="Easy" className="bg-white dark:bg-[#0F172A]">Easy</option>
                          <option value="Moderate" className="bg-white dark:bg-[#0F172A]">Moderate</option>
                          <option value="Expert" className="bg-white dark:bg-[#0F172A]">Expert</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-bold">Tank Size Rec.</label>
                        <input
                          type="text"
                          value={formTankSize}
                          onChange={(e) => setFormTankSize(e.target.value)}
                          disabled={isSubmitRunning || userRole === "Employee"}
                          className="w-full rounded-lg px-3 py-2.5 !bg-white dark:!bg-[#0F172A] !text-[#0F172A] dark:!text-white !border-[#E2E8F0] dark:!border-white/[0.08] placeholder:!text-[#64748B] dark:placeholder:!text-[#94A3B8] focus:!border-cyan-500 focus:!ring-2 focus:!ring-cyan-500/20 focus:!outline-none transition-all disabled:opacity-60"
                          placeholder="e.g. 50G+"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-bold">Diet / Feeding</label>
                        <input
                          type="text"
                          value={formFeedingInfo}
                          onChange={(e) => setFormFeedingInfo(e.target.value)}
                          disabled={isSubmitRunning || userRole === "Employee"}
                          className="w-full rounded-lg px-3 py-2.5 !bg-white dark:!bg-[#0F172A] !text-[#0F172A] dark:!text-white !border-[#E2E8F0] dark:!border-white/[0.08] placeholder:!text-[#64748B] dark:placeholder:!text-[#94A3B8] focus:!border-cyan-500 focus:!ring-2 focus:!ring-cyan-500/20 focus:!outline-none transition-all disabled:opacity-60"
                          placeholder="e.g. Omnivore"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-bold">Size / Weight</label>
                        <input
                          type="text"
                          value={formSize}
                          onChange={(e) => setFormSize(e.target.value)}
                          disabled={isSubmitRunning || userRole === "Employee"}
                          className="w-full rounded-lg px-3 py-2.5 !bg-white dark:!bg-[#0F172A] !text-[#0F172A] dark:!text-white !border-[#E2E8F0] dark:!border-white/[0.08] placeholder:!text-[#64748B] dark:placeholder:!text-[#94A3B8] focus:!border-cyan-500 focus:!ring-2 focus:!ring-cyan-500/20 focus:!outline-none transition-all disabled:opacity-60"
                          placeholder="e.g. 15 cm"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-bold">Origin</label>
                        <input
                          type="text"
                          value={formOrigin}
                          onChange={(e) => setFormOrigin(e.target.value)}
                          disabled={isSubmitRunning || userRole === "Employee"}
                          className="w-full rounded-lg px-3 py-2.5 !bg-white dark:!bg-[#0F172A] !text-[#0F172A] dark:!text-white !border-[#E2E8F0] dark:!border-white/[0.08] placeholder:!text-[#64748B] dark:placeholder:!text-[#94A3B8] focus:!border-cyan-500 focus:!ring-2 focus:!ring-cyan-500/20 focus:!outline-none transition-all disabled:opacity-60"
                          placeholder="e.g. Amazon River"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-bold">Water Parameters</label>
                      <input
                        type="text"
                        value={formWaterParams}
                        onChange={(e) => setFormWaterParams(e.target.value)}
                        disabled={isSubmitRunning || userRole === "Employee"}
                        className="w-full rounded-lg px-3 py-2.5 !bg-white dark:!bg-[#0F172A] !text-[#0F172A] dark:!text-white !border-[#E2E8F0] dark:!border-white/[0.08] placeholder:!text-[#64748B] dark:placeholder:!text-[#94A3B8] focus:!border-cyan-500 focus:!ring-2 focus:!ring-cyan-500/20 focus:!outline-none transition-all disabled:opacity-60"
                        placeholder="e.g. pH 6.5 - 7.5 | 24-28°C"
                      />
                    </div>
                  </div>
                )}

                {/* Image Upload */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-bold">Product Image</label>
                  <div className="relative border border-dashed border-[#CBD5E1] dark:border-white/15 p-6 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] hover:bg-[#F1F5F9] dark:hover:bg-[#0F172A]/80 transition-colors flex flex-col items-center justify-center gap-2 text-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                    <Upload className="w-5 h-5 text-[#64748B] dark:text-[#94A3B8]" />
                    <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-semibold">
                      Drag and drop or <span className="text-cyan-500">browse</span> product image
                    </span>
                    <span className="text-[9px] text-[#64748B]/70 dark:text-[#94A3B8]/60">Supports PNG, JPG, JPEG</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={isSubmitRunning || userRole === "Employee"}
                      className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                  </div>
                  {/* Base64 Image Preview */}
                  {formImageBase64 && (
                    <div className="relative h-20 w-20 rounded-xl overflow-hidden border border-[#E2E8F0] dark:border-white/10 mt-2">
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
                  <label className="text-[10px] uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] font-bold">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    disabled={isSubmitRunning}
                    className="w-full rounded-xl px-4 py-3 cursor-pointer !bg-white dark:!bg-[#0F172A] !text-[#0F172A] dark:!text-white !border-[#E2E8F0] dark:!border-white/[0.08] focus:!border-cyan-500 focus:!ring-2 focus:!ring-cyan-500/20 focus:!outline-none transition-all"
                  >
                    <option value="Active" className="bg-white dark:bg-[#0F172A]">Active</option>
                    <option value="Inactive" className="bg-white dark:bg-[#0F172A]">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="px-6 py-4 border-t border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#071A52]/20 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  disabled={isSubmitRunning}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 border border-[#CBD5E1] dark:border-[#1E293B] text-[#475569] dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitRunning}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer shadow-md hover:shadow-cyan-500/20 hover:opacity-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitRunning ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
