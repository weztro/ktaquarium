"use client";

import React, { useEffect } from "react";
import { useAuth, UserRole } from "./AuthProvider";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useToast } from "./Toast";
import { BRAND } from "@/lib/brand-config";

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export default function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    if (!loading) {
      if (!user || !userRole) {
        showToast("Access Denied: Please log in first.", "error");
        router.push("/");
      } else if (!allowedRoles.includes(userRole)) {
        showToast("Access Denied: Insufficient permissions.", "error");
        router.push("/");
      }
    }
  }, [user, userRole, loading, allowedRoles, router, showToast]);

  if (loading || !user || !userRole || !allowedRoles.includes(userRole)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg text-text">
        <div className="relative flex items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-accent filter drop-shadow-[0_0_15px_rgba(6,182,212,0.2)]" />
          <span className="absolute text-xs font-semibold tracking-wider text-accent">{BRAND.shopName.split(' ')[0]}</span>
        </div>
        <p className="mt-4 text-sm tracking-widest uppercase text-muted animate-pulse">Securing Session...</p>
      </div>
    );
  }

  return <>{children}</>;
}
