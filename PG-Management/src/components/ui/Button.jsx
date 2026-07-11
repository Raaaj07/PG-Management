import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const VARIANTS = {
  primary:
    'bg-indigo-600 text-white hover:bg-indigo-650 shadow-md shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-600/25 focus-visible:ring-indigo-500/40 dark:bg-indigo-550 dark:hover:bg-indigo-500 dark:text-slate-950',
  secondary:
    'bg-white dark:bg-slate-900 text-slate-750 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 focus-visible:ring-slate-400/30',
  ghost:
    'bg-transparent text-slate-550 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white focus-visible:ring-slate-400/30',
  danger:
    'bg-red-600 text-white hover:bg-red-650 shadow-md shadow-red-600/20 hover:shadow-lg hover:shadow-red-600/25 focus-visible:ring-red-500/40',
  outlineDanger:
    'bg-transparent text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-955/20 focus-visible:ring-red-500/30',
};

const SIZES = {
  sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-lg',
  md: 'text-sm px-4 py-2.5 gap-2 rounded-xl',
  lg: 'text-sm px-5 py-3 gap-2 rounded-xl',
  icon: 'p-2.5 rounded-xl',
};

export const Button = React.forwardRef(
  ({ className, variant = 'primary', size = 'md', loading = false, disabled, children, icon: Icon, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-all duration-150 active:scale-[0.97] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-4',
          VARIANTS[variant],
          SIZES[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          Icon && <Icon className="w-4 h-4" />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export default Button;
