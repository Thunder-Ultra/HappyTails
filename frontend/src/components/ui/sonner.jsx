import React from "react";
// Simple wrapper that re-exports the Toaster from `sonner` if present.
// Keeps the component signature minimal and avoids TS/Next-specific syntax.
import { Toaster as SonnerToaster } from "sonner";

const Toaster = (props) => {
  // If sonner isn't installed this will error at runtime — but
  // the code here is valid JS/JSX and will compile.
  return <SonnerToaster {...props} />;
};

export { Toaster };
