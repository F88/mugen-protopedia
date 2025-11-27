import React from 'react';

import { ObservatoryLayoutBase } from '@/components/observatory/ObservatoryLayoutBase';

export default function ObservatoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ObservatoryLayoutBase>{children}</ObservatoryLayoutBase>;
}
