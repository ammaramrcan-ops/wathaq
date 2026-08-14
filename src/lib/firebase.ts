import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase Configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoDummyKeyForTestingWathaqPlatform12345",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "wathaq-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "wathaq-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "wathaq-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:demo123456789"
};

// Initialize Firebase (prevent multiple initialization during HMR)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Firebase Auth instance
export const auth = getAuth(app);

// Helper check whether real API key is supplied
export const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID
);

export default app;
