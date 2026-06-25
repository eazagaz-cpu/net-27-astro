import { useState } from 'react';

const GOOGLE_ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const { getFirebaseAuth, isFirebaseConfigured } = await import('../../lib/firebase');

      if (!isFirebaseConfigured()) {
        setError('Google sign-in is being configured. Please try again later.');
        setLoading(false);
        return;
      }

      const auth = getFirebaseAuth();
      if (!auth) {
        setError('Google sign-in is being configured. Please try again later.');
        setLoading(false);
        return;
      }

      const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);

      window.location.href = '/';
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled.');
      } else if (err?.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized for sign-in. Contact support.');
      } else {
        setError(err?.message || 'Sign-in failed. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-wait"
        style={{ background: '#fff', color: '#333', border: 'none' }}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        ) : (
          GOOGLE_ICON
        )}
        {loading ? 'Signing in...' : 'Continue with Google'}
      </button>

      {error && (
        <p className="mt-3 text-xs text-center px-3 py-2 rounded-lg" style={{ color: 'var(--color-muted)', background: 'rgba(255,255,255,0.05)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
