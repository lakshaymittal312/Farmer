import React from 'react';
import { CheckCircle2, Clock, Truck, PackageCheck, XCircle } from 'lucide-react';

const steps = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'accepted', label: 'Accepted', icon: CheckCircle2 },
  { key: 'processing', label: 'Processing', icon: Clock },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: PackageCheck },
];

const OrderTimeline = ({ currentStatus }) => {
  if (currentStatus === 'cancelled' || currentStatus === 'rejected') {
    return (
      <div className="bg-rose-950/40 border border-rose-800/60 p-4 rounded-2xl flex items-center gap-3 text-rose-300">
        <XCircle className="w-6 h-6 shrink-0" />
        <div>
          <h4 className="font-bold text-sm">Order {currentStatus === 'cancelled' ? 'Cancelled' : 'Rejected'}</h4>
          <p className="text-xs text-rose-400">This order is no longer active.</p>
        </div>
      </div>
    );
  }

  const currentIndex = steps.findIndex((s) => s.key === currentStatus?.toLowerCase());
  const activeStep = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-dark-border -translate-y-1/2 -z-0" />
        <div
          className="absolute top-1/2 left-0 h-1 bg-primary-500 -translate-y-1/2 transition-all duration-500 -z-0"
          style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx <= activeStep;
          const isCurrent = idx === activeStep;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition ${
                  isCompleted
                    ? 'bg-primary-500 border-primary-400 text-slate-950 shadow-lg shadow-primary-500/30'
                    : 'bg-dark-card border-dark-border text-slate-500'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`text-[11px] font-semibold mt-2 text-center max-w-[80px] ${
                  isCurrent ? 'text-primary-400 font-bold' : isCompleted ? 'text-slate-200' : 'text-slate-500'
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

export default OrderTimeline;
