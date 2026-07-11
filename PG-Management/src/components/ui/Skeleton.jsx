import React from 'react';
import { cn } from '../../lib/utils';

export const Skeleton = ({ className }) => (
  <div className={cn('animate-pulse rounded-lg bg-slate-200/70 dark:bg-slate-850', className)} />
);

export const SkeletonStatCard = () => (
  <div className="bg-white dark:bg-slate-955 p-6 rounded-2xl border border-slate-200 dark:border-slate-850 flex justify-between items-center">
    <div className="space-y-2.5">
      <Skeleton className="h-2.5 w-24" />
      <Skeleton className="h-6 w-14" />
    </div>
    <Skeleton className="w-12 h-12 rounded-xl" />
  </div>
);

export const SkeletonTableRow = ({ cols = 5 }) => (
  <tr className="border-b border-slate-100 dark:border-slate-850">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-4">
        <Skeleton className="h-3.5 w-full max-w-[120px]" />
      </td>
    ))}
  </tr>
);

export const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-955 p-6 rounded-2xl border border-slate-200 dark:border-slate-850 space-y-3">
    <Skeleton className="h-4 w-1/3" />
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-2/3" />
  </div>
);

export default Skeleton;
