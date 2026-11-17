import React from 'react';

const Card = ({
  children,
  className = '',
  hoverEffect = false,
  padding = 'p-6',
  ...props
}) => {
  return (
    <div
      className={`
        bg-white rounded-card border border-slate-100/80 shadow-card transition-all duration-300
        ${hoverEffect ? 'hover:shadow-card-hover hover:-translate-y-1' : ''}
        ${padding}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
