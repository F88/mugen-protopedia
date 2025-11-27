import React from 'react';

export type BarProps = {
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
};

export const Bar = ({ style, className, children }: BarProps) => (
  <div style={style} className={className}>
    {children}
  </div>
);
