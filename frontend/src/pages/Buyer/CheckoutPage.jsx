import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCartAndProfile();
  }, []);

  const fetchCartAndProfile = async () => {
    try {
      const cRes = await api.get('/cart');
      if (cRes.data.success) setCart(cRes.data.cart);

      const pRes = await api.get('/buyer-profiles/me');
      if (pRes.data.success && pRes.data.data?.deliveryAddresses?.length > 0) {
        const def = pRes.data.data.deliveryAddresses.find((a) => a.isDefault) || pRes.data.data.deliveryAddresses[0];
        setAddress(def.address);
        setCity(def.city);
        setState(def.state);
        setPincode(def.pincode);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const payload = {
      deliveryAddress: {
        label: 'Home',
        address,
        city,
        state,
        pincode,
      },
      paymentMethod,
    };

    try {
      const res = await api.post('/orders', payload);
      if (res.data.success) {
        navigate('/buyer/orders');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading checkout details...</div>;
  if (!cart || !cart.items || cart.items.length === 0) {
    return <div className="p-8 text-center text-red-600">Cart is empty. Cannot proceed to checkout.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Checkout</h1>
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

        <div className="mb-6 bg-emerald-50 p-4 rounded-xl border border-emerald-200 flex justify-between items-center">
          <span className="font-semibold text-emerald-900">Total Order Amount</span>
          <span className="text-2xl font-extrabold text-emerald-700">₹{cart.calculatedCartTotal}</span>
        </div>

        <form onSubmit={handleCheckout} className="space-y-4">
          <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2">Delivery Address</h3>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Street Address *</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">City *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">State *</label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Pincode *</label>
              <input
                type="text"
                required
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2 pt-4">Payment Method</h3>
          <div>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="COD">Cash on Delivery (COD)</option>
              <option value="online">Online Payment</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg shadow mt-6 text-lg"
          >
            {submitting ? 'Placing Order...' : 'Place Order Now'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
