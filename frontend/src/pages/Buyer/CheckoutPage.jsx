import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, MapPin, CreditCard, Truck, Check, Plus, ChevronLeft } from 'lucide-react';
import api from '../../services/api';
import Modal from '../../components/ui/Modal';
import { ErrorState } from '../../components/ui/EmptyState';

const CheckoutPage = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod'); // cod or online
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Add Address Modal
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressLine, setAddressLine] = useState('');
  const [district, setDistrict] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');

  useEffect(() => {
    fetchCheckoutData();
  }, []);

  const fetchCheckoutData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch Cart
      const cRes = await api.get('/cart');
      if (cRes.data.success) setCart(cRes.data.cart);

      // Fetch Buyer Profile / Addresses
      const pRes = await api.get('/buyer-profiles/me');
      if (pRes.data.success && pRes.data.data) {
        const addrs = pRes.data.data.deliveryAddresses || [];
        setAddresses(addrs);
        const defaultAddr = addrs.find((a) => a.isDefault) || addrs[0];
        setSelectedAddress(defaultAddr || null);
      }
    } catch (e) {
      setError(e.message || 'Failed to load checkout details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const payload = { addressLine, district, state: stateName, pincode, isDefault: addresses.length === 0 };
      const res = await api.post('/buyer-profiles/addresses', payload);
      if (res.data.success) {
        const updatedAddrs = res.data.data.deliveryAddresses || [];
        setAddresses(updatedAddrs);
        setSelectedAddress(updatedAddrs[updatedAddrs.length - 1]);
        setShowAddressModal(false);
        setAddressLine('');
        setDistrict('');
        setStateName('');
        setPincode('');
      }
    } catch (err) {
      alert(err.message || 'Failed to add address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert('Please select or add a delivery address.');
      return;
    }
    if (!cart || !cart.items || cart.items.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        shippingAddress: {
          addressLine: selectedAddress.addressLine,
          district: selectedAddress.district,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode,
        },
        paymentMethod,
      };

      const res = await api.post('/orders', payload);
      if (res.data.success) {
        alert('Order placed successfully!');
        navigate('/buyer/orders');
      }
    } catch (err) {
      alert(err.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  const items = cart?.items || [];
  const subtotal = items.reduce((acc, i) => acc + (i.price || 0) * i.quantity, 0);
  const deliveryFee = subtotal > 0 ? 50 : 0;
  const grandTotal = subtotal + deliveryFee;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-dark-card border border-dark-border rounded-3xl h-96 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <ErrorState message={error} onRetry={fetchCheckoutData} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Link
        to="/cart"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary-400 transition"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Cart
      </Link>

      <div className="border-b border-dark-border pb-6">
        <h1 className="text-3xl font-black text-slate-100">Checkout & Delivery</h1>
        <p className="text-xs text-slate-400 mt-1">Select delivery destination and confirm produce order</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Options */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Delivery Address Selection */}
          <div className="bg-dark-card border border-dark-border p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-400" /> 1. Delivery Address
              </h3>

              <button
                onClick={() => setShowAddressModal(true)}
                className="bg-dark-bg border border-dark-border hover:border-primary-500 text-primary-400 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Address
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="bg-dark-bg border border-dark-border p-6 rounded-2xl text-center text-xs text-slate-400">
                No delivery address saved yet. Please add a destination address.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => {
                  const isSelected = selectedAddress?._id === addr._id || selectedAddress?.addressLine === addr.addressLine;

                  return (
                    <div
                      key={addr._id || addr.addressLine}
                      onClick={() => setSelectedAddress(addr)}
                      className={`p-4 rounded-2xl border cursor-pointer transition ${
                        isSelected
                          ? 'bg-emerald-950/40 border-primary-500 ring-2 ring-primary-500/20'
                          : 'bg-dark-bg border-dark-border hover:border-dark-hover'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-bold text-slate-100 text-xs">{addr.addressLine}</span>
                        {isSelected && <Check className="w-4 h-4 text-primary-400" />}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {addr.district}, {addr.state} - {addr.pincode}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Payment Method */}
          <div className="bg-dark-card border border-dark-border p-6 rounded-3xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-accent-gold" /> 2. Payment Method
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === 'cod'
                    ? 'bg-emerald-950/40 border-primary-500 ring-2 ring-primary-500/20'
                    : 'bg-dark-bg border-dark-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100 text-xs">Cash On Delivery (COD)</span>
                  {paymentMethod === 'cod' && <Check className="w-4 h-4 text-primary-400" />}
                </div>
                <p className="text-xs text-slate-400 mt-1">Pay direct in cash upon crop delivery at your gate.</p>
              </div>

              <div
                onClick={() => setPaymentMethod('online')}
                className={`p-4 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === 'online'
                    ? 'bg-emerald-950/40 border-primary-500 ring-2 ring-primary-500/20'
                    : 'bg-dark-bg border-dark-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100 text-xs">UPI / Online Gateway</span>
                  {paymentMethod === 'online' && <Check className="w-4 h-4 text-primary-400" />}
                </div>
                <p className="text-xs text-slate-400 mt-1">Instant digital payment simulation via NetBanking / UPI.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Summary Panel */}
        <div className="lg:col-span-4 sticky top-24 space-y-6">
          <div className="glass-panel p-6 rounded-3xl space-y-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100 border-b border-dark-border pb-3">Produce Order Items</h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((i) => (
                <div key={i.product?._id || i.product} className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 truncate max-w-[180px]">
                    {i.name} (x{i.quantity})
                  </span>
                  <span className="font-bold text-primary-400">₹{i.price * i.quantity}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs pt-4 border-t border-dark-border">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Transport Fee</span>
                <span>₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 text-sm font-bold text-slate-100 border-t border-dark-border/60">
                <span>Total Amount</span>
                <span className="text-2xl font-black text-primary-400">₹{grandTotal}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={submitting || items.length === 0}
              className="w-full bg-primary-500 hover:bg-primary-600 text-slate-950 font-bold py-4 rounded-2xl shadow-lg shadow-primary-500/25 transition text-sm flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              {submitting ? 'Processing Order...' : 'Confirm & Place Order'}
            </button>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      <Modal isOpen={showAddressModal} onClose={() => setShowAddressModal(false)} title="Add Delivery Address">
        <form onSubmit={handleAddAddress} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Street Address</label>
            <input
              type="text"
              required
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              placeholder="e.g. Flat 302, Green Park Avenue"
              className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">District / City</label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Pune"
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">State</label>
              <input
                type="text"
                required
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                placeholder="Maharashtra"
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">PIN Code</label>
            <input
              type="text"
              required
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="411001"
              className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddressModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-dark-hover"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary-500 hover:bg-primary-600 text-slate-950 font-bold text-xs px-5 py-2 rounded-xl"
            >
              Save Address
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CheckoutPage;
