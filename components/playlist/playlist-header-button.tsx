import Link from 'next/link';

import { Button } from '@/components/ui/button';

export function PlaylistHeaderButton() {
  return (
    <Link href="/playlist/edit/" aria-label="Open playlist editor">
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
