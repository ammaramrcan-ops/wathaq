import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase Configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCr1UD50KcKuWdw8aUOjQgGALAoMdAKuB4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "wathaq-92751.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "wathaq-92751",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "wathaq-92751.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "430884197568",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:430884197568:web:05f1518dd8830d5c8fc925"
};

// Initialize Firebase (prevent multiple initialization during HMR)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Firebase Auth & Firestore instances
export const auth = getAuth(app);
export const db = getFirestore(app);

// Helper check whether real API key is supplied
export const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID
);

export default app;
