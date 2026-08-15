/**
 * PushSubscribeButton.tsx — "Notify me when this releases" button.
 *
 * Shown on coming-soon cards and unreleased title pages.
 * Uses Firebase Cloud Messaging (FCM) to store the user's push token.
 *
 * States:
 *   - Not supported (browser/VAPID key missing): hidden
 *   - Not signed in: shows "Sign in to get notified"
 *   - Supported + signed in + not subscribed: "🔔 Notify Me"
 *   - Subscribed: "✓ Notifications On" (can click to unsubscribe)
 */
import { useState, useEffect } from 'react';
import { isPushSupported, isPushGranted, requestPushPermission, unsubscribePush } from '../lib/fcm';

interface Props {
  /** The title to notify about (for display only) */
  titleName: string;
  /** Optional compact mode for card display */
  compact?: boolean;
}

export default function PushSubscribeButton({ titleName, compact = false }: Props) {
  const [user, setUser] = useState<{ uid: string } | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');

  const supported = isPushSupported();

  useEffect(() => {
    if (!supported) { setLoading(false); return; }

    (async () => {
      try {
        const { getFirebaseAuth } = await import('../lib/firebase');
        const auth = getFirebaseAuth();
        if (!auth) { setLoading(false); return; }
        const { onAuthStateChanged } = await import('firebase/auth');
        onAuthStateChanged(auth, async (fu) => {
          if (fu) {
            setUser({ uid: fu.uid });
            // Check if already subscribed
            setSubscribed(isPushGranted());
          } else {
            setUser(null);
          }
          setLoading(false);
        });
      } catch { setLoading(false); }
    })();
  }, [supported]);

  if (!supported || loading) return null;

  const handleSubscribe = async () => {
    if (!user) {
      document.dispatchEvent(new CustomEvent('open-auth-modal'));
      return;
    }
    setWorking(true);
    setError('');
    const token = await requestPushPermission(user.uid);
    if (token) {
      setSubscribed(true);
    } else {
      setError('Permission denied. Enable notifications in your browser settings.');
    }
    setWorking(false);
  };

  const handleUnsubscribe = async () => {
    if (!user) return;
    setWorking(true);
    await unsubscribePush(user.uid);
    setSubscribed(false);
    setWorking(false);
  };

  if (subscribed) {
    return (
      <button
        onClick={handleUnsubscribe}
        disabled={working}
        title="Click to turn off notifications"
        className={`flex items-center gap-2 font-semibold transition-all disabled:opacity-50 ${
          compact
            ? 'text-xs px-3 py-1.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/20 hover:bg-red-500/15 hover:text-red-400 hover:border-red-500/20'
            : 'text-sm px-4 py-2 rounded-xl bg-green-500/15 text-green-400 border border-green-500/20 hover:bg-red-500/15 hover:text-red-400 hover:border-red-500/20'
        }`}
      >
        <span>✓</span>
        <span>{compact ? 'Notifying' : 'Notifications On'}</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        onClick={handleSubscribe}
        disabled={working}
        title={`Get notified when ${titleName} is available`}
        className={`flex items-center gap-2 font-semibold transition-all disabled:opacity-50 ${
          compact
            ? 'text-xs px-3 py-1.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 hover:bg-[var(--color-primary)]/20'
            : 'text-sm px-4 py-2 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 hover:bg-[var(--color-primary)]/20'
        }`}
      >
        <span>🔔</span>
        <span>{working ? 'Setting up…' : compact ? 'Notify Me' : `Notify Me When Available`}</span>
      </button>
      {error && <p className="text-xs text-red-400 max-w-xs">{error}</p>}
    </div>
  );
}
