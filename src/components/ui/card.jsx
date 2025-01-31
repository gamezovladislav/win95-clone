import React from 'react';

export function Card({ children, className, ...props }) {
  return (
    <div
      className={`border border-gray-400 shadow p-2 bg-white ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
}
