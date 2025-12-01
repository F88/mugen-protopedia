import React from 'react';

import { ObservatoryLayoutBase } from './components/observatory-layout-base';

export default function ObservatoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ObservatoryLayoutBase>{children}</ObservatoryLayoutBase>;
}
