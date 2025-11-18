import React from 'react';

// Minimal Badge component used across the app. Keeps API simple and
// avoids external runtime dependencies that were causing parse errors.
const Badge = ({ children, className = '', variant = 'default', ...props }) => {
  const base = 'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium';
  const variantClass =
    variant === 'secondary'
      ? 'bg-gray-100 text-gray-800 border'
      : variant === 'destructive'
        ? 'bg-red-100 text-red-800 border'
        : 'bg-primary text-white';

  return (
    <span data-slot="badge" className={`${base} ${variantClass} ${className}`} {...props}>
      {children}
    </span>
  );
};

export { Badge };
