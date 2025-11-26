import React from 'react';
import { ObservatoryLayoutBase } from '@/components/observatory/ObservatoryLayoutBase';

export default function HelloWorldLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerClassName =
    'bg-green-600/80 dark:bg-green-900/60 backdrop-blur-[2px]';
  return (
    <ObservatoryLayoutBase headerClassName={headerClassName}>
      {children}
    </ObservatoryLayoutBase>
  );
}
