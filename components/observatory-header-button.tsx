'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';

export function ObservatoryHeaderButton() {
  return (
    <Link href="/observatory" aria-label="Go to Observatory">
      <Button
        variant="outline"
        size="icon-sm"
        className="shrink-0"
        title="Go to Observatory"
      >
        <span aria-hidden="true">🔭</span>
        {/* <span aria-hidden="true">🗺️</span> */}
        {/* <span aria-hidden="true">🧭️</span> */}
        {/* <span aria-hidden="true">🌌</span> */}
      </Button>
    </Link>
  );
}
