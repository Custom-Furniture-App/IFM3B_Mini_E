// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC3V5UcnLZyQstCQGt914oImnT9uDEr_NI",
  authDomain: "dripforit-3ad1e.firebaseapp.com",
  projectId: "dripforit-3ad1e",
  storageBucket: "dripforit-3ad1e.firebasestorage.app",
  messagingSenderId: "145271019564",
  appId: "1:145271019564:web:808c05c5d85c94894fd989",
  measurementId: "G-CGGP5501C8",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app); 
export default app;
