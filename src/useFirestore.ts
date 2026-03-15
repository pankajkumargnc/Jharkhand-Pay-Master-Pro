// src/useFirestore.ts
import { useState, useEffect, useCallback } from 'react';
import {
  collection, doc, setDoc, deleteDoc,
  onSnapshot, writeBatch, serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import type { EmployeeData } from './App';

export const COLLEGE_ID = 'guru-nanak-college';

const profilesRef  = () => collection(db, 'colleges', COLLEGE_ID, 'profiles');
const profileRef   = (id: string) => doc(db, 'colleges', COLLEGE_ID, 'profiles', id);
const sysConfigRef = () => doc(db, 'colleges', COLLEGE_ID, 'settings', 'sysConfig');

// ── Logo stored separately in localStorage (base64 too large for Firestore 1MB limit) ──
const LOGO_KEY = 'gnc_logo_permanent_v8';

export function getStoredLogo(): string {
  try { return localStorage.getItem(LOGO_KEY) || ''; } catch { return ''; }
}
export function saveLogoLocally(base64: string): void {
  try { localStorage.setItem(LOGO_KEY, base64); } catch(e) {
    console.error('Logo save failed (storage full?):', e);
  }
}
export function removeLogoLocally(): void {
  try { localStorage.removeItem(LOGO_KEY); } catch {}
}

// ══════════════════════════════════════════════════════════════════
// HOOK: useProfiles
// ══════════════════════════════════════════════════════════════════
export function useProfiles() {
  const [profiles, setProfiles] = useState<EmployeeData[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const q = query(profilesRef(), orderBy('name'));
    const unsub = onSnapshot(
      q,
      snap => {
        const data = snap.docs.map(d => ({ ...d.data() } as EmployeeData));
        setProfiles(data);
        setLoading(false);
        setError(null);
        try { localStorage.setItem('gnc_profiles_cache', JSON.stringify(data)); } catch {}
      },
      err => {
        console.error('Firestore profiles error:', err);
        setError(err.message);
        setLoading(false);
        try {
          const cached = localStorage.getItem('gnc_profiles_cache');
          if (cached) setProfiles(JSON.parse(cached));
        } catch {}
      }
    );
    return () => unsub();
  }, []);

  const saveProfile = useCallback(async (profile: EmployeeData) => {
    try {
      await setDoc(profileRef(profile.id), { ...profile, updatedAt: serverTimestamp() });
    } catch (err: any) { console.error('Save profile error:', err); throw err; }
  }, []);

  const deleteProfile = useCallback(async (id: string) => {
    try { await deleteDoc(profileRef(id)); }
    catch (err: any) { console.error('Delete profile error:', err); throw err; }
  }, []);

  const importProfiles = useCallback(async (newProfiles: EmployeeData[]) => {
    const batch = writeBatch(db);
    newProfiles.forEach(p => { batch.set(profileRef(p.id), { ...p, updatedAt: serverTimestamp() }); });
    await batch.commit();
  }, []);

  const deleteAllProfiles = useCallback(async () => {
    const batch = writeBatch(db);
    profiles.forEach(p => batch.delete(profileRef(p.id)));
    await batch.commit();
  }, [profiles]);

  return { profiles, loading, error, saveProfile, deleteProfile, importProfiles, deleteAllProfiles };
}

// ══════════════════════════════════════════════════════════════════
// HOOK: useSysConfig
// Logo is NOT stored in Firestore (base64 too large → 1MB Firestore doc limit)
// Logo lives permanently in localStorage under LOGO_KEY
// ══════════════════════════════════════════════════════════════════
const DEFAULT_SYS = {
  collegeName:  'GURU NANAK COLLEGE',
  address:      'Bhuda, Dhanbad, Jharkhand - 826001',
  affiliatedTo: 'Binod Bihari Mahto Koylanchal University',
  logoBase64:   '',
};

export function useSysConfig() {
  // Load logo from localStorage immediately (permanent)
  const [sysConfig, setSysConfigState] = useState(() => ({
    ...DEFAULT_SYS,
    logoBase64: getStoredLogo(),
  }));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      sysConfigRef(),
      snap => {
        const cloudData = snap.exists() ? snap.data() : {};
        // Always override logoBase64 from localStorage — NOT from Firestore
        setSysConfigState(prev => ({
          ...DEFAULT_SYS,
          ...cloudData,
          logoBase64: getStoredLogo() || prev.logoBase64, // localStorage wins
        }));
        setLoading(false);
      },
      err => {
        console.error('SysConfig error:', err);
        setLoading(false);
        // Offline fallback
        try {
          const cached = localStorage.getItem('gnc_sys_cache');
          const parsed = cached ? JSON.parse(cached) : {};
          setSysConfigState(prev => ({
            ...DEFAULT_SYS,
            ...parsed,
            logoBase64: getStoredLogo() || prev.logoBase64,
          }));
        } catch {}
      }
    );
    return () => unsub();
  }, []);

  const setSysConfig = useCallback(async (
    updater: typeof DEFAULT_SYS | ((prev: typeof DEFAULT_SYS) => typeof DEFAULT_SYS)
  ) => {
    const newConfig = typeof updater === 'function' ? updater(sysConfig) : updater;

    // Save logo to localStorage permanently (not Firestore)
    if (newConfig.logoBase64) {
      saveLogoLocally(newConfig.logoBase64);
    } else if (newConfig.logoBase64 === '') {
      removeLogoLocally();
    }

    setSysConfigState(newConfig); // optimistic UI update

    // Save everything EXCEPT logoBase64 to Firestore (too large)
    const { logoBase64, ...firestoreData } = newConfig;
    try {
      await setDoc(sysConfigRef(), { ...firestoreData, updatedAt: serverTimestamp() }, { merge: true });
      localStorage.setItem('gnc_sys_cache', JSON.stringify(firestoreData));
    } catch (err) {
      console.error('Save sysConfig error:', err);
    }
  }, [sysConfig]);

  return { sysConfig, setSysConfig, loading };
}