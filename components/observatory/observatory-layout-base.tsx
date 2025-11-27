import React from 'react';

interface ObservatoryLayoutBaseProps {
  children: React.ReactNode;
}

export function ObservatoryLayoutBase({
  children,
}: ObservatoryLayoutBaseProps) {
  return (
    <div className="min-h-screen transition-colors duration-200 flex flex-col relative">
      <div className="relative z-10 flex flex-col flex-1">
        <div className="pt-[calc(env(safe-area-inset-top)+64px)] flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
