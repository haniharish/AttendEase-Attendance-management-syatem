import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = ({
  label,
  id,
  name,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error = '',
  helperText = '',
  icon: Icon = null,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id || name}
          className="text-xs font-semibold text-brand-muted uppercase tracking-wider flex items-center justify-between"
        >
          <span>
            {label} {required && <span className="text-brand-error">*</span>}
          </span>
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 pointer-events-none text-slate-400">
            <Icon className="w-5 h-5" />
          </div>
        )}

        <input
          id={id || name}
          name={name}
          type={effectiveType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`
            w-full rounded-input border bg-white px-3.5 py-2.5 text-sm text-brand-text placeholder-slate-400
            transition-all duration-200 outline-none
            ${Icon ? 'pl-11' : 'pl-3.5'}
            ${isPassword ? 'pr-11' : 'pr-3.5'}
            ${
              error
                ? 'border-brand-error focus:border-brand-error focus:ring-2 focus:ring-brand-error/20'
                : 'border-slate-200 focus:border-brand-blue focus:ring-3 focus:ring-brand-blue/15'
            }
            ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : ''}
          `}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3.5 text-slate-400 hover:text-brand-text transition-colors duration-200"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>

      {error ? (
        <p className="text-xs font-medium text-brand-error flex items-center gap-1 mt-0.5">
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-xs text-brand-muted mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
};

export default Input;
