import React from 'react';

import { CircleCheck, Info, CircleX } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export type CardState = 'invalid' | 'valid' | 'neutral';

export type StatusCardProps = {
  state: CardState;
  title: string;
  description?: React.ReactNode;
  helpText?: string;
  children: React.ReactNode;
};

export function StatusCard({
  title,
  state,
  description,
  helpText,
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
          {state === 'neutral' && helpText && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-slate-400"
                  aria-label={helpText}
                >
                  <Info className="h-8 w-8" aria-hidden="true" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="left"
                className="max-w-xs text-left whitespace-pre-line"
              >
                {helpText}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">{children}</CardContent>
    </Card>
  );
}
