import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sprout, MapPin, ShoppingCart, Star } from 'lucide-react';
import ImageWithFallback from './ui/ImageWithFallback';
import RatingStars from './ui/RatingStars';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { isBuyer } = useAuth();
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    await addToCart(product, 1);
    setAdding(false);
  };

  return (
    <div className="glass-panel-interactive rounded-2xl overflow-hidden flex flex-col justify-between group h-full">
      <div>
        <div className="relative p-2">
          <ImageWithFallback
            src={product.images && product.images[0] ? product.images[0] : ''}
            alt={product.name}
            className="w-full h-48 object-cover rounded-xl"
            tilt={true}
          />
          {product.isOrganic && (
            <span className="absolute top-4 left-4 bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg backdrop-blur-md">
              Organic
            </span>
          )}
        </div>

        <div className="p-4 space-y-2">
          <h3 className="font-bold text-slate-100 text-base line-clamp-1 group-hover:text-primary-400 transition">
            {product.name}
          </h3>

          <p className="text-xs text-slate-400 flex items-center gap-1">
            <Sprout className="w-3.5 h-3.5 text-primary-400 shrink-0" />
            <span className="truncate">{product.farmer?.farmName || 'Verified Farm'}</span>
          </p>

          {product.location && (product.location.district || product.location.state) && (
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{product.location.district}, {product.location.state}</span>
            </p>
          )}

          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-lg font-black text-primary-400">
                ₹{product.price} <span className="text-xs font-normal text-slate-400">/ {product.unit}</span>
              </p>
            </div>
            <RatingStars rating={product.rating || 5} size="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      <div className="p-4 pt-0 grid grid-cols-2 gap-2">
        <Link
          to={`/products/${product._id}`}
          className="block text-center bg-dark-card hover:bg-dark-hover text-slate-200 font-medium text-xs py-2.5 rounded-xl border border-dark-border transition"
        >
          Details
        </Link>

        {isBuyer ? (
          <button
            onClick={handleAdd}
            disabled={adding}
            className="bg-primary-500 hover:bg-primary-600 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1 shadow-sm"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {adding ? 'Adding...' : 'Add'}
          </button>
        ) : (
          <Link
            to={`/products/${product._id}`}
            className="bg-primary-500 hover:bg-primary-600 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1 shadow-sm"
          >
            View
          </Link>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
