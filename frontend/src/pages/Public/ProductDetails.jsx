import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isBuyer, isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchProductAndReviews();
  }, [id]);

  const fetchProductAndReviews = async () => {
    try {
      const pRes = await api.get(`/products/${id}`);
      if (pRes.data.success) setProduct(pRes.data.data);

      const rRes = await api.get(`/reviews/product/${id}`);
      if (rRes.data.success) setReviews(rRes.data.reviews);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!isBuyer) {
      setMsg('Only buyers can add items to cart.');
      return;
    }
    try {
      const res = await api.post('/cart/items', { product: id, quantity: Number(quantity) });
      if (res.data.success) {
        setMsg('Product added to cart!');
      }
    } catch (err) {
      setMsg(err.message);
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!isBuyer) {
      setMsg('Only buyers can manage wishlist.');
      return;
    }
    try {
      const res = await api.post('/buyer-profiles/wishlist', { productId: id });
      if (res.data.success) {
        setMsg('Added to wishlist!');
      }
    } catch (err) {
      setMsg(err.message);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading product...</div>;
  if (!product) return <div className="p-8 text-center text-red-600">Product not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {msg && <div className="mb-4 p-3 bg-emerald-100 text-emerald-800 rounded font-medium">{msg}</div>}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <img
            src={product.images && product.images[0] ? product.images[0] : 'https://via.placeholder.com/400'}
            alt={product.name}
            className="w-full h-80 object-cover rounded-xl"
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <p className="text-sm text-gray-500 mb-4">Category: {product.category?.name}</p>

          <p className="text-3xl font-extrabold text-emerald-700 mb-4">
            ₹{product.price} <span className="text-base font-normal text-gray-500">/ {product.unit}</span>
          </p>

          <p className="text-gray-700 mb-4">{product.description}</p>

          <div className="border-t border-b border-gray-100 py-3 mb-6 space-y-1 text-sm text-gray-600">
            <p><span className="font-semibold">Farm:</span> {product.farmer?.farmName}</p>
            <p><span className="font-semibold">Location:</span> {product.location?.village}, {product.location?.district}, {product.location?.state}</p>
            <p><span className="font-semibold">Stock Available:</span> {product.quantityAvailable} {product.unit}</p>
            <p><span className="font-semibold">Rating:</span> ⭐ {product.rating || 'No ratings yet'}</p>
          </div>

          {isBuyer && product.status === 'active' && product.quantityAvailable > 0 && (
            <div className="flex items-center gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={product.quantityAvailable}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-20 border border-gray-300 rounded px-3 py-1.5 text-center focus:outline-none"
                />
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded shadow"
              >
                Add to Cart
              </button>

              <button
                onClick={handleAddToWishlist}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-4 py-2.5 rounded border border-gray-300"
              >
                ♥ Wishlist
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-gray-500 text-sm">No reviews yet for this product.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r._id} className="border-b border-gray-100 pb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-sm text-gray-800">{r.buyer?.name}</span>
                  <span className="text-amber-500 font-bold text-sm">{"★".repeat(r.rating)}</span>
                </div>
                <p className="text-gray-600 text-sm">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
