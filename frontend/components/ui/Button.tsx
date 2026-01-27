import React from 'react';
import clsx from 'clsx';

type Variant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants: Record<Variant, string> = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-300',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-200',
    success: 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-300',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-300',
    ghost: 'bg-transparent text-gray-800 hover:bg-gray-100',
  };

  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
