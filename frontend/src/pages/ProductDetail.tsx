import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '@/utils/api';
import { useStore } from '@/store/useStore';

const STAR = (n: number, rating: number) => n <= Math.round(rating) ? '★' : '☆';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const navigate = useNavigate();

  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const addToCart = useStore(state => state.addToCart);
  const clearCart = useStore(state => state.clearCart);
  const wishlist = useStore(state => state.wishlist);
  const toggleWishlist = useStore(state => state.toggleWishlist);
  const user = useStore(state => state.user);

  const isWishlisted = id ? wishlist.includes(id) : false;

  useEffect(() => {
    setLoading(true);
    api.get(`/api/products/${id}`)
      .then(res => setProduct(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));

    api.get(`/api/reviews/${id}`)
      .then(res => setReviews(res.data.data || []))
      .catch(() => {});
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product._id,
      title: product.title,
      price: product.price,
      image: product.images?.[0] || '',
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    clearCart();
    addToCart({
      id: product._id,
      title: product.title,
      price: product.price,
      image: product.images?.[0] || '',
    });
    navigate('/cart');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    setReviewError('');
    setReviewSuccess('');
    try {
      await api.post('/api/reviews', {
        product_id: id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      setReviewSuccess('Review submitted!');
      setReviewForm({ rating: 5, comment: '' });
      // Refresh reviews
      const res = await api.get(`/api/reviews/${id}`);
      setReviews(res.data.data || []);
    } catch (err: any) {
      setReviewError(err.response?.data?.error || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 md:px-0 py-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col md:flex-row gap-8 animate-pulse">
          <div className="w-full md:w-[450px] aspect-square bg-slate-50 rounded-xl" />
          <div className="flex-1 space-y-6">
            <div className="h-6 bg-slate-50 rounded w-1/4" />
            <div className="h-10 bg-slate-50 rounded w-3/4" />
            <div className="h-12 bg-slate-50 rounded w-1/3" />
            <div className="h-32 bg-slate-50 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 md:px-0 py-16 text-center space-y-4">
        <div className="text-5xl">😕</div>
        <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
        <Link to="/products" className="text-blue-600 font-semibold hover:underline">← Back to Products</Link>
      </div>
    );
  }

  const originalPrice = Math.round(product.price * 1.4);
  const discount = Math.round(((originalPrice - product.price) / originalPrice) * 100);
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-0 py-6 space-y-6">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-blue-600">Products</Link>
        <span>/</span>
        <span className="text-slate-600 truncate max-w-[200px]">{product.title}</span>
      </div>

      {/* Main Product Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col md:flex-row">

        {/* Left — Image */}
        <div className="w-full md:w-[45%] p-6 md:p-8 md:border-r border-slate-100 flex flex-col">
          <div className="w-full aspect-square bg-slate-50 rounded-2xl flex items-center justify-center p-6 border border-slate-100 hover:bg-slate-100/50 transition-colors relative">
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={product.title} className="max-w-full max-h-full object-contain mix-blend-multiply" />
            ) : (
              <span className="text-8xl text-slate-200">📦</span>
            )}
            {/* Wishlist toggle */}
            <button
              onClick={() => id && toggleWishlist(id)}
              className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-md border transition-all ${isWishlisted ? 'bg-rose-50 border-rose-200 text-rose-500' : 'bg-white border-slate-200 text-slate-300 hover:text-rose-400'}`}
              title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              {isWishlisted ? '❤️' : '🤍'}
            </button>
          </div>

          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
              {product.images.slice(0, 5).map((img: string, i: number) => (
                <div key={i} className="w-14 h-14 rounded-lg border border-slate-200 flex items-center justify-center bg-slate-50 shrink-0 overflow-hidden">
                  <img src={img} alt="" className="w-full h-full object-contain mix-blend-multiply p-1" />
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleAddToCart}
              className={`flex-1 py-4 font-bold text-sm rounded-xl text-white transition-all duration-300 shadow-md ${added ? 'bg-emerald-600 shadow-emerald-100' : 'bg-orange-500 hover:bg-orange-600 shadow-orange-100 hover:-translate-y-0.5'}`}
            >
              {added ? '✓ ADDED TO CART' : '🛒 ADD TO CART'}
            </button>
             <button
              onClick={handleBuyNow}
              className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-100 hover:-translate-y-0.5 transition-all duration-300"
            >
              ⚡ BUY NOW
            </button>
          </div>
        </div>

        {/* Right — Info */}
        <div className="flex-1 p-6 md:p-8 space-y-5">
          <div className="space-y-2">
            <span className="inline-block px-2.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
              {product.category}
            </span>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 leading-tight">{product.title}</h1>
            <div className="flex items-center gap-2">
              {avgRating ? (
                <>
                  <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded flex items-center gap-0.5">
                    {avgRating} ★
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">{reviews.length} Review{reviews.length !== 1 ? 's' : ''}</span>
                </>
              ) : (
                <span className="text-xs text-slate-400">No reviews yet</span>
              )}
              <span className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full ${product.stock > 5 ? 'bg-green-50 text-green-600' : product.stock > 0 ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'}`}>
                {product.stock > 5 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left!` : 'Out of Stock'}
              </span>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-1">
            <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Special Offer</p>
            <div className="flex items-baseline gap-3">
              <span className="text-[32px] font-black text-slate-800">₹{product.price.toLocaleString()}</span>
              <span className="text-base text-slate-400 line-through font-medium">₹{originalPrice.toLocaleString()}</span>
              <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                {discount}% OFF
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Tax included. Free shipping above ₹499.</p>
          </div>

          {/* Offers */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-slate-800">Available Offers</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { title: 'Bank Offer', desc: '10% off on HDFC credit cards.' },
                { title: 'No-Cost EMI', desc: 'Up to 6 months, starting ₹499/mo.' },
                { title: 'UPI Cashback', desc: 'Flat ₹50 cashback via UPI.' },
                { title: 'Easy Returns', desc: '7-day hassle-free returns.' },
              ].map((o, i) => (
                <div key={i} className="border border-slate-100 rounded-xl p-3 flex gap-2 bg-white hover:border-blue-100 transition-colors">
                  <span className="text-sm">🏷️</span>
                  <div>
                    <h5 className="text-xs font-bold text-slate-700">{o.title}</h5>
                    <p className="text-[11px] text-slate-400">{o.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="border-t border-slate-100 pt-5 space-y-2">
            <h4 className="font-bold text-sm text-slate-800">About this Product</h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              {product.description || 'Premium quality item with standard quality checks for optimal performance and durability.'}
            </p>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Customer Reviews {reviews.length > 0 && `(${reviews.length})`}</h2>
          {avgRating && (
            <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-xl">
              <span className="text-yellow-400 text-lg">★</span>
              <span className="font-bold text-slate-700">{avgRating}</span>
              <span className="text-xs text-slate-400">/ 5</span>
            </div>
          )}
        </div>

        {/* Review list */}
        {reviews.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">No reviews yet. Be the first to review this product!</p>
        ) : (
          <div className="divide-y divide-slate-100 space-y-0">
            {reviews.map(r => (
              <div key={r._id} className="py-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm shrink-0">
                    {r.user_id?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-800 text-sm">{r.user_id?.name || 'Anonymous'}</p>
                      <p className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div className="text-yellow-400 text-sm mt-0.5">{[1, 2, 3, 4, 5].map(n => STAR(n, r.rating)).join('')}</div>
                    {r.comment && <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{r.comment}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Write a review */}
        {user ? (
          <div className="border-t border-slate-100 pt-6">
            <h3 className="font-bold text-slate-800 mb-4">Write a Review</h3>
            {reviewSuccess && <p className="text-green-600 text-sm font-semibold mb-3">{reviewSuccess}</p>}
            {reviewError && <p className="text-red-600 text-sm font-semibold mb-3">{reviewError}</p>}
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Your Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setReviewForm(f => ({ ...f, rating: n }))}
                      className={`text-2xl transition-transform hover:scale-110 ${n <= reviewForm.rating ? 'text-yellow-400' : 'text-slate-200'}`}
                    >★</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Your Review (optional)</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm h-24 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                  placeholder="Share your experience with this product..."
                />
              </div>
              <button
                type="submit"
                disabled={submittingReview}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow transition-all hover:-translate-y-0.5 disabled:opacity-50"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        ) : (
          <div className="border-t border-slate-100 pt-4 text-center">
            <p className="text-sm text-slate-500">
              <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link> to write a review.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
