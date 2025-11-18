import React from 'react';

// Minimal Card primitive bundle. Exports the common named components
// used throughout the app. Keeps structure simple and portable.
const Card = ({ children, className = '', ...props }) => (
  <div data-slot="card" className={`bg-white text-black flex flex-col gap-6 rounded-xl border ${className}`} {...props}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '', ...props }) => (
  <div data-slot="card-header" className={`px-6 pt-6 ${className}`} {...props}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '', ...props }) => (
  <h4 data-slot="card-title" className={`${className}`} {...props}>
    {children}
  </h4>
);

const CardDescription = ({ children, className = '', ...props }) => (
  <p data-slot="card-description" className={`${className}`} {...props}>
    {children}
  </p>
);

const CardAction = ({ children, className = '', ...props }) => (
  <div data-slot="card-action" className={`${className}`} {...props}>
    {children}
  </div>
);

const CardContent = ({ children, className = '', ...props }) => (
  <div data-slot="card-content" className={`px-6 ${className}`} {...props}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '', ...props }) => (
  <div data-slot="card-footer" className={`flex items-center px-6 pb-6 ${className}`} {...props}>
    {children}
  </div>
);

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
