import React from 'react';

export const Skeleton = ({ className = 'h-6 w-full' }) => {
  return <div className={`bg-dark-hover animate-pulse rounded-xl ${className}`} />;
};

export const CardSkeleton = () => {
  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl h-80 animate-pulse p-4 space-y-3">
      <div className="bg-dark-hover h-44 rounded-xl w-full" />
      <div className="bg-dark-hover h-5 rounded w-3/4" />
      <div className="bg-dark-hover h-4 rounded w-1/2" />
    </div>
  );
};

export default Skeleton;
