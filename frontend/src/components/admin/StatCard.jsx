import React from 'react';
import Card from '../common/Card';

const StatCard = ({
  title,
  value,
  subtitle = '',
  icon: Icon,
  color = 'blue',
  badge = null,
  trend = null,
}) => {
  const colorStyles = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-brand-blue',
      border: 'border-blue-100',
    },
    orange: {
      bg: 'bg-orange-50',
      text: 'text-brand-orange',
      border: 'border-orange-100',
    },
    green: {
      bg: 'bg-emerald-50',
      text: 'text-brand-green',
      border: 'border-emerald-100',
    },
    pink: {
      bg: 'bg-pink-50',
      text: 'text-brand-pink',
      border: 'border-pink-100',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-brand-purple',
      border: 'border-purple-100',
    },
  };

  const current = colorStyles[color] || colorStyles.blue;

  return (
    <Card hoverEffect className="p-6 bg-white border border-slate-100">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-muted">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-brand-text tracking-tight">
              {value}
            </h3>
            {trend && (
              <span className={`text-xs font-bold ${trend > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                {trend > 0 ? `+${trend}%` : `${trend}%`}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-brand-muted leading-none font-medium">{subtitle}</p>
          )}
        </div>

        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${current.bg} ${current.text}`}
        >
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>

      {badge && (
        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-xs font-semibold">
          <span className="text-brand-muted">{badge.label}</span>
          <span className={`px-2 py-0.5 rounded-md ${current.bg} ${current.text}`}>
            {badge.value}
          </span>
        </div>
      )}
    </Card>
  );
};

export default StatCard;
