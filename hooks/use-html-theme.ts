'use client';

import { useEffect, useState } from 'react';

type HtmlTheme = 'light' | 'dark';

const getCurrentTheme = (): HtmlTheme => {
  if (typeof document === 'undefined') {
    return 'light';
  }

  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
};

export const useHtmlTheme = () => {
  const [theme, setTheme] = useState<HtmlTheme>(() => getCurrentTheme());

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const observer = new MutationObserver(() => {
      setTheme(getCurrentTheme());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return {
    theme,
    isDark: theme === 'dark',
  };
};
