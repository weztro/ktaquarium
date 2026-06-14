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
  Truck, XCircle, ArrowLeft, RefreshCw, ChevronRight, 
  User as UserIcon, ShieldAlert, Loader2, ShieldCheck, 
  Search, Calendar, ArrowUpDown, Filter, Menu
} from "lucide-react";
import { useToast } from "@/components/Toast";
import { subscribeToCollection } from "@/lib/firestoreService";
import { motion, AnimatePresence } from "framer-motion";

type OrderStatus = "Pending" | "Processing" | "Packed" | "Shipped" | "Delivered" | "Cancelled" | "Refunded";

const STATUSES = ["All Orders", "Pending", "Processing", "Packed", "Shipped", "Delivered", "Cancelled", "Refunded"];
const TIMELINE_STEPS = ["Pending", "Processing", "Packed", "Shipped", "Delivered"];

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
  
  // Real-time Firestore sync orders list
  const [orders, setOrders] = useState<any[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redesign state variables
  const [selectedStatus, setSelectedStatus] = useState<string>("All Orders");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("date-desc"); // date-desc, date-asc, amount-desc, amount-asc
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  
  // Responsive / collapsible states
  const [isTreeCollapsed, setIsTreeCollapsed] = useState(false);

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
        // Keep list raw so JS can filter and sort dynamically
        setOrders(list);
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
      
      // Update details drawer if currently open order matches
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error("Update order status failed:", err);
      showToast("Failed to update order status.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  // Normalizes status for mapping Confirmed -> Processing
  const normalizeStatus = (status: string): string => {
    if (status === "Confirmed") return "Processing";
    return status;
  };

  // Stepper helper
  const getActiveStepIndex = (status: string) => {
    const normStatus = normalizeStatus(status);
    return TIMELINE_STEPS.indexOf(normStatus);
  };

  const getStatusIcon = (status: string) => {
    const normStatus = normalizeStatus(status);
    switch (normStatus) {
      case "Pending":
        return <Clock className="w-3.5 h-3.5 text-orange-500 shrink-0 animate-pulse" />;
      case "Processing":
        return <RefreshCw className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
      case "Packed":
        return <ShoppingBag className="w-3.5 h-3.5 text-purple-500 shrink-0" />;
      case "Shipped":
        return <Truck className="w-3.5 h-3.5 text-cyan-500 shrink-0" />;
      case "Delivered":
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
      case "Cancelled":
        return <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
      case "Refunded":
        return <ShieldAlert className="w-3.5 h-3.5 text-slate-500 shrink-0" />;
      default:
        return <Clipboard className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const normStatus = normalizeStatus(status);
    switch (normStatus) {
      case "Pending":
        return "border-orange-500/20 bg-orange-500/10 text-orange-500";
      case "Processing":
        return "border-blue-500/20 bg-blue-500/10 text-blue-500";
      case "Packed":
        return "border-purple-500/20 bg-purple-500/10 text-purple-700 dark:text-purple-400";
      case "Shipped":
        return "border-cyan-500/20 bg-cyan-500/10 text-cyan-500";
      case "Delivered":
        return "border-emerald-500/20 bg-emerald-500/10 text-emerald-500";
      case "Cancelled":
        return "border-rose-500/20 bg-rose-500/10 text-rose-500";
      case "Refunded":
        return "border-slate-500/20 bg-slate-500/10 text-slate-500";
      default:
        return "border-slate-200 bg-slate-50 text-slate-600 dark:border-border dark:bg-card-secondary dark:text-text-secondary";
    }
  };

  // Compute Tree Node Counts Dynamically
  const getStatusCount = (status: string) => {
    if (status === "All Orders") return orders.length;
    return orders.filter(o => normalizeStatus(o.status) === status).length;
  };

  // Perform JS-based advanced filters and sorting dynamically
  const filteredOrders = orders
    .filter((order) => {
      // 1. Status Filter
      if (selectedStatus !== "All Orders") {
        if (normalizeStatus(order.status) !== selectedStatus) return false;
      }

      // 2. Search Query (ID, Name, Email, Phone)
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const orderId = (order.id || "").toLowerCase();
        const customerName = (order.customerName || order.userName || "").toLowerCase();
        const email = (order.email || order.userEmail || "").toLowerCase();
        const phone = (order.phone || "").toLowerCase();
        
        if (
          !orderId.includes(query) &&
          !customerName.includes(query) &&
          !email.includes(query) &&
          !phone.includes(query)
        ) {
          return false;
        }
      }

      // 3. Date Filter Range
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const orderDate = new Date(order.createdAt);
        if (orderDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        const orderDate = new Date(order.createdAt);
        if (orderDate > end) return false;
      }

      return true;
    })
    .sort((a, b) => {
      // 4. Sorting Parameters
      const amountA = a.totalAmount || a.totalPrice || 0;
      const amountB = b.totalAmount || b.totalPrice || 0;
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();

      if (sortBy === "date-desc") return dateB - dateA;
      if (sortBy === "date-asc") return dateA - dateB;
      if (sortBy === "amount-desc") return amountB - amountA;
      if (sortBy === "amount-asc") return amountA - amountB;
      return 0;
    });

  return (
    <main className="min-h-screen bg-bg pt-28 pb-16 relative overflow-hidden text-text transition-colors duration-300">
      {/* Ocean atmosphere overlays */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-accent/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-[30%] left-[-10%] w-[350px] h-[350px] bg-accent/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-border pb-6">
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-accent">Order Registry</span>
            <h1 className="text-3xl md:text-4xl font-display font-black text-glow-cyan text-text mt-1">
              {userRole === "User" ? "My Orders" : "Order Management"}
            </h1>
          </div>
          <div className="text-xs text-text-secondary font-medium">
            Currently logged in as: <strong className="text-text capitalize bg-card-secondary border border-border px-2.5 py-1 rounded-md">{userRole}</strong>
          </div>
        </div>

        {/* Database Status Handling */}
        {error ? (
          <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-3xl text-center p-6 shadow-sm">
            <ShieldAlert className="w-12 h-12 text-red-500 mb-4 animate-pulse" />
            <h3 className="text-lg font-bold text-text mb-2">Access Restrained</h3>
            <p className="text-text-secondary text-sm max-w-sm mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-full bg-accent hover:bg-accent/85 text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-8 h-8 animate-spin text-accent-purple mb-2" />
            <span className="text-xs text-text-secondary font-bold uppercase tracking-wider">Loading system logs...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 rounded-3xl border border-border bg-card p-8 shadow-sm">
            <span className="text-4xl mb-4 block" role="img" aria-label="Folder package">📦</span>
            <h3 className="text-lg font-bold text-text mb-2">No orders recorded</h3>
            <p className="text-sm text-text-secondary">
              {userRole === "User" 
                ? "You have not placed any orders yet." 
                : "No customer orders are currently recorded in the database."}
            </p>
          </div>
        ) : (
          /* Main Layout: Left Tree Nav (25%), Right Grid & Filters (75%) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT SIDE: Tree Navigation (Hidden on Mobile, Collapsible on Tablet, Split on Desktop) */}
            <div className={`lg:col-span-3 bg-card border border-border rounded-3xl p-5 shadow-sm transition-all duration-300 hidden md:block ${isTreeCollapsed ? "md:hidden lg:block lg:col-span-3" : "md:block"}`}>
              <div className="flex flex-col gap-1.5">
                
                {/* Tree Root */}
                <div className="flex items-center justify-between px-3 py-2 text-xs font-black uppercase text-text-secondary/70 tracking-widest border-b border-border mb-2 select-none">
                  <div className="flex items-center gap-2">
                    <Clipboard className="w-4 h-4 text-accent-purple" />
                    <span>Status Registry</span>
                  </div>
                  {/* Collapsible toggle for Tablet */}
                  <button
                    onClick={() => setIsTreeCollapsed(true)}
                    className="lg:hidden p-1 hover:bg-card-secondary rounded text-text-secondary"
                  >
                    ←
                  </button>
                </div>

                <div className="space-y-1">
                  {/* All Orders Node */}
                  <button
                    onClick={() => setSelectedStatus("All Orders")}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all outline-none focus-visible:ring-2 focus-visible:ring-accent-purple cursor-pointer ${
                      selectedStatus === "All Orders"
                        ? "bg-accent-purple/10 text-accent-purple border border-accent-purple/20 shadow-sm"
                        : "text-text-secondary hover:text-text hover:bg-card-secondary border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Clipboard className="w-3.5 h-3.5 shrink-0" />
                      <span>All Orders</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-card-secondary text-text border border-border shadow-sm">
                      {getStatusCount("All Orders")}
                    </span>
                  </button>

                  {/* Indented Status Nodes Under Root */}
                  <div className="pl-3.5 border-l-2 border-border/70 my-2 space-y-1.5">
                    {STATUSES.filter(s => s !== "All Orders").map((status) => {
                      const isActive = selectedStatus === status;
                      const count = getStatusCount(status);
                      const Icon = getStatusIcon(status);
                      
                      return (
                        <button
                          key={status}
                          onClick={() => setSelectedStatus(status)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-accent-purple cursor-pointer ${
                            isActive
                              ? "bg-card-secondary text-text font-black border border-border shadow-sm"
                              : "text-text-secondary hover:text-text hover:bg-card-secondary border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="opacity-95">{Icon}</span>
                            <span>{status}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border transition-colors ${
                            count > 0 
                              ? "bg-accent-purple/5 text-accent-purple border-accent-purple/15" 
                              : "bg-card-secondary text-text-secondary/50 border-border"
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

            {/* RIGHT SIDE: Filters Bar + Order Grid or Mobile Cards */}
            <div className={`flex flex-col gap-6 ${isTreeCollapsed ? "col-span-12" : "col-span-12 lg:col-span-9"}`}>
              
              {/* Tablet collapsed tree indicator */}
              {isTreeCollapsed && (
                <div className="hidden md:flex lg:hidden items-center gap-3">
                  <button
                    onClick={() => setIsTreeCollapsed(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-xs font-bold text-text hover:bg-card-secondary transition-all cursor-pointer shadow-sm"
                  >
                    <Menu className="w-3.5 h-3.5 text-accent-purple" />
                    <span>Show Status Sidebar</span>
                  </button>
                  <span className="text-xs text-text-secondary">
                    Active Filter: <strong className="text-text">{selectedStatus}</strong>
                  </span>
                </div>
              )}

              {/* Mobile Tree Dropdown Selector */}
              <div className="md:hidden flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-text-secondary/80">
                  <Filter className="w-3.5 h-3.5 text-accent-purple" />
                  <span>Filter by Status</span>
                </div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-3 py-3 text-xs text-text focus:border-accent-purple outline-none cursor-pointer shadow-sm"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status} ({getStatusCount(status)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Advanced Filter / Search / Sort Bar */}
              <div className="p-5 rounded-3xl bg-card border border-border shadow-sm flex flex-col sm:flex-row flex-wrap gap-4 items-center justify-between">
                
                {/* Search Bar */}
                <div className="relative w-full sm:flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/60" />
                  <input
                    type="text"
                    placeholder="Search Reference, Customer, Email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-text placeholder-text-secondary/60 focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/10 transition-all outline-none"
                  />
                </div>

                {/* Date Filters Range */}
                <div className="flex items-center gap-2 flex-wrap text-xs w-full sm:w-auto">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-text-secondary/60" />
                    <span className="text-text-secondary/80 font-bold uppercase text-[9px] tracking-wider">From:</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-card border border-border rounded-xl px-2.5 py-1.5 text-xs text-text focus:border-accent-purple outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-text-secondary/80 font-bold uppercase text-[9px] tracking-wider">To:</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-card border border-border rounded-xl px-2.5 py-1.5 text-xs text-text focus:border-accent-purple outline-none"
                    />
                  </div>
                  {(startDate || endDate) && (
                    <button
                      onClick={() => {
                        setStartDate("");
                        setEndDate("");
                      }}
                      className="text-accent-purple hover:underline font-bold text-[9px] uppercase tracking-wider cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Sorting Select */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <ArrowUpDown className="w-3.5 h-3.5 text-text-secondary/60" />
                  <span className="text-text-secondary/80 font-bold uppercase text-[9px] tracking-wider">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-card border border-border rounded-xl px-3 py-2 text-xs text-text focus:border-accent-purple outline-none cursor-pointer shadow-sm w-full sm:w-auto"
                  >
                    <option value="date-desc">Latest First</option>
                    <option value="date-asc">Oldest First</option>
                    <option value="amount-desc">Highest Price</option>
                    <option value="amount-asc">Lowest Price</option>
                  </select>
                </div>

              </div>

              {/* Order Grid (Desktop / Tablet >= 768px) */}
              <div className="hidden md:block overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-card-secondary border-b border-border text-text-secondary/80 font-black uppercase tracking-wider text-[9px]">
                        <th className="p-4">Order ID</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Email / Phone</th>
                        <th className="p-4 text-center">Items</th>
                        <th className="p-4">Total</th>
                        <th className="p-4">Order Date</th>
                        <th className="p-4">Payment</th>
                        <th className="p-4">Order Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="p-8 text-center text-text-secondary italic">
                            No orders match active filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order) => {
                          const customerName = order.customerName || order.userName || "Guest";
                          const email = order.email || order.userEmail || "N/A";
                          const phone = order.phone || "N/A";
                          const count = order.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;
                          const amount = order.totalAmount || order.totalPrice || 0;
                          const dateStr = new Date(order.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          });
                          const payStatus = order.paymentStatus || "Paid";

                          return (
                            <tr
                              key={order.id}
                              className="hover:bg-card-secondary/60 transition-all duration-200 cursor-pointer"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <td className="p-4 font-black text-accent-purple hover:underline">{order.id}</td>
                              <td className="p-4 font-black text-text truncate max-w-[110px]">{customerName}</td>
                              <td className="p-4 text-text-secondary">
                                <div className="flex flex-col">
                                  <span className="truncate max-w-[130px]">{email}</span>
                                  <span className="text-[10px] text-text-secondary/60 mt-0.5">{phone}</span>
                                </div>
                              </td>
                              <td className="p-4 text-center font-bold text-text">{count}</td>
                              <td className="p-4 font-black text-text">${amount}</td>
                              <td className="p-4 text-text-secondary">{dateStr}</td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                  payStatus.toLowerCase() === "paid" 
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                                    : "bg-orange-500/10 border-orange-500/20 text-orange-500"
                                }`}>
                                  {payStatus}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase border inline-flex items-center gap-1.5 shadow-sm ${getStatusBadgeClass(order.status)}`} onClick={(e) => e.stopPropagation()}>
                                  {getStatusIcon(order.status)}
                                  {normalizeStatus(order.status)}
                                </span>
                              </td>
                              <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-2">
                                  {/* Dropdown status update for Admin/Employee */}
                                  {userRole !== "User" && (
                                    <select
                                      value={order.status}
                                      disabled={updatingId === order.id}
                                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                      className="bg-card border border-border focus:border-accent-purple/50 rounded-lg px-2 py-1 text-xs text-text cursor-pointer focus:outline-none"
                                    >
                                      <option value="Pending">Pending</option>
                                      <option value="Processing">Processing</option>
                                      <option value="Packed">Packed</option>
                                      <option value="Shipped">Shipped</option>
                                      <option value="Delivered">Delivered</option>
                                      <option value="Cancelled">Cancelled</option>
                                      <option value="Refunded">Refunded</option>
                                    </select>
                                  )}
                                  <button
                                    onClick={() => setSelectedOrder(order)}
                                    className="p-1.5 rounded-lg border border-border hover:border-accent-purple text-text-secondary hover:text-accent-purple transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent-purple"
                                    aria-label="View order specifications"
                                  >
                                    <ChevronRight className="w-4 h-4" />
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

              {/* Order Cards List (Mobile < 768px) */}
              <div className="md:hidden space-y-4">
                {filteredOrders.length === 0 ? (
                  <div className="p-8 text-center text-text-secondary bg-card border border-border rounded-2xl italic">
                    No orders match filter criteria.
                  </div>
                ) : (
                  filteredOrders.map((order) => {
                    const customerName = order.customerName || order.userName || "Guest";
                    const amount = order.totalAmount || order.totalPrice || 0;
                    const count = order.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;
                    const dateStr = new Date(order.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    });
                    const payStatus = order.paymentStatus || "Paid";

                    return (
                      <div
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="p-5 rounded-3xl border border-border bg-card shadow-sm hover:border-accent-purple/35 transition-all flex flex-col gap-4 cursor-pointer"
                      >
                        <div className="flex items-center justify-between border-b border-border/50 pb-3">
                          <div>
                            <span className="text-[9px] text-text-secondary/50 font-bold uppercase tracking-wider block">ID</span>
                            <h4 className="text-sm font-black text-accent-purple">{order.id}</h4>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase border flex items-center gap-1.5 shadow-sm ${getStatusBadgeClass(order.status)}`} onClick={(e) => e.stopPropagation()}>
                            {getStatusIcon(order.status)}
                            {normalizeStatus(order.status)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-[9px] text-text-secondary/60 font-bold uppercase tracking-wider block">Customer</span>
                            <span className="font-bold text-text truncate block max-w-[120px]">{customerName}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-text-secondary/60 font-bold uppercase tracking-wider block">Total Amount</span>
                            <span className="font-black text-text">${amount}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-text-secondary/60 font-bold uppercase tracking-wider block">Items count</span>
                            <span className="font-semibold text-text-secondary">{count} items</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-text-secondary/60 font-bold uppercase tracking-wider block">Order Date</span>
                            <span className="text-text-secondary text-[11px] truncate block">{dateStr}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs">
                          <div>
                            <span className="text-[9px] text-text-secondary/60 font-bold uppercase tracking-wider block mb-1">Payment</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                              payStatus.toLowerCase() === "paid" 
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                                : "bg-orange-500/10 border-orange-500/20 text-orange-500"
                            }`}>
                              {payStatus}
                            </span>
                          </div>
                          
                          {/* Admin/Employee inline state selector */}
                          {userRole !== "User" && (
                            <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-2">
                              <select
                                value={order.status}
                                disabled={updatingId === order.id}
                                onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                className="bg-card-secondary border border-border focus:border-accent-purple/50 rounded-lg px-2.5 py-1 text-xs text-text cursor-pointer focus:outline-none"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Packed">Packed</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Refunded">Refunded</option>
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>

          </div>
        )}

      </div>

      {/* Slide Drawer Side Panel using Framer Motion */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            {/* Dark glassmorphism Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer"
            />

            {/* Slide drawer container */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-card border-l border-border shadow-2xl z-50 flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-border flex items-center justify-between bg-card-secondary">
                <div>
                  <span className="text-[9px] uppercase font-bold text-accent-purple tracking-widest block">Detailed Specifications</span>
                  <h3 className="text-base font-black text-text">Order Ref: {selectedOrder.id}</h3>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-xl border border-border hover:border-text-secondary/50 text-text hover:bg-card-secondary transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent-purple"
                  aria-label="Close details panel"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Content Body */}
              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                
                {/* 1. Status Alert Badge */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between shadow-sm ${getStatusBadgeClass(selectedOrder.status)}`}>
                  <span className="text-xs font-bold uppercase tracking-wider">Current Status</span>
                  <span className="font-black uppercase tracking-widest text-xs flex items-center gap-1.5">
                    {getStatusIcon(selectedOrder.status)}
                    {normalizeStatus(selectedOrder.status)}
                  </span>
                </div>

                {/* 2. Customer Information Card */}
                <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-3.5">
                  <h4 className="text-[10px] uppercase font-black tracking-widest text-text-secondary/70">Customer Profile</h4>
                  <div className="space-y-2.5 text-xs text-text-secondary">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-text">Name:</span>
                      <span className="text-text">{selectedOrder.customerName || selectedOrder.userName || "Guest"}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-text">Email:</span>
                      <span className="text-text select-all">{selectedOrder.email || selectedOrder.userEmail || "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-text">Phone:</span>
                      <span className="text-text select-all">{selectedOrder.phone || "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-text">Account ID:</span>
                      <span className="text-text font-mono text-[11px] select-all">{selectedOrder.userId || "Guest Checkout"}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Shipping Address Card */}
                <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-2">
                  <h4 className="text-[10px] uppercase font-black tracking-widest text-text-secondary/70">Shipping Logistics</h4>
                  <p className="text-xs text-text select-all leading-relaxed">
                    {selectedOrder.shippingAddress || "Showroom Pickup - K.T Aquarium Exhibition Center"}
                  </p>
                </div>

                {/* 4. Products Ordered Table Card */}
                <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-4">
                  <h4 className="text-[10px] uppercase font-black tracking-widest text-text-secondary/70">Products Register</h4>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item: any, idx: number) => {
                      const itemPrice = item.product.price || 0;
                      const qty = item.quantity || 1;
                      return (
                        <div key={idx} className="flex justify-between items-center text-xs border-b border-border/50 pb-2.5 last:border-b-0 last:pb-0">
                          <div className="min-w-0 pr-3">
                            <span className="font-black text-text block truncate">{item.product.name}</span>
                            <span className="text-[10px] text-text-secondary capitalize">Category: {(item.product.categoryType || item.product.type || "Fishes").toLowerCase()}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-text font-black block">${itemPrice * qty}</span>
                            <span className="text-[10px] text-text-secondary/85 block">{qty} x ${itemPrice}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Payment details Card */}
                <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-3.5">
                  <h4 className="text-[10px] uppercase font-black tracking-widest text-text-secondary/70">Payment Specifications</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center text-text-secondary">
                      <span>Payment Status</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        (selectedOrder.paymentStatus || "Paid").toLowerCase() === "paid" 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                          : "bg-orange-500/10 border-orange-500/20 text-orange-500"
                      }`}>
                        {selectedOrder.paymentStatus || "Paid"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-text-secondary">
                      <span>Security Clearance</span>
                      <span className="text-text font-medium flex items-center gap-1 select-none">
                        <ShieldCheck className="w-3.5 h-3.5 text-accent" /> SSL Encrypted
                      </span>
                    </div>
                    <div className="h-[1px] bg-border my-2" />
                    <div className="flex justify-between items-baseline">
                      <span className="text-text-secondary font-black uppercase tracking-widest text-[9px]">Grand Total</span>
                      <span className="text-xl font-black text-accent-purple">${selectedOrder.totalAmount || selectedOrder.totalPrice || 0}</span>
                    </div>
                  </div>
                </div>

                {/* 6. Order progress timeline Stepper */}
                <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-4">
                  <h4 className="text-[10px] uppercase font-black tracking-widest text-text-secondary/70">Order Progress Timeline</h4>
                  <div className="space-y-6 pl-2 relative before:absolute before:inset-y-3 before:left-[11px] before:w-[2px] before:bg-border/60">
                    {(() => {
                      const activeStepIdx = getActiveStepIndex(selectedOrder.status);
                      const isCancelled = selectedOrder.status === "Cancelled";
                      const isRefunded = selectedOrder.status === "Refunded";

                      const steps = ["Pending", "Processing", "Packed", "Shipped", "Delivered"];
                      if (isCancelled) steps.push("Cancelled");
                      if (isRefunded) steps.push("Refunded");

                      return steps.map((step, idx) => {
                        let isDone = false;
                        let isCurrent = false;
                        let isError = false;

                        if (step === "Cancelled") {
                          isError = true;
                          isCurrent = true;
                        } else if (step === "Refunded") {
                          isCurrent = true;
                        } else if (isCancelled || isRefunded) {
                          isDone = idx < activeStepIdx;
                        } else {
                          isDone = idx < activeStepIdx;
                          isCurrent = idx === activeStepIdx;
                        }

                        return (
                          <div key={step} className="flex items-start gap-4 relative z-10">
                            {/* Step circle index */}
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-all select-none ${
                              isError
                                ? "bg-rose-500/10 border-rose-500 text-rose-500"
                                : step === "Refunded"
                                ? "bg-slate-500/10 border-slate-500 text-slate-500"
                                : isDone
                                ? "bg-emerald-500 border-emerald-500 text-white"
                                : isCurrent
                                ? "bg-accent-purple/20 border-accent-purple text-accent-purple shadow-[0_0_8px_rgba(124,58,237,0.3)]"
                                : "bg-card border-border text-text-secondary/30"
                            }`}>
                              {isDone ? (
                                <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                              ) : (
                                <span className="text-[10px] font-black">{idx + 1}</span>
                              )}
                            </div>

                            {/* Step descriptions */}
                            <div>
                              <span className={`text-xs font-black block ${
                                isError 
                                  ? "text-rose-500" 
                                  : step === "Refunded"
                                  ? "text-slate-500"
                                  : isDone
                                  ? "text-text"
                                  : isCurrent
                                  ? "text-accent-purple"
                                  : "text-text-secondary/40"
                              }`}>{step}</span>
                              <span className="text-[10px] text-text-secondary/60 block mt-0.5">
                                {step === "Pending" && "Order received and queued for confirmation"}
                                {step === "Processing" && "Aquarium inventory allocated & quality checks active"}
                                {step === "Packed" && "Item packaged securely in thermocol & oxygenated water containers"}
                                {step === "Shipped" && "Handed over to K.T Aquarium Insured Living Delivery agents"}
                                {step === "Delivered" && "Successfully received by customer and acclimated"}
                                {step === "Cancelled" && "Order cancelled by administrator or client request"}
                                {step === "Refunded" && "Clearing transaction refunded and catalog item restocked"}
                              </span>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </main>
  );
}
