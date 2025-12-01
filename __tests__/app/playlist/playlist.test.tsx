import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Playlist } from '@/app/playlist/[title]/[ids]/playlist';
import { useRouter } from 'next/navigation';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock PlaylistPreviewCard to avoid complex dependencies
vi.mock('@/components/playlist/editor/playlist-preview-card', () => ({
  PlaylistPreviewCard: () => (
    <div data-testid="playlist-preview-card">Preview Card</div>
  ),
}));

describe('Playlist Component', () => {
  const mockPush = vi.fn();
  const defaultProps = {
    title: 'My Playlist',
    ids: [1, 2, 3],
    extraParams: 'foo=bar',
    shouldAutoplay: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush,
    });
  });

  it('renders correctly when shouldAutoplay is false', () => {
    render(<Playlist {...defaultProps} />);

    expect(screen.getByText('My Playlist')).toBeInTheDocument();
    expect(screen.getByText('3 prototypes')).toBeInTheDocument();
    expect(screen.getByTestId('playlist-preview-card')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /start playlist/i }),
    ).toBeInTheDocument();
  });

  it('does not render UI when shouldAutoplay is true', () => {
    const { container } = render(
      <Playlist {...defaultProps} shouldAutoplay={true} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('auto-redirects when shouldAutoplay is true', () => {
    render(<Playlist {...defaultProps} shouldAutoplay={true} />);

    const expectedDestination = '/?foo=bar&title=My+Playlist&id=1%2C2%2C3';
    expect(mockPush).toHaveBeenCalledWith(expectedDestination);
  });

  it('navigates to the correct destination when Play button is clicked', () => {
    render(<Playlist {...defaultProps} />);

    const button = screen.getByRole('button', { name: /start playlist/i });
    fireEvent.click(button);

    const expectedDestination = '/?foo=bar&title=My+Playlist&id=1%2C2%2C3';
    expect(mockPush).toHaveBeenCalledWith(expectedDestination);
  });

  it('constructs destination URL correctly with empty extraParams', () => {
    render(<Playlist {...defaultProps} extraParams="" />);

    const button = screen.getByRole('button', { name: /start playlist/i });
    fireEvent.click(button);

    const expectedDestination = '/?title=My+Playlist&id=1%2C2%2C3';
    expect(mockPush).toHaveBeenCalledWith(expectedDestination);
  });
});
