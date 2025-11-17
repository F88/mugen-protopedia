import { renderHook } from '@testing-library/react';
import { useDirectLaunch } from '@/hooks/use-direct-launch';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { MockedFunction } from 'vitest';
import { useSearchParams } from 'next/navigation';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
}));

const mockedUseSearchParams = useSearchParams as MockedFunction<
  typeof useSearchParams
>;

const toReadonlyParams = (params: URLSearchParams) =>
  params as unknown as ReturnType<typeof useSearchParams>;

const expectSuccess = (result: ReturnType<typeof useDirectLaunch>) => {
  expect(result.type).toBe('success');

  if (result.type !== 'success') {
    throw new Error('Expected success result');
  }

  return result.value;
};

const expectFailure = (result: ReturnType<typeof useDirectLaunch>) => {
  expect(result.type).toBe('failure');

  if (result.type !== 'failure') {
    throw new Error('Expected failure result');
  }

  return result.error;
};

describe('useDirectLaunch', () => {
  beforeEach(() => {
    mockedUseSearchParams.mockReset();
  });

  it('should return ids and title from search params', () => {
    const params = new URLSearchParams('id=1,2,3&title=My%20Playlist');
    mockedUseSearchParams.mockReturnValue(toReadonlyParams(params));

    const { result } = renderHook(() => useDirectLaunch());

    const value = expectSuccess(result.current);

    expect(value.ids).toEqual([1, 2, 3]);
    expect(value.title).toBe('My Playlist');
  });

  it('should return empty array for ids when id param is missing', () => {
    const params = new URLSearchParams('title=No%20IDs');
    mockedUseSearchParams.mockReturnValue(toReadonlyParams(params));

    const { result } = renderHook(() => useDirectLaunch());

    const value = expectSuccess(result.current);

    expect(value.ids).toEqual([]);
    expect(value.title).toBe('No IDs');
  });

  it('should return null for title when title param is missing', () => {
    const params = new URLSearchParams('id=10,20');
    mockedUseSearchParams.mockReturnValue(toReadonlyParams(params));

    const { result } = renderHook(() => useDirectLaunch());

    const value = expectSuccess(result.current);

    expect(value.ids).toEqual([10, 20]);
    expect(value.title).toBeUndefined();
  });

  it('should handle invalid id params gracefully', () => {
    const params = new URLSearchParams('id=a,b,c');
    mockedUseSearchParams.mockReturnValue(toReadonlyParams(params));

    const { result } = renderHook(() => useDirectLaunch());

    const error = expectFailure(result.current);

    expect(error.errors).toContain('IDs must contain only digits and commas.');
  });

  it('should handle empty params', () => {
    const params = new URLSearchParams('');
    mockedUseSearchParams.mockReturnValue(toReadonlyParams(params));

    const { result } = renderHook(() => useDirectLaunch());

    const value = expectSuccess(result.current);

    expect(value.ids).toEqual([]);
    expect(value.title).toBeUndefined();
  });

  it('should ignore empty values when splitting ids', () => {
    const params = new URLSearchParams('id=1,,2,');
    mockedUseSearchParams.mockReturnValue(toReadonlyParams(params));

    const { result } = renderHook(() => useDirectLaunch());

    const value = expectSuccess(result.current);

    expect(value.ids).toEqual([1, 2]);
  });

  it('should handle mixed valid and invalid ids', () => {
    const params = new URLSearchParams('id=5,abc,9,NaN,12');
    mockedUseSearchParams.mockReturnValue(toReadonlyParams(params));

    const { result } = renderHook(() => useDirectLaunch());

    const error = expectFailure(result.current);

    expect(error.errors).toContain('IDs must contain only digits and commas.');
  });

  it('should keep title when ids are invalid', () => {
    const params = new URLSearchParams('id=a,b&title=Still%20There');
    mockedUseSearchParams.mockReturnValue(toReadonlyParams(params));

    const { result } = renderHook(() => useDirectLaunch());

    const error = expectFailure(result.current);

    expect(error.errors).toContain('IDs must contain only digits and commas.');
  });
});
