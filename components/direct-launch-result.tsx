'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import type {
  DirectLaunchParams,
  ValidationError,
} from '@/lib/utils/validation';
import type { Result } from '@/lib/utils/result';

type DirectLaunchResultProps = {
  directLaunchResult: Result<DirectLaunchParams, ValidationError>;
  className?: string;
  successMessage?: string;
  failureMessage?: string;
};

export function DirectLaunchResult({
  directLaunchResult,
  className,
  successMessage,
  failureMessage,
}: DirectLaunchResultProps) {
  const heading = (
    <h2 className="text-center text-sm font-semibold text-gray-700 dark:text-gray-200">
      Result of direct launch
    </h2>
  );

  if (directLaunchResult.type === 'success') {
    return (
      <div className={cn('p-4 text-center', className)}>
        {heading}
        <p className="mt-2 text-center text-sm font-medium text-green-600 dark:text-green-300">
          {successMessage ?? 'Direct launch parameters validated successfully.'}
        </p>
      </div>
    );
  }

  const errors = directLaunchResult.error.errors;

  return (
    <div className={cn('p-4 text-center', className)}>
      {heading}
      <h1 className="mt-2 text-center text-2xl font-bold text-red-500 dark:text-red-300">
        Direct Launch Error
      </h1>
      {failureMessage ? (
        <p className="mt-2 text-center text-sm text-red-400 dark:text-red-200">
          {failureMessage}
        </p>
      ) : null}
      {errors.length > 0 && (
        <ul className="mt-2 list-inside list-disc space-y-1 text-center text-sm text-red-400 dark:text-red-200">
          {errors.map((msg) => (
            <li key={msg}>{msg}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
