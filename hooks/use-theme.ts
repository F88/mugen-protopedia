'use client';

/**
 * ユーザーのテーマ設定とシステムテーマを統合的に扱うクライアント専用フック。
 *
 * - localStorage から保存済みのテーマを取得し、無ければ `system` を既定とする。
 * - OS のカラーモード変更を監視して動的に反映する。
 * - `document.documentElement` に `light` / `dark` クラスを付与して Tailwind の
 *   ダークモード制御に対応する。
 */
import { useCallback, useEffect, useState } from 'react';

type ThemePreference = 'light' | 'dark' | 'system';
type ThemeValue = 'light' | 'dark';

const THEME_STORAGE_KEY = 'theme';

const isThemePreference = (value: unknown): value is ThemePreference =>
  value === 'light' || value === 'dark' || value === 'system';

const resolveSystemTheme = (): ThemeValue =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

export const useTheme = () => {
  const [mounted, setMounted] = useState(false);
  const [preference, setPreference] = useState<ThemePreference>('system');
  const [systemTheme, setSystemTheme] = useState<ThemeValue>(() =>
    resolveSystemTheme(),
  );

  /** 初回マウント時に localStorage からテーマ設定を復元する */
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    requestAnimationFrame(() => {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (isThemePreference(saved)) {
        setPreference(saved);
      }

      setTimeout(() => setMounted(true), 50);
    });
  }, []);

  /** OS のダークモード設定を監視し、`system` 選択時の解決結果に反映する */
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      setSystemTheme(media.matches ? 'dark' : 'light');
    };

    handleChange();

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', handleChange);
      return () => {
        media.removeEventListener('change', handleChange);
      };
    }

    media.addListener(handleChange);
    return () => {
      media.removeListener(handleChange);
    };
  }, []);

  const resolvedTheme: ThemeValue =
    preference === 'system' ? systemTheme : preference;

  /** 解決済みテーマを DOM と localStorage に反映する */
  useEffect(() => {
    if (!mounted) {
      return;
    }

    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(resolvedTheme);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
      /* ignore storage errors */
    }
  }, [preference, resolvedTheme, mounted]);

  /** ユーザーが明示的にテーマを選択するための setter */
  const setTheme = useCallback((next: ThemePreference) => {
    setPreference(next);
  }, []);

  /** 現在の状態に応じてライト/ダークテーマをトグルする */
  const toggleTheme = useCallback(() => {
    setPreference((current) => {
      const next: ThemePreference =
        current === 'system'
          ? systemTheme === 'dark'
            ? 'light'
            : 'dark'
          : current === 'dark'
            ? 'light'
            : 'dark';

      return next;
    });
  }, [systemTheme]);

  const isDark = resolvedTheme === 'dark';

  return {
    theme: preference,
    resolvedTheme,
    mounted,
    isDark,
    setTheme,
    toggleTheme,
  };
};
