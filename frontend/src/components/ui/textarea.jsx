import React from 'react';

// Minimal Textarea component
const Textarea = React.forwardRef(({ className = '', ...props }, ref) => (
  <textarea ref={ref} className={`px-3 py-2 border rounded ${className}`} {...props} />
));

export { Textarea };
export default Textarea;

