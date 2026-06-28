'use client';

import type { Route } from 'next';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

interface MugenProtoPediaHomeButtonProps {
  link?: Route;
}

export function MugenProtoPediaHomeButton({
  link = '/',
}: MugenProtoPediaHomeButtonProps) {
  return (
    <Link href={link} aria-label="Go to MUGEN ProtoPedia Home">
      <Button
        variant="outline"
        size="icon-sm"
        className="shrink-0"
        title="Go to MUGEN ProtoPedia Home"
      >
        <span aria-hidden="true">♾️</span>
      </Button>
    </Link>
  );
}
