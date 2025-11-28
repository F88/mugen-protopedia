import React from 'react';
import { cn } from '@/lib/utils';

export type ObservatorySectionTheme =
  | 'sky'
  | 'orange'
  | 'red'
  | 'lime'
  | 'slate'
  | 'cyan'
  | 'purple'
  | 'rose'
  | 'pink'
  | 'blue'
  | 'amber'
  | 'teal'
  | 'emerald'
  | 'fuchsia'
  | 'space';

interface ThemeStyles {
  container: string;
  border: string;
  iconBg: string;
  iconText: string;
  decoration: string;
  narrativeBorder: string;
}

const THEME_STYLES: Record<ObservatorySectionTheme, ThemeStyles> = {
  sky: {
    container:
      'bg-linear-to-r from-sky-50 to-yellow-50 dark:from-sky-900/20 dark:to-yellow-900/20',
    border: 'border-sky-100 dark:border-sky-800/50',
    iconBg: 'bg-sky-100 dark:bg-sky-900/50',
    iconText: 'text-sky-600 dark:text-sky-300',
    decoration: 'bg-yellow-400/10',
    narrativeBorder: 'border-sky-200/50 dark:border-sky-800/30',
  },
  orange: {
    container:
      'bg-linear-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20',
    border: 'border-orange-100 dark:border-orange-800/50',
    iconBg: 'bg-orange-100 dark:bg-orange-900/50',
    iconText: 'text-orange-600 dark:text-orange-300',
    decoration: 'bg-yellow-400/10',
    narrativeBorder: 'border-orange-200/50 dark:border-orange-800/30',
  },
  red: {
    container:
      'bg-linear-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-amber-900/20',
    border: 'border-red-100 dark:border-red-800/50',
    iconBg: 'bg-red-100 dark:bg-red-900/50',
    iconText: 'text-red-600 dark:text-red-400',
    decoration: 'bg-orange-400/10',
    narrativeBorder: 'border-red-200/50 dark:border-red-800/30',
  },
  lime: {
    container:
      'bg-linear-to-r from-lime-50 to-green-50 dark:from-lime-900/20 dark:to-green-900/20',
    border: 'border-lime-100 dark:border-lime-800/50',
    iconBg: 'bg-lime-100 dark:bg-lime-800',
    iconText: 'text-lime-600 dark:text-lime-300',
    decoration: 'bg-green-400/10',
    narrativeBorder: 'border-lime-200/50 dark:border-lime-800/30',
  },
  slate: {
    container:
      'bg-linear-to-r from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20',
    border: 'border-slate-100 dark:border-slate-800/50',
    iconBg: 'bg-slate-100 dark:bg-slate-800',
    iconText: 'text-slate-600 dark:text-slate-300',
    decoration: 'bg-blue-400/10',
    narrativeBorder: 'border-slate-200/50 dark:border-slate-800/30',
  },
  cyan: {
    container:
      'bg-linear-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20',
    border: 'border-cyan-100 dark:border-cyan-800/50',
    iconBg: 'bg-cyan-100 dark:bg-cyan-800',
    iconText: 'text-cyan-600 dark:text-cyan-300',
    decoration: 'bg-cyan-400/10',
    narrativeBorder: 'border-cyan-200/50 dark:border-cyan-800/30',
  },
  purple: {
    container:
      'bg-linear-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
    border: 'border-purple-100 dark:border-purple-800/50',
    iconBg: 'bg-purple-100 dark:bg-purple-800',
    iconText: 'text-purple-600 dark:text-purple-300',
    decoration: 'bg-pink-400/10',
    narrativeBorder: 'border-purple-200/50 dark:border-purple-800/30',
  },
  rose: {
    container:
      'bg-linear-to-r from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20',
    border: 'border-rose-100 dark:border-rose-800/50',
    iconBg: 'bg-rose-100 dark:bg-rose-800',
    iconText: 'text-rose-600 dark:text-rose-300',
    decoration: 'bg-red-400/5',
    narrativeBorder: 'border-rose-200/50 dark:border-rose-800/30',
  },
  pink: {
    container:
      'bg-linear-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20',
    border: 'border-pink-100 dark:border-pink-800/50',
    iconBg: 'bg-pink-100 dark:bg-pink-800',
    iconText: 'text-pink-600 dark:text-pink-300',
    decoration: 'bg-rose-400/10',
    narrativeBorder: 'border-pink-200/50 dark:border-pink-800/30',
  },
  blue: {
    container:
      'bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
    border: 'border-blue-100 dark:border-blue-800/50',
    iconBg: 'bg-blue-100 dark:bg-blue-800',
    iconText: 'text-blue-600 dark:text-blue-300',
    decoration: 'bg-indigo-400/10',
    narrativeBorder: 'border-blue-200/50 dark:border-blue-800/30',
  },
  amber: {
    container:
      'bg-linear-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20',
    border: 'border-amber-100 dark:border-amber-800/50',
    iconBg: 'bg-amber-100 dark:bg-amber-800',
    iconText: 'text-amber-600 dark:text-amber-300',
    decoration: 'bg-yellow-400/10',
    narrativeBorder: 'border-amber-200/50 dark:border-amber-800/30',
  },
  teal: {
    container:
      'bg-linear-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20',
    border: 'border-teal-100 dark:border-teal-800/50',
    iconBg: 'bg-teal-100 dark:bg-teal-800',
    iconText: 'text-teal-600 dark:text-teal-300',
    decoration: 'bg-emerald-400/10',
    narrativeBorder: 'border-teal-200/50 dark:border-teal-800/30',
  },
  emerald: {
    container:
      'bg-linear-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20',
    border: 'border-emerald-100 dark:border-emerald-800/50',
    iconBg: 'bg-emerald-100 dark:bg-emerald-800',
    iconText: 'text-emerald-600 dark:text-emerald-300',
    decoration: 'bg-green-400/10',
    narrativeBorder: 'border-emerald-200/50 dark:border-emerald-800/30',
  },
  fuchsia: {
    container:
      'bg-linear-to-r from-fuchsia-50 to-pink-50 dark:from-fuchsia-900/20 dark:to-pink-900/20',
    border: 'border-fuchsia-100 dark:border-fuchsia-800/50',
    iconBg: 'bg-fuchsia-100 dark:bg-fuchsia-800',
    iconText: 'text-fuchsia-600 dark:text-fuchsia-300',
    decoration: 'bg-pink-400/10',
    narrativeBorder: 'border-fuchsia-200/50 dark:border-fuchsia-800/30',
  },
  space: {
    container:
      'bg-black text-white border-purple-900/50 shadow-2xl shadow-purple-900/20',
    border: 'border-purple-800/50',
    iconBg: 'bg-purple-900/30',
    iconText: 'text-yellow-400',
    decoration: 'bg-purple-600/20',
    narrativeBorder: 'border-purple-800/30',
  },
};

