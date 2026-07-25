import React, { useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';

const HIGHLIGHT_WRAPPER_CLASS =
  'flex flex-col gap-2 rounded-md border border-transparent transition-all duration-300';
const HIGHLIGHT_ACTIVE_CLASS =
  'border-border shadow-[0_0_0_3px_rgba(37,99,235,0.9)]';

/**
 * Shared presentation for one shareable playlist page: its document
 * title, its URL, optional extra controls, and Copy/Open actions.
 * The copy status is local to the panel, so each page's Copy button
 * reports independently.
 */
export function TargetPagePanel({
  pageTitle,
  url,
  highlighted,
  testIds,
  children,
}: {
  pageTitle: string;
  url: string;
  highlighted: { title: boolean; url: boolean };
  testIds: { title: string; url: string };
  /** Extra controls rendered between the URL and the action buttons. */
  children?: React.ReactNode;
}) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'ok' | 'fail'>('idle');

  const handleCopy = useCallback(async () => {
    if (url.length === 0) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopyStatus('ok');
    } catch {
      // Swallow clipboard error; status already reflects failure
      setCopyStatus('fail');
    }
    // Reset status after a delay. The catch above swallows all errors, so
    // this always runs on both the success and failure paths while avoiding
    // try/finally, which the React Compiler cannot optimize.
    setTimeout(() => setCopyStatus('idle'), 2500);
  }, [url]);

  return (
    <div className="flex flex-col gap-3">
      {pageTitle.length > 0 && (
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-medium">Title of page</h3>
          <div
            className={`${HIGHLIGHT_WRAPPER_CLASS} ${
              highlighted.title ? HIGHLIGHT_ACTIVE_CLASS : ''
            }`}
          >
            <code
              className="rounded bg-muted px-3 py-2 text-sm md:text-base break-all"
              data-test-id={testIds.title}
            >
              {pageTitle}
            </code>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium">URL</h3>
        <div
          className={`${HIGHLIGHT_WRAPPER_CLASS} ${
            highlighted.url ? HIGHLIGHT_ACTIVE_CLASS : ''
          }`}
        >
          <code
            className="rounded bg-muted px-3 py-2 text-sm md:text-base break-all"
            data-test-id={testIds.url}
          >
            {url}
          </code>
        </div>
      </div>

      {children}

      <div className="flex items-center gap-3">
        <Button type="button" onClick={handleCopy} disabled={url.length === 0}>
          Copy
        </Button>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
        >
          Open
        </a>
        {copyStatus === 'ok' && (
          <span className="text-xs text-green-600 dark:text-green-400">
            Copied!
          </span>
        )}
        {copyStatus === 'fail' && (
          <span className="text-xs text-red-600 dark:text-red-400">
            Copy failed
          </span>
        )}
      </div>
    </div>
  );
}
