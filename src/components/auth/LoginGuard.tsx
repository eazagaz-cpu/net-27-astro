import { useState, useEffect } from 'react';

interface UserInfo {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export default function LoginGuard() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { getFirebaseAuth } = await import('../../lib/firebase');
        const auth = getFirebaseAuth();
        if (!auth) { setChecking(false); return; }

        const { onAuthStateChanged } = await import('firebase/auth');
        onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser) {
            setUser({
              displayName: firebaseUser.displayName,
              email: firebaseUser.email,
              photoURL: firebaseUser.photoURL,
            });
          }
          setChecking(false);
        });
      } catch { setChecking(false); }
    })();
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
    } catch {}
  };

  useEffect(() => {
    const form = document.getElementById('login-form');
    if (!form) return;
    if (checking) return;
    form.style.display = user ? 'none' : 'block';
  }, [user, checking]);

  if (checking) return null;
  if (!user) return null;

  return (
    <div style={{
      textAlign: 'center', padding: '24px 0',
    }}>
      <div style={{ marginBottom: 16 }}>
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            width={64} height={64}
            style={{ borderRadius: '50%', border: '3px solid var(--color-primary)', margin: '0 auto' }}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div style={{
            width: 64, height: 64, borderRadius: '50%', margin: '0 auto',
            background: 'var(--color-primary)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 700, color: '#fff',
          }}>
            {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
        Welcome, {user.displayName || 'User'}
      </p>
      <p style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 20 }}>
        {user.email}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <a
          href="/"
          style={{
            display: 'block', padding: '12px', borderRadius: 12,
            fontSize: 14, fontWeight: 600, color: '#fff', textDecoration: 'none',
            background: 'var(--color-primary)', textAlign: 'center',
          }}
        >
          Browse Movies & Shows
        </a>
        <button
          onClick={handleSignOut}
          className="cursor-pointer"
          style={{
            padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 500,
            color: 'var(--color-muted)', background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center',
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
