import React from "react";

// Lightweight fallback implementations for the Sheet primitives.
// These are intentionally simple: they provide basic structure and
// avoid depending on radix/ui to allow the app to compile while
// the original components are restored or fixed later.

const Sheet = ({ children, ...props }) => (
  <div data-slot="sheet" {...props}>
    {children}
  </div>
);

const SheetTrigger = ({ children, ...props }) => (
  <button data-slot="sheet-trigger" type="button" {...props}>
    {children}
  </button>
);

const SheetClose = ({ children, ...props }) => (
  <button data-slot="sheet-close" type="button" {...props}>
    {children}
  </button>
);

const SheetPortal = ({ children }) => <>{children}</>;

const SheetOverlay = ({ className = "", ...props }) => (
  <div data-slot="sheet-overlay" className={className} {...props} />
);

const SheetContent = ({ children, className = "", ...props }) => (
  <div data-slot="sheet-content" className={className} {...props}>
    <SheetOverlay />
    <div>{children}</div>
  </div>
);

const SheetHeader = ({ children, ...props }) => (
  <div data-slot="sheet-header" {...props}>
    {children}
  </div>
);

const SheetFooter = ({ children, ...props }) => (
  <div data-slot="sheet-footer" {...props}>
    {children}
  </div>
);

const SheetTitle = ({ children, ...props }) => (
  <div data-slot="sheet-title" {...props}>
    {children}
  </div>
);

const SheetDescription = ({ children, ...props }) => (
  <div data-slot="sheet-description" {...props}>
    {children}
  </div>
);

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
