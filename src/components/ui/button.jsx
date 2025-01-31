import React from 'react';

export function Button({ children, className, ...props }) {
  return (
    <button
      className={`text-sm px-2 py-1 border border-gray-400 hover:bg-gray-300 ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
}
