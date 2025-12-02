'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';

export function PlaylistHeaderButton() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams?.toString() ?? '');

  const queryString = params.toString();
  const href =
    queryString.length > 0 ? `/playlist/edit?${queryString}` : '/playlist/edit';

  return (
    <Link href={href} aria-label="Open playlist editor">
      <Button
        variant="outline"
        size="icon-sm"
        className="shrink-0"
        title="Open playlist editor"
      >
        <span aria-hidden="true">📜</span>
      </Button>
    </Link>
  );
}
