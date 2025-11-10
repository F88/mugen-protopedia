// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { scrollToPrototypeByIndex } from '@/lib/utils/scroll-to-prototype';

function makeContainerWithCards(count: number) {
  const container = document.createElement('div');
  // Simulate scrollable container
  Object.assign(container.style, { height: '400px', overflow: 'auto' });
  // Mock getBoundingClientRect for container
  container.getBoundingClientRect = () => ({
    top: 0,
    left: 0,
    right: 400,
    bottom: 400,
    width: 400,
    height: 400,
    x: 0,
    y: 0,
    toJSON: () => {},
  });

  for (let i = 0; i < count; i += 1) {
    const card = document.createElement('div');
    card.setAttribute('data-prototype-id', String(i));
    // Each card 300px tall stacked vertically => top = i * 300
    card.getBoundingClientRect = () => ({
      top: i * 300,
      left: 0,
      right: 400,
      bottom: i * 300 + 300,
      width: 400,
      height: 300,
      x: 0,
      y: i * 300,
      toJSON: () => {},
    });
    container.appendChild(card);
  }
  return container;
}

describe('scrollToPrototypeByIndex', () => {
  it('scrolls container so target card sits below dynamic header', () => {
    const container = makeContainerWithCards(5);
    document.body.appendChild(container);
    // Simulate header offset via CSS variable
    document.documentElement.style.setProperty('--header-offset', '100');

    // Index 1 card top is 300px relative to container
    scrollToPrototypeByIndex(container, 1, {
      behavior: 'auto',
      waitForLayout: false,
    });

    // Expected scrollTop: cardTop (300) - headerOffset (100) - extraOffset (16) = 184
    expect(container.scrollTop).toBe(184);
  });
});
