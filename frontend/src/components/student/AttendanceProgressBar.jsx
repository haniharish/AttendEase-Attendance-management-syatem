import React from 'react';

const AttendanceProgressBar = ({
  percentage = 0,
  threshold = 75,
  showLabel = true,
  size = 'md',
}) => {
  const clampedPercentage = Math.min(100, Math.max(0, Math.round(percentage)));

  // Color logic according to design system:
  // >= 75%: Healthy (Green)
  // 65% - 74%: Warning (Orange)
  // < 65%: Low (Pink / Red)
  let barColor = 'bg-emerald-500';
  let textColor = 'text-emerald-600';
  let badgeVariant = 'bg-emerald-50 text-emerald-700 border-emerald-200';

  if (clampedPercentage < 65) {
    barColor = 'bg-red-500';
    textColor = 'text-red-500';
    badgeVariant = 'bg-red-50 text-red-700 border-red-200';
  } else if (clampedPercentage < threshold) {
    barColor = 'bg-amber-500';
    textColor = 'text-amber-500';
    badgeVariant = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  const heightClass = size === 'sm' ? 'h-2' : size === 'lg' ? 'h-3.5' : 'h-2.5';

  return (
    <div className="w-full space-y-1.5">
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-brand-muted">Attendance Rate</span>
          <span className={`font-extrabold ${textColor}`}>{clampedPercentage}%</span>
        </div>
      )}

      {/* Progress Bar Track */}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightClass} p-0.5`}>
        <div
          className={`${heightClass} rounded-full transition-all duration-500 ease-out ${barColor}`}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default AttendanceProgressBar;
