'use client';

import { useEffect } from 'react';

/**
 * Registers the service worker at /sw.js in production builds.
 * No-op in development.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });
        // Optionally, listen for updates and prompt reloads, etc.
        reg.addEventListener('updatefound', () => {
          // Could surface an update UI here.
        });
      } catch (err) {
        console.error('[sw] registration failed', err);
      }
    };

    // Wait for window load for better compatibility
    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register, { once: true });
    }
  }, []);

  return null;
}
