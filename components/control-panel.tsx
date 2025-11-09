'use client';

import { useState, type ChangeEvent, type ReactNode } from 'react';

import { ChevronDown, ChevronUp, Square } from 'lucide-react';
import { BsFillDice3Fill } from 'react-icons/bs';
import { useKeyboardShortcuts } from '@/lib/hooks/use-keyboard-shortcuts';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Shared styles
const PANEL_BG = 'bg-white/60 dark:bg-gray-900/60';
const PANEL_BORDER = 'border border-slate-200 dark:border-gray-700';
// Reusable class tokens
const KBD_CLASS =
  'px-1 py-0.5 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded text-xs dark:text-white';
const KBD_ROW_CLASS =
  'hidden items-center gap-1 text-xs text-muted-foreground sm:flex';
const MUTED_XS = 'text-xs text-muted-foreground';

function Kbd({ children }: { children: ReactNode }) {
  return <kbd className={KBD_CLASS}>{children}</kbd>;
}

// Main (top) panel
export type MainPanelProps = {
  onClear: () => void;
  onGetRandomPrototype: () => void;
  canFetchMorePrototypes: boolean;
  isClearDisabled?: boolean;
};

function MainPanel({
  onClear,
  onGetRandomPrototype,
  canFetchMorePrototypes,
  isClearDisabled,
}: MainPanelProps) {
  const navigationHintContent = (
    <>
      <div className={MUTED_XS}>Navigate</div>
      <div className={cn('flex items-center gap-1', MUTED_XS)}>
        <Kbd>↑</Kbd>
        <Kbd>←</Kbd>
        <Kbd>k</Kbd>
        <span className="mx-2">|</span>
        <Kbd>j</Kbd>
        <Kbd>→</Kbd>
        <Kbd>↓</Kbd>
      </div>
      <div className={cn('flex items-center gap-1', MUTED_XS)}>
        <Kbd>o</Kbd>
        Open in ProtoPedia
      </div>
    </>
  );

  return (
    // Responsive layout spec:
    // - Small screens (default):
    //   * Container spans full width (w-full)
    //   * Left block aligns left, right block aligns right
    //   * Middle column shrinks to minimal width via auto track
    //   * Navigation hint is hidden; 1px placeholder keeps 3-column grid
    // - Wide screens (sm+):
    //   * Container fits content width (sm:w-fit) and is horizontally centered (mx-auto)
    //   * Left block aligns right, right block aligns left to balance the row
    //   * Middle column stays minimal width (auto)
    //   * Navigation hint becomes visible in the middle
    <div
      className={`grid grid-cols-[1fr_auto_1fr] sm:grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 w-full sm:w-fit mx-auto ${PANEL_BG} p-2 rounded-lg transition-colors duration-200`}
    >
      {/* Reset block (left)
      - Narrow: items-start -> left aligned
      - Wide  : sm:items-end -> right aligned
      - Hint ("R") stays centered under the button */}
      <div className="w-full flex flex-col items-start sm:items-end gap-1 justify-self-start">
        <div className="flex flex-col items-center w-fit">
          <Button
            variant="destructive"
            onClick={onClear}
            className="gap-2"
            title="Reset (R)"
            aria-label="Reset"
            disabled={isClearDisabled}
          >
            <Square className="h-4 w-4" />
            RESET
          </Button>
          <span id="kbd-reset-hint" className="sr-only">
            Shortcut: Reset
          </span>
          <div className={KBD_ROW_CLASS}>
            <Kbd>R</Kbd>
          </div>
        </div>
      </div>

      {/* Navigation hint block (center)
      - Column width is minimal (auto) at all breakpoints
      - Narrow: content hidden, 1px placeholder keeps 3 columns
      - Wide  : content visible */}
      <div className="flex flex-col items-center justify-center">
        <div className="hidden sm:flex flex-col items-center justify-center gap-1">
          {navigationHintContent}
        </div>
        {/* Minimal placeholder (1px) on narrow screens */}
        <div className="sm:hidden w-px h-px" aria-hidden="true" />
      </div>

      {/* Get Prototype block (right)
      - Narrow: items-end -> right aligned
      - Wide  : sm:items-start -> left aligned
      - Hint ("Enter") stays centered under the button */}
      <div className="w-full flex flex-col items-end sm:items-start gap-1 justify-self-end">
        <div className="flex flex-col items-center w-fit">
          <Button
            onClick={onGetRandomPrototype}
            className="gap-2"
            title="Battle (Enter or B)"
            aria-label="Battle"
            aria-describedby="kbd-prototype-hint"
            disabled={!canFetchMorePrototypes}
          >
            <BsFillDice3Fill className="h-5 w-5" />
            PROTOTYPE
          </Button>
          <span id="kbd-prototype-hint" className="sr-only">
            Shortcut: Enter
          </span>
          <div className={KBD_ROW_CLASS}>
            <Kbd>Enter</Kbd>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub panel (collapsible) below main panel
export type SubPanelProps = {
  prototypeIdInput: string;
  onPrototypeIdInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onPrototypeIdInputSet: (value: number) => void;
  onGetPrototypeById: () => void;
  canFetchMorePrototypes: boolean;
  maxPrototypeId: number;
};

function SubPanel({
  prototypeIdInput,
  onPrototypeIdInputChange,
  onPrototypeIdInputSet,
  onGetPrototypeById,
  canFetchMorePrototypes,
  maxPrototypeId,
}: SubPanelProps) {
  return (
    <div className="flex gap-3 items-center justify-center">
      {/* Random fill button */}
      <Button
        type="button"
        variant="ghost"
        onClick={() => {
          const randomId = Math.floor(Math.random() * maxPrototypeId) + 1;
          onPrototypeIdInputSet(randomId);
        }}
        className="gap-2 h-auto"
        title="Fill with random prototype ID"
        aria-label="Fill input with random prototype ID"
      >
        <BsFillDice3Fill className="size-6" />
      </Button>

      {/* Prototype ID input */}
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={99999}
        value={prototypeIdInput}
        onChange={onPrototypeIdInputChange}
        className={`${PANEL_BORDER} w-24 rounded p-2 text-base text-center tracking-widest bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200`}
        placeholder="ID"
      />

      {/* Show button */}
      <Button
        onClick={onGetPrototypeById}
        className="gap-2"
        title="Show specified Prototype"
        aria-label="Show Prototype with specified ID"
        disabled={prototypeIdInput === '' || !canFetchMorePrototypes}
      >
        SHOW
      </Button>
    </div>
  );
}

export type ControlPanelProps = {
  prototypeIdInput: string;
  onPrototypeIdInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onPrototypeIdInputSet: (value: number) => void;
  onGetPrototypeById: () => void;
  onGetRandomPrototype: () => void;
  onClear: () => void;
  canFetchMorePrototypes: boolean;
  prototypeIdError: string | null;
  isClearDisabled?: boolean;
  maxPrototypeId: number;
  // Keyboard shortcuts
  onScrollNext: () => void;
  onScrollPrev: () => void;
  onOpenPrototype: () => void;
};

export function ControlPanel({
  prototypeIdInput,
  onPrototypeIdInputChange,
  onPrototypeIdInputSet,
  onGetPrototypeById,
  onGetRandomPrototype,
  onClear,
  canFetchMorePrototypes,
  prototypeIdError,
  isClearDisabled,
  onScrollNext,
  onScrollPrev,
  onOpenPrototype,
  maxPrototypeId,
}: ControlPanelProps) {
  const [isSubPanelExpanded, setIsSubPanelExpanded] = useState(false);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onGetRandomPrototype,
    onClear,
    onScrollNext,
    onScrollPrev,
    onOpenPrototype,
  });

  return (
    <div className="space-y-1">
      <MainPanel
        onClear={onClear}
        onGetRandomPrototype={onGetRandomPrototype}
        canFetchMorePrototypes={canFetchMorePrototypes}
        isClearDisabled={isClearDisabled}
      />

      {/* Collapsible sub panel */}
      <div
        className={`${PANEL_BG} ${PANEL_BORDER} p-2 px-4 w-fit mx-auto rounded-lg transition-all duration-200`}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsSubPanelExpanded(!isSubPanelExpanded)}
          className="flex items-center justify-center gap-1 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 transition-colors w-full h-6 py-0 px-2"
        >
          {isSubPanelExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          More
        </Button>
        {isSubPanelExpanded && (
          <div className="p-2 rounded transition-colors duration-200">
            <SubPanel
              prototypeIdInput={prototypeIdInput}
              onPrototypeIdInputChange={onPrototypeIdInputChange}
              onGetPrototypeById={onGetPrototypeById}
              canFetchMorePrototypes={canFetchMorePrototypes}
              onPrototypeIdInputSet={onPrototypeIdInputSet}
              maxPrototypeId={maxPrototypeId}
            />
          </div>
        )}
      </div>

      {/* {prototypeIdError && (
        <p className="text-sm text-red-500 dark:text-red-400 mt-2">
          {prototypeIdError}
        </p>
      )} */}
    </div>
  );
}
