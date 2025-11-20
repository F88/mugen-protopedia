import React from 'react';

import { CircleCheck, CircleHelp, CircleX } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export type CardState = 'invalid' | 'valid' | 'neutral';

export type StatusCardProps = {
  state: CardState;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
};

export function StatusCard({
  title,
  state,
  description,
  children,
}: StatusCardProps) {
  const cardClassName =
    state === 'invalid'
      ? 'w-full p-4 border-4 !border-red-500/70 bg-red-800/10'
      : state === 'valid'
        ? 'w-full p-4 border-4 !border-emerald-500/70 bg-emerald-800/10'
        : 'w-full p-4 border-4 border-border';

  return (
    <Card className={cardClassName}>
      <CardHeader className="flex items-start justify-between gap-2">
        <div>
          <CardTitle>{title}</CardTitle>
          {description}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {state === 'invalid' && (
            <CircleX className="h-8 w-8 text-red-500" aria-hidden="true" />
          )}
          {state === 'valid' && (
            <CircleCheck
              className="h-8 w-8 text-emerald-500"
              aria-hidden="true"
            />
          )}
          {state === 'neutral' && (
            <CircleHelp className="h-8 w-8 text-slate-400" aria-hidden="true" />
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">{children}</CardContent>
    </Card>
  );
}
