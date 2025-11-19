'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import type { ValidationError } from '@/lib/validation/validation';
import type { Result } from '@/lib/utils/result';
import type { DirectLaunchParams } from '@/schemas/direct-launch';

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
  if (directLaunchResult.type === 'success') {
    return (
      <div className={cn('p-4 text-center', className)}>
        <p className="mt-2 text-center text-sm font-medium text-green-600 dark:text-green-300">
          {successMessage ?? 'Direct launch parameters validated successfully.'}
        </p>
      </div>
    );
  }

  const errors = directLaunchResult.error.errors;

  return (
    <div className={cn('p-4 text-center', className)}>
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
