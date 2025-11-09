'use client';

import { useState, type ChangeEvent } from 'react';

import { ChevronDown, ChevronUp, Square } from 'lucide-react';
// import { GiInvertedDice3 } from 'react-icons/gi';
import { BsFillDice3Fill } from 'react-icons/bs';
import { useKeyboardShortcuts } from '@/lib/hooks/use-keyboard-shortcuts';

import { Button } from '@/components/ui/button';

// Shared background style for main and sub panels.
// Adjust here to change both consistently.
const PANEL_BG = 'bg-white/60 dark:bg-gray-900/60';
// const PANEL_BG = 'bg-white dark:bg-gray-900';
const PANEL_BORDER = 'border border-slate-200 dark:border-gray-700';

type MainPanelProps = {
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
  return (
    <div
      className={`${PANEL_BG} p-4 flex w-fit mx-auto justify-center items-center gap-8 rounded-lg transition-colors duration-200`}
    >
      {/* Reset block */}
      <div className="flex flex-col items-center gap-1">
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
        <div className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
          <kbd className="px-1 py-0.5 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded text-xs dark:text-white">
            R
          </kbd>
        </div>
      </div>

      {/* Navigation hint block */}
      <div className="hidden sm:flex flex-col items-center justify-center gap-1">
        <div className="text-xs text-muted-foreground">Navigate</div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <kbd className="px-1 py-0.5 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded text-xs dark:text-white">
            ↑
          </kbd>
          <kbd className="px-1 py-0.5 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded text-xs dark:text-white">
            ←
          </kbd>
          <kbd className="px-1 py-0.5 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded text-xs dark:text-white">
            k
          </kbd>
          {/* <span className="mx-1">prev</span> */}
          <span className="mx-2">|</span>
          {/* <span className="mx-1">next</span> */}
          <kbd className="px-1 py-0.5 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded text-xs dark:text-white">
            j
          </kbd>
          <kbd className="px-1 py-0.5 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded text-xs dark:text-white">
            →
          </kbd>
          <kbd className="px-1 py-0.5 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded text-xs dark:text-white">
            ↓
          </kbd>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <kbd className="px-1 py-0.5 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded text-xs dark:text-white">
            o
          </kbd>
          Open in ProtoPedia
        </div>
      </div>

      {/* Get Prototype block */}
      <div className="flex flex-col items-center gap-1">
        <Button
          onClick={onGetRandomPrototype}
          className="gap-2"
          title="Battle (Enter or B)"
          aria-label="Battle"
          aria-describedby="kbd-battle-hint"
          disabled={!canFetchMorePrototypes}
        >
          {/* <GiInvertedDice3 className="h-5 w-5" /> */}
          <BsFillDice3Fill className="h-5 w-5" />
          {/* <BsFillDice3Fill className="h-6 w-6 md:h-5 md:w-5" /> */}
          {/* 🎲 */}
          PROTOTYPE
        </Button>
        <span id="kbd-prototype-hint" className="sr-only">
          Shortcut: Enter
        </span>
        <div className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
          <kbd className="px-1 py-0.5 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded text-xs dark:text-white">
            Enter
          </kbd>
        </div>
      </div>
    </div>
  );
}

type SubPanelProps = {
  prototypeIdInput: string;
  onPrototypeIdInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onGetPrototypeById: () => void;
  canFetchMorePrototypes: boolean;
  onPrototypeIdInputSet: (value: number) => void;
  maxPrototypeId: number;
};

function SubPanel({
  prototypeIdInput,
  onPrototypeIdInputChange,
  onGetPrototypeById,
  canFetchMorePrototypes,
  onPrototypeIdInputSet,
  maxPrototypeId,
}: SubPanelProps) {
  // console.debug('Max Prototype ID:', maxPrototypeId);

  return (
    <div className="flex gap-3 items-center justify-center">
      {/* DICE BUTTON */}
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
        {/* <BsFillDice3Fill className="size-7 md:size-6" /> */}
      </Button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={99999}
        value={prototypeIdInput}
        onChange={onPrototypeIdInputChange}
        className="${PANEL_BORDER} w-24 rounded p-2 text-base text-center tracking-widest bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200"
        placeholder="ID"
      />
      <Button
        onClick={onGetPrototypeById}
        className="gap-2"
        title="Show specified Prototype"
        aria-label="Show Prototype with specified ID"
        aria-describedby="kbd-battle-hint"
        disabled={!canFetchMorePrototypes}
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
  const [isSubPanelExpanded, setIsSubPanelExpanded] = useState(
    // process.env.NODE_ENV === 'development',
    false,
  );

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onGetRandomPrototype,
    onClear,
    onScrollNext,
    onScrollPrev,
    onOpenPrototype,
  });

  return (
    <div className="w-full space-y-1">
      {/* Main panel */}
      <MainPanel
        onClear={onClear}
        onGetRandomPrototype={onGetRandomPrototype}
        canFetchMorePrototypes={canFetchMorePrototypes}
        isClearDisabled={isClearDisabled}
      />

      {/* Sub Panel (Collapsible) */}
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
          <div className={`p-2 rounded transition-colors duration-200`}>
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

      {/* Prototype ID Error (Collapsible) */}
      {prototypeIdError && (
        <p className="text-sm text-red-500 dark:text-red-400 mt-2">
          {prototypeIdError}
        </p>
      )}
    </div>
  );
}
