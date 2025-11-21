import React from 'react';
import { Info } from 'lucide-react';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type PrototypeErrorLinkProps = {
  expectedPrototypeId: number;
};

export const PrototypeErrorLink = ({
  expectedPrototypeId,
}: PrototypeErrorLinkProps) => {
  return (
    <div className="flex items-center gap-2 animate-bounce hover:animate-none">
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 cursor-help" />
        </TooltipTrigger>
        <TooltipContent>
          <p>ProtoPedia にはページが存在する可能性があります</p>
        </TooltipContent>
      </Tooltip>
      <a
        href={`https://protopedia.net/prototype/${expectedPrototypeId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-xl font-semibold text-blue-600 hover:underline truncate"
        title={`Open prototype ${expectedPrototypeId} in ProtoPedia`}
      >
        Check on ProtoPedia
      </a>
    </div>
  );
};
