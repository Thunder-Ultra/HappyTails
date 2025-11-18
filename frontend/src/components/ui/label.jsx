import React from 'react';

// Minimal Label component
export const Label = ({ children, className = '', ...props }) => (
  <label className={`text-sm font-medium ${className}`} {...props}>
    {children}
  </label>
);

export default Label;
