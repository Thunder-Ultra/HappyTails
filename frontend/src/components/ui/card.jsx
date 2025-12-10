import * as React from "react";
import { cn } from "./utils";

function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 rounded-xl border bg-card text-card-foreground",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }) {
  return (
    <div
      className={cn(
        "grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 @container/card-header has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }) {
  return (
    <h4 className={cn("leading-none", className)} {...props} />
  );
}

function CardDescription({ className, ...props }) {
  return (
    <p className={cn("text-muted-foreground", className)} {...props} />
  );
}

function CardAction({ className, ...props }) {
  return (
    <div
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }) {
  return (
    <div className={cn("px-6 [&:last-child]:pb-6", className)} {...props} />
  );
}

function CardFooter({ className, ...props }) {
  return (
    <div
      className={cn("flex items-center px-6 pb-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};