import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Console check to detect placeholder credentials or missing config
if (typeof window !== "undefined") {
  const isPlaceholder = (val?: string) => 
    !val || 
    val.includes("Placeholder") || 
    val.includes("placeholder") || 
    val.includes("your_");

  if (isPlaceholder(firebaseConfig.apiKey) || isPlaceholder(firebaseConfig.appId)) {
    console.warn(
      "⚠️ K.T AQUARIUM - Firebase Configuration Notice:\n" +
      "It looks like you are using placeholder credentials in your .env.local file.\n" +
      "To enable actual authentication services, please replace the values in .env.local with your real Firebase Web App keys from the Firebase Console."
    );
  }
}

// Initialize Firebase once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
