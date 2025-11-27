'use client';

import { useEffect, useState, useCallback } from 'react';

// Shooting Star Animation Keyframes
const shootingStarKeyframes = `
@keyframes shoot {
  0% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateX(var(--travel-distance, 700px)) scale(0.1);
    opacity: 0;
  }
}
`;

function Star({ style }: { style: React.CSSProperties }) {
  return (
    <div
      className="absolute rounded-full bg-white animate-pulse"
      style={{
        ...style,
        boxShadow: '0 0 4px 1px rgba(255, 255, 255, 0.6)',
      }}
    />
  );
}

function ShootingStar({
  id,
  onComplete,
}: {
  id: number;
  onComplete: (id: number) => void;
}) {
  const [config] = useState(() => {
    const direction = Math.random() > 0.5 ? 'left' : 'right';
    const duration = Math.random() * 2.5 + 1.5; // 1.5s - 4.0s
    const distance = Math.random() * 1000 + 500; // 500px - 1500px

    let angle;
    let top, left;

    if (direction === 'left') {
      // Top-Right to Bottom-Left (South-West)
      // Base 135deg, +/- 15deg variance
      angle = 135 + (Math.random() * 30 - 15);
      top = Math.random() * 50;
      left = Math.random() * 40 + 60; // 60-100%
    } else {
      // Top-Left to Bottom-Right (South-East)
      // Base 45deg, +/- 15deg variance
      angle = 45 + (Math.random() * 30 - 15);
      top = Math.random() * 50;
      left = Math.random() * 40; // 0-40%
    }

    return {
      wrapperStyle: {
        top: `${top}%`,
        left: `${left}%`,
        position: 'absolute',
        transform: `rotate(${angle}deg)`,
      } as React.CSSProperties,
      starStyle: {
        width: '4px',
        height: '4px',
        background: 'white',
        borderRadius: '50%',
        boxShadow:
          '0 0 0 4px rgba(255, 255, 255, 0.1), 0 0 0 8px rgba(255, 255, 255, 0.1), 0 0 20px rgba(255, 255, 255, 1)',
        animation: `shoot ${duration}s linear forwards`,
        '--travel-distance': `${distance}px`,
      } as React.CSSProperties & { [key: string]: string },
      duration,
    };
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete(id);
    }, config.duration * 1000);

    return () => clearTimeout(timer);
  }, [id, onComplete, config.duration]);

  return (
    <div style={config.wrapperStyle}>
      <div style={config.starStyle}>
        {/* Tail of the shooting star */}
        <div
          className="absolute top-1/2 right-0 w-[150px] h-0.5 bg-linear-to-r from-transparent to-white origin-right"
          style={{
            transform: 'translateY(-50%)',
          }}
        />
      </div>
    </div>
  );
}

export function UniverseBackground() {
  const [stars, setStars] = useState<
    Array<{ id: number; style: React.CSSProperties }>
  >([]);
  const [shootingStars, setShootingStars] = useState<Array<number>>([]);

  useEffect(() => {
    // Generate stars on client side
    // Using setTimeout to avoid "setState synchronously within an effect" warning
    const timer = setTimeout(() => {
      const newStars = Array.from({ length: 70 }).map((_, i) => ({
        id: i,
        style: {
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          width: `${Math.random() * 3 + 1}px`,
          height: `${Math.random() * 3 + 1}px`,
          opacity: Math.random() * 0.7 + 0.3,
          animationDuration: `${Math.random() * 3 + 2}s`,
          animationDelay: `${Math.random() * 5}s`,
        } as React.CSSProperties,
      }));
      setStars(newStars);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Shooting star generator
    // Check every 1 second, 20% chance to spawn a star
    const interval = setInterval(() => {
      if (Math.random() < 0.2) {
        setShootingStars((prev) => [...prev, Date.now() + Math.random()]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleShootingStarComplete = useCallback((id: number) => {
    setShootingStars((prev) => prev.filter((sId) => sId !== id));
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <style>{shootingStarKeyframes}</style>

      {/* Dark Mode: Deep Space */}
      <div className="absolute inset-0 bg-[#020205] dark:opacity-100 opacity-0 transition-opacity duration-700">
        {/* Subtle Gradient */}
        <div className="absolute inset-0 bg-linear-to-b from-indigo-950/10 via-transparent to-purple-950/10" />

        {/* Stars */}
        {stars.map((star) => (
          <Star key={star.id} style={star.style} />
        ))}

        {/* Shooting Stars */}
        {shootingStars.map((id) => (
          <ShootingStar
            key={id}
            id={id}
            onComplete={handleShootingStarComplete}
          />
        ))}
      </div>

      {/* Light Mode: Stratosphere (darker) */}
      <div className="absolute inset-0 bg-linear-to-b from-blue-500 via-blue-200 to-blue-50 dark:opacity-0 opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 bg-linear-to-tr from-blue-500/40 via-transparent to-purple-400/40" />
      </div>
    </div>
  );
}
