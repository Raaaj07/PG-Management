import React from 'react';
import { cn } from '../../lib/utils';

// Maps common status strings used across the app (fees, complaints, leaves, visitors...) to a tone.
const STATUS_TONE = {
  paid: 'success', resolved: 'success', approved: 'success', 'checked out': 'success',
  active: 'success', available: 'success', completed: 'success', accepted: 'success',

  pending: 'warning', 'pending review': 'warning', 'in progress': 'warning',
  'checked in': 'warning', occupied: 'warning', 'partially paid': 'warning',

  unpaid: 'danger', rejected: 'danger', overdue: 'danger', denied: 'danger',
  cancelled: 'danger', closed: 'neutral', inactive: 'neutral',
};

const TONE_CLASSES = {
  success: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-955/40 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/15',
  warning: 'bg-amber-50 text-amber-600 dark:bg-amber-955/40 dark:text-amber-400 ring-1 ring-inset ring-amber-500/15',
  danger: 'bg-red-50 text-red-650 dark:bg-red-955/40 dark:text-red-400 ring-1 ring-inset ring-red-500/15',
  neutral: 'bg-slate-100 text-slate-600 dark:bg-slate-850 dark:text-slate-400 ring-1 ring-inset ring-slate-500/10',
  info: 'bg-sky-50 text-sky-600 dark:bg-sky-955/40 dark:text-sky-400 ring-1 ring-inset ring-sky-500/15',
  indigo: 'bg-indigo-55/10 text-indigo-650 dark:bg-indigo-955/40 dark:text-indigo-400 ring-1 ring-inset ring-indigo-500/15',
};

export const Badge = ({ status, tone, dot = true, className, children }) => {
  const resolvedTone = tone || STATUS_TONE[String(status).toLowerCase()] || 'neutral';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide whitespace-nowrap',
        TONE_CLASSES[resolvedTone],
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', {
        'bg-emerald-500': resolvedTone === 'success',
        'bg-amber-500': resolvedTone === 'warning',
        'bg-red-500': resolvedTone === 'danger',
        'bg-slate-400': resolvedTone === 'neutral',
        'bg-sky-500': resolvedTone === 'info',
        'bg-indigo-500': resolvedTone === 'indigo',
      })} />}
      {children || status}
    </span>
  );
};

export default Badge;
