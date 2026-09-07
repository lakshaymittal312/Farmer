export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStatusBadgeColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'bg-amber-950/80 text-amber-300 border-amber-800/60';
    case 'accepted':
    case 'processing':
      return 'bg-blue-950/80 text-blue-300 border-blue-800/60';
    case 'shipped':
      return 'bg-purple-950/80 text-purple-300 border-purple-800/60';
    case 'delivered':
    case 'completed':
    case 'active':
    case 'approved':
      return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60';
    case 'cancelled':
    case 'rejected':
    case 'inactive':
    case 'suspended':
      return 'bg-rose-950/80 text-rose-300 border-rose-800/60';
    default:
      return 'bg-slate-900 text-slate-300 border-slate-700';
  }
};
