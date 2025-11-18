import React from "react";

// Minimal button replacement to avoid parsing errors in corrupted file.
// This keeps the API small: `Button` accepts `variant`, `size`, `asChild`,
// and forwards className/children/props.
const Button = ({ className = "", asChild = false, children, ...props }) => {
  const Comp = asChild && props.as ? props.as : "button";
  return (
    <Comp className={`inline-flex items-center gap-2 ${className}`} {...props}>
      {children}
    </Comp>
  );
};

export { Button };
