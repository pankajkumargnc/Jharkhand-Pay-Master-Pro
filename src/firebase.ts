// src/firebase.ts
// ══════════════════════════════════════════════════════════════════
// STEP 1: Firebase Console (console.firebase.google.com) pe jao
// STEP 2: New Project banao → "jharkhand-pay-master-pro"
// STEP 3: Web app add karo → Config copy karo → YAHAN paste karo
// ══════════════════════════════════════════════════════════════════
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCv0JU1ijxE4kbjeSft6zSjG30c6fRBW70",
  authDomain: "jharkhand-pay-master-pro.firebaseapp.com",
  projectId: "jharkhand-pay-master-pro",
  storageBucket: "jharkhand-pay-master-pro.firebasestorage.app",
  messagingSenderId: "114458737638",
  appId: "1:114458737638:web:c389326ecbcd394e393427"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
export default app;