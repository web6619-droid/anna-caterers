// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD99qh6_VXpn84bESIvkb0ZDpu09H3JNzo",
  authDomain: "anna-caterer.firebaseapp.com",
  projectId: "anna-caterer",
  storageBucket: "anna-caterer.firebasestorage.app",
  messagingSenderId: "503174113677",
  appId: "1:503174113677:web:7e3c29e7fc204dac4d35c4"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };
