import React from 'react';
import { PackageOpen, AlertTriangle, RefreshCw } from 'lucide-react';

export const EmptyState = ({
  title = 'No items found',
  description = 'There are no results matching your criteria at this time.',
  actionLabel,
  onAction,
  icon: Icon = PackageOpen,
}) => {
  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl p-10 text-center flex flex-col items-center justify-center my-6">
      <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-primary-500/30 flex items-center justify-center text-primary-400 mb-4 shadow-lg">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-slate-100 mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">{description}</p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-primary-500 hover:bg-primary-600 text-slate-950 font-semibold px-5 py-2.5 rounded-xl transition shadow-lg shadow-primary-500/20"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export const ErrorState = ({
  message = 'Failed to load data from server',
  onRetry,
}) => {
  return (
    <div className="bg-rose-950/30 border border-rose-900/50 rounded-2xl p-8 text-center flex flex-col items-center justify-center my-6">
      <div className="w-14 h-14 rounded-full bg-rose-900/40 text-rose-400 flex items-center justify-center mb-3">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h4 className="text-lg font-bold text-rose-200 mb-1">Something went wrong</h4>
      <p className="text-sm text-rose-300/80 mb-5">{message}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 bg-rose-900/60 hover:bg-rose-800 text-rose-100 border border-rose-700/60 px-4 py-2 rounded-xl text-sm font-medium transition"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
};

export default EmptyState;
