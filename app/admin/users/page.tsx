"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RouteGuard from "@/components/RouteGuard";
import { useAuth } from "@/components/AuthProvider";
import { doc, updateDoc, deleteDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  Users, UserCheck, ShieldAlert, Plus, Edit, Trash2, 
  ChevronRight, ToggleLeft, ToggleRight, X, Loader2 
} from "lucide-react";
import Image from "next/image";
import { useToast } from "@/components/Toast";
import { motion, AnimatePresence } from "framer-motion";
import { subscribeToCollection } from "@/lib/firestoreService";

type RoleFilter = "Admin" | "Employee" | "User";

export default function UserManagementPage() {
  return (
    <RouteGuard allowedRoles={["Admin"]}>
      <Navbar />
      <UserManagementContent />
      <Footer />
    </RouteGuard>
  );
}

function UserManagementContent() {
  const { createAuthUser } = useAuth();
  const { showToast } = useToast();
  
  const [users, setUsers] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleFilter>("User");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add User Form States
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addRole, setAddRole] = useState<RoleFilter>("User");
  const [isCreating, setIsCreating] = useState(false);

  // Edit User Form States
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<RoleFilter>("User");
  const [isActive, setIsActive] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch users in real-time
  useEffect(() => {
    setLoading(true);
    setError(null);
    const unsubscribe = subscribeToCollection(
      "users",
      [],
      (list) => {
        setUsers(list);
        setLoading(false);
      },
      (err) => {
        console.error("UserManagementContent listen error in 'users' collection:", err);
        setError("Missing or insufficient permissions to access user profiles.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const filteredUsers = users.filter((u) => u.role === selectedRole);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName || !addEmail || !addPassword) {
      showToast("Please fill in all fields.", "error");
      return;
    }
    if (addPassword.length < 8) {
      showToast("Password must be at least 8 characters.", "error");
      return;
    }

    setIsCreating(true);
    try {
      await createAuthUser(addEmail, addPassword, addRole, addName);
      setIsAddModalOpen(false);
      setAddName("");
      setAddEmail("");
      setAddPassword("");
      setAddRole("User");
    } catch (err) {
      console.error("User creation failed:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenEdit = (userItem: any) => {
    setEditingUser(userItem);
    setEditName(userItem.displayName || "");
    setEditRole(userItem.role || "User");
    setIsActive(userItem.isActive !== false);
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editName) {
      showToast("Name is required.", "error");
      return;
    }

    setIsUpdating(true);
    try {
      const userRef = doc(db, "users", editingUser.uid);
      await updateDoc(userRef, {
        displayName: editName,
        role: editRole,
        isActive: isActive,
      });

      // Update corresponding employee record if role is Employee
      if (editRole === "Employee") {
        const empRef = doc(db, "employees", editingUser.uid);
        const empSnap = await getDoc(empRef);
        const now = new Date().toISOString();
        if (empSnap.exists()) {
          await updateDoc(empRef, {
            employeeName: editName,
            status: isActive ? "Active" : "Inactive",
          });
        } else {
          // If they weren't in employees collection, create them
          await setDoc(empRef, {
            uid: editingUser.uid,
            employeeCode: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
            employeeName: editName,
            email: editingUser.email,
            phone: "",
            role: "Employee",
            createdAt: now,
            status: isActive ? "Active" : "Inactive",
          });
        }
      }

      showToast("User updated successfully!", "success");
      setIsEditModalOpen(false);
      setEditingUser(null);
    } catch (err) {
      console.error("User update failed:", err);
      showToast("Failed to update user.", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async (uid: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}? This will remove their Firestore document.`)) {
      try {
        await deleteDoc(doc(db, "users", uid));
        await deleteDoc(doc(db, "employees", uid)); // clean up if employee
        showToast("User record deleted.", "success");
      } catch (err) {
        console.error("Delete user document failed:", err);
        showToast("Failed to delete user document.", "error");
      }
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
            <span className="text-xs font-semibold tracking-widest uppercase text-accent">Security & Roles</span>
            <h1 className="text-3xl md:text-4xl font-display font-black text-text mt-1">
              User Management
            </h1>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent to-accent-purple text-xs font-bold uppercase tracking-widest text-white shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer self-start md:self-end"
          >
            <Plus className="w-4.5 h-4.5" /> Add User
          </button>
        </div>
 
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
            <span className="text-xs text-muted font-bold uppercase tracking-wider">Loading user base...</span>
          </div>
        ) : (
          /* Tree Grid Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Role Tree Navigation (3 cols) */}
          <div className="lg:col-span-3 rounded-2xl border border-border bg-card/40 backdrop-blur-xl p-5 shadow-2xl relative">
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-cyan-500/20 rounded-tl-2xl" />
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-4 px-2">Role Structure</h3>
            
            <div className="flex flex-col gap-1.5 text-xs">
              
              {/* Tree node: Admin */}
              <div className="relative">
                <button
                  onClick={() => setSelectedRole("Admin")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer text-left ${
                    selectedRole === "Admin" ? "bg-cyan-500/15 border border-cyan-500/20 text-cyan-400 font-bold" : "border border-transparent text-slate-350 hover:bg-slate-900/40"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-cyan-400" />
                    Admin
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${selectedRole === "Admin" ? "rotate-90" : ""}`} />
                </button>
                <div className="pl-6 pt-1 border-l border-white/5 ml-5 mt-1 flex flex-col gap-1">
                  <div className="text-[10px] text-slate-500 py-1 pl-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                    └ Users
                  </div>
                </div>
              </div>

              {/* Tree node: Employee */}
              <div className="relative mt-2">
                <button
                  onClick={() => setSelectedRole("Employee")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer text-left ${
                    selectedRole === "Employee" ? "bg-purple-500/15 border border-purple-500/20 text-purple-400 font-bold" : "border border-transparent text-slate-350 hover:bg-slate-900/40"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 shrink-0 text-purple-400" />
                    Employee
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${selectedRole === "Employee" ? "rotate-90" : ""}`} />
                </button>
                <div className="pl-6 pt-1 border-l border-white/5 ml-5 mt-1 flex flex-col gap-1">
                  <div className="text-[10px] text-slate-500 py-1 pl-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                    └ Employees
                  </div>
                </div>
              </div>

              {/* Tree node: User */}
              <div className="relative mt-2">
                <button
                  onClick={() => setSelectedRole("User")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer text-left ${
                    selectedRole === "User" ? "bg-pink-500/15 border border-pink-500/20 text-pink-400 font-bold" : "border border-transparent text-slate-350 hover:bg-slate-900/40"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4 shrink-0 text-pink-400" />
                    User
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${selectedRole === "User" ? "rotate-90" : ""}`} />
                </button>
                <div className="pl-6 pt-1 border-l border-white/5 ml-5 mt-1 flex flex-col gap-1">
                  <div className="text-[10px] text-slate-500 py-1 pl-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                    └ Customers
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Side: Data Grid Table (9 cols) */}
          <div className="lg:col-span-9 rounded-2xl border border-border bg-card/20 backdrop-blur-xl overflow-hidden shadow-2xl relative min-h-[400px]">
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-cyan-500/20 rounded-tr-2xl" />
            
            {/* Grid Header */}
            <div className="p-5 border-b border-border bg-bg/40 flex items-center justify-between">
              <h3 className="text-sm font-bold text-text uppercase tracking-wider flex items-center gap-2">
                <span>{selectedRole}s Registry</span>
                <span className="text-[10px] font-normal text-slate-550 capitalize">({filteredUsers.length} records)</span>
              </h3>
            </div>

            {/* Table Area */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-bg text-muted font-bold uppercase tracking-wider">
                    <th className="p-4 pl-6">Member</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Last Login</th>
                    <th className="p-4 text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-20 text-slate-500 font-semibold">
                        No {selectedRole} accounts found in database.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isActiveVal = u.isActive !== false;
                      const joinedDate = u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A";
                      const lastLoginVal = u.lastLogin ? new Date(u.lastLogin).toLocaleString() : "Never";

                      return (
                        <tr key={u.id} className="hover:bg-white/[0.01] transition-colors">
                          {/* Profile & Name */}
                          <td className="p-4 pl-6 flex items-center gap-3">
                            <div className="relative h-9 w-9 rounded-full overflow-hidden border border-white/10 shrink-0 bg-slate-900 flex items-center justify-center text-slate-450 font-bold">
                              {u.photoURL ? (
                                <Image
                                  src={u.photoURL}
                                  alt={u.displayName || "Avatar"}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              ) : (
                                <span>{u.displayName?.substring(0, 2).toUpperCase() || "?"}</span>
                              )}
                            </div>
                            <div>
                              <span className="font-semibold text-text block">{u.displayName || "N/A"}</span>
                              <span className="text-[10px] text-slate-500 block">Joined: {joinedDate}</span>
                            </div>
                          </td>

                          {/* Email */}
                          <td className="p-4 text-slate-300 font-medium select-all">{u.email}</td>

                          {/* Role Badge */}
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                              u.role === "Admin" 
                                ? "border-cyan-500/20 bg-cyan-500/5 text-cyan-400"
                                : u.role === "Employee"
                                ? "border-purple-500/20 bg-purple-500/5 text-purple-400"
                                : "border-pink-500/20 bg-pink-500/5 text-pink-400"
                            }`}>
                              {u.role || "User"}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                              isActiveVal 
                                ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                                : "border-rose-500/20 bg-rose-500/5 text-rose-400"
                            }`}>
                              {isActiveVal ? "Active" : "Inactive"}
                            </span>
                          </td>

                          {/* Last Login */}
                          <td className="p-4 text-slate-400">{lastLoginVal}</td>

                          {/* Action triggers */}
                          <td className="p-4 text-right pr-6 shrink-0">
                            <div className="flex items-center justify-end gap-3.5">
                              <button
                                onClick={() => handleOpenEdit(u)}
                                className="text-slate-450 hover:text-cyan-400 transition-colors cursor-pointer"
                                title="Edit Role/Status"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.uid, u.displayName || u.email)}
                                className="text-slate-450 hover:text-red-400 transition-colors cursor-pointer"
                                title="Delete Document"
                              >
                                <Trash2 className="w-4 h-4" />
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
        </div>
      )}
 
      </div>

      {/* ==================== ADD USER MODAL ==================== */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isCreating && setIsAddModalOpen(false)}
              className="absolute inset-0 bg-bg/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl z-10 text-text"
            >
              <button
                onClick={() => setIsAddModalOpen(false)}
                disabled={isCreating}
                className="absolute top-4 right-4 text-muted hover:text-text cursor-pointer disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-display font-black text-text mb-1">Add User Account</h2>
              <p className="text-xs text-muted mb-6 leading-relaxed">
                Enter details to create credentials in Firebase Authentication and insert their user record into Firestore.
              </p>

              <form onSubmit={handleCreateUser} className="flex flex-col gap-4 text-xs">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-wider text-muted font-bold">Display Name</label>
                  <input
                    type="text"
                    required
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    disabled={isCreating}
                    className="w-full rounded-xl bg-bg border border-border focus:border-accent focus:outline-none px-4 py-3 text-text placeholder:text-muted/60 focus:ring-1 focus:ring-accent"
                    placeholder="Full Name"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-wider text-muted font-bold">Email Address</label>
                  <input
                    type="email"
                    required
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    disabled={isCreating}
                    className="w-full rounded-xl bg-bg border border-border focus:border-accent focus:outline-none px-4 py-3 text-text placeholder:text-muted/60 focus:ring-1 focus:ring-accent"
                    placeholder="email@example.com"
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-wider text-muted font-bold">Password</label>
                  <input
                    type="password"
                    required
                    value={addPassword}
                    onChange={(e) => setAddPassword(e.target.value)}
                    disabled={isCreating}
                    className="w-full rounded-xl bg-bg border border-border focus:border-accent focus:outline-none px-4 py-3 text-text placeholder:text-muted/60 focus:ring-1 focus:ring-accent"
                    placeholder="•••••••• (Min 8 chars)"
                  />
                </div>

                {/* Role */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-wider text-muted font-bold">System Role</label>
                  <select
                    value={addRole}
                    onChange={(e) => setAddRole(e.target.value as RoleFilter)}
                    disabled={isCreating}
                    className="w-full rounded-xl bg-bg border border-border focus:border-accent focus:outline-none px-4 py-3 text-text cursor-pointer focus:ring-1 focus:ring-accent"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Employee">Employee</option>
                    <option value="User">User (Customer)</option>
                  </select>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 py-3.5 px-4 font-bold text-white uppercase tracking-wider cursor-pointer shadow-[0_0_10px_rgba(34,211,238,0.15)] mt-2 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:scale-100"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <span>Create Account</span>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== EDIT USER MODAL ==================== */}
      <AnimatePresence>
        {isEditModalOpen && editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isUpdating && setIsEditModalOpen(false)}
              className="absolute inset-0 bg-bg/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl z-10 text-text"
            >
              <button
                onClick={() => setIsEditModalOpen(false)}
                disabled={isUpdating}
                className="absolute top-4 right-4 text-muted hover:text-text cursor-pointer disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-display font-black text-text mb-1">Edit User details</h2>
              <p className="text-xs text-muted mb-6 leading-relaxed">
                Update account details for user <strong className="text-text">{editingUser.email}</strong>.
              </p>

              <form onSubmit={handleUpdateUser} className="flex flex-col gap-4 text-xs">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-wider text-muted font-bold">Display Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    disabled={isUpdating}
                    className="w-full rounded-xl bg-bg border border-border focus:border-accent focus:outline-none px-4 py-3 text-text focus:ring-1 focus:ring-accent"
                    placeholder="Full Name"
                  />
                </div>

                {/* Role */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-wider text-muted font-bold">Role Assignment</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as RoleFilter)}
                    disabled={isUpdating}
                    className="w-full rounded-xl bg-bg border border-border focus:border-accent focus:outline-none px-4 py-3 text-text cursor-pointer focus:ring-1 focus:ring-accent"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Employee">Employee</option>
                    <option value="User">User (Customer)</option>
                  </select>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-bg/50">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted tracking-wider">Account status</span>
                    <span className="text-[10px] block text-muted">Enable or disable login access</span>
                  </div>
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => setIsActive(!isActive)}
                    className="text-accent hover:opacity-80 transition-colors cursor-pointer"
                  >
                    {isActive ? (
                      <ToggleRight className="w-10 h-10" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-muted" />
                    )}
                  </button>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 py-3.5 px-4 font-bold text-white uppercase tracking-wider cursor-pointer shadow-[0_0_10px_rgba(34,211,238,0.15)] mt-2 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:scale-100"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Saving Changes...</span>
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
