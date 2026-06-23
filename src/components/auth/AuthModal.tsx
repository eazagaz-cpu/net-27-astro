import { useState, useEffect, useRef, useCallback } from 'react';
import { signInWithGoogle, signOut, onAuthChange, isFirebaseConfigured, type AuthUser } from '../../lib/auth';

const GOOGLE_ICON = (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

function UserAvatar({ user }: { user: AuthUser }) {
  if (user.photoURL) {
    return <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />;
  }
  const initials = (user.displayName || user.email || 'U').charAt(0).toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: 'var(--color-primary)' }}>
      {initials}
    </div>
  );
}

export default function AuthModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [toast, setToast] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const scrollYRef = useRef(0);

  const configured = isFirebaseConfigured();

  useEffect(() => {
    if (!configured) return;
    const unsub = onAuthChange(setUser);
    return unsub;
  }, [configured]);

  const openModal = useCallback(() => {
    scrollYRef.current = window.scrollY;
    setIsOpen(true);
    setError('');
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollYRef.current}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflow = 'hidden';
    setTimeout(() => emailRef.current?.focus({ preventScroll: true }), 100);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setError('');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.overflow = '';
    window.scrollTo({ top: scrollYRef.current, behavior: 'instant' as ScrollBehavior });
    triggerRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>('button, a, input, [tabindex]:not([tabindex="-1"])');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus({ preventScroll: true }); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus({ preventScroll: true }); }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, closeModal]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleGoogle = async () => {
    if (!configured) { setError('Google sign-in is not configured yet.'); return; }
    setLoading(true);
    setError('');
    try {
      const u = await signInWithGoogle();
      if (u) {
        setToast(`Signed in as ${u.displayName || u.email}`);
        closeModal();
      }
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') { setError('Sign-in cancelled.'); }
      else { setError(err?.message || 'Sign-in failed. Please try again.'); }
    } finally { setLoading(false); }
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setShowUserMenu(false);
    setToast('Signed out successfully');
  };

  const handleEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setError('Email sign-in will be available soon. Please continue with Google.');
  };

  // Signed-in header state
  if (user) {
    return (
      <div className="relative">
        <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 cursor-pointer" aria-label="User menu">
          <UserAvatar user={user} />
        </button>
        {showUserMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl z-50 border" style={{ background: 'var(--color-surface-soft)', borderColor: 'rgba(255,255,255,0.1)' }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <p className="text-sm font-medium text-white truncate">{user.displayName || 'User'}</p>
                <p className="text-xs truncate" style={{ color: 'var(--color-muted)' }}>{user.email}</p>
              </div>
              <div className="py-1">
                <a href="/watchlist/" className="block px-4 py-2 text-sm hover:bg-white/5 transition-colors" style={{ color: 'var(--color-muted)' }}>Watchlist</a>
                <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors cursor-pointer" style={{ color: 'var(--color-primary)' }}>Sign Out</button>
              </div>
            </div>
          </>
        )}
        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl text-sm font-medium text-white shadow-2xl" style={{ background: 'var(--color-surface-soft)', border: '1px solid rgba(255,255,255,0.1)' }}>
            {toast}
          </div>
        )}
      </div>
    );
  }

  // Signed-out state
  return (
    <>
      <button ref={triggerRef} onClick={openModal} className="btn-primary text-xs px-4 py-2 rounded-lg cursor-pointer">
        Sign In
      </button>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl text-sm font-medium text-white shadow-2xl" style={{ background: 'var(--color-surface-soft)', border: '1px solid rgba(255,255,255,0.1)' }}>
          {toast}
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="auth-title" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          {/* Background */}
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />

          {/* Poster collage background */}
          <div className="absolute inset-0 opacity-[0.08]" style={{
            backgroundImage: 'url(https://image.tmdb.org/t/p/w342/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg), url(https://image.tmdb.org/t/p/w342/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg), url(https://image.tmdb.org/t/p/w342/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg), url(https://image.tmdb.org/t/p/w342/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg)',
            backgroundSize: '200px',
            backgroundRepeat: 'repeat',
            transform: 'rotate(-15deg) scale(1.5)',
          }} />

          {/* Modal card */}
          <div ref={modalRef} className="relative w-full max-w-md rounded-2xl p-8 z-10" style={{ background: 'linear-gradient(180deg, rgba(20,20,25,0.97), rgba(10,10,14,0.99))', border: '1px solid rgba(255,255,255,0.08)' }}>
            {/* Close button */}
            <button onClick={closeModal} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer" aria-label="Close" style={{ color: 'var(--color-muted)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>

            {/* Logo */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1a1a1f, #0a0a0e)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span className="text-2xl font-black" style={{ color: 'var(--color-primary)' }}>N</span>
              </div>
              <h2 className="text-xl font-bold text-white">
                <span style={{ color: 'var(--color-primary)' }}>Net</span>Mirror
              </h2>
              <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>India's #1 streaming platform</p>
            </div>

            {/* Title */}
            <h3 id="auth-title" className="text-lg font-bold text-white text-center mb-1">Sign in / Sign Up</h3>
            <p className="text-xs text-center mb-6" style={{ color: 'var(--color-muted)' }}>Free account. No credit card. Resume where you left off.</p>

            {/* Email form */}
            <form onSubmit={handleEmail} className="mb-4">
              <div className="relative mb-3">
                <input
                  ref={emailRef}
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', '--tw-ring-color': 'var(--color-primary)' } as React.CSSProperties}
                />
              </div>
              <button type="submit" className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer" style={{ background: 'var(--color-primary)' }}>
                Continue with Email
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <span className="text-xs" style={{ color: 'var(--color-muted)' }}>OR</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
            </div>

            {/* Google sign-in */}
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
              style={{ background: '#fff', color: '#333' }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              ) : GOOGLE_ICON}
              {loading ? 'Signing in...' : 'Sign in with Google'}
            </button>

            {/* Error */}
            {error && (
              <p className="mt-3 text-xs text-center px-2 py-2 rounded-lg" style={{ color: 'var(--color-primary)', background: 'rgba(255,31,61,0.1)' }}>{error}</p>
            )}

            {/* Terms */}
            <p className="mt-5 text-[10px] text-center" style={{ color: 'var(--color-muted)' }}>
              By continuing, you agree to our{' '}
              <a href="/terms/" className="underline hover:text-white transition-colors">Terms</a> &{' '}
              <a href="/privacy/" className="underline hover:text-white transition-colors">Privacy Policy</a>.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
