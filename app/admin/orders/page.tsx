"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RouteGuard from "@/components/RouteGuard";
import { useAuth } from "@/components/AuthProvider";
import { doc, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  ShoppingBag, Clipboard, Clock, CheckCircle2, 
  Truck, XCircle, ArrowLeft, RefreshCw, ChevronRight, User as UserIcon, ShieldAlert, Loader2 
} from "lucide-react";
import { useToast } from "@/components/Toast";
import { subscribeToCollection } from "@/lib/firestoreService";

type OrderStatus = "Pending" | "Confirmed" | "Packed" | "Shipped" | "Delivered" | "Cancelled";

export default function OrderManagementPage() {
  return (
    <RouteGuard allowedRoles={["Admin", "Employee", "User"]}>
      <Navbar />
      <OrderManagementContent />
      <Footer />
    </RouteGuard>
  );
}

function OrderManagementContent() {
  const { user, userRole } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
 
  // Fetch orders in real-time
  useEffect(() => {
    if (!user || !userRole) return;
 
    setLoading(true);
    setError(null);
 
    const constraints = userRole === "User" ? [where("userId", "==", user.uid)] : [];
 
    const unsubscribe = subscribeToCollection(
      "orders",
      constraints,
      (list) => {
        const sortedList = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(sortedList);
        setLoading(false);
      },
      (err) => {
        console.error("OrderManagementContent listen error in 'orders' collection:", err);
        setError("Missing or insufficient permissions to access orders.");
        setLoading(false);
      }
    );
 
    return () => unsubscribe();
  }, [user, userRole]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });
      showToast(`Order status updated to ${newStatus}.`, "success");
    } catch (err) {
      console.error("Update order status failed:", err);
      showToast("Failed to update order status.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "Pending":
        return <Clock className="w-4 h-4 text-yellow-600 shrink-0 animate-pulse" />;
      case "Confirmed":
        return <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" />;
      case "Packed":
        return <ShoppingBag className="w-4 h-4 text-purple-600 shrink-0" />;
      case "Shipped":
        return <Truck className="w-4 h-4 text-blue-600 shrink-0" />;
      case "Delivered":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
      case "Cancelled":
        return <XCircle className="w-4 h-4 text-rose-600 shrink-0" />;
      default:
        return <Clipboard className="w-4 h-4 text-slate-500 shrink-0" />;
    }
  };

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case "Pending":
        return "border-yellow-200 bg-yellow-50 text-yellow-700";
      case "Confirmed":
        return "border-cyan-200 bg-cyan-50 text-cyan-700";
      case "Packed":
        return "border-purple-200 bg-purple-50 text-purple-700";
      case "Shipped":
        return "border-blue-200 bg-blue-50 text-blue-700";
      case "Delivered":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "Cancelled":
        return "border-rose-200 bg-rose-50 text-rose-700";
      default:
        return "border-slate-200 bg-slate-50 text-slate-600";
    }
  };

  return (
    <main className="min-h-screen bg-bg pt-28 pb-16 relative overflow-hidden text-text transition-colors duration-300">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-border/40 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-[30%] left-[-10%] w-[350px] h-[350px] bg-accent/5 rounded-full blur-[130px] pointer-events-none" />
 
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 border-b border-border pb-6">
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-accent">Order Logs</span>
            <h1 className="text-3xl md:text-4xl font-display font-black text-text mt-1">
              {userRole === "User" ? "My Orders" : "Order Management"}
            </h1>
          </div>
          <div className="text-xs text-muted font-medium">
            Currently logged in as: <strong className="text-text capitalize">{userRole}</strong>
          </div>
        </div>
 
        {/* Orders List */}
        {error ? (
          <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-2xl text-center p-6 shadow-sm">
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
            <span className="text-xs text-muted font-bold uppercase tracking-wider">Loading orders...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 rounded-3xl border border-border bg-card p-8 shadow-sm">
            <span className="text-4xl mb-4 block">📦</span>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No orders recorded</h3>
            <p className="text-sm text-slate-500">
              {userRole === "User" 
                ? "You have not placed any orders yet." 
                : "No customer orders are currently recorded in the database."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const orderDate = new Date(order.createdAt).toLocaleString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={order.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm relative flex flex-col gap-6"
                >
                  {/* Top Order Meta */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Order Reference</span>
                      <h3 className="text-base font-bold text-purple-650">{order.id}</h3>
                      <span className="text-slate-500 block mt-0.5">{orderDate}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Status badge */}
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border flex items-center gap-1.5 ${getStatusBadgeClass(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>

                      {/* Dropdown status update for Admin/Employee */}
                      {userRole !== "User" && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Change Status:</span>
                          <select
                            value={order.status}
                            disabled={updatingId === order.id}
                            onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                            className="bg-white border border-slate-200 focus:border-purple-500/50 rounded-lg px-2.5 py-1 text-xs text-slate-700 cursor-pointer focus:outline-none"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Packed">Packed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Items & Customer Details */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Items Grid (7 cols) */}
                    <div className="lg:col-span-8 space-y-3">
                      <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Items Ordered</h4>
                      {order.items?.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{item.product.name}</span>
                            <span className="text-[10px] text-slate-500 capitalize">({(item.product.categoryType || item.product.type || "").toLowerCase()})</span>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className="text-slate-500">Qty: <strong className="text-slate-900 font-bold">{item.quantity}</strong></span>
                            <span className="text-purple-650 font-bold">${item.product.price * item.quantity}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Customer Info (5 cols) */}
                    <div className="lg:col-span-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs flex flex-col gap-3">
                      <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Customer & Shipping</h4>
                      
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                          <UserIcon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <strong className="text-slate-900 block truncate">{order.userName || "N/A"}</strong>
                          <span className="text-[10px] text-slate-500 block select-all">{order.userEmail}</span>
                        </div>
                      </div>

                      <div className="h-[1px] w-full bg-slate-200 my-1" />

                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Shipping Destination</span>
                        <p className="text-slate-700 mt-1 select-all">{order.shippingAddress || "Showroom Pickup"}</p>
                      </div>

                      <div className="h-[1px] w-full bg-slate-200 my-1" />

                      <div className="flex justify-between items-baseline">
                        <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Subtotal Paid</span>
                        <span className="text-xl font-black text-purple-600">${order.totalPrice}</span>
                      </div>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}
