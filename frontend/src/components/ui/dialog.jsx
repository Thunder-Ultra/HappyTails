import React from 'react';

// Minimal Dialog primitives for forms and modals
const Dialog = ({ children, open, onOpenChange, ...props }) => (
  <div data-slot="dialog" {...props}>
    {children}
  </div>
);

const DialogTrigger = ({ children, ...props }) => (
  <button data-slot="dialog-trigger" type="button" {...props}>
    {children}
  </button>
);

const DialogPortal = ({ children }) => <>{children}</>;

const DialogClose = ({ children, ...props }) => (
  <button data-slot="dialog-close" type="button" {...props}>
    {children}
  </button>
);

const DialogOverlay = ({ className = '', ...props }) => (
  <div data-slot="dialog-overlay" className={className} {...props} />
);

const DialogContent = ({ children, className = '', ...props }) => (
  <div data-slot="dialog-content" className={`bg-white rounded-lg border p-6 ${className}`} {...props}>
    {children}
  </div>
);

const DialogHeader = ({ children, className = '', ...props }) => (
  <div data-slot="dialog-header" className={`flex flex-col gap-2 mb-4 ${className}`} {...props}>
    {children}
  </div>
);

const DialogFooter = ({ children, className = '', ...props }) => (
  <div data-slot="dialog-footer" className={`flex gap-2 justify-end mt-6 ${className}`} {...props}>
    {children}
  </div>
);

const DialogTitle = ({ children, className = '', ...props }) => (
  <h2 data-slot="dialog-title" className={`text-lg font-semibold ${className}`} {...props}>
    {children}
  </h2>
);

const DialogDescription = ({ children, className = '', ...props }) => (
  <p data-slot="dialog-description" className={`text-sm text-gray-600 ${className}`} {...props}>
    {children}
  </p>
);

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
