import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';

const BuyerOrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Review form states
  const [reviewProduct, setReviewProduct] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewMsg, setReviewMsg] = useState('');
  const [reviewErr, setReviewErr] = useState('');

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      if (res.data.success) setOrder(res.data.order);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewMsg('');
    setReviewErr('');

    try {
      const res = await api.post('/reviews', {
        product: reviewProduct,
        order: id,
        rating: Number(rating),
        comment,
      });

      if (res.data.success) {
        setReviewMsg('Review submitted successfully!');
        setComment('');
      }
    } catch (err) {
      setReviewErr(err.message);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading order details...</div>;
  if (!order) return <div className="p-8 text-center text-red-600">Order not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Order #{order._id}</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6 mb-8">
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span className="font-bold text-lg uppercase text-emerald-700">{order.orderStatus}</span>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="text-2xl font-extrabold text-gray-900">₹{order.totalAmount}</p>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-gray-900 mb-2">Farm Details</h3>
          <p className="text-sm text-gray-700">{order.farmer?.farmName} ({order.farmer?.village}, {order.farmer?.district})</p>
        </div>

        <div>
          <h3 className="font-bold text-gray-900 mb-2">Items Purchased</h3>
          <div className="space-y-2">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100 text-sm">
                <div>
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">₹{item.price} x {item.quantity} {item.unit}</p>
                </div>
                <p className="font-bold text-gray-900">₹{item.price * item.quantity}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Form for Delivered Orders */}
      {order.orderStatus === 'delivered' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Write a Product Review</h2>
          {reviewMsg && <div className="mb-4 p-3 bg-emerald-100 text-emerald-800 rounded text-sm">{reviewMsg}</div>}
          {reviewErr && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{reviewErr}</div>}

          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Select Product to Review</label>
              <select
                value={reviewProduct}
                onChange={(e) => setReviewProduct(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="">Select a product...</option>
                {order.items?.map((item) => (
                  <option key={item.product?._id || item.product} value={item.product?._id || item.product}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Rating (1 to 5 Stars)</label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 font-semibold"
              >
                <option value="5">⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                <option value="4">⭐⭐⭐⭐ (4 - Very Good)</option>
                <option value="3">⭐⭐⭐ (3 - Good)</option>
                <option value="2">⭐⭐ (2 - Fair)</option>
                <option value="1">⭐ (1 - Poor)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Comment</label>
              <textarea
                rows="3"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this produce..."
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded shadow text-sm"
            >
              Submit Review
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default BuyerOrderDetail;
