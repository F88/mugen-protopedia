import { useEffect, useState } from 'react';

import { getPrototypeNamesFromStore } from '@/app/actions/prototypes';

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
  const [namesById, setNamesById] = useState<Record<number, string>>({});

  useEffect(() => {
    const uniqueIds = Array.from(new Set(effectiveIds));
    let isCancelled = false;

    const resolveNames = async () => {
      if (uniqueIds.length === 0) {
        if (!isCancelled) {
          setNamesById({});
        }
        return;
      }

      try {
        const names = await getPrototypeNamesFromStore(uniqueIds);
        if (!isCancelled) {
          setNamesById(names);
        }
      } catch {
        if (!isCancelled) {
          setNamesById({});
        }
      }
    };

    void resolveNames();

    return () => {
      isCancelled = true;
    };
  }, [effectiveIds]);

  return (
    <Card className="w-full p-4 border-4">
      <CardHeader>
        <CardTitle>Prototypes in playlist</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead>Prototype ID</TableHead>
              <TableHead>Prototype name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {effectiveIds.map((id, index) => (
              <TableRow key={`${id}-${index}`}>
                <TableCell className="text-center text-xs text-muted-foreground">
                  {index + 1}
                </TableCell>
                <TableCell className="font-mono text-xs">{id}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {namesById[id] ?? 'unknown (cache not available)'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
