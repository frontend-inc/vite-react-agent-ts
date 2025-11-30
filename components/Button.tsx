import React from 'react';
import { Zap } from 'lucide-react';
import clsx from 'clsx';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  disabled?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  showIcon = false,
  disabled = false,
  className
}) => {
  const iconSize = size === 'small' ? 14 : size === 'large' ? 18 : 16;

  const buttonClasses = clsx(
    // Base classes
    'border-0 rounded-lg cursor-pointer font-semibold transition-all duration-300 inline-flex items-center justify-center gap-2 hover:opacity-80 active:scale-95',

    // Variant classes
    {
      'bg-blue-500 text-white hover:bg-blue-600': variant === 'primary',
      'bg-gray-500 text-white hover:bg-gray-600': variant === 'secondary',
      'bg-green-500 text-white hover:bg-green-600': variant === 'success',
      'bg-red-500 text-white hover:bg-red-600': variant === 'danger',
    },

    // Size classes
    {
      'px-4 py-2 text-sm': size === 'small',
      'px-6 py-3 text-base': size === 'medium',
      'px-8 py-4 text-lg': size === 'large',
    },

    // Disabled state
    {
      'opacity-50 cursor-not-allowed hover:opacity-50 active:scale-100': disabled,
    },

    // Custom className
    className
  );

  return (
    <button
      className={buttonClasses}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {showIcon && <Zap size={iconSize} />}
      {children}
    </button>
  );
};

export default Button;