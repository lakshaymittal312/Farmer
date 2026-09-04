import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Sprout, MapPin, Calendar, ShoppingCart, ShieldCheck, Star, ChevronLeft, Minus, Plus, MessageSquare, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import ImageWithFallback from '../../components/ui/ImageWithFallback';
import RatingStars from '../../components/ui/RatingStars';
import { VerificationBadge, OrganicBadge } from '../../components/ui/Badge';
import { ErrorState } from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isBuyer } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingCart, setAddingCart] = useState(false);

  // Review Form State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchProductDetails();
    fetchReviews();
  }, [id]);

  const fetchProductDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/products/${id}`);
      if (res.data.success) {
        setProduct(res.data.data);
      }
    } catch (e) {
      setError(e.message || 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/product/${id}`);
      if (res.data.success) setReviews(res.data.data || []);
    } catch (e) {
      // silent
    }
  };

  const handleAddToCart = async (directCheckout = false) => {
    if (!isBuyer) {
      alert('Please sign in as a buyer to purchase products.');
      navigate('/login');
      return;
    }
    setAddingCart(true);
    try {
      await api.post('/cart/items', { productId: id, quantity });
      if (directCheckout) {
        navigate('/checkout');
      } else {
        alert(`Successfully added ${quantity} ${product.unit} of ${product.name} to cart!`);
      }
    } catch (e) {
      alert(e.message || 'Failed to add item to cart');
    } finally {
      setAddingCart(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingReview(true);
    try {
      const res = await api.post('/reviews', {
        product: id,
        rating: newRating,
        comment: newComment,
      });
      if (res.data.success) {
        alert('Thank you! Your review has been submitted.');
        setNewComment('');
        setShowReviewForm(false);
        fetchReviews();
        fetchProductDetails();
      }
    } catch (e) {
      alert(e.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-dark-card border border-dark-border rounded-2xl h-96 animate-pulse p-8" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <ErrorState message={error || 'Product not found'} onRetry={fetchProductDetails} />
      </div>
    );
  }

  const imagesList = product.images && product.images.length > 0 ? product.images : [''];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Back Button */}
      <Link
        to="/marketplace"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary-400 transition"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Marketplace
      </Link>

      {/* TOP SECTION: Gallery Left + Info Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative">
            <ImageWithFallback
              src={imagesList[selectedImage]}
              alt={product.name}
              className="w-full h-[400px] object-cover rounded-3xl"
              tilt={true}
            />

            {product.isOrganic && (
              <div className="absolute top-4 left-4 z-10">
                <OrganicBadge />
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {imagesList.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {imagesList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition ${
                    selectedImage === idx ? 'border-primary-500 scale-105 shadow-md' : 'border-dark-border opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Product Details Info */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-primary-400 uppercase tracking-widest bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-primary-800/40">
                {product.category?.name || 'Produce'}
              </span>
              {product.quantity > 0 ? (
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-0.5 rounded-full">
                  In Stock ({product.quantity} {product.unit})
                </span>
              ) : (
                <span className="text-xs font-semibold text-rose-400 bg-rose-950/40 border border-rose-800/40 px-2.5 py-0.5 rounded-full">
                  Out of Stock
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-100">{product.name}</h1>

            <div className="flex items-center gap-3 pt-1">
              <RatingStars rating={product.rating || 5} size="w-4 h-4" />
              <span className="text-xs font-bold text-slate-300">
                {product.rating || 5.0} / 5.0
              </span>
              <span className="text-xs text-slate-500">({reviews.length} reviews)</span>
            </div>
          </div>

          {/* Price Box */}
          <div className="p-4 rounded-2xl bg-dark-card border border-dark-border flex items-baseline justify-between">
            <div>
              <p className="text-3xl font-black text-primary-400">
                ₹{product.price}
                <span className="text-sm font-normal text-slate-400"> / {product.unit}</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Inclusive of all local farm gate prices</p>
            </div>

            {product.harvestDate && (
              <div className="text-right">
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-accent-gold" /> Harvest Date
                </p>
                <p className="text-xs font-bold text-slate-200 mt-0.5">
                  {new Date(product.harvestDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Product Overview</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Quantity Selector & Action CTAs */}
          <div className="space-y-4 pt-4 border-t border-dark-border">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-300">Quantity ({product.unit}):</span>
              <div className="flex items-center bg-dark-bg border border-dark-border rounded-xl p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg bg-dark-card text-slate-300 flex items-center justify-center hover:bg-dark-hover"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-12 text-center text-sm font-bold text-slate-100">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.quantity || 99, q + 1))}
                  className="w-8 h-8 rounded-lg bg-dark-card text-slate-300 flex items-center justify-center hover:bg-dark-hover"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => handleAddToCart(false)}
                disabled={addingCart || product.quantity <= 0}
                className="w-full bg-dark-card border border-primary-500/40 text-primary-300 font-bold py-3.5 rounded-2xl hover:bg-primary-500 hover:text-slate-950 transition flex items-center justify-center gap-2 shadow-sm"
              >
                <ShoppingCart className="w-4 h-4" />
                Add To Cart
              </button>

              <button
                onClick={() => handleAddToCart(true)}
                disabled={addingCart || product.quantity <= 0}
                className="w-full bg-primary-500 hover:bg-primary-600 text-slate-950 font-bold py-3.5 rounded-2xl transition shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FARMER PROFILE CARD */}
      {product.farmer && (
        <div className="glass-panel p-6 rounded-3xl border border-dark-border flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-950 border border-primary-500/40 flex items-center justify-center text-primary-400 font-bold text-xl shadow-md">
              <Sprout className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-100">
                  {product.farmer.farmName || 'Verified Local Farm'}
                </h3>
                <VerificationBadge status={product.farmer.verificationStatus || 'verified'} />
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                {product.farmer.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-primary-400" />
                    {product.farmer.location.district}, {product.farmer.location.state}
                  </span>
                )}
                <span>•</span>
                <span>Rating: ⭐ {product.farmer.rating || 5.0}</span>
              </p>
            </div>
          </div>

          <Link
            to={`/farmer/profile`}
            className="px-5 py-2.5 rounded-xl bg-dark-card border border-dark-border text-xs font-bold text-slate-200 hover:bg-dark-hover transition"
          >
            Inspect Farm Credentials
          </Link>
        </div>
      )}

      {/* REVIEWS SECTION */}
      <div className="space-y-6 pt-4 border-t border-dark-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate-100">Customer Reviews</h3>
            <p className="text-xs text-slate-400 mt-0.5">Real feedback from verified crop buyers</p>
          </div>

          {isBuyer && (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="bg-primary-500 hover:bg-primary-600 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              Write a Review
            </button>
          )}
        </div>

        {/* Review Form Drawer */}
        {showReviewForm && (
          <form onSubmit={handleSubmitReview} className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4 animate-fade-in">
            <h4 className="text-sm font-bold text-slate-100">Submit Your Produce Review</h4>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Your Rating</label>
              <RatingStars rating={newRating} interactive={true} onChange={setNewRating} size="w-6 h-6" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Comment / Feedback</label>
              <textarea
                rows="3"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your feedback about the quality, freshness, and packaging of this produce..."
                className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
                required
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-dark-hover"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingReview}
                className="bg-primary-500 hover:bg-primary-600 text-slate-950 font-bold text-xs px-5 py-2 rounded-xl"
              >
                {submittingReview ? 'Submitting...' : 'Post Review'}
              </button>
            </div>
          </form>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="bg-dark-card border border-dark-border rounded-2xl p-8 text-center text-xs text-slate-400">
            No customer reviews yet. Be the first to leave feedback after purchase!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div key={rev._id} className="bg-dark-card border border-dark-border p-5 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100">
                    {rev.buyer?.name || 'Verified Buyer'}
                  </span>
                  <RatingStars rating={rev.rating} size="w-3.5 h-3.5" />
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
                <span className="text-[10px] text-slate-500 block">
                  {new Date(rev.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
