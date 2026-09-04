import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import api from '../../services/api';
import ImageWithFallback from '../../components/ui/ImageWithFallback';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/cart');
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (e) {
      setError(e.message || 'Failed to load shopping cart');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;

    setUpdatingId(productId);
    try {
      const res = await api.put(`/cart/items/${productId}`, { quantity: newQty });
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (e) {
      alert(e.message || 'Failed to update quantity');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveItem = async (productId) => {
    setUpdatingId(productId);
    try {
      const res = await api.delete(`/cart/items/${productId}`);
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (e) {
      alert(e.message || 'Failed to remove item');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return;
    try {
      const res = await api.delete('/cart');
      if (res.data.success) {
        setCart({ items: [] });
      }
    } catch (e) {
      alert(e.message || 'Failed to clear cart');
    }
  };

  const subtotal = cart?.items?.reduce((acc, i) => acc + (i.price || 0) * i.quantity, 0) || 0;
  const deliveryEstimate = subtotal > 0 ? 50 : 0;
  const grandTotal = subtotal + deliveryEstimate;

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
        <ErrorState message={error} onRetry={fetchCart} />
      </div>
    );
  }

  const items = cart?.items || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between border-b border-dark-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-100">Shopping Cart</h1>
          <p className="text-xs text-slate-400 mt-1">Review produce selections before proceeding to checkout</p>
        </div>

        {items.length > 0 && (
          <button
            onClick={handleClearCart}
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Your Shopping Cart is Empty"
          description="Explore our fresh crop marketplace and support local farmers by adding produce."
          actionLabel="Browse Marketplace"
          onAction={() => navigate('/marketplace')}
          icon={ShoppingBag}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <div
                key={item.product?._id || item.product}
                className="bg-dark-card border border-dark-border p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <ImageWithFallback
                    src={item.image || (item.product?.images && item.product?.images[0])}
                    alt={item.name}
                    className="w-20 h-20 rounded-2xl object-cover"
                    hoverScale={false}
                  />
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">{item.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Price: <span className="text-primary-400 font-bold">₹{item.price}</span> / {item.unit || 'unit'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Farmer: {item.farmer?.farmName || 'Verified Farm'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-dark-border">
                  {/* Quantity Stepper */}
                  <div className="flex items-center bg-dark-bg border border-dark-border rounded-xl p-1">
                    <button
                      onClick={() => handleUpdateQuantity(item.product?._id || item.product, item.quantity, -1)}
                      disabled={updatingId === (item.product?._id || item.product)}
                      className="w-7 h-7 rounded-lg bg-dark-card text-slate-300 flex items-center justify-center hover:bg-dark-hover"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-10 text-center text-xs font-bold text-slate-100">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.product?._id || item.product, item.quantity, 1)}
                      disabled={updatingId === (item.product?._id || item.product)}
                      className="w-7 h-7 rounded-lg bg-dark-card text-slate-300 flex items-center justify-center hover:bg-dark-hover"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] block">Subtotal</span>
                    <span className="font-black text-primary-400 text-sm">₹{item.price * item.quantity}</span>
                  </div>

                  {/* Delete Item */}
                  <button
                    onClick={() => handleRemoveItem(item.product?._id || item.product)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Sticky Summary Card */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="glass-panel p-6 rounded-3xl space-y-6 shadow-2xl">
              <h3 className="text-lg font-bold text-slate-100 border-b border-dark-border pb-3">Order Summary</h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="font-bold text-slate-100">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-primary-400" /> Delivery Estimate
                  </span>
                  <span className="font-bold text-slate-100">₹{deliveryEstimate}</span>
                </div>

                <div className="pt-3 border-t border-dark-border flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-100">Grand Total</span>
                  <span className="text-2xl font-black text-primary-400">₹{grandTotal}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-primary-500 hover:bg-primary-600 text-slate-950 font-bold py-3.5 rounded-2xl shadow-lg shadow-primary-500/25 transition flex items-center justify-center gap-2 text-sm"
              >
                Proceed To Checkout <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-[11px] text-slate-400 space-y-2 pt-2 border-t border-dark-border/60">
                <p className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  Guaranteed Direct Farm Quality
                </p>
                <p>Prices agreed directly with registered local farmers.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
