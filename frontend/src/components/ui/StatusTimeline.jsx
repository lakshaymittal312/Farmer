import React from 'react';
import { Clock, CheckCircle2, Package, Truck, Home, XCircle } from 'lucide-react';

const steps = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'accepted', label: 'Accepted', icon: CheckCircle2 },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Home },
];

const StatusTimeline = ({ currentStatus }) => {
  const normalized = (currentStatus || '').toLowerCase();

  if (normalized === 'cancelled' || normalized === 'rejected') {
    return (
      <div className="bg-red-950/30 border border-red-900/50 rounded-2xl p-6 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-900/50 text-red-400 mb-3">
          <XCircle className="w-6 h-6" />
        </div>
        <h4 className="text-lg font-bold text-red-300 capitalize">Order {normalized}</h4>
        <p className="text-sm text-red-400/80 mt-1">This order was {normalized} and is no longer being processed.</p>
      </div>
    );
  }

  // Find index of current status
  const currentStepIndex = steps.findIndex((s) => s.key === normalized);
  const activeIndex = currentStepIndex >= 0 ? currentStepIndex : 0;

  return (
    <div className="w-full py-4">
      <div className="relative flex items-center justify-between">
        {/* Background Track Bar */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-dark-border -translate-y-1/2 z-0" />

        {/* Active Progress Bar */}
        <div
          className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-emerald-600 to-primary-400 -translate-y-1/2 transition-all duration-500 ease-in-out z-0"
          style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
        />

        {/* Timeline Steps */}
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx <= activeIndex;
          const isCurrent = idx === activeIndex;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCurrent
                    ? 'bg-primary-500 text-slate-950 ring-4 ring-primary-500/25 scale-110 shadow-lg shadow-primary-500/30'
                    : isCompleted
                    ? 'bg-emerald-950 border-2 border-primary-500 text-primary-400'
                    : 'bg-dark-card border-2 border-dark-border text-slate-500'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <span
                className={`mt-2 text-xs font-semibold text-center whitespace-nowrap transition-colors ${
                  isCurrent
                    ? 'text-primary-400 font-bold'
                    : isCompleted
                    ? 'text-slate-200'
                    : 'text-slate-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusTimeline;
