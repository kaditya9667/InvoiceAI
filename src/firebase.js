import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, set, get, child, update, remove } from "firebase/database";

// Firebase Realtime Database configuration
const firebaseConfig = {
  apiKey: "AIzaSyBTbJQBgeanZNZfXIKTC-z6-UGOHdqyLhs",
  authDomain: "invoiceai-64213.firebaseapp.com",
  databaseURL: "https://invoiceai-64213-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "invoiceai-64213",
  storageBucket: "invoiceai-64213.firebasestorage.app",
  messagingSenderId: "462876857803",
  appId: "1:462876857803:web:8f5b62a8ab6f5eae8bd24e",
  measurementId: "G-LEX088YMJM"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Realtime Database
export const rtdb = getDatabase(app);

// Analytics initialization
let analytics = null;
if (typeof window !== "undefined") {
  try {
    analytics = getAnalytics(app);
  } catch (e) {
    // Analytics fallback
  }
}

export { analytics };
export default app;
