import React from 'react';

/**
 * Pure SVG Line Chart Component for Dark Theme
 */
export const LineChart = ({
  data = [12, 19, 15, 25, 22, 30, 45],
  labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  title = 'Revenue Trend',
  color = '#10B981',
  height = 200,
}) => {
  const maxVal = Math.max(...data, 1);
  const minVal = Math.min(...data, 0);
  const range = maxVal - minVal || 1;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * 100;
    const y = 90 - ((val - minVal) / range) * 75;
    return `${x},${y}`;
  });

  const pointsString = points.join(' ');
  const areaPoints = `0,100 ${pointsString} 100,100`;

  return (
    <div className="w-full bg-dark-card border border-dark-border rounded-2xl p-5 shadow-dark-card">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950/60 border border-primary-500/30 text-primary-400 font-medium">
          Live Data
        </span>
      </div>

      <div className="relative w-full" style={{ height: `${height}px` }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.4" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Area under line */}
          <polygon points={areaPoints} fill="url(#lineGrad)" />

          {/* Line stroke */}
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={pointsString}
          />

          {/* Data Points */}
          {data.map((val, idx) => {
            const x = (idx / (data.length - 1)) * 100;
            const y = 90 - ((val - minVal) / range) * 75;
            return (
              <circle
                key={idx}
                cx={x}
                cy={y}
                r="3"
                className="fill-emerald-400 stroke-dark-bg stroke-2 hover:r-4 transition-all"
              >
                <title>{`${labels[idx]}: ₹${val}`}</title>
              </circle>
            );
          })}
        </svg>
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-3 border-t border-dark-border/60 pt-2 text-xs text-slate-400">
        {labels.map((lbl, idx) => (
          <span key={idx}>{lbl}</span>
        ))}
      </div>
    </div>
  );
};

/**
 * Pure SVG Donut Chart Component for Dark Theme
 */
export const DonutChart = ({
  data = [
    { label: 'Pending', value: 3, color: '#F59E0B' },
    { label: 'Processing', value: 5, color: '#14B8A6' },
    { label: 'Shipped', value: 4, color: '#6366F1' },
    { label: 'Delivered', value: 12, color: '#10B981' },
  ],
  title = 'Order Status Breakdown',
}) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0) || 1;
  let cumulativeAngle = 0;

  return (
    <div className="w-full bg-dark-card border border-dark-border rounded-2xl p-5 shadow-dark-card flex flex-col justify-between">
      <h4 className="text-sm font-semibold text-slate-200 mb-4">{title}</h4>

      <div className="flex flex-col sm:flex-row items-center justify-around gap-4 my-2">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90">
            {data.map((item, idx) => {
              const strokeDasharray = `${(item.value / total) * 100} ${100 - (item.value / total) * 100}`;
              const strokeDashoffset = 100 - cumulativeAngle;
              cumulativeAngle += (item.value / total) * 100;

              return (
                <circle
                  key={idx}
                  cx="21"
                  cy="21"
                  r="15.91549430918954"
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth="6"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-500 hover:opacity-80"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-bold text-slate-100">{total}</span>
            <span className="text-[10px] uppercase tracking-wider text-slate-400">Total</span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2 text-xs">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-slate-300 font-medium">{item.label}:</span>
              <span className="text-slate-100 font-bold">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
