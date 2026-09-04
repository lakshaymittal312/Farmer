import React from 'react';
import { CheckCircle2, Clock, Truck, Package, XCircle, ShieldCheck, Sparkles } from 'lucide-react';

export const OrderStatusBadge = ({ status }) => {
  const normalized = (status || '').toLowerCase();

  const config = {
    pending: {
      label: 'Pending',
      bg: 'bg-amber-950/40 text-amber-300 border-amber-800/50',
      icon: Clock,
    },
    accepted: {
      label: 'Accepted',
      bg: 'bg-blue-950/40 text-blue-300 border-blue-800/50',
      icon: CheckCircle2,
    },
    processing: {
      label: 'Processing',
      bg: 'bg-teal-950/40 text-teal-300 border-teal-800/50',
      icon: Package,
    },
    shipped: {
      label: 'Shipped',
      bg: 'bg-indigo-950/40 text-indigo-300 border-indigo-800/50',
      icon: Truck,
    },
    delivered: {
      label: 'Delivered',
      bg: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50',
      icon: CheckCircle2,
    },
    cancelled: {
      label: 'Cancelled',
      bg: 'bg-red-950/40 text-red-300 border-red-800/50',
      icon: XCircle,
    },
    rejected: {
      label: 'Rejected',
      bg: 'bg-rose-950/40 text-rose-300 border-rose-800/50',
      icon: XCircle,
    },
  };

  const current = config[normalized] || {
    label: status,
    bg: 'bg-slate-800 text-slate-300 border-slate-700',
    icon: Clock,
  };

  const Icon = current.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${current.bg} shadow-sm backdrop-blur-md`}>
      <Icon className="w-3.5 h-3.5" />
      {current.label}
    </span>
  );
};

export const VerificationBadge = ({ status }) => {
  const isVerified = status === 'verified';
  const isPending = status === 'pending';

  if (isVerified) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950/50 text-emerald-400 border border-emerald-800/60 shadow-sm">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        Verified Farm
      </span>
    );
  }

  if (isPending) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-950/50 text-amber-300 border border-amber-800/60">
        <Clock className="w-3.5 h-3.5" />
        Pending Verification
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-950/50 text-rose-300 border border-rose-800/60">
      <XCircle className="w-3.5 h-3.5" />
      Unverified
    </span>
  );
};

export const OrganicBadge = () => (
  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-sm">
    <Sparkles className="w-3 h-3 text-emerald-400" />
    100% Organic
  </span>
);

export default OrderStatusBadge;
