import React from 'react';
import { getStatusBadgeColor } from '../../utils/formatters';

const OrderStatusBadge = ({ status }) => {
  const badgeClasses = getStatusBadgeColor(status);
  const displayStatus = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${badgeClasses}`}>
      {displayStatus}
    </span>
  );
};

export default OrderStatusBadge;
