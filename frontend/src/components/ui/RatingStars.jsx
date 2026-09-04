import React from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({
  rating = 5,
  maxStars = 5,
  size = 'w-4 h-4',
  interactive = false,
  onChange = () => {},
  showCount = false,
  count = 0,
}) => {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxStars }).map((_, idx) => {
        const starValue = idx + 1;
        const isFilled = starValue <= Math.round(rating);

        return (
          <button
            key={idx}
            type={interactive ? 'button' : undefined}
            disabled={!interactive}
            onClick={() => interactive && onChange(starValue)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition' : 'cursor-default'}`}
          >
            <Star
              className={`${size} ${
                isFilled ? 'fill-accent-gold text-accent-gold' : 'fill-dark-card text-slate-600'
              }`}
            />
          </button>
        );
      })}
      {showCount && (
        <span className="text-xs text-slate-400 font-medium ml-1">
          ({count})
        </span>
      )}
    </div>
  );
};

export default RatingStars;
