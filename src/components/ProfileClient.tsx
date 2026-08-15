import { useState, useEffect } from 'react';

interface UserInfo {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  uid: string;
  creationTime?: string;
}

interface WatchlistItem {
  id: string | number;
  title: string;
  type: string;
}

interface HistoryItem {
  id: string | number;
  title: string;
  type: string;
  watchedAt: number;
}

interface Stats {
  watchlistCount: number;
  watchedCount: number;
  moviesWatched: number;
  showsWatched: number;
  memberSince: string;
}

export default function ProfileClient() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentHistory, setRecentHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    (async () => {
      try {
        const { getFirebaseAuth } = await import('../lib/firebase');
        const auth = getFirebaseAuth();
        if (!auth) { setLoading(false); return; }

        const { onAuthStateChanged } = await import('firebase/auth');
        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            setUser({
              displayName: firebaseUser.displayName,
              email: firebaseUser.email,
              photoURL: firebaseUser.photoURL,
              uid: firebaseUser.uid,
              creationTime: firebaseUser.metadata.creationTime,
            });

            // Load stats from localStorage + Firestore
            try {
              const { firestoreGetWatchlist, firestoreGetHistory } = await import('../lib/firestore');
              const [wl, hx] = await Promise.all([
                firestoreGetWatchlist(firebaseUser.uid),
                firestoreGetHistory(firebaseUser.uid),
              ]);

              const moviesWatched = hx.filter(h => h.type === 'movie').length;
              const showsWatched  = hx.filter(h => h.type !== 'movie').length;
              const createdDate   = firebaseUser.metadata.creationTime
                ? new Date(firebaseUser.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                : 'Unknown';

              setStats({
                watchlistCount: wl.length,
                watchedCount: hx.length,
                moviesWatched,
                showsWatched,
                memberSince: createdDate,
              });

              setRecentHistory(hx.slice(0, 6));
            } catch {}
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="text-6xl">👤</div>
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Sign in to View Your Profile</h2>
        <p className="text-[var(--color-text-muted)] max-w-sm">
          Create an account or sign in to see your watch stats, history, and saved watchlist.
        </p>
        <button
          id="profile-signin-btn"
          className="btn-primary px-6 py-3 rounded-xl font-semibold"
          onClick={() => {
            document.dispatchEvent(new CustomEvent('open-auth-modal'));
          }}
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  const initials = user.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email?.[0]?.toUpperCase() ?? '?';

  return (
    <div className="space-y-10">

      {/* Profile Header */}
      <div className="glass-card rounded-2xl p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName ?? 'Profile'}
            className="w-24 h-24 rounded-full object-cover ring-4 ring-[var(--color-primary)]/40 flex-shrink-0"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-3xl font-bold text-white flex-shrink-0 ring-4 ring-[var(--color-primary)]/40">
            {initials}
          </div>
        )}
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-2xl font-extrabold text-[var(--color-text-primary)]">
            {user.displayName ?? 'Anonymous User'}
          </h2>
          <p className="text-[var(--color-text-muted)] mt-1">{user.email}</p>
          {stats && (
            <p className="text-xs text-[var(--color-text-muted)] mt-2">
              🗓 Member since {stats.memberSince}
            </p>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div>
          <h3 className="section-title mb-4">Your Watch Stats</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Watchlist',       value: stats.watchlistCount, emoji: '🔖' },
              { label: 'Titles Watched',  value: stats.watchedCount,   emoji: '👁' },
              { label: 'Movies',          value: stats.moviesWatched,  emoji: '🎬' },
              { label: 'Shows',           value: stats.showsWatched,   emoji: '📺' },
            ].map(stat => (
              <div key={stat.label} className="glass-card rounded-xl p-6 text-center">
                <div className="text-3xl mb-2">{stat.emoji}</div>
                <div className="text-3xl font-extrabold text-[var(--color-primary)]">{stat.value}</div>
                <div className="text-xs text-[var(--color-text-muted)] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent History */}
      {recentHistory.length > 0 && (
        <div>
          <h3 className="section-title mb-4">Recently Watched</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {recentHistory.map(item => (
              <div key={String(item.id)} className="glass-card rounded-xl p-3 text-center">
                <div className="text-2xl mb-2">{item.type === 'movie' ? '🎬' : '📺'}</div>
                <p className="text-xs font-semibold text-[var(--color-text-primary)] line-clamp-2">{item.title}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  {new Date(item.watchedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <a href="/watchlist/" className="chip">View Full Watchlist →</a>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div>
        <h3 className="section-title mb-4">Quick Links</h3>
        <div className="flex flex-wrap gap-3">
          <a href="/watchlist/"   className="chip">🔖 My Watchlist</a>
          <a href="/trending/"    className="chip">🔥 Trending</a>
          <a href="/mood/"        className="chip">😊 Mood Discovery</a>
          <a href="/movies/"      className="chip">🎬 Browse Movies</a>
          <a href="/shows/"       className="chip">📺 Browse Shows</a>
        </div>
      </div>

    </div>
  );
}
