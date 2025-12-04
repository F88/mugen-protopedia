import { useMemo } from 'react';
import type { PlayMode } from '@/types/mugen-protopedia.types';

/**
 * Visual themes associated with specific play modes.
 * Renders global visual effects (overlays, borders, etc.) based on the current mode.
 */
export const PlayModeTheme = ({ mode }: { mode: PlayMode }) => {
  switch (mode) {
    case 'unleashed':
      return <UnleashedThemeRandomized />;

    case 'normal':
    case 'playlist':
    default:
      return null;
  }
};

const UnleashedThemeRandomized = () => {
  const SelectedTheme = useMemo(() => {
    const variants = [
      UnleashedThemeAccelerator, // Red/Orange (Cyborg 009 style)
      // UnleashedThemeLightning, // Yellow (Original style)
      // UnleashedThemeOverdrive, // Blue/Cyan (Cool style)
      // UnleashedThemeManga, // Black & White (Manga style)
      // UnleashedThemeSonic, // Blue/White (Sky High Speed style)
    ];
    // Use a simple pseudo-random based on time to avoid "impure function" lint error in strict mode,
    // although useMemo is technically run during render.
    // A better approach for true purity would be passing a seed or using useEffect,
    // but for a visual theme randomization, this is acceptable if we suppress the lint or move it out.
    // Here we use Date.now() which is also impure but often tolerated, or just suppress.
    // Actually, let's just use Math.random() and ignore the linter for this specific line
    // because we WANT a random result on mount (which useMemo with [] simulates).

    // eslint-disable-next-line
    const index = Math.floor(Math.random() * variants.length);
    return variants[index];
  }, []);

  return <SelectedTheme />;
};

/**
 * Variant 1: Accelerator (Red/Orange/Blue)
 * Based on Cyborg 009 Accelerator Mode.
 */
const UnleashedThemeAccelerator = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
    {/* Dynamic Speed Lines */}
    <div className="absolute inset-0 opacity-60 mix-blend-hard-light bg-[repeating-conic-gradient(from_0deg_at_50%_50%,transparent_0deg_10deg,#dc2626_10deg_14deg,transparent_14deg_24deg,#ea580c_24deg_26deg,transparent_26deg_36deg,#facc15_36deg_38deg,transparent_38deg_48deg,#3b82f6_48deg_49deg)] mask-[radial-gradient(circle,transparent_20%,black_100%)]" />

    {/* Intense Burning Border & Atmosphere */}
    <div className="absolute inset-0 border-8 border-red-600 shadow-[inset_0_0_100px_rgba(220,38,38,0.9)] bg-red-900/10 animate-pulse" />

    {/* Color Overlay */}
    <div className="absolute inset-0 bg-linear-to-br from-red-500/20 via-transparent to-blue-600/20 mix-blend-overlay" />
  </div>
);

/**
 * Variant 2: Lightning (Yellow & Pale Blue)
 * High voltage electric shock style with random thickness.
 */
const UnleashedThemeLightning = () => {
  const gradient = useMemo(() => {
    let currentDeg = 0;
    const stops: string[] = [];
    let state = 0; // 0: Gap, 1: Yellow, 2: Gap, 3: Blue

    while (currentDeg < 360) {
      let width = 0;
      let color = 'transparent';

      if (state === 0 || state === 2) {
        // Gap: 1deg to 4deg
        width = Math.random() * 3 + 1; // eslint-disable-line
        color = 'transparent';
      } else if (state === 1) {
        // Yellow Line: 0.2deg to 0.8deg
        width = Math.random() * 0.6 + 0.2; // eslint-disable-line
        color = '#facc15';
      } else {
        // Blue Line: 0.2deg to 0.8deg
        width = Math.random() * 0.6 + 0.2; // eslint-disable-line
        color = '#bae6fd';
      }

      const nextDeg = Math.min(currentDeg + width, 360);
      stops.push(
        `${color} ${currentDeg.toFixed(2)}deg ${nextDeg.toFixed(2)}deg`,
      );

      currentDeg = nextDeg;
      state = (state + 1) % 4;
    }

    return `conic-gradient(from 0deg at 50% 50%, ${stops.join(', ')})`;
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Speed lines: Yellow and Pale Blue */}
      <div
        className="absolute inset-0 opacity-40 mix-blend-overlay mask-[radial-gradient(circle,transparent_10%,black_80%)]"
        style={{ background: gradient }}
      />

      {/* Glowing border & Pulse overlay */}
      <div className="absolute inset-0 border-16 border-yellow-400 shadow-[inset_0_0_60px_rgba(186,230,253,0.8)] bg-yellow-400/10 animate-pulse" />
    </div>
  );
};

