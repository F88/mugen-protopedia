/**
 * @fileoverview Utility to scroll the window to a prototype card by index.
 *
 * Elements are located via the attribute selector `[data-prototype-id]` inside
 * a provided scroll container. The function computes an adjusted scroll
 * position accounting for a fixed header whose height is exposed through the
 * CSS custom property `--header-offset`. An additional `extraOffset` lets you
 * create breathing room under the header.
 *
 * When `waitForLayout` is enabled a double `requestAnimationFrame` plus a
 * short timeout (~100ms) is used to defer measurement until after layout &
 * paint settle. This mirrors the original implementation embedded in the page
 * component and helps avoid scroll jitter for freshly mounted content.
 */

/** Options controlling how scrolling to a prototype element is performed. */
export type ScrollToPrototypeOptions = {
  /** Scroll behavior passed to `window.scrollTo` (defaults to `'smooth'`). */
  behavior?: ScrollBehavior;
  /** Wait for layout stabilization using double rAF + timeout before measuring. */
  waitForLayout?: boolean;
  /**
   * The number of `requestAnimationFrame` rounds to wait when `waitForLayout`
   * is enabled. Defaults to `2` to mimic the historical double-rAF behavior.
   */
  layoutWaitRafRounds?: number;
  /**
   * Additional timeout (in milliseconds) after rAF rounds when `waitForLayout`
   * is enabled. Defaults to `100` to allow images/fonts to settle a bit.
   * Set to `0` to skip the timeout phase.
   */
  layoutWaitTimeoutMs?: number;
  /** Extra pixels subtracted below the header for spacing (defaults to `16`). */
  extraOffset?: number;
  /**
   * Optional provider to resolve the current header offset. If omitted, the
   * value is read from the CSS custom property `--header-offset` on `:root`.
   * Use this when the effective offset depends on runtime conditions (e.g.,
   * additional toolbars, safe area insets on mobile, or per-page headers).
   */
  headerOffsetProvider?: () => number;
};

/**
 * Scroll the window so that the prototype element at `index` inside `container`
 * appears just beneath the fixed header.
 *
 * Contract:
 * - Safe no-op if container or element does not exist.
 * - Reads `--header-offset` from `:root` to align element under header.
 * - Adds `extraOffset` (default 16px) for visual padding.
 * - Optional layout wait reduces the risk of measuring mid-flow.
 *
 * @param container The DOM element containing prototype cards.
 * @param index Zero-based index of the target prototype element.
 * @param options See {@link ScrollToPrototypeOptions}.
 */
export function scrollToPrototypeByIndex(
  container: HTMLElement | null,
  index: number,
  {
    behavior = 'smooth',
    waitForLayout = false,
    layoutWaitRafRounds = 2,
    layoutWaitTimeoutMs = 100,
    extraOffset = 16,
    headerOffsetProvider,
  }: ScrollToPrototypeOptions = {},
): void {
  console.debug(`Scrolling to prototype index ${index} with options:`, {
    behavior,
    waitForLayout,
    layoutWaitRafRounds,
    layoutWaitTimeoutMs,
    extraOffset,
  });

  const doScroll = () => {
    if (!container) return;
    const prototypeElements = container.querySelectorAll('[data-prototype-id]');
    const element = prototypeElements[index];
    if (!element) return;

    const headerOffset =
      typeof headerOffsetProvider === 'function'
        ? Number(headerOffsetProvider()) || 0
        : ((): number => {
            const str = getComputedStyle(
              document.documentElement,
            ).getPropertyValue('--header-offset');
            return Number.parseInt(str, 10) || 0;
          })();
    const elementRect = element.getBoundingClientRect();
    const absoluteElementTop = elementRect.top + window.scrollY;
    const targetScrollPosition =
      absoluteElementTop - headerOffset - extraOffset;
    window.scrollTo({ top: targetScrollPosition, behavior });
  };

  if (!waitForLayout) {
    doScroll();
    return;
  }

  // Configurable wait: rAF rounds followed by optional timeout
  const runRafRounds = (rounds: number, done: () => void) => {
    if (rounds <= 0) {
      done();
      return;
    }
    requestAnimationFrame(() => runRafRounds(rounds - 1, done));
  };

  runRafRounds(layoutWaitRafRounds, () => {
    if (layoutWaitTimeoutMs > 0) {
      setTimeout(doScroll, layoutWaitTimeoutMs);
    } else {
      doScroll();
    }
  });
}
