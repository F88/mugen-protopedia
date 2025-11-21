import React from 'react';
import { PrototypeErrorLink } from '@/components/prototype/prototype-error-link';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('PrototypeErrorLink', () => {
  it('renders the link with the correct URL', () => {
    const expectedPrototypeId = 12345;
    render(<PrototypeErrorLink expectedPrototypeId={expectedPrototypeId} />);

    const link = screen.getByRole('link', { name: /Check on ProtoPedia/i });
    expect(link).toHaveAttribute(
      'href',
      `https://protopedia.net/prototype/${expectedPrototypeId}`,
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('shows tooltip on hover over the info icon', async () => {
    render(<PrototypeErrorLink expectedPrototypeId={12345} />);

    // The Info icon is the trigger. We can find it as the link's previous sibling.
    const linkElement = screen.getByRole('link');
    const infoIcon = linkElement.previousElementSibling;
    expect(infoIcon).toBeInTheDocument();

    // Simulate hover
    fireEvent.mouseEnter(infoIcon!);
    fireEvent.focus(infoIcon!);

    // Wait for tooltip to appear
    await waitFor(() => {
      const tooltipTexts = screen.getAllByText(
        'ProtoPedia にはページが存在する可能性があります',
      );
      expect(tooltipTexts.length).toBeGreaterThan(0);
      expect(tooltipTexts[0]).toBeInTheDocument();
    });
  });
});
