import { useState } from 'react';

export default function EmailSignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError('');
    setLoading(true);

    try {
      const { getFirebaseAuth } = await import('../../lib/firebase');
      const auth = getFirebaseAuth();
      if (!auth) {
        setError('Sign-in service is not available. Try Google sign-in.');
        setLoading(false);
        return;
      }

      const { fetchSignInMethodsForEmail } = await import('firebase/auth');
      const methods = await fetchSignInMethodsForEmail(auth, email.trim());
      setIsNewUser(methods.length === 0);
      setStep('password');
    } catch (err: any) {
      if (err?.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setStep('password');
        setIsNewUser(true);
      }
    }
    setLoading(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const { getFirebaseAuth } = await import('../../lib/firebase');
      const auth = getFirebaseAuth();
      if (!auth) {
        setError('Sign-in service is not available.');
        setLoading(false);
        return;
      }

      if (isNewUser) {
        const { createUserWithEmailAndPassword } = await import('firebase/auth');
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }

      window.location.href = '/';
    } catch (err: any) {
      if (err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        setError('Incorrect password. Please try again.');
      } else if (err?.code === 'auth/email-already-in-use') {
        setError('Account exists. Enter your password to sign in.');
        setIsNewUser(false);
      } else if (err?.code === 'auth/weak-password') {
        setError('Password is too weak. Use at least 6 characters.');
      } else if (err?.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait and try again.');
      } else {
        setError(err?.message || 'Something went wrong. Please try again.');
      }
      setLoading(false);
    }
  };

  if (step === 'email') {
    return (
      <form onSubmit={handleEmailSubmit} className="mb-4">
        <div style={{ position: 'relative' }}>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-label="Email address"
            className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 mb-3"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white cursor-pointer disabled:opacity-50 disabled:cursor-wait"
          style={{ background: 'var(--color-primary)' }}
        >
          {loading ? 'Checking...' : 'Continue with Email'}
        </button>
        {error && (
          <p className="mt-3 text-xs text-center px-3 py-2 rounded-lg" style={{ color: '#f87171', background: 'rgba(248,113,113,0.08)' }}>
            {error}
          </p>
        )}
      </form>
    );
  }

  return (
    <form onSubmit={handlePasswordSubmit} className="mb-4">
      <div className="mb-3 px-1">
        <p className="text-xs text-zinc-400 mb-1">
          {isNewUser ? 'Create a password for' : 'Enter password for'}
        </p>
        <p className="text-sm text-white font-medium">{email}</p>
        <button
          type="button"
          onClick={() => { setStep('email'); setPassword(''); setError(''); }}
          className="text-xs mt-1 cursor-pointer hover:underline"
          style={{ color: 'var(--color-primary)' }}
        >
          Change email
        </button>
      </div>
      <input
        type="password"
        placeholder={isNewUser ? 'Create a password (min 6 chars)' : 'Enter your password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
        autoFocus
        aria-label="Password"
        className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 mb-3"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
      />
      <button
        type="submit"
        disabled={loading || password.length < 6}
        className="w-full py-3 rounded-xl text-sm font-semibold text-white cursor-pointer disabled:opacity-50 disabled:cursor-wait"
        style={{ background: 'var(--color-primary)' }}
      >
        {loading ? (isNewUser ? 'Creating account...' : 'Signing in...') : (isNewUser ? 'Create Account' : 'Sign In')}
      </button>
      {error && (
        <p className="mt-3 text-xs text-center px-3 py-2 rounded-lg" style={{ color: '#f87171', background: 'rgba(248,113,113,0.08)' }}>
          {error}
        </p>
      )}
    </form>
  );
}
