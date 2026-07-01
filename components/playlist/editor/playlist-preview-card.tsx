import React, { useMemo } from 'react';

import useSWR from 'swr';

import { getPrototypeNames } from '@/app/actions/prototypes-gateway';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export type PlaylistPreviewCardProps = {
  effectiveIds: number[];
};

export function PlaylistPreviewCard({
  effectiveIds,
}: PlaylistPreviewCardProps) {
  // Deduplicate and sort so the SWR cache key is canonical: playlists with the
  // same set of ids (regardless of order or duplicates) share one cache entry.
  // The table below still renders `effectiveIds` verbatim (order + duplicates).
  const uniqueIds = useMemo(
    () => Array.from(new Set(effectiveIds)).sort((a, b) => a - b),
    [effectiveIds],
  );

  // Conditional fetch: a `null` key skips the request when there are no ids,
  // matching the previous empty-map behaviour. SWR deep-compares the array key,
  // so an unchanged id set is served from cache instead of refetching.
  const { data: namesById, isLoading } = useSWR(
    uniqueIds.length > 0 ? (['prototypeNames', uniqueIds] as const) : null,
    ([, ids]) => getPrototypeNames(ids),
  );

  return (
    <Card className="w-full py-4 border-4">
      <CardHeader>
        <CardTitle>Prototypes in playlist</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
        {/*
          Let the prototype-name column absorb all slack via `w-full`
          (width: 100%) while the table keeps its auto layout. The name column
          then always claims the remaining width, so the ID column sizes only to
          its own (constant) content and no longer changes between "loading..."
          and the loaded names. This removes the layout shift without hardcoding
          the ID column width.
        */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead>
                <span className="sm:hidden">ID</span>
                <span className="hidden sm:inline">Prototype ID</span>
              </TableHead>
              <TableHead className="w-full">Prototype name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {effectiveIds.map((id, index) => (
              <TableRow key={`${id}-${index}`}>
                <TableCell className="text-center text-xs text-muted-foreground">
                  {index + 1}
                </TableCell>
                <TableCell className="font-mono text-xs text-right">
                  {id}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground break-all whitespace-normal">
                  {namesById?.[id] ?? (isLoading ? '' : '(unknown)')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
