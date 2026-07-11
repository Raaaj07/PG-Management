import React from 'react';
import { motion } from 'framer-motion';

export const PageHeader = ({ title, subtitle, actions }) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
  >
    <div>
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{title}</h1>
      {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
  </motion.div>
);

export const EmptyState = ({ icon: Icon, title = 'Nothing here yet', description, action }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-6">
    {Icon && (
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-850 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4">
        <Icon className="w-6 h-6" />
      </div>
    )}
    <h3 className="text-sm font-bold text-slate-800 dark:text-white">{title}</h3>
    {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-xs">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default PageHeader;
