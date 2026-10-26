// src/firebase.js
// ============================================================
// Konfigurasi Firebase
// PENTING: Ganti nilai di bawah dengan kredensial Firebase 
// project Anda dari Firebase Console > Project Settings
// ============================================================

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAhIAjn3PvDkO0gs1DPHlm4VV0kLJDClCI",
  authDomain: "click-8ef88.firebaseapp.com",
  projectId: "click-8ef88",
  storageBucket: "click-8ef88.firebasestorage.app",
  messagingSenderId: "796491309145",
  appId: "1:796491309145:web:6bf4e0232a8211762d1148",
  measurementId: "G-VZFKTQRG2V"
};

const app = initializeApp(firebaseConfig);

export const db   = getFirestore(app);
export const auth = getAuth(app);
export default app;
