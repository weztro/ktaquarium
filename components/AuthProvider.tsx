"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  User 
} from "firebase/auth";
import { initializeApp, deleteApp, getApps } from "firebase/app";
import { getAuth as getSecondaryAuth, createUserWithEmailAndPassword as createSecondaryUser } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useToast } from "./Toast";

export type UserRole = "Admin" | "Employee" | "User";

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  createAuthUser: (email: string, password: string, role: UserRole, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const getAssignedRole = (email: string | null, currentDocRole?: UserRole): UserRole => {
    if (email === "madhansharonv@gmail.com") return "Admin";
    return currentDocRole || "User";
  };

  const saveUserData = async (currentUser: User, providerType: "google" | "email") => {
    try {
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      const now = new Date().toISOString();
      const existingData = userSnap.exists() ? userSnap.data() : null;
      
      const role = getAssignedRole(currentUser.email, existingData?.role);
      setUserRole(role);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: currentUser.uid,
          displayName: currentUser.displayName || currentUser.email?.split("@")[0] || "User",
          email: currentUser.email,
          photoURL: currentUser.photoURL || null,
          role: role,
          isActive: true,
          createdAt: now,
          lastLogin: now,
        });
      } else {
        await updateDoc(userRef, {
          lastLogin: now,
          displayName: currentUser.displayName || existingData?.displayName || currentUser.email?.split("@")[0] || "User",
          photoURL: currentUser.photoURL || existingData?.photoURL || null,
          role: role,
        });
      }
    } catch (err) {
      console.error("Error saving user data to Firestore:", err);
      showToast("Profile data could not be saved to database.", "error");
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      await saveUserData(result.user, "google");
      showToast("Login Successful", "success");
    } catch (err: any) {
      console.error("Firebase Login Error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        showToast("Login cancelled by user.", "info");
      } else if (err.code === "auth/network-request-failed") {
        showToast("Network error. Please check your connection.", "error");
      } else {
        showToast("Authentication Failed.", "error");
      }
      throw err;
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await saveUserData(result.user, "email");
      showToast("Login Successful", "success");
    } catch (err: any) {
      console.error("Firebase Email Login Error:", err);
      let errMsg = "Authentication Failed.";
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        errMsg = "Invalid email or password.";
      } else if (err.code === "auth/invalid-email") {
        errMsg = "Please enter a valid email address.";
      } else if (err.code === "auth/user-disabled") {
        errMsg = "This account has been disabled.";
      } else if (err.code === "auth/network-request-failed") {
        errMsg = "Network error. Please check your connection.";
      }
      showToast(errMsg, "error");
      throw err;
    }
  };

  const registerWithEmail = async (email: string, password: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await saveUserData(result.user, "email");
      showToast("Account Created Successfully!", "success");
    } catch (err: any) {
      console.error("Firebase Registration Error:", err);
      let errMsg = "Registration Failed.";
      if (err.code === "auth/email-already-in-use") {
        errMsg = "This email is already registered.";
      } else if (err.code === "auth/invalid-email") {
        errMsg = "Please enter a valid email address.";
      } else if (err.code === "auth/weak-password") {
        errMsg = "Password must be at least 6 characters.";
      } else if (err.code === "auth/network-request-failed") {
        errMsg = "Network error. Please check your connection.";
      }
      showToast(errMsg, "error");
      throw err;
    }
  };

  // Helper method for admin to create secondary auth users without logging out
  const createAuthUser = async (email: string, password: string, role: UserRole, name: string) => {
    let secondaryApp;
    try {
      const secondaryConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      };

      const secondaryAppName = `TempApp_${Date.now()}`;
      secondaryApp = initializeApp(secondaryConfig, secondaryAppName);
      const secondaryAuth = getSecondaryAuth(secondaryApp);

      // Create credential
      const res = await createSecondaryUser(secondaryAuth, email, password);
      const newUser = res.user;

      const now = new Date().toISOString();

      // Create in users collection
      await setDoc(doc(db, "users", newUser.uid), {
        uid: newUser.uid,
        displayName: name,
        email: email,
        photoURL: null,
        role: role,
        isActive: true,
        createdAt: now,
        lastLogin: now,
      });

      // If Employee role, also create in employees collection
      if (role === "Employee") {
        await setDoc(doc(db, "employees", newUser.uid), {
          uid: newUser.uid,
          employeeCode: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
          employeeName: name,
          email: email,
          phone: "",
          role: "Employee",
          createdAt: now,
          status: "Active",
        });
      }

      await secondaryAuth.signOut();
      showToast(`Account for ${name} (${role}) created successfully!`, "success");
    } catch (err: any) {
      console.error("Firebase Secondary App User Creation Error:", err);
      let errMsg = "Failed to create user account.";
      if (err.code === "auth/email-already-in-use") {
        errMsg = "This email is already in use.";
      } else if (err.code === "auth/weak-password") {
        errMsg = "Password must be at least 6 characters.";
      }
      showToast(errMsg, "error");
      throw err;
    } finally {
      if (secondaryApp) {
        await deleteApp(secondaryApp);
      }
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      showToast("Password reset link sent to your email.", "success");
    } catch (err: any) {
      console.error("Firebase Reset Password Error:", err);
      let errMsg = "Failed to send reset link.";
      if (err.code === "auth/user-not-found") {
        errMsg = "No user found with this email.";
      } else if (err.code === "auth/invalid-email") {
        errMsg = "Please enter a valid email address.";
      }
      showToast(errMsg, "error");
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserRole(null);
      showToast("Logout Successful", "success");
    } catch (err) {
      console.error("Firebase Logout Error:", err);
      showToast("Failed to logout.", "error");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const role = getAssignedRole(currentUser.email, userSnap.data().role);
            setUserRole(role);
          } else {
            const role = getAssignedRole(currentUser.email);
            setUserRole(role);
          }
        } catch (err) {
          console.error("Error fetching user role on state change:", err);
          setUserRole("User");
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userRole, loading, loginWithGoogle, loginWithEmail, registerWithEmail, createAuthUser, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
