import React from 'react';

const StatCard = ({ title, value, icon: Icon, trend, color = 'emerald' }) => {
  const colorMap = {
    emerald: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60',
    amber: 'bg-amber-950/80 text-amber-400 border-amber-800/60',
    blue: 'bg-blue-950/80 text-blue-400 border-blue-800/60',
    purple: 'bg-purple-950/80 text-purple-400 border-purple-800/60',
  };

  return (
    <div className="bg-dark-card border border-dark-border p-5 rounded-2xl flex items-center justify-between shadow-sm">
      <div className="space-y-1">
        <p className="text-xs text-slate-400 font-medium">{title}</p>
        <p className="text-2xl font-black text-slate-100">{value}</p>
        {trend && <p className="text-[11px] text-emerald-400 font-semibold">{trend}</p>}
      </div>
      {Icon && (
        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${colorMap[color] || colorMap.emerald}`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
};

export default StatCard;
