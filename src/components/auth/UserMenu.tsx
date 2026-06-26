import { useState, useEffect } from 'react';

interface UserInfo {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export default function UserMenu() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    (async () => {
      try {
        const { getFirebaseAuth } = await import('../../lib/firebase');
        const auth = getFirebaseAuth();
        if (!auth) {
          setLoading(false);
          return;
        }

        const { onAuthStateChanged } = await import('firebase/auth');
        unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser) {
            setUser({
              displayName: firebaseUser.displayName,
              email: firebaseUser.email,
              photoURL: firebaseUser.photoURL,
            });
          } else {
            setUser(null);
          }
          setLoading(false);
        });
      } catch {
        setLoading(false);
      }
    })();

    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  const handleSignOut = async () => {
    try {
      const { getFirebaseAuth } = await import('../../lib/firebase');
      const auth = getFirebaseAuth();
      if (auth) {
        const { signOut } = await import('firebase/auth');
        await signOut(auth);
      }
      setUser(null);
      setMenuOpen(false);
    } catch {}
  };

  if (loading) {
    return (
      <a href="/login/" className="hidden sm:inline-flex btn-primary text-xs px-4 py-2 rounded-lg">
        Sign In
      </a>
    );
  }

  if (!user) {
    return (
      <a href="/login/" className="hidden sm:inline-flex btn-primary text-xs px-4 py-2 rounded-lg">
        Sign In
      </a>
    );
  }

  const initial = (user.displayName || user.email || 'U').charAt(0).toUpperCase();

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 cursor-pointer"
        aria-label="User menu"
        aria-expanded={menuOpen}
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            width={32}
            height={32}
            style={{ borderRadius: '50%', border: '2px solid var(--color-primary)' }}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--color-primary)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: '#fff',
          }}>
            {initial}
          </div>
        )}
      </button>

      {menuOpen && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
            onClick={() => setMenuOpen(false)}
          />
          <div style={{
            position: 'absolute', right: 0, top: 40, zIndex: 50,
            width: 240, borderRadius: 12, overflow: 'hidden',
            background: 'rgba(20,20,25,0.98)', border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(12px)',
          }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 2 }}>
                {user.displayName || 'User'}
              </p>
              <p style={{ fontSize: 11, color: 'var(--color-muted)', wordBreak: 'break-all' }}>
                {user.email}
              </p>
            </div>
            <div style={{ padding: 6 }}>
              <button
                onClick={handleSignOut}
                className="cursor-pointer"
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8,
                  fontSize: 13, fontWeight: 500, color: 'var(--color-primary)',
                  background: 'transparent', border: 'none', textAlign: 'left',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
