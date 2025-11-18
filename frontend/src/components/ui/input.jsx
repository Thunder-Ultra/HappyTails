import React from 'react';

// Minimal Input component used across pages
const Input = React.forwardRef(({ className = '', ...props }, ref) => (
  <input ref={ref} className={`px-3 py-2 border rounded ${className}`} {...props} />
));

export { Input };
export default Input;

