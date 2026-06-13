"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const isSuccess = toast.type === "success";
            const isError = toast.type === "error";

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl backdrop-blur-md border ${
                  isSuccess
                    ? "bg-[#030B2A]/80 border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.15)]"
                    : isError
                    ? "bg-[#0c0314]/80 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
                    : "bg-[#030B2A]/80 border-purple-500/30 shadow-[0_0_20px_rgba(139,92,246,0.15)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  {isSuccess && <CheckCircle className="w-5 h-5 text-cyan-400 shrink-0" />}
                  {isError && <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
                  {!isSuccess && !isError && <Info className="w-5 h-5 text-purple-400 shrink-0" />}
                  <span className="text-sm font-medium text-slate-100">{toast.message}</span>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="ml-4 text-slate-400 hover:text-white transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
