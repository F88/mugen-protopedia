import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ControlPanel } from '@/components/control-panel';
import type { ControlPanelProps } from '@/components/control-panel';

// Mock useKeyboardShortcuts
vi.mock('@/lib/hooks/use-keyboard-shortcuts', () => ({
  useKeyboardShortcuts: vi.fn(),
}));

describe('ControlPanel', () => {
  const defaultProps: ControlPanelProps = {
    prototypeIdInput: '',
    onPrototypeIdInputChange: vi.fn(),
    onPrototypeIdInputSet: vi.fn(),
    onGetPrototypeById: vi.fn(),
    onGetRandomPrototype: vi.fn(),
    onClear: vi.fn(),
    canFetchMorePrototypes: true,
    prototypeIdError: null,
    maxPrototypeId: 100,
    onScrollNext: vi.fn(),
    onScrollPrev: vi.fn(),
    onOpenPrototype: vi.fn(),
    controlPanelMode: 'normal',
  };

  describe('Normal Mode', () => {
    it('renders correctly', () => {
      render(<ControlPanel {...defaultProps} />);
      expect(
        screen.getByRole('button', { name: /reset/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /prototype/i }),
      ).toBeInTheDocument();
    });

    it('calls onClear when RESET is clicked', () => {
      render(<ControlPanel {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /reset/i }));
      expect(defaultProps.onClear).toHaveBeenCalled();
    });

    it('calls onGetRandomPrototype when PROTOTYPE is clicked', () => {
      render(<ControlPanel {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /prototype/i }));
      expect(defaultProps.onGetRandomPrototype).toHaveBeenCalled();
    });

    it('disables PROTOTYPE button when canFetchMorePrototypes is false', () => {
      render(<ControlPanel {...defaultProps} canFetchMorePrototypes={false} />);
      expect(screen.getByRole('button', { name: /prototype/i })).toBeDisabled();
    });

    it('expands sub-panel and interacts with input', () => {
      render(<ControlPanel {...defaultProps} />);

      // Expand sub-panel
      const moreButton = screen.getByRole('button', { name: /more/i });
      fireEvent.click(moreButton);

      const input = screen.getByPlaceholderText('ID');
      expect(input).toBeInTheDocument();

      fireEvent.change(input, { target: { value: '123' } });
      expect(defaultProps.onPrototypeIdInputChange).toHaveBeenCalled();
    });

    it('calls onPrototypeIdInputSet with random ID when dice button is clicked', () => {
      render(<ControlPanel {...defaultProps} maxPrototypeId={500} />);

      // Expand sub-panel
      fireEvent.click(screen.getByRole('button', { name: /more/i }));

      const diceButton = screen.getByRole('button', {
        name: /fill input with random prototype id/i,
      });
      fireEvent.click(diceButton);

      expect(defaultProps.onPrototypeIdInputSet).toHaveBeenCalled();
      expect(defaultProps.onPrototypeIdInputSet).toHaveBeenCalledWith(
        expect.any(Number),
      );
    });

    it('calls onGetPrototypeById when SHOW is clicked', () => {
      render(<ControlPanel {...defaultProps} prototypeIdInput="123" />);

      // Expand sub-panel
      fireEvent.click(screen.getByRole('button', { name: /more/i }));

      const showButton = screen.getByRole('button', {
        name: /show prototype with specified id/i,
      });
      expect(showButton).not.toBeDisabled();

      fireEvent.click(showButton);
      expect(defaultProps.onGetPrototypeById).toHaveBeenCalled();
    });

    it('disables SHOW button when input is empty', () => {
      render(<ControlPanel {...defaultProps} prototypeIdInput="" />);

      // Expand sub-panel
      fireEvent.click(screen.getByRole('button', { name: /more/i }));

      const showButton = screen.getByRole('button', {
        name: /show prototype with specified id/i,
      });
      expect(showButton).toBeDisabled();
    });

    it('toggles sub-panel text between More and Less', () => {
      render(<ControlPanel {...defaultProps} />);

      const toggleButton = screen.getByRole('button', { name: /more/i });
      expect(toggleButton).toHaveTextContent('More');

      fireEvent.click(toggleButton);
      expect(toggleButton).toHaveTextContent('Less');

      fireEvent.click(toggleButton);
      expect(toggleButton).toHaveTextContent('More');
    });
  });

  describe('Playlist Mode', () => {
    it('disables PROTOTYPE and RESET buttons', () => {
      render(
        <ControlPanel {...defaultProps} controlPanelMode="loadingPlaylist" />,
      );
      // In loadingPlaylist mode:
      // canGetPrototypes={!isPlaylistMode} -> false
      // canClearDisabled={!isPlaylistMode} -> false

      expect(screen.getByRole('button', { name: /prototype/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /reset/i })).toBeDisabled();
    });

    it('disables sub-panel controls', () => {
      render(
        <ControlPanel {...defaultProps} controlPanelMode="loadingPlaylist" />,
      );

      // Expand sub-panel
      fireEvent.click(screen.getByRole('button', { name: /more/i }));

      const diceButton = screen.getByRole('button', {
        name: /fill input with random prototype id/i,
      });
      const input = screen.getByPlaceholderText('ID');
      const showButton = screen.getByRole('button', {
        name: /show prototype with specified id/i,
      });

      expect(diceButton).toBeDisabled();
      expect(input).toBeDisabled();
      expect(showButton).toBeDisabled();
    });
  });
});