/**
 * Variant 3: Overdrive (Blue/Cyan)
 * Cybernetic/Future speed style.
 */
const UnleashedThemeOverdrive = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
    {/* Speed lines */}
    <div className="absolute inset-0 opacity-50 mix-blend-hard-light bg-[repeating-conic-gradient(from_0deg_at_50%_50%,transparent_0deg_8deg,#06b6d4_8deg_10deg,transparent_10deg_20deg,#3b82f6_20deg_22deg,transparent_22deg_32deg,#8b5cf6_32deg_33deg)] mask-[radial-gradient(circle,transparent_20%,black_100%)]" />

    {/* Glowing border & Pulse overlay */}
    <div className="absolute inset-0 border-8 border-cyan-400 shadow-[inset_0_0_80px_rgba(34,211,238,0.8)] bg-cyan-900/10 animate-pulse" />

    {/* Color Overlay */}
    <div className="absolute inset-0 bg-linear-to-br from-cyan-500/20 via-transparent to-purple-600/20 mix-blend-overlay" />
  </div>
);

/**
 * Variant 4: Manga (Black & White)
 * Classic Japanese manga style speed lines with random thickness.
 */
const UnleashedThemeManga = () => {
  // Generate random manga speed lines on mount
  const gradient = useMemo(() => {
    let currentDeg = 0;
    const stops: string[] = [];
    let isBlack = true;

    while (currentDeg < 360) {
      // Random width: 0.2deg to 4deg for black lines, 0.5deg to 6deg for gaps
      const width = isBlack
        ? Math.random() * 3.8 + 0.2 // eslint-disable-line
        : Math.random() * 5.5 + 0.5; // eslint-disable-line

      const nextDeg = Math.min(currentDeg + width, 360);
      const color = isBlack ? '#000' : 'transparent';

      stops.push(
        `${color} ${currentDeg.toFixed(2)}deg ${nextDeg.toFixed(2)}deg`,
      );

      currentDeg = nextDeg;
      isBlack = !isBlack;
    }

    return `conic-gradient(from 0deg at 50% 50%, ${stops.join(', ')})`;
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden mix-blend-hard-light">
      {/* Speed lines: Black and White high contrast */}
      <div
        className="absolute inset-0 opacity-90 mask-[radial-gradient(circle,transparent_20%,black_100%)]"
        style={{ background: gradient }}
      />
    </div>
  );
};

/**
 * Variant 5: Sonic (Blue & White)
 * High speed movement in the sky. Vertical speed lines.
 */
const UnleashedThemeSonic = () => {
  const gradient = useMemo(() => {
    let currentPercent = 0;
    const stops: string[] = [];

    while (currentPercent < 100) {
      // Random width: 0.5% to 3%
      const width = Math.random() * 2.5 + 0.5; // eslint-disable-line
      const nextPercent = Math.min(currentPercent + width, 100);

      // Random color: Blue, Sky Blue, White, or Transparent
      const rand = Math.random(); // eslint-disable-line
      let color = 'transparent';
      if (rand < 0.3)
        color = '#3b82f6'; // Blue
      else if (rand < 0.6)
        color = '#0ea5e9'; // Sky Blue
      else if (rand < 0.8)
        color = '#ffffff'; // White
      else color = 'transparent'; // Gap

      stops.push(
        `${color} ${currentPercent.toFixed(2)}% ${nextPercent.toFixed(2)}%`,
      );

      currentPercent = nextPercent;
    }

    return `linear-gradient(90deg, ${stops.join(', ')})`;
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Vertical Speed Lines */}
      <div
        className="absolute inset-0 opacity-50 mix-blend-hard-light"
        style={{ background: gradient }}
      />

      {/* Background Gradient (Sky) */}
      <div className="absolute inset-0 bg-linear-to-b from-blue-400/20 via-cyan-300/20 to-white/20 mix-blend-overlay" />

      {/* Glowing border (Blue/Cyan) */}
      <div className="absolute inset-0 border-16 border-blue-500 shadow-[inset_0_0_60px_rgba(59,130,246,0.8)] bg-blue-500/10 animate-pulse" />
    </div>
  );
};
