import React from 'react';

export const Loader = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
      <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      <span className="text-xs text-slate-400 font-medium">{message}</span>
    </div>
  );
};

export default Loader;
