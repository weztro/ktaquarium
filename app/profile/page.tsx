"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/AuthProvider";
import { Loader2, Calendar, Mail, User as UserIcon } from "lucide-react";
import Image from "next/image";
import { BRAND } from "@/lib/brand-config";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg text-text">
        <div className="relative flex items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-accent filter drop-shadow-[0_0_15px_rgba(6,182,212,0.2)]" />
          <span className="absolute text-xs font-semibold tracking-wider text-accent">{BRAND.shopName.split(' ')[0]}</span>
        </div>
        <p className="mt-4 text-sm tracking-widest uppercase text-muted animate-pulse">Loading Profile...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const memberSince = user.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-bg pt-28 pb-16 flex flex-col items-center justify-center relative overflow-hidden text-text">
        {/* Cinematic Undersea backgrounds */}
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-accent/5 via-accent-purple/5 to-transparent pointer-events-none" />
        <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-accent-purple/5 rounded-full blur-[150px]" />

        <div className="w-full max-w-2xl px-6 relative z-10">
          <button
            onClick={() => router.push("/")}
            className="mb-8 group flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted hover:text-accent transition-colors duration-300"
          >
            <span className="text-base group-hover:-translate-x-1 transition-transform">←</span> Back to Showroom
          </button>

          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 md:p-12 shadow-2xl">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-accent/20 rounded-tl-3xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-accent-purple/20 rounded-br-3xl" />

            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-10">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-gradient-to-tr from-accent to-accent-purple rounded-full blur-md opacity-60 animate-pulse" />
                <div className="relative h-28 w-28 md:h-32 md:w-32 rounded-full p-1 bg-gradient-to-tr from-accent to-accent-purple">
                  <div className="relative h-full w-full overflow-hidden rounded-full bg-bg">
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt={user.displayName || "User Avatar"}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-bg text-muted">
                        <UserIcon className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 text-center md:text-left flex flex-col gap-5">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-accent/10 border border-accent/20 text-accent mb-3">
                    VIP Member
                  </span>
                  <h1 className="text-3xl md:text-4xl font-display font-extrabold tracking-wide text-text">
                    {user.displayName || "Aquarist User"}
                  </h1>
                </div>

                <div className="h-[1px] w-full bg-gradient-to-r from-accent/10 via-accent-purple/10 to-transparent" />

                <div className="flex flex-col gap-3 text-muted">
                  <div className="flex items-center justify-center md:justify-start gap-3 text-sm">
                    <Mail className="w-4 h-4 text-accent shrink-0" />
                    <span>{user.email || "No Email Provided"}</span>
                  </div>

                  <div className="flex items-center justify-center md:justify-start gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-accent-purple shrink-0" />
                    <span>Member Since: <strong className="text-text font-medium">{memberSince}</strong></span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-4 rounded-2xl bg-bg border border-border flex flex-col justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-muted font-semibold">Wishlist Items</span>
                    <span className="text-2xl font-bold text-accent mt-1">0</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-bg border border-border flex flex-col justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-muted font-semibold">Active Orders</span>
                    <span className="text-2xl font-bold text-accent-purple mt-1">0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
