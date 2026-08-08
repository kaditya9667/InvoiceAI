import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where
} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBTbJQBgeanZNZfXIKTC-z6-UGOHdqyLhs",
  authDomain: "invoiceai-64213.firebaseapp.com",
  projectId: "invoiceai-64213",
  storageBucket: "invoiceai-64213.firebasestorage.app",
  messagingSenderId: "462876857803",
  appId: "1:462876857803:web:8f5b62a8ab6f5eae8bd24e",
  measurementId: "G-LEX088YMJM"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore Cloud Database
export const db = getFirestore(app);

// Initialize Analytics safely
let analytics = null;
if (typeof window !== "undefined") {
  try {
    analytics = getAnalytics(app);
  } catch (e) {
    // Analytics fallback if measurementId is blocked/offline
  }
}

export { analytics };
export default app;
