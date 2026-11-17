import React from 'react';

const LoadingSpinner = ({ size = 'md', message = '' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 gap-3">
      <div
        className={`${sizeClasses[size] || sizeClasses.md} border-blue-200 border-t-brand-blue rounded-full animate-spin`}
      />
      {message && (
        <p className="text-sm font-medium text-brand-muted animate-pulse">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
