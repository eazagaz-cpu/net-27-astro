/**
 * UserReviews.tsx — User ratings & reviews system powered by Firebase Firestore.
 *
 * Features:
 * - 1-5 star rating with hover effect
 * - Optional text review (with spoiler toggle)
 * - Firestore: reviews/{tmdbId}/ratings/{uid}
 * - Aggregate rating display (avg + count)
 * - Schema.org AggregateRating data via window event
 */
import { useState, useEffect, useCallback } from 'react';

interface Review {
  uid: string;
  displayName: string;
  photoURL: string | null;
  stars: number;
  review: string;
  spoiler: boolean;
  createdAt: number;
}

interface Props {
  tmdbId: number;
  titleName: string;
}

function StarRow({
  value,
  interactive,
  onChange,
}: {
  value: number;
  interactive: boolean;
  onChange?: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  const display = interactive ? (hover || value) : value;

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => interactive && setHover(n)}
          onMouseLeave={() => interactive && setHover(0)}
          className={`text-2xl transition-all duration-150 ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
          style={{ background: 'none', border: 'none', padding: 0, lineHeight: 1 }}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          <span style={{ color: n <= display ? '#f59e0b' : 'rgba(255,255,255,0.15)' }}>★</span>
        </button>
      ))}
    </div>
  );
}

export default function UserReviews({ tmdbId, titleName }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [user, setUser] = useState<{ uid: string; displayName: string | null; photoURL: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [stars, setStars] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [spoiler, setSpoiler] = useState(false);
  const [showSpoiler, setShowSpoiler] = useState<Record<string, boolean>>({});
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const collectionPath = `reviews/${tmdbId}/ratings`;

  const loadReviews = useCallback(async () => {
    try {
      const { getFirestore } = await import('../lib/firestore');
      const db = await getFirestore();
      if (!db) return;
      const { collection, getDocs, orderBy, query, limit } = await import('firebase/firestore');
      const q = query(collection(db, collectionPath), orderBy('createdAt', 'desc'), limit(20));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => d.data() as Review);
      setReviews(data);

      // Emit aggregate rating for SEO
      const avg = data.length ? (data.reduce((s, r) => s + r.stars, 0) / data.length) : 0;
      window.dispatchEvent(new CustomEvent('aggregate-rating', {
        detail: { ratingValue: avg.toFixed(1), ratingCount: data.length },
      }));
    } catch {}
  }, [collectionPath]);

  useEffect(() => {
    (async () => {
      try {
        const { getFirebaseAuth } = await import('../lib/firebase');
        const auth = getFirebaseAuth();
        if (!auth) { setLoading(false); return; }
        const { onAuthStateChanged } = await import('firebase/auth');
        onAuthStateChanged(auth, async (fu) => {
          if (fu) {
            setUser({ uid: fu.uid, displayName: fu.displayName, photoURL: fu.photoURL });
            // Load my existing review
            try {
              const { getFirestore } = await import('../lib/firestore');
              const db = await getFirestore();
              if (db) {
                const { doc, getDoc } = await import('firebase/firestore');
                const ref = doc(db, collectionPath, fu.uid);
                const snap = await getDoc(ref);
                if (snap.exists()) {
                  const data = snap.data() as Review;
                  setMyReview(data);
                  setStars(data.stars);
                  setReviewText(data.review);
                  setSpoiler(data.spoiler);
                }
              }
            } catch {}
          } else {
            setUser(null);
          }
          setLoading(false);
        });
      } catch { setLoading(false); }
    })();
    loadReviews();
  }, [collectionPath, loadReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stars) { setFormError('Please select a star rating.'); return; }
    if (!user) { setFormError('Please sign in to submit a review.'); return; }
    setSubmitting(true);
    setFormError('');
    try {
      const { getFirestore } = await import('../lib/firestore');
      const db = await getFirestore();
      if (!db) throw new Error('DB unavailable');
      const { doc, setDoc } = await import('firebase/firestore');
      const ref = doc(db, collectionPath, user.uid);
      const data: Review = {
        uid: user.uid,
        displayName: user.displayName ?? 'Anonymous',
        photoURL: user.photoURL,
        stars,
        review: reviewText.trim(),
        spoiler,
        createdAt: Date.now(),
      };
      await setDoc(ref, data);
      setMyReview(data);
      setFormSuccess(true);
      await loadReviews();
      setTimeout(() => setFormSuccess(false), 3000);
    } catch { setFormError('Failed to submit. Please try again.'); }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!user || !myReview) return;
    try {
      const { getFirestore } = await import('../lib/firestore');
      const db = await getFirestore();
      if (!db) return;
      const { doc, deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, collectionPath, user.uid));
      setMyReview(null);
      setStars(0);
      setReviewText('');
      setSpoiler(false);
      await loadReviews();
    } catch {}
  };

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.stars, 0) / reviews.length) : 0;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="section-title">User Reviews</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-3">
            <StarRow value={Math.round(avg)} interactive={false} />
            <span className="text-[var(--color-text-secondary)] text-sm font-semibold">
              {avg.toFixed(1)} / 5 &nbsp;·&nbsp; {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Submit Form */}
      {!loading && (
        <div className="glass-card rounded-xl p-6">
          {user ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" width={36} height={36} className="rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-sm font-bold text-white">
                    {(user.displayName ?? 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {myReview ? 'Update your review' : `Rate ${titleName}`}
                </span>
              </div>

              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-2">Your rating *</p>
                <StarRow value={stars} interactive onChange={setStars} />
              </div>

              <div>
                <textarea
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  placeholder="Share your thoughts (optional)..."
                  maxLength={1000}
                  rows={3}
                  className="w-full rounded-lg px-4 py-3 text-sm resize-none"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'var(--color-text-primary)',
                    outline: 'none',
                  }}
                />
                <div className="flex items-center justify-between mt-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={spoiler}
                      onChange={e => setSpoiler(e.target.checked)}
                      className="accent-[var(--color-primary)] w-4 h-4"
                    />
                    <span className="text-xs text-[var(--color-text-muted)]">Contains spoilers</span>
                  </label>
                  <span className="text-xs text-[var(--color-text-muted)]">{reviewText.length}/1000</span>
                </div>
              </div>

              {formError && <p className="text-xs text-red-400">{formError}</p>}
              {formSuccess && <p className="text-xs text-green-400">✓ Review submitted!</p>}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting || !stars}
                  className="btn-primary px-6 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : myReview ? 'Update Review' : 'Submit Review'}
                </button>
                {myReview && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-4 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <p className="text-sm text-[var(--color-text-secondary)]">
                Sign in to rate and review <strong>{titleName}</strong>
              </p>
              <button
                className="btn-primary px-5 py-2 rounded-lg text-sm font-semibold"
                onClick={() => document.dispatchEvent(new CustomEvent('open-auth-modal'))}
              >
                Sign In to Review
              </button>
            </div>
          )}
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.uid} className="glass-card rounded-xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {r.photoURL ? (
                    <img src={r.photoURL} alt="" width={32} height={32} className="rounded-full flex-shrink-0" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/30 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                      {(r.displayName ?? 'A')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{r.displayName ?? 'Anonymous'}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
                <StarRow value={r.stars} interactive={false} />
              </div>
              {r.review && (
                <div className="mt-3">
                  {r.spoiler && !showSpoiler[r.uid] ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full">⚠️ Spoiler</span>
                      <button
                        onClick={() => setShowSpoiler(prev => ({ ...prev, [r.uid]: true }))}
                        className="text-xs text-[var(--color-primary)] hover:underline"
                      >
                        Reveal
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{r.review}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {reviews.length === 0 && !loading && (
        <div className="text-center py-8 text-[var(--color-text-muted)] text-sm">
          No reviews yet — be the first to rate {titleName}!
        </div>
      )}
    </section>
  );
}
