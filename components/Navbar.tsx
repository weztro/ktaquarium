"use client";

import React, { useState, useEffect } from "react";
import { Menu, X, ArrowUpRight, ChevronDown, LogOut, User as UserIcon, Heart, ShoppingBag, Settings as SettingsIcon, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "./AuthProvider";
import LoginModal from "./LoginModal";
import { useCart } from "./CartProvider";
import { useTheme } from "./ThemeProvider";
import { BRAND } from "@/lib/brand-config";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user, userRole, loading, logout } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle clicking outside user dropdown to close it
  useEffect(() => {
    if (!isDropdownOpen) return;
    const closeDropdown = () => setIsDropdownOpen(false);
    document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, [isDropdownOpen]);

  const getNavLinks = () => {
    if (loading || !user) {
      return [
        { name: "Collection", href: "/#collection" },
        { name: "Services", href: "/#services" },
        { name: "Showcase", href: "/#showcase" },
        { name: "Process", href: "/#process" },
        { name: "Gallery", href: "/#gallery" },
        { name: "Contact", href: "/#contact" },
      ];
    }

    if (userRole === "Admin") {
      return [
        { name: "Inventory", href: "/inventory" },
        { name: "Products", href: "/admin/products" },
        { name: "Users", href: "/admin/users" },
        { name: "Orders", href: "/admin/orders" },
      ];
    }

    if (userRole === "Employee") {
      return [
        { name: "Inventory", href: "/inventory" },
        { name: "Products", href: "/admin/products" },
        { name: "Orders", href: "/admin/orders" },
      ];
    }

    // Standard Customer
    return [
      { name: "Showroom", href: "/" },
      { name: "My Profile", href: "/profile" },
      { name: "My Orders", href: "/admin/orders" },
    ];
  };
  const navLinks = getNavLinks();

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "py-4 glass-navbar shadow-lg"
            : "py-6 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl md:text-2xl font-display font-extrabold tracking-widest bg-gradient-to-r from-text via-accent to-accent-purple bg-clip-text text-transparent group-hover:opacity-85 transition-opacity duration-300">
              {BRAND.shopName}
            </span>
          </Link>
 
          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-muted hover:text-accent transition-colors duration-300 relative py-1 group"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>
 
          {/* Desktop CTA & Auth Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Cart Icon Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-full bg-card border border-border hover:border-accent text-text hover:text-accent transition-all duration-300 cursor-pointer"
              aria-label="Open Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-accent to-accent-purple text-[9px] font-bold text-white shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                  {cartCount}
                </span>
              )}
            </button>
            {loading ? (
              <div className="h-10 w-24 rounded-full bg-card-secondary animate-pulse border border-border" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDropdownOpen(!isDropdownOpen);
                  }}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card border border-border hover:border-cyan-500/40 dark:hover:border-cyan-400/40 text-text transition-all duration-300 cursor-pointer"
                >
                  <div className="relative h-7 w-7 rounded-full overflow-hidden border border-cyan-500/20 dark:border-cyan-400/30">
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt={user.displayName || "Avatar"}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-card-secondary text-text-secondary">
                        <UserIcon className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-semibold tracking-wide max-w-[100px] truncate">
                    {user.displayName?.split(" ")[0]}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-text-secondary transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Options */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-border bg-card/95 backdrop-blur-xl p-2 shadow-[0_10px_45px_rgba(2,8,23,0.08)] z-50 flex flex-col gap-1"
                    >
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide text-text-secondary hover:text-text hover:bg-cyan-500/10 hover:shadow-[inset_0_0_10px_rgba(34,211,238,0.05)] transition-all duration-300 cursor-pointer"
                      >
                        <UserIcon className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                        My Profile
                      </Link>
                      <button
                        onClick={() => {}}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide text-text-secondary hover:text-text hover:bg-cyan-500/10 hover:shadow-[inset_0_0_10px_rgba(34,211,238,0.05)] transition-all duration-300 cursor-pointer text-left w-full"
                      >
                        <Heart className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                        My Wishlist
                      </button>
                      <button
                        onClick={() => {}}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide text-text-secondary hover:text-text hover:bg-cyan-500/10 hover:shadow-[inset_0_0_10px_rgba(34,211,238,0.05)] transition-all duration-300 cursor-pointer text-left w-full"
                      >
                        <ShoppingBag className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                        My Orders
                      </button>
                      <button
                        onClick={() => {}}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide text-text-secondary hover:text-text hover:bg-cyan-500/10 hover:shadow-[inset_0_0_10px_rgba(34,211,238,0.05)] transition-all duration-300 cursor-pointer text-left w-full"
                      >
                        <SettingsIcon className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                        Settings
                      </button>
                      <div className="h-[1px] w-full bg-border my-1" />
                      <button
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-500/10 transition-all duration-300 cursor-pointer text-left w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="relative group overflow-hidden rounded-full p-[1px] focus:outline-none transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-full group-hover:opacity-100 transition-opacity duration-300 animate-pulse-glow" />
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-full blur-md opacity-40 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative block px-5 py-2.5 rounded-full bg-card/95 text-[10px] font-bold uppercase tracking-wider text-text transition-all duration-300 group-hover:text-accent group-hover:bg-card/85 backdrop-blur-md">
                  Login / Sign Up
                </span>
              </button>
            )}

            <a
              href="/#contact"
              className="inline-flex items-center gap-1 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]"
            >
              Book Consultation
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full bg-card border border-border hover:border-accent text-text hover:text-accent transition-all duration-300 cursor-pointer flex items-center justify-center"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-yellow-500 animate-pulse" />
              ) : (
                <Moon className="w-4 h-4 text-cyan-500" />
              )}
            </button>
          </div>



          {/* Mobile Actions Container */}
          <div className="flex lg:hidden items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-card border border-border text-text cursor-pointer flex items-center justify-center"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-yellow-500 animate-pulse" />
              ) : (
                <Moon className="w-4 h-4 text-cyan-500" />
              )}
            </button>

            {/* Mobile Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-full bg-card border border-border text-text cursor-pointer"
              aria-label="Open Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gradient-to-r from-accent to-accent-purple text-[8px] font-bold text-white shadow-[0_0_8px_rgba(34,211,238,0.3)]">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-text hover:text-accent transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 lg:hidden bg-bg/98 backdrop-blur-xl flex flex-col justify-between pt-24 pb-8 px-8 md:px-16"
          >
            {/* Navigation Links */}
            <nav className="flex flex-col gap-5 text-left my-auto">
              {navLinks.map((link, index) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={link.name}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-2xl font-display font-bold text-text hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}

              {/* Mobile Auth Content */}
              <div className="h-[1px] w-full bg-border my-4" />

              {loading ? (
                <div className="h-10 w-24 rounded-full bg-card-secondary animate-pulse border border-border" />
              ) : user ? (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                  className="flex flex-col gap-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 rounded-full overflow-hidden border border-cyan-500/20 dark:border-cyan-400/30">
                      {user.photoURL ? (
                        <Image
                          src={user.photoURL}
                          alt={user.displayName || "Avatar"}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-card-secondary text-text-secondary">
                          <UserIcon className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-text">{user.displayName}</div>
                      <div className="text-xs text-text-secondary">{user.email}</div>
                    </div>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="text-base font-semibold text-text-secondary hover:text-cyan-500 dark:hover:text-cyan-400 flex items-center gap-2 mt-2"
                  >
                    <UserIcon className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                    My Profile
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="text-base font-semibold text-red-400 hover:text-red-300 flex items-center gap-2 text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setIsLoginModalOpen(true);
                    }}
                    className="w-full relative group overflow-hidden rounded-full p-[1px] focus:outline-none transition-all duration-300 hover:scale-105 cursor-pointer text-center"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-full" />
                    <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-full blur-md opacity-40" />
                    <span className="relative block px-6 py-3 rounded-full bg-card/95 text-xs font-bold uppercase tracking-widest text-text backdrop-blur-md">
                      Login / Sign Up
                    </span>
                  </button>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-4"
              >
                <a
                  href="/#contact"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center justify-center inline-flex items-center gap-2 px-8 py-3 rounded-full text-xs font-semibold tracking-widest uppercase bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:scale-105 transition-all duration-300"
                >
                  Book Consultation
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
}
