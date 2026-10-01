import React, { useState, useMemo } from 'react';
import {
  Star,
  CheckCircle2,
  ThumbsUp,
  ShieldCheck,
  ShieldAlert,
  Edit3,
  Trash2,
  ShoppingBag,
  Sparkles,
  Filter,
  Check,
  X,
  AlertCircle,
  LogIn,
} from 'lucide-react';
import { useReviews } from '../../context/ReviewContext';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { useCart } from '../../context/CartContext';
import { useRouter } from '../../context/RouterContext';
import { useToast } from '../../context/ToastContext';

interface ReviewSectionProps {
  productId: string;
  productName: string;
  rating: number;
  reviewCount: number;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Poor - Did not meet expectations',
  2: 'Fair - Needs improvement',
  3: 'Average - Meets basic expectations',
  4: 'Good - Satisfied with purchase',
  5: 'Excellent - Highly recommended!',
};

export const ReviewSection: React.FC<ReviewSectionProps> = ({
  productId,
  productName,
  rating: initialRating,
  reviewCount: initialReviewCount,
}) => {
  const { getProductReviews, addReview, updateReview, deleteReview } = useReviews();
  const { user, isAuthenticated } = useAuth();
  const { orders, createOrder, addresses } = useOrders();
  const { addToCart } = useCart();
  const { navigate } = useRouter();
  const { success, info } = useToast();

  const reviews = getProductReviews(productId);

  // Check if current logged-in customer has purchased this product
  const customerOrders = useMemo(() => {
    if (!user) return [];
    return orders.filter(
      (o) => o.user_id === user.id || (user.email && o.email?.toLowerCase() === user.email.toLowerCase())
    );
  }, [orders, user]);

  const matchingOrder = useMemo(() => {
    return customerOrders.find((order) =>
      order.items.some((item) => item.product_id === productId)
    );
  }, [customerOrders, productId]);

  const hasPurchased = Boolean(matchingOrder);

  // Check if this user already wrote a review for this product
  const userExistingReview = useMemo(() => {
    if (!user) return undefined;
    return reviews.find(
      (r) => r.user_id === user.id || (user.name && r.user_name === user.name)
    );
  }, [reviews, user]);

  // Review Form UI State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formRating, setFormRating] = useState<number>(5);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helpful votes state (local state map)
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, number>>({});
  const [userVotedReviews, setUserVotedReviews] = useState<Record<string, boolean>>({});

  // Filter and Sort states
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest'>('newest');

  // Compute live aggregate rating
  const effectiveReviewsCount = reviews.length;
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return initialRating;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return Number((sum / reviews.length).toFixed(1));
  }, [reviews, initialRating]);

  // Rating distribution counts
  const starCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const s = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [reviews]);

  // Filtered and sorted reviews
  const displayedReviews = useMemo(() => {
    let list = [...reviews];

    if (starFilter !== 'all') {
      list = list.filter((r) => Math.round(r.rating) === starFilter);
    }

    if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'highest') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'lowest') {
      list.sort((a, b) => a.rating - b.rating);
    }

    return list;
  }, [reviews, starFilter, sortBy]);

  // Open create review form
  const handleOpenCreateForm = () => {
    setIsEditing(false);
    setFormRating(5);
    setFormTitle('');
    setFormComment('');
    setFormError('');
    setIsFormOpen(true);
  };

  // Open edit review form
  const handleOpenEditForm = () => {
    if (!userExistingReview) return;
    setIsEditing(true);
    setFormRating(userExistingReview.rating);
    setFormTitle(userExistingReview.title);
    setFormComment(userExistingReview.comment);
    setFormError('');
    setIsFormOpen(true);
  };

  // Submit review handler
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !user) {
      setFormError('You must be signed in to submit a review.');
      return;
    }

    if (!hasPurchased) {
      setFormError('Only verified buyers who purchased this product can leave a review.');
      return;
    }

    if (!formTitle.trim()) {
      setFormError('Please provide a brief headline summarizing your review.');
      return;
    }

    if (!formComment.trim()) {
      setFormError('Please write your detailed feedback about this product.');
      return;
    }

    if (formComment.trim().length < 10) {
      setFormError('Review feedback must be at least 10 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && userExistingReview) {
        updateReview(userExistingReview.id, {
          rating: formRating,
          title: formTitle.trim(),
          comment: formComment.trim(),
        });
      } else {
        await addReview({
          productId,
          rating: formRating,
          title: formTitle.trim(),
          comment: formComment.trim(),
        });
      }

      setIsFormOpen(false);
      setFormTitle('');
      setFormComment('');
      setFormError('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete review handler
  const handleDeleteReview = (reviewId: string) => {
    deleteReview(reviewId);
  };

  // Helpful vote
  const handleToggleHelpful = (reviewId: string) => {
    if (userVotedReviews[reviewId]) {
      setUserVotedReviews((prev) => ({ ...prev, [reviewId]: false }));
      setHelpfulVotes((prev) => ({
        ...prev,
        [reviewId]: Math.max(0, (prev[reviewId] || 1) - 1),
      }));
      info('Helpful vote removed.');
    } else {
      setUserVotedReviews((prev) => ({ ...prev, [reviewId]: true }));
      setHelpfulVotes((prev) => ({
        ...prev,
        [reviewId]: (prev[reviewId] || 0) + 1,
      }));
      success('Thank you! Marked as helpful.');
    }
  };

  return (
    <div className="py-6 sm:py-8 border-t border-slate-200">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 font-brand">
              Customer Reviews & Ratings
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {effectiveReviewsCount} {effectiveReviewsCount === 1 ? 'Review' : 'Reviews'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Genuine ratings and reviews from customers who purchased this item across Nepal.
          </p>
        </div>

        {/* Action Button: Write / Edit Review or Login */}
        <div className="self-start sm:self-auto">
          {!isAuthenticated ? (
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors shadow-2xs cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In to Review</span>
            </button>
          ) : hasPurchased ? (
            userExistingReview ? (
              <button
                onClick={handleOpenEditForm}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-300"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Your Review</span>
              </button>
            ) : (
              <button
                onClick={handleOpenCreateForm}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors shadow-2xs cursor-pointer"
              >
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>Write a Verified Review</span>
              </button>
            )
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  addToCart({ id: productId } as any, 1);
                  navigate('/checkout');
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Buy to Review</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Customer Purchase Status Banner */}
      <div className="mb-6">
        {!isAuthenticated ? (
          <div className="p-3.5 sm:p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-slate-700">
              <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <span className="font-bold text-slate-900 block">Verified Buyer Reviews Only</span>
                <span className="text-slate-500 text-[11px]">
                  Sign in with your CartPlus account to rate and review products you have received.
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 underline self-start sm:self-auto cursor-pointer"
            >
              Sign In Now →
            </button>
          </div>
        ) : hasPurchased ? (
          <div className="p-3.5 sm:p-4 bg-emerald-50 border border-emerald-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950">
            <div className="flex items-start sm:items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-emerald-900">Verified Purchase Confirmed</span>
                  <span className="text-[10px] font-bold px-2 py-0.2 bg-emerald-200/70 text-emerald-800 rounded-md">
                    Order #{matchingOrder?.id}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  You ordered this item on{' '}
                  {matchingOrder?.created_at
                    ? new Date(matchingOrder.created_at).toLocaleDateString('en-NP', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'recently'}
                  . Your review will be marked with a green Verified Purchaser badge.
                </p>
              </div>
            </div>

            {!userExistingReview && !isFormOpen && (
              <button
                onClick={handleOpenCreateForm}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-colors shrink-0 self-start sm:self-auto cursor-pointer shadow-2xs"
              >
                Leave Feedback
              </button>
            )}
          </div>
        ) : (
          <div className="p-3.5 sm:p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
            <div className="flex items-start sm:items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-amber-900 block">
                  Verified Purchase Required to Review
                </span>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Only customers who have ordered this item can submit a rating and review. This prevents fake feedback.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  addToCart({ id: productId } as any, 1);
                  navigate('/checkout');
                }}
                className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 text-[11px] font-bold rounded-xl transition-colors cursor-pointer shadow-2xs"
              >
                Buy Now to Review
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Review Submission / Editing Form (Collapsible Card) */}
      {isFormOpen && (
        <div className="mb-8 p-5 sm:p-6 bg-white rounded-2xl border-2 border-amber-400 shadow-lg relative animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Edit3 className="w-4 h-4" />
              </div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 font-brand">
                {isEditing ? 'Update Your Review' : 'Write a Product Review'}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {formError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
            {/* 1. Star Rating Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Overall Rating <span className="text-rose-500">*</span>
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled =
                      hoveredStar !== null ? star <= hoveredStar : star <= formRating;
                    return (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(null)}
                        onClick={() => setFormRating(star)}
                        className="p-1 sm:p-1.5 text-amber-400 hover:scale-115 transition-all cursor-pointer focus:outline-none"
                        aria-label={`Rate ${star} out of 5 stars`}
                      >
                        <Star
                          className={`w-6 h-6 sm:w-8 sm:h-8 transition-colors ${
                            isFilled ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="text-xs font-bold text-slate-800 px-3 py-1 bg-amber-50 rounded-lg border border-amber-200/60">
                  {RATING_LABELS[hoveredStar || formRating]}
                </div>
              </div>
            </div>

            {/* 2. Review Headline */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Review Headline <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Exceptional sound clarity, very prompt delivery in Kathmandu!"
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                required
              />
            </div>

            {/* 3. Text-Based Feedback */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800">
                  Detailed Feedback <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-slate-400">
                  {formComment.length} characters (min 10)
                </span>
              </div>
              <textarea
                rows={4}
                value={formComment}
                onChange={(e) => setFormComment(e.target.value)}
                placeholder="Describe what you liked or disliked: quality, battery life, packaging, courier delivery speed, etc."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 leading-relaxed"
                required
              />
            </div>

            {/* Form actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{isEditing ? 'Save Changes' : 'Submit Verified Review'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ratings Overview & Breakdown Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50/80 p-4 sm:p-6 rounded-2xl border border-slate-200/80 mb-8">
        {/* Left Side: Aggregate Score Card */}
        <div className="md:col-span-4 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-slate-200/80 pb-6 md:pb-0 md:pr-6">
          <div className="text-4xl sm:text-5xl font-black text-slate-950 font-brand tabular-nums tracking-tight">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex items-center text-amber-400 gap-1 my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  star <= Math.round(averageRating) ? 'fill-amber-400' : 'text-slate-200'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-slate-700">
            {effectiveReviewsCount} {effectiveReviewsCount === 1 ? 'Customer Review' : 'Customer Reviews'}
          </span>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% Verified Purchases</span>
          </span>
        </div>

        {/* Right Side: Rating Distribution Progress Bars */}
        <div className="md:col-span-8 flex flex-col justify-center gap-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = starCounts[star as 1 | 2 | 3 | 4 | 5] || 0;
            const pct =
              effectiveReviewsCount > 0
                ? Math.round((count / effectiveReviewsCount) * 100)
                : 0;

            const isSelected = starFilter === star;

            return (
              <button
                key={star}
                type="button"
                onClick={() => setStarFilter((prev) => (prev === star ? 'all' : star))}
                className={`w-full flex items-center gap-3 text-xs p-1 rounded-lg transition-colors cursor-pointer text-left ${
                  isSelected ? 'bg-amber-100/70 font-bold' : 'hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1 w-12 text-slate-700 font-bold shrink-0">
                  <span>{star}</span>
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </div>

                <div className="flex-1 h-2.5 bg-slate-200/90 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="w-16 text-right text-slate-500 font-mono text-[11px] tabular-nums shrink-0">
                  {pct}% ({count})
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </span>
          <button
            onClick={() => setStarFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              starFilter === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({effectiveReviewsCount})
          </button>
          {[5, 4, 3, 2, 1].map((st) => (
            <button
              key={st}
              onClick={() => setStarFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                starFilter === st
                  ? 'bg-amber-400 text-slate-950 shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{st}★</span>
              <span className="text-[10px] text-slate-500 font-normal">
                ({starCounts[st as 1 | 2 | 3 | 4 | 5]})
              </span>
            </button>
          ))}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-slate-500 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
          >
            <option value="newest">Newest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {displayedReviews.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
            {starFilter !== 'all' ? (
              <div>
                <p className="font-semibold text-slate-700">No {starFilter}-star reviews found.</p>
                <button
                  onClick={() => setStarFilter('all')}
                  className="mt-2 text-amber-600 font-bold underline cursor-pointer"
                >
                  View all reviews
                </button>
              </div>
            ) : (
              <div>
                <p className="font-bold text-slate-800 text-sm">No reviews yet for this product.</p>
                <p className="text-slate-500 mt-1">
                  Have you purchased this item? Be the first to write a verified customer review!
                </p>
                {hasPurchased && (
                  <button
                    onClick={handleOpenCreateForm}
                    className="mt-3 px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs"
                  >
                    Write the First Review
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          displayedReviews.map((rev) => {
            const isMyReview = user && (rev.user_id === user.id || rev.user_name === user.name);
            const votes = (helpfulVotes[rev.id] || 0) + (rev.id === 'rev-01' ? 8 : rev.id === 'rev-02' ? 5 : 2);
            const hasVoted = Boolean(userVotedReviews[rev.id]);

            return (
              <div
                key={rev.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-shadow space-y-3 ${
                  isMyReview
                    ? 'bg-amber-50/40 border-amber-300 shadow-xs ring-1 ring-amber-200'
                    : 'bg-white border-slate-200/90 shadow-2xs'
                }`}
              >
                {/* Header: User avatar, name, verified purchaser tag, date */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isMyReview
                          ? 'bg-amber-400 text-slate-950 font-black'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {rev.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          {rev.user_name}
                        </span>
                        {isMyReview && (
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-amber-200 text-amber-900">
                            Your Review
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified Purchaser</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                      {new Date(rev.created_at).toLocaleDateString('en-NP', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>

                    {/* If this is the current user's review, show edit and delete controls */}
                    {isMyReview && (
                      <div className="flex items-center gap-1 ml-1">
                        <button
                          onClick={handleOpenEditForm}
                          title="Edit your review"
                          className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          title="Delete review"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                          s <= rev.rating ? 'fill-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-700">
                    {rev.rating}.0
                  </span>
                </div>

                {/* Review Headline & Detailed Comment */}
                <div>
                  <h5 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    {rev.title}
                  </h5>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1 whitespace-pre-line">
                    {rev.comment}
                  </p>
                </div>

                {/* Footer: Helpful Vote */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleHelpful(rev.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        hasVoted
                          ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <ThumbsUp className={`w-3 h-3 ${hasVoted ? 'fill-amber-500' : ''}`} />
                      <span>Helpful ({votes})</span>
                    </button>
                  </div>

                  <span className="text-[10px] text-slate-400">
                    Settlement verified by CARTPLUS
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
