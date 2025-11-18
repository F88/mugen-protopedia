import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ControlPanel } from '@/components/control-panel';

describe('ControlPanel', () => {
  const defaultProps = {
    prototypeIdInput: '',
    onPrototypeIdInputChange: vi.fn(),
    onPrototypeIdInputSet: vi.fn(),
    onGetPrototypeById: vi.fn(),
    onGetRandomPrototype: vi.fn(),
    onClear: vi.fn(),
    canFetchMorePrototypes: true,
    prototypeIdError: null,
    maxPrototypeId: 7777,
    onScrollNext: vi.fn(),
    onScrollPrev: vi.fn(),
    onOpenPrototype: vi.fn(),
  };

  it('renders main panel with RESET and PROTOTYPE buttons', () => {
    render(<ControlPanel {...defaultProps} />);
    expect(screen.getByText('RESET')).toBeDefined();
    expect(screen.getByText('PROTOTYPE')).toBeDefined();
  });

  it('enables controls in normal mode', () => {
    render(<ControlPanel {...defaultProps} controlPanelMode="normal" />);
    const prototypeButton = screen.getByText('PROTOTYPE');
    const resetButton = screen.getByText('RESET');
    
    expect(prototypeButton.closest('button')?.hasAttribute('disabled')).toBe(false);
    expect(resetButton.closest('button')?.hasAttribute('disabled')).toBe(false);
  });

  it('disables controls when in loadingPlaylist mode', () => {
    render(<ControlPanel {...defaultProps} controlPanelMode="loadingPlaylist" />);
    const prototypeButton = screen.getByText('PROTOTYPE');
    const resetButton = screen.getByText('RESET');
    
    expect(prototypeButton.closest('button')?.hasAttribute('disabled')).toBe(true);
    expect(resetButton.closest('button')?.hasAttribute('disabled')).toBe(true);
  });

  it('disables PROTOTYPE button when canFetchMorePrototypes is false', () => {
    render(<ControlPanel {...defaultProps} canFetchMorePrototypes={false} />);
    const prototypeButton = screen.getByText('PROTOTYPE');
    
    expect(prototypeButton.closest('button')?.hasAttribute('disabled')).toBe(true);
  });

  it('disables controls when canFetchMorePrototypes is false and in loadingPlaylist mode', () => {
    render(
      <ControlPanel
        {...defaultProps}
        controlPanelMode="loadingPlaylist"
        canFetchMorePrototypes={false}
      />,
    );
    const prototypeButton = screen.getByText('PROTOTYPE');
    const resetButton = screen.getByText('RESET');
    
    expect(prototypeButton.closest('button')?.hasAttribute('disabled')).toBe(true);
    expect(resetButton.closest('button')?.hasAttribute('disabled')).toBe(true);
  });
});
