"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Mail, Lock, AlertCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { BRAND } from "@/lib/brand-config";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalView = "login" | "register" | "forgot";

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword } = useAuth();
  const [view, setView] = useState<ModalView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Reset states when modal closes or opens
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setView("login");
        setEmail("");
        setPassword("");
        setValidationError(null);
      }, 300); // Wait for exit animation
    }
  }, [isOpen]);

  // Clear validation error when changing views
  const handleViewChange = (newView: ModalView) => {
    setView(newView);
    setValidationError(null);
    setPassword("");
  };

  const validateEmail = (emailStr: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailStr);
  };

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // 1. Validate Email
    if (!email) {
      setValidationError("Email address is required.");
      return;
    }
    if (!validateEmail(email)) {
      setValidationError("Please enter a valid email address.");
      return;
    }

    // 2. Validate Password (only for Login and Register)
    if (view !== "forgot") {
      if (!password) {
        setValidationError("Password is required.");
        return;
      }
      if (password.length < 8) {
        setValidationError("Password must be at least 8 characters.");
        return;
      }
    }

    // 3. Trigger Firebase Authentication calls
    setIsAuthenticating(true);
    try {
      if (view === "login") {
        await loginWithEmail(email, password);
        onClose();
      } else if (view === "register") {
        await registerWithEmail(email, password);
        onClose();
      } else if (view === "forgot") {
        await resetPassword(email);
        handleViewChange("login"); // return to login after success
      }
    } catch (err) {
      console.error(`Error in authentication view (${view}):`, err);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGoogleLogin = async () => {
    setValidationError(null);
    setIsAuthenticating(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err) {
      console.error("Google authentication failed:", err);
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isAuthenticating ? onClose : undefined}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card p-6 md:p-8 shadow-2xl text-text"
          >
            {/* Ambient Background Glows */}
            <div className="absolute -top-12 -left-12 -z-10 h-32 w-32 rounded-full bg-accent/10 blur-3xl" />
            <div className="absolute -bottom-12 -right-12 -z-10 h-32 w-32 rounded-full bg-accent-purple/10 blur-3xl" />

            {/* Close Button */}
            <button
              onClick={onClose}
              disabled={isAuthenticating}
              className="absolute top-4 right-4 text-muted hover:text-text transition-colors disabled:opacity-50 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content Container */}
            <div className="flex flex-col items-center">
              {/* Back Button (Only for Register/Forgot Views) */}
              {view !== "login" && (
                <button
                  onClick={() => handleViewChange("login")}
                  disabled={isAuthenticating}
                  className="self-start flex items-center gap-1.5 text-xs text-muted hover:text-accent transition-colors disabled:opacity-50 cursor-pointer mb-4"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                </button>
              )}

              {/* Title & Subtitle */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-display font-extrabold tracking-wide text-text">
                  {view === "login" && <>Welcome to <span className="bg-gradient-to-r from-accent to-accent-purple bg-clip-text text-transparent">{BRAND.shopName}</span></>}
                  {view === "register" && "Create Account"}
                  {view === "forgot" && "Reset Password"}
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-muted max-w-[320px] mx-auto">
                  {view === "login" && "Sign in to access your aquarium profile, wishlist and premium services."}
                  {view === "register" && "Register to set up your profile and browse our custom installations."}
                  {view === "forgot" && "Enter your email address and we'll send you a password reset link."}
                </p>
              </div>

              {/* Inline Validation Errors */}
              <AnimatePresence>
                {validationError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="w-full flex items-center gap-2 p-3.5 rounded-xl border border-red-500/20 bg-red-500/10 text-rose-600 dark:text-red-200 text-xs font-semibold mb-4"
                  >
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{validationError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form Input fields */}
              <form onSubmit={handleAction} className="w-full flex flex-col gap-4">
                {/* Email Address */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-muted">Email Address</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-muted">
                      <Mail className="w-4.5 h-4.5" />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isAuthenticating}
                      className="w-full rounded-xl bg-bg border border-border focus:border-accent/50 focus:outline-none pl-11 pr-4 py-3 text-sm text-text placeholder:text-muted/60 transition-all duration-300 disabled:opacity-50"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                {/* Password (Hide in Forgot View) */}
                {view !== "forgot" && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-muted">Password</label>
                      {view === "login" && (
                        <button
                          type="button"
                          onClick={() => handleViewChange("forgot")}
                          disabled={isAuthenticating}
                          className="text-[10px] font-bold text-accent hover:opacity-80 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3.5 text-muted">
                        <Lock className="w-4.5 h-4.5" />
                      </span>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isAuthenticating}
                        className="w-full rounded-xl bg-bg border border-border focus:border-accent/50 focus:outline-none pl-11 pr-4 py-3 text-sm text-text placeholder:text-muted/60 transition-all duration-300 disabled:opacity-50"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                )}

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-purple hover:opacity-90 text-white font-semibold py-3 px-4 shadow-[0_0_15px_rgba(34,211,238,0.15)] transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 disabled:shadow-none cursor-pointer mt-2"
                >
                  {isAuthenticating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>
                      {view === "login" && "Login"}
                      {view === "register" && "Create Account"}
                      {view === "forgot" && "Send Reset Link"}
                    </span>
                  )}
                </button>
              </form>

              {/* Login View Sibling (Create Account & Google Login) */}
              {view === "login" && (
                <>
                  <div className="flex items-center gap-3 w-full my-5">
                    <div className="h-[1px] flex-1 bg-border" />
                    <span className="text-[10px] uppercase font-bold text-muted tracking-wider">or</span>
                    <div className="h-[1px] flex-1 bg-border" />
                  </div>

                  <div className="flex flex-col gap-3.5 w-full">
                    {/* Google Login */}
                    <button
                      onClick={handleGoogleLogin}
                      disabled={isAuthenticating}
                      className="flex items-center justify-center gap-3 w-full rounded-xl bg-bg border border-border hover:border-accent/40 text-text font-semibold py-3 px-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-sm disabled:opacity-50 disabled:scale-100 cursor-pointer"
                    >
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#EA4335"
                          d="M12 5.04c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 1.76 14.94 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.85 2.99C6.27 7.03 8.87 5.04 12 5.04z"
                        />
                        <path
                          fill="#4285F4"
                          d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.76 2.91c2.2-2.03 3.67-5.02 3.67-8.64z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.35 10.49c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.5 2.92A11.96 11.96 0 000 12c0 3.32.9 6.43 2.5 9.08l2.85-8.59z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.76-2.91c-1.05.7-2.39 1.13-4.2 1.13-3.13 0-5.73-1.99-6.65-5.45L1.5 16.85C3.4 20.35 7.35 23 12 23z"
                        />
                      </svg>
                      <span>Continue with Google</span>
                    </button>

                    {/* Registration Option */}
                    <div className="text-center text-xs text-muted mt-2">
                      New to {BRAND.shopName}?{" "}
                      <button
                        onClick={() => handleViewChange("register")}
                        disabled={isAuthenticating}
                        className="text-accent hover:opacity-80 font-bold underline transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        Create Account
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Close Button / Cancel */}
              <div className="flex flex-col items-center gap-4 mt-6">
                <button
                  onClick={onClose}
                  disabled={isAuthenticating}
                  className="text-xs text-muted hover:text-text hover:underline transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Close Window
                </button>
                <span className="text-[10px] text-muted/60 font-medium">
                  Designed by{" "}
                  <a
                    href="https://weztro.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold hover:underline bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent"
                  >
                    WEZTRO
                  </a>
                </span>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
