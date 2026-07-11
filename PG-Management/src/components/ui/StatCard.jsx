import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const COLOR_MAP = {
  indigo: 'text-indigo-650 dark:text-indigo-400 bg-indigo-55/10 dark:bg-indigo-955/40',
  sky: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-955/40',
  emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-955/40',
  amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-955/40',
  red: 'text-red-650 dark:text-red-400 bg-red-50 dark:bg-red-955/40',
  violet: 'text-violet-600 dark:text-violet-400 bg-violet-500/10 dark:bg-violet-955/40',
};

export const StatCard = ({ label, value, icon: Icon, color = 'indigo', trend, index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: index * 0.05, ease: 'easeOut' }}
    whileHover={{ y: -3 }}
    className="bg-white dark:bg-slate-955 p-6 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-sm hover:shadow-lg hover:shadow-slate-900/5 dark:hover:shadow-black/20 transition-shadow flex justify-between items-center group"
  >
    <div className="min-w-0">
      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</span>
      <h3 className="text-2xl font-extrabold mt-1 text-slate-900 dark:text-white tabular-nums">{value}</h3>
      {trend && (
        <span className={cn('text-[11px] font-semibold mt-1 inline-block', trend.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
          {trend.label}
        </span>
      )}
    </div>
    <div className={cn('p-3.5 rounded-xl shrink-0 transition-transform group-hover:scale-105', COLOR_MAP[color] || COLOR_MAP.indigo)}>
      <Icon className="w-5 h-5" />
    </div>
  </motion.div>
);

export default StatCard;
