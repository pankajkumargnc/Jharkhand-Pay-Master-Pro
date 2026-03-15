// src/LoginPage.tsx
// ══════════════════════════════════════════════════════════════════
// Firebase Email/Password Login Page
// Premium dark design matching Pay Master Pro theme
// ══════════════════════════════════════════════════════════════════
import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from './firebase';

interface Props {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: Props) {
  const [mode,     setMode]     = useState<'login' | 'register' | 'reset'>('login');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [name,     setName]     = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);

    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        onLogin();
      } else if (mode === 'register') {
        await createUserWithEmailAndPassword(auth, email, password);
        onLogin();
      } else {
        await sendPasswordResetEmail(auth, email);
        setSuccess('Password reset email bheja gaya! Inbox check karein.');
      }
    } catch (err: any) {
      const msg: Record<string, string> = {
        'auth/user-not-found':     'Email registered nahi hai.',
        'auth/wrong-password':     'Password galat hai.',
        'auth/email-already-in-use': 'Ye email already registered hai.',
        'auth/weak-password':      'Password kam se kam 6 characters ka hona chahiye.',
        'auth/invalid-email':      'Valid email dalein.',
        'auth/too-many-requests':  'Bahut zyada attempts. Thodi der baad try karein.',
        'auth/network-request-failed': 'Internet connection check karein.',
      };
      setError(msg[err.code] || `Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #080b0f 0%, #0d1a2e 60%, #080b0f 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif",
      padding: '20px',
      position: 'relative', overflow: 'hidden',
    }}>

      {/* Background glow */}
      <div style={{ position:'absolute', width:'600px', height:'600px', background:'radial-gradient(circle,rgba(200,168,75,0.07) 0%,transparent 65%)', top:'-200px', right:'-200px', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', width:'500px', height:'500px', background:'radial-gradient(circle,rgba(13,148,136,0.05) 0%,transparent 65%)', bottom:'-150px', left:'-150px', pointerEvents:'none' }}/>

      {/* Card */}
      <div style={{
        background: 'rgba(18,22,31,0.95)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        position: 'relative',
      }}>
        {/* Gold top line */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:'linear-gradient(90deg,transparent,#c8a84b,#2dd4bf,#c8a84b,transparent)', borderRadius:'20px 20px 0 0' }}/>

        {/* Logo + Title */}
        <div style={{ textAlign:'center', marginBottom:'36px' }}>
          <div style={{ fontSize:'40px', marginBottom:'12px' }}>💰</div>
          <h1 style={{ fontSize:'22px', fontWeight:'900', color:'#f0f4ff', margin:'0 0 6px', letterSpacing:'-0.5px' }}>
            Jharkhand Pay Master Pro
          </h1>
          <p style={{ fontSize:'12px', color:'#7a8ba0', margin:0 }}>
            Guru Nanak College, Dhanbad
          </p>
          <div style={{ width:'60px', height:'2px', background:'linear-gradient(90deg,#c8a84b,#2dd4bf)', margin:'14px auto 0', borderRadius:'2px' }}/>
        </div>

        {/* Mode tabs */}
        <div style={{ display:'flex', gap:'4px', background:'rgba(255,255,255,0.04)', borderRadius:'10px', padding:'4px', marginBottom:'28px' }}>
          {(['login','register'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); setSuccess(''); }}
              style={{
                flex:1, padding:'8px', borderRadius:'8px', border:'none', cursor:'pointer',
                background: mode === m ? '#c8a84b' : 'transparent',
                color: mode === m ? '#0a1628' : '#7a8ba0',
                fontWeight: mode === m ? '700' : '500',
                fontSize: '13px', transition: 'all 0.2s',
              }}>
              {m === 'login' ? '🔑 Login' : '✨ Register'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div style={{ marginBottom:'16px' }}>
              <label style={{ display:'block', fontSize:'11px', fontWeight:'700', color:'#c8a84b', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'6px' }}>
                Full Name
              </label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Your full name"
                required
                style={{ width:'100%', padding:'12px 14px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', color:'#f0f4ff', fontSize:'14px', outline:'none', boxSizing:'border-box' }}
                onFocus={e => e.target.style.borderColor = '#c8a84b'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          )}

          <div style={{ marginBottom:'16px' }}>
            <label style={{ display:'block', fontSize:'11px', fontWeight:'700', color:'#c8a84b', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'6px' }}>
              Email Address
            </label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{ width:'100%', padding:'12px 14px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', color:'#f0f4ff', fontSize:'14px', outline:'none', boxSizing:'border-box' }}
              onFocus={e => e.target.style.borderColor = '#c8a84b'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          {mode !== 'reset' && (
            <div style={{ marginBottom:'24px' }}>
              <label style={{ display:'block', fontSize:'11px', fontWeight:'700', color:'#c8a84b', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'6px' }}>
                Password
              </label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required minLength={6}
                style={{ width:'100%', padding:'12px 14px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', color:'#f0f4ff', fontSize:'14px', outline:'none', boxSizing:'border-box' }}
                onFocus={e => e.target.style.borderColor = '#c8a84b'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              {mode === 'login' && (
                <button type="button" onClick={() => { setMode('reset'); setError(''); setSuccess(''); }}
                  style={{ background:'none', border:'none', color:'#7a8ba0', fontSize:'12px', cursor:'pointer', marginTop:'6px', padding:0, float:'right' }}>
                  Forgot password?
                </button>
              )}
            </div>
          )}

          {/* Error / Success */}
          {error && (
            <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'8px', padding:'10px 14px', fontSize:'12px', color:'#f87171', marginBottom:'16px' }}>
              ❌ {error}
            </div>
          )}
          {success && (
            <div style={{ background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.3)', borderRadius:'8px', padding:'10px 14px', fontSize:'12px', color:'#4ade80', marginBottom:'16px' }}>
              ✅ {success}
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{
              width:'100%', padding:'14px', borderRadius:'10px', border:'none',
              background: loading ? 'rgba(200,168,75,0.5)' : 'linear-gradient(135deg,#c8a84b,#b8943a)',
              color:'#0a1628', fontWeight:'800', fontSize:'14px', letterSpacing:'0.08em',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition:'all 0.2s', textTransform:'uppercase',
            }}>
            {loading ? '⏳ Please wait...' :
             mode === 'login' ? '🔑 Login' :
             mode === 'register' ? '✨ Create Account' : '📧 Send Reset Email'}
          </button>
        </form>

        {/* Footer */}
        <p style={{ textAlign:'center', fontSize:'11px', color:'rgba(122,139,160,0.6)', marginTop:'24px', marginBottom:0 }}>
          © 2026 Pankaj Kumar Prasad · All Rights Reserved
        </p>
      </div>
    </div>
  );
}