import React, { useState } from 'react';
import { ImageOff, Leaf } from 'lucide-react';

const ImageWithFallback = ({
  src,
  alt = 'Farm Product',
  className = '',
  aspectRatio = 'aspect-4/3',
  tilt = false,
  tiltDirection = 'right',
  hoverScale = true,
  showOverlay = true,
  fallbackText = 'Farm Fresh Product'
}) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Default fallback image with high-quality farm produce background from Unsplash if provided src fails
  const defaultFallback = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';

  const tiltClass = tilt
    ? tiltDirection === 'left'
      ? 'rotate-[-1.5deg] hover:rotate-0'
      : 'rotate-[1.5deg] hover:rotate-0'
    : '';

  const scaleClass = hoverScale ? 'group-hover:scale-105' : '';

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-dark-card border border-dark-border shadow-lg shadow-black/40 transition-all duration-300 ${tiltClass} ${className}`}
    >
      {/* Loading Skeleton Placeholder */}
      {loading && !error && (
        <div className="absolute inset-0 bg-dark-hover animate-pulse flex items-center justify-center">
          <Leaf className="w-8 h-8 text-primary-500/30 animate-spin" />
        </div>
      )}

      {error ? (
        <div className="w-full h-full min-h-[160px] bg-dark-surface flex flex-col items-center justify-center p-4 text-center border border-dark-border/60">
          <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-primary-500/30 flex items-center justify-center text-primary-400 mb-2">
            <Leaf className="w-6 h-6" />
          </div>
          <span className="text-xs font-medium text-slate-400">{fallbackText}</span>
        </div>
      ) : (
        <img
          src={src || defaultFallback}
          alt={alt}
          onLoad={() => setLoading(false)}
          onError={() => {
            setError(true);
            setLoading(false);
          }}
          className={`w-full h-full object-cover transition-transform duration-500 ease-out ${scaleClass} ${
            loading ? 'opacity-0' : 'opacity-100'
          }`}
        />
      )}

      {/* Subtle Bottom Gradient Overlay for readability */}
      {showOverlay && !error && (
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/80 via-transparent to-transparent opacity-60 pointer-events-none" />
      )}
    </div>
  );
};

export default ImageWithFallback;
