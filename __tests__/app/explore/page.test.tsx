import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ExplorePage from '@/app/explore/page';

describe('ExplorePage', () => {
  it('renders the main heading', () => {
    render(<ExplorePage />);
    expect(
      screen.getByRole('heading', {
        name: /explore the protopedia universe/i,
        level: 1,
      }),
    ).toBeDefined();
  });

  it('renders the Hello World feature card', () => {
    render(<ExplorePage />);
    expect(
      screen.getByRole('heading', { name: /hello world/i, level: 2 }),
    ).toBeDefined();
    expect(
      screen.getByText(/witness the birth of new prototypes/i),
    ).toBeDefined();
    expect(screen.getByRole('link', { name: /hello world/i })).toBeDefined();
  });

  it('renders the Hall of Fame placeholder', () => {
    render(<ExplorePage />);
    expect(
      screen.getByRole('heading', { name: /hall of fame/i, level: 2 }),
    ).toBeDefined();
    expect(screen.getByText(/coming soon/i)).toBeDefined();
  });
});
