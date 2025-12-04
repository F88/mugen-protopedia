'use client';

import React, { useEffect, useState, useRef } from 'react';

// -----------------------------------------------------------------------------
// Helper Components & Hooks
// -----------------------------------------------------------------------------

/**
 * Component that renders animated radial speed lines.
 * Uses requestAnimationFrame to update the background style directly,
 * bypassing React's render cycle for performance and to avoid lint errors.
 */
const AnimatedSpeedLines = ({
  className,
  color,
}: {
  className?: string;
  color: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(
    () => {
      const element = ref.current;
      if (!element) return;

      let animationFrameId: number;
      let lastTime = 0;
      // Increase FPS to 24 for smoother/faster animation
      // const fps = 24;
      const fps = 12;
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

        // Use 'background' shorthand for better compatibility and ensure it's applied
        element.style.background = `conic-gradient(from 0deg at 50% 50%, ${stops.join(', ')})`;
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
    },
    [
      //
      color,
    ],
    //
  );

  return <div ref={ref} className={className} />;
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
      <AnimatedSpeedLines
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
      <AnimatedSpeedLines
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
      <AnimatedSpeedLines
        className="absolute inset-0 opacity-30 mix-blend-multiply"
        color="rgba(0, 0, 0, 0.8)"
      />
    </div>
  );
};

/**
 * Theme: Sonic
 * Visuals: Blue radial speed lines with vertical gradient.
 */
const UnleashedThemeSonic = () => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-blue-950/40" />
      <AnimatedSpeedLines
        className="absolute inset-0 opacity-40 mix-blend-screen"
        color="rgba(0, 100, 255, 0.8)"
      />
      <div className="absolute inset-0 bg-linear-to-b from-blue-400/10 via-transparent to-blue-600/20" />
    </div>
  );
};

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------

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
        // UnleashedThemeLightning,
        // UnleashedThemeAccelerator,
        UnleashedThemeManga,
        // UnleashedThemeSonic,
      ];
      const RandomTheme = themes[Math.floor(Math.random() * themes.length)];
      setThemeComponent(() => RandomTheme);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  if (!ThemeComponent) return null;

  return <ThemeComponent />;
};

/**
 * Main component for Play Mode themes.
 * Renders the appropriate theme overlay based on the current mode.
 */
export function PlayModeTheme({ mode }: { mode: 'normal' | 'unleashed' }) {
  if (mode !== 'unleashed') return null;

  return <UnleashedThemeRandomized />;
}
