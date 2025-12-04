'use client';

import React, { useEffect, useRef, useState } from 'react';

import { UniverseBackgroundMainDark } from '@/app/observatory/shared/universe-background-main-dark';

import { useHtmlTheme } from '@/hooks/use-html-theme';

import { logger } from '@/lib/logger.client';

import {
  PlayModeState,
  SimulatedDelayLevel,
} from '@/types/mugen-protopedia.types';

// -----------------------------------------------------------------------------
// Helper Components & Hooks
/**
 * Component that renders animated radial speed lines (for Lightning, Accelerator, Manga).
 * Uses requestAnimationFrame to update the background style directly.
 */
const AnimatedRadialSpeedLines = ({
  className,
  color,
}: {
  className?: string;
  color: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let animationFrameId: number;
    let lastTime = 0;
    const fps = 24;
    const interval = 1000 / fps;

    const draw = () => {
      const stops: string[] = [];
      let currentAngle = 0;

      while (currentAngle < 360) {
        const gap = Math.random() * 15 + 5; // Gap between 5 and 20 degrees
        const width = Math.random() * 2 + 0.5; // Line width between 0.5 and 2.5 degrees

        const start = currentAngle + gap;
        const end = start + width;

        // Fill gap with transparent
        stops.push(`transparent ${currentAngle}deg ${start}deg`);

        if (start >= 360) break;

        // Draw line
        stops.push(`${color} ${start}deg ${end}deg`);

        currentAngle = end;
      }

      // Fill remaining space
      if (currentAngle < 360) {
        stops.push(`transparent ${currentAngle}deg 360deg`);
      }

      element.style.background = `conic-gradient(from 0deg at 50% 50%, ${stops.join(', ')})`;

      // Apply mask to fade out towards center
      const mask = 'radial-gradient(circle, transparent 15%, black 80%)';
      element.style.maskImage = mask;
      element.style.webkitMaskImage = mask;
    };

    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);

      if (time - lastTime >= interval) {
        lastTime = time;
        draw();
      }
    };

    // Initial draw
    draw();
    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [color]);

  return <div ref={ref} className={className} />;
};

/**
 * Component that renders animated linear speed lines (for Sonic).
 * Uses HTML5 Canvas to render vertical lines that fade in and out,
 * simulating a high-speed vertical motion effect.
 * Supports multiple colors mixed together.
 */

const AnimatedLinearSpeedLines = ({
  className,
  color,
  themeKey,
}: {
  className?: string;
  color: string | string[];
  themeKey: string;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize handling
    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    // Prepare color palette (solid and transparent versions for each color)
    const colorList = Array.isArray(color) ? color : [color];
    const colorPalette = colorList.map((c) => {
      let r = 255,
        g = 255,
        b = 255;
      const match = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        r = parseInt(match[1]);
        g = parseInt(match[2]);
        b = parseInt(match[3]);
      }
      return {
        solid: c,
        transparent: `rgba(${r}, ${g}, ${b}, 0)`,
      };
    });

    // Line particles
    const lines: {
      x: number;
      y: number;
      length: number;
      speed: number;
      opacity: number;
      thickness: number;
      colorIndex: number;
    }[] = [];
    const lineCount = 40; // Number of lines

    const initLines = () => {
      lines.length = 0;
      for (let i = 0; i < lineCount; i++) {
        // Length based on canvas height (30% to 100%)
        const minLen = canvas.height * 0.3;
        const maxLen = canvas.height * 1.0;

        lines.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          length: Math.random() * (maxLen - minLen) + minLen,
          speed: Math.random() * 20 + 15, // Speed between 15-35px/frame
          opacity: Math.random() * 0.6 + 0.2, // Opacity 0.2-0.8
          thickness: Math.random() * 2 + 1, // Thickness 1-3px
          colorIndex: Math.floor(Math.random() * colorPalette.length),
        });
      }
    };
    initLines();

    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      lines.forEach((line) => {
        // Move line vertically
        line.y += line.speed;
        if (line.y > canvas.height) {
          line.y = -line.length;
          line.x = Math.random() * canvas.width;
          // Randomize properties on reset
          const minLen = canvas.height * 0.3;
          const maxLen = canvas.height * 1.0;
          line.length = Math.random() * (maxLen - minLen) + minLen;
          line.speed = Math.random() * 20 + 15;
          line.opacity = Math.random() * 0.6 + 0.2;
          line.colorIndex = Math.floor(Math.random() * colorPalette.length);
        }

        const palette = colorPalette[line.colorIndex];

        // Create gradient for "fade in/out" effect (transparent -> color -> transparent)
        const gradient = ctx.createLinearGradient(
          line.x,
          line.y,
          line.x,
          line.y + line.length,
        );
        gradient.addColorStop(0, palette.transparent);
        gradient.addColorStop(0.2, palette.solid); // Fade in quickly
        gradient.addColorStop(0.8, palette.solid); // Stay visible
        gradient.addColorStop(1, palette.transparent); // Fade out

        ctx.fillStyle = gradient;
        ctx.globalAlpha = line.opacity;
        ctx.fillRect(line.x, line.y, line.thickness, line.length);
        ctx.globalAlpha = 1.0;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [color, themeKey]);

  return <canvas ref={canvasRef} className={className} />;
};

// -----------------------------------------------------------------------------
// Theme Components
// -----------------------------------------------------------------------------

/**
 * Theme: Lightning
 * Visuals: Blue/White radial speed lines with overlay.
 */
const UnleashedThemeLightning = () => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/40" />
      <AnimatedRadialSpeedLines
        className="absolute inset-0 opacity-50 mix-blend-screen"
        color="rgba(255, 255, 255, 0.8)"
      />
      <div className="absolute inset-0 bg-linear-to-t from-blue-500/20 via-transparent to-blue-500/20" />
    </div>
  );
};

/**
 * Theme: Accelerator
 * Visuals: Red radial speed lines with overlay.
 */
const UnleashedThemeAccelerator = () => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-red-950/40" />
      <AnimatedRadialSpeedLines
        className="absolute inset-0 opacity-50 mix-blend-screen"
        color="rgba(255, 200, 200, 0.8)"
      />
      <div className="absolute inset-0 bg-linear-to-t from-red-500/20 via-transparent to-red-500/20" />
    </div>
  );
};

/**
 * Theme: Manga
 * Visuals: Black radial speed lines with multiply blend mode.
 */
const UnleashedThemeManga = () => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-white/5 mix-blend-overlay" />
      <AnimatedRadialSpeedLines
        className="absolute inset-0 opacity-30 mix-blend-multiply"
        color="rgba(0, 0, 0, 0.8)"
      />
    </div>
  );
};

/**
 * Theme: Sonic
 * Visuals: Blue vertical linear speed lines.
 */
const UnleashedThemeSonic = () => {
  const { isDark } = useHtmlTheme();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className={`absolute inset-0 ${isDark ? 'bg-slate-950' : 'bg-sky-200'}`}
      />
      <AnimatedLinearSpeedLines
        className={
          isDark
            ? 'absolute inset-0 opacity-80 mix-blend-screen'
            : 'absolute inset-0 opacity-70 mix-blend-normal'
        }
        color={
          isDark
            ? [
                'rgba(56, 189, 248, 1)',
                'rgba(59, 130, 246, 1)',
                'rgba(191, 219, 254, 1)',
              ]
            : [
                'rgba(30, 64, 175, 1)',
                'rgba(37, 99, 235, 1)',
                'rgba(59, 130, 246, 1)',
                'rgba(255, 255, 255, 1)',
              ]
        }
        themeKey={isDark ? 'dark' : 'light'}
      />
    </div>
  );
};

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------

/**
 * Component that renders the normal theme background with slight variation based on delay level.
 */
const NormalThemeRandomized = ({
  delayLevel,
}: {
  delayLevel?: SimulatedDelayLevel;
}) => {
  logger.debug('[NormalThemeRandomized] render', { delayLevel });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <UniverseBackgroundMainDark />
    </div>
  );
};

/**
 * Component that randomly selects one of the Unleashed themes on mount.
 * Uses client-side only rendering to avoid hydration mismatches.
 */
const UnleashedThemeRandomized = () => {
  const [ThemeComponent, setThemeComponent] =
    useState<React.ComponentType | null>(null);

  useEffect(() => {
    // Defer selection to avoid hydration mismatch and synchronous setState warning
    const timer = setTimeout(() => {
      const themes = [
        /* AnimatedRadialSpeedLines backgrounds */
        UnleashedThemeLightning,
        UnleashedThemeAccelerator,
        UnleashedThemeManga,
        /* AnimatedLinearSpeedLines background */
        UnleashedThemeSonic,
      ];
      const RandomTheme = themes[Math.floor(Math.random() * themes.length)];
      setThemeComponent(() => RandomTheme);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  if (!ThemeComponent) return null;

  return <ThemeComponent />;
};

type PlayModeThemeProps = {
  mode: PlayModeState;
  delayLevel?: SimulatedDelayLevel;
};

/**
 * Main component for Play Mode themes.
 * Renders the appropriate theme overlay based on the current mode.
 */
export function PlayModeTheme({ mode, delayLevel }: PlayModeThemeProps) {
  logger.debug('[PlayModeTheme] render', { mode, delayLevel });
  if (mode.type === 'unleashed') {
    return <UnleashedThemeRandomized />;
  }
  if (mode.type === 'normal' && delayLevel != null) {
    if (
      delayLevel === 'FAST' ||
      delayLevel === 'FASTER' ||
      delayLevel === 'FASTEST'
    ) {
      return <NormalThemeRandomized delayLevel={delayLevel} />;
    }
  }
  return null;
}
