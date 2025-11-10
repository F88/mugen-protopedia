// Utility for scrolling to a prototype element by index with optional layout wait.
// Extracted from page component for reuse.

export type ScrollToPrototypeOptions = {
  behavior?: ScrollBehavior;
  waitForLayout?: boolean; // if true, wait double rAF + small timeout before scrolling
  extraOffset?: number; // extra padding offset under header
};

export function scrollToPrototypeByIndex(
  container: HTMLElement | null,
  index: number,
  {
    behavior = 'smooth',
    waitForLayout = false,
    extraOffset = 16,
  }: ScrollToPrototypeOptions = {},
): void {
  console.debug(`Scrolling to prototype index ${index} with options:`, {
    behavior,
    waitForLayout,
    extraOffset,
  });

  const doScroll = () => {
    if (!container) return;
    const prototypeElements = container.querySelectorAll('[data-prototype-id]');
    const element = prototypeElements[index];
    if (!element) return;

    const headerOffsetStr = getComputedStyle(
      document.documentElement,
    ).getPropertyValue('--header-offset');
    const headerOffset = Number.parseInt(headerOffsetStr, 10) || 0;
    const elementRect = element.getBoundingClientRect();
    const absoluteElementTop = elementRect.top + window.scrollY;
    const targetScrollPosition =
      absoluteElementTop - headerOffset - extraOffset;
    window.scrollTo({ top: targetScrollPosition, behavior });
  };

  if (waitForLayout) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(doScroll, 100);
      });
    });
  } else {
    doScroll();
  }
}
