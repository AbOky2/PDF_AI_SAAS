import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDc3m0vJKsbTxnmMOiKQic3XoMi9eqMEVk",
    authDomain: "chat-with-pdf-1a9f5.firebaseapp.com",
    projectId: "chat-with-pdf-1a9f5",
    storageBucket: "chat-with-pdf-1a9f5.firebasestorage.app",
    messagingSenderId: "283574079240",
    appId: "1:283574079240:web:7fd4dcbfb74f64e84a26bd"
  };

  const app = getApps.length === 0 ? initializeApp(firebaseConfig) : getApp();

  const db = getFirestore(app);
  const storage = getStorage(app);

  export {db, storage};