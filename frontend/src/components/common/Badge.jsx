import React from 'react';

const Badge = ({
  children,
  variant = 'blue',
  size = 'md',
  icon: Icon = null,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-semibold rounded-md',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold rounded-badge',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold rounded-badge',
  };

  const variantStyles = {
    blue: 'bg-brand-blue-light text-brand-blue border border-blue-100',
    orange: 'bg-brand-orange-light text-brand-orange border border-orange-100',
    green: 'bg-brand-green-light text-brand-green border border-green-100',
    pink: 'bg-brand-pink-light text-brand-pink border border-pink-100',
    purple: 'bg-brand-purple-light text-brand-purple border border-purple-100',
    warning: 'bg-brand-warning-light text-brand-warning border border-amber-100',
    error: 'bg-brand-error-light text-brand-error border border-red-100',
    gray: 'bg-slate-100 text-slate-700 border border-slate-200',
  };

  return (
    <span
      className={`
        inline-flex items-center tracking-wide
        ${sizeStyles[size] || sizeStyles.md}
        ${variantStyles[variant] || variantStyles.blue}
        ${className}
      `}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
