import React from 'react';
import { Toaster as HotToaster } from 'react-hot-toast';

/**
 * App-wide toast host, styled to match the glass/dark design system.
 * Import `toast` from 'react-hot-toast' directly in pages to fire notifications.
 */
export const AppToaster = () => (
  <HotToaster
    position="top-right"
    gutter={10}
    toastOptions={{
      duration: 3500,
      className: '!font-sans',
      style: {
        background: 'var(--slate-955, #0f172a)',
        color: '#fff',
        border: '1px solid rgba(148,163,184,0.15)',
        borderRadius: '14px',
        padding: '12px 16px',
        fontSize: '13px',
        fontWeight: 600,
        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.35)',
      },
      success: {
        iconTheme: { primary: '#10b981', secondary: '#fff' },
      },
      error: {
        iconTheme: { primary: '#ef4444', secondary: '#fff' },
      },
    }}
  />
);

export default AppToaster;
