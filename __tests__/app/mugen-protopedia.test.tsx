import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Integration test: render the real MugenProtoPedia and exercise the actual
// fetch wiring (button -> hook -> data fetcher) plus the playlist playback loop
// (timer effect -> playlist fetch). The data layer and navigation are mocked;
// usePrototypeSlots and usePrototypeFetching run for real.

const h = vi.hoisted(() => ({
  getRandomPrototype: vi.fn(),
  fetchPlaylistPrototype: vi.fn(),
  getLatestPrototypeById: vi.fn(),
  routerReplace: vi.fn(),
  directLaunch: {
    current: { type: 'success', value: { ids: [] } } as unknown,
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: h.routerReplace, push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(''),
  usePathname: () => '/',
}));
vi.mock('@/hooks/use-direct-launch', () => ({
  useDirectLaunch: () => h.directLaunch.current,
}));
vi.mock('@/lib/hooks/use-random-prototype', () => ({
  useRandomPrototype: () => ({ getRandomPrototype: h.getRandomPrototype }),
}));
vi.mock('@/lib/hooks/use-playlist-prototype', () => ({
  usePlaylistPrototype: () => ({ fetchPrototype: h.fetchPlaylistPrototype }),
}));
vi.mock('@/lib/fetcher/get-latest-prototype-by-id', () => ({
  getLatestPrototypeById: h.getLatestPrototypeById,
}));
vi.mock('@/lib/hooks/use-max-prototype-id', () => ({
  useMaxPrototypeId: () => 7777,
}));
vi.mock('@/components/analysis-dashboard-container', () => ({
  AnalysisDashboardContainer: () => null,
}));

import { MugenProtoPedia } from '@/app/mugen-protopedia';

// jsdom lacks matchMedia (used by the theme toggle in the header).
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});

describe('MugenProtoPedia fetch wiring (integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.directLaunch.current = { type: 'success', value: { ids: [] } };
    h.getRandomPrototype.mockResolvedValue(null);
    h.getLatestPrototypeById.mockResolvedValue(null);
    h.fetchPlaylistPrototype.mockResolvedValue(null);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('wires the random button to the random fetcher', async () => {
    render(<MugenProtoPedia />);

    fireEvent.click(screen.getByRole('button', { name: 'Prototype' }));

    await waitFor(() => expect(h.getRandomPrototype).toHaveBeenCalledTimes(1));
  });

  it('wires the SHOW control to a fetch by the entered id', async () => {
    render(<MugenProtoPedia />);

    // The id input lives in the collapsed "More" sub-panel.
    fireEvent.click(screen.getByRole('button', { name: /more/i }));
    fireEvent.change(screen.getByPlaceholderText('ID'), {
      target: { value: '123' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Show Prototype with specified ID' }),
    );

    await waitFor(() =>
      expect(h.getLatestPrototypeById).toHaveBeenCalledWith(123),
    );
  });

  it('drives the playlist playback loop through the playlist fetcher', async () => {
    vi.useFakeTimers();
    h.directLaunch.current = {
      type: 'success',
      value: { ids: [11, 22], title: 'T' },
    };

    render(<MugenProtoPedia />);

    // First item is dispatched on the initial 0ms tick.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(h.fetchPlaylistPrototype).toHaveBeenCalledWith(11);

    // The next item follows after the inter-fetch interval.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(h.fetchPlaylistPrototype).toHaveBeenCalledWith(22);
  });
});
