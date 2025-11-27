import React from 'react';

import { ObservatoryLayoutBase } from '@/components/observatory/ObservatoryLayoutBase';

export default function HelloWorldLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ObservatoryLayoutBase>{children}</ObservatoryLayoutBase>;
}
