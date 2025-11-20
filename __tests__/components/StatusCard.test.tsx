import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it } from 'vitest';
import { StatusCard } from '@/components/status-card';

const baseProps = {
  title: 'Inputs status',
  description: 'Describe current state',
};

describe('StatusCard', () => {
  it('renders title and description', () => {
    render(
      <StatusCard {...baseProps} state="neutral">
        <div>Child content</div>
      </StatusCard>,
    );

    expect(screen.getByText('Inputs status')).toBeInTheDocument();
    expect(screen.getByText('Describe current state')).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('shows neutral icon by default when state is neutral', () => {
    render(
      <StatusCard {...baseProps} state="neutral">
        <div>Neutral</div>
      </StatusCard>,
    );

    expect(screen.getByText('⏳')).toBeInTheDocument();
  });

  it('shows valid icon when state is valid', () => {
    render(
      <StatusCard {...baseProps} state="valid">
        <div>Valid</div>
      </StatusCard>,
    );

    expect(screen.getByText('✅')).toBeInTheDocument();
  });

  it('shows invalid icon when state is invalid', () => {
    render(
      <StatusCard {...baseProps} state="invalid">
        <div>Invalid</div>
      </StatusCard>,
    );

    expect(screen.getByText('❌')).toBeInTheDocument();
  });

  it('renders without children', () => {
    render(
      <StatusCard {...baseProps} state="neutral">
        <></>
      </StatusCard>,
    );

    expect(screen.getByText('Inputs status')).toBeInTheDocument();
  });
});
