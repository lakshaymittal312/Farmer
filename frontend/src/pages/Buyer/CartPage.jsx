import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      if (res.data.success) setCart(res.data.cart);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQty = async (productId, quantity) => {
    if (quantity <= 0) return handleRemove(productId);
    try {
      const res = await api.put(`/cart/items/${productId}`, { quantity });
      if (res.data.success) setCart(res.data.cart);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemove = async (productId) => {
    try {
      const res = await api.delete(`/cart/items/${productId}`);
      if (res.data.success) setCart(res.data.cart);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleClearCart = async () => {
    try {
      const res = await api.delete('/cart');
      if (res.data.success) setCart(res.data.cart);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading cart...</div>;
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Shopping Cart</h1>
        <p className="text-gray-500 mb-6">Your cart is currently empty.</p>
        <Link to="/marketplace" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded shadow">
          Explore Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Your Shopping Cart</h1>
        <button onClick={handleClearCart} className="text-sm text-red-600 hover:underline font-medium">
          Clear Cart
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="divide-y divide-gray-100">
          {cart.items.map((item) => (
            <div key={item._id} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={item.product?.images && item.product?.images[0] ? item.product.images[0] : 'https://via.placeholder.com/100'}
                  alt={item.product?.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <h3 className="font-bold text-gray-900">{item.product?.name}</h3>
                  <p className="text-sm text-emerald-700 font-semibold">₹{item.currentPrice} / {item.product?.unit}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleUpdateQty(item.product?._id, Number(e.target.value))}
                  className="w-16 border border-gray-300 rounded px-2 py-1 text-center font-medium"
                />
                <span className="font-bold text-gray-900 w-24 text-right">₹{item.calculatedItemTotal}</span>
                <button onClick={() => handleRemove(item.product?._id)} className="text-red-600 hover:underline text-sm">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-between items-center">
          <span className="font-bold text-gray-900 text-lg">Cart Total</span>
          <span className="font-extrabold text-2xl text-emerald-700">₹{cart.calculatedCartTotal}</span>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => navigate('/checkout')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-lg shadow text-lg"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default CartPage;