interface ObservatorySectionProps {
  theme: ObservatorySectionTheme;
  icon: React.ReactNode;
  title: string;
  description: string;
  sourceNote?: React.ReactNode;
  visualContent: React.ReactNode;
  children: React.ReactNode;
  narrative?: {
    title: React.ReactNode;
    content: React.ReactNode;
  };
  decorationPosition?: string; // e.g. "-mt-10 -ml-10 top-0 left-0"
  className?: string;
  delay?: string; // e.g. "delay-100"
}

export function ObservatorySection({
  theme,
  icon,
  title,
  description,
  sourceNote,
  visualContent,
  children,
  narrative,
  decorationPosition = '-mt-10 -ml-10 top-0 left-0',
  className,
  delay,
}: ObservatorySectionProps) {
  const styles = THEME_STYLES[theme];

  return (
    <section
      className={cn(
        'mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700',
        delay,
        className,
      )}
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-3xl p-8 border',
          styles.container,
          styles.border,
        )}
      >
        {/* Background Decoration */}
        <div
          className={cn(
            'absolute w-64 h-64 rounded-full blur-3xl pointer-events-none',
            styles.decoration,
            decorationPosition,
          )}
        ></div>

        {/* Top Section */}
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-8">
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <div
                className={cn(
                  'p-3 rounded-full',
                  styles.iconBg,
                  styles.iconText,
                )}
              >
                {icon}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {title}
              </h2>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {description}
            </p>
            {sourceNote && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                * Source: {sourceNote}
              </p>
            )}
          </div>
          <div className="shrink-0">{visualContent}</div>
        </div>

        {/* Content Section */}
        <div className="relative z-10 mb-8">{children}</div>

        {/* Narrative Section */}
        {narrative && (
          <div
            className={cn(
              'relative z-10 pt-8 border-t',
              styles.narrativeBorder,
            )}
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              {narrative.title}
            </h3>
            <div className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {narrative.content}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
