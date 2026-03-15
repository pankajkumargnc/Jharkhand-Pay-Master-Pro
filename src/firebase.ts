// src/firebase.ts
// ══════════════════════════════════════════════════════════════════
// Firebase config — reads from .env.local (NEVER hardcode keys here)
// .env.local is in .gitignore — safe from GitHub exposure
// ══════════════════════════════════════════════════════════════════
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// Dev check — warns if any key is missing
if (import.meta.env.DEV) {
  const missing = Object.entries(firebaseConfig).filter(([,v]) => !v).map(([k]) => k);
  if (missing.length > 0) {
    console.warn('⚠️ Firebase: Missing env vars:', missing.join(', '));
    console.warn('👉 Create .env.local file with VITE_FIREBASE_* variables');
  }
}

const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
export default app;