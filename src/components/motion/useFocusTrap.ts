'use client';

import { useEffect, type RefObject } from 'react';

/**
 * Trap Tab focus inside a container while it's "active" (e.g. a modal/overlay).
 *
 * On mount-active: nothing — the caller is responsible for focusing the first
 * meaningful element (an input, a close button, whatever). We just keep focus
 * from escaping the container via Tab/Shift+Tab once it's in there.
 *
 * Why we don't auto-focus the first element here: callers usually want
 * specific focus behavior (e.g. focus the textarea, not the close button) and
 * each modal's "preferred first focus" differs.
 *
 * NOTE: This does NOT restore focus on close. Callers handle that themselves
 * because the right "restore target" varies (the trigger button, sometimes
 * the element that was focused before, sometimes nothing).
 */
export function useFocusTrap(active: boolean, containerRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusable = container.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeEl = document.activeElement as HTMLElement | null;

      // Forward Tab off the last element → wrap to first.
      if (!e.shiftKey && activeEl === last) {
        e.preventDefault();
        first.focus();
      }
      // Shift+Tab off the first element → wrap to last.
      else if (e.shiftKey && activeEl === first) {
        e.preventDefault();
        last.focus();
      }
      // If focus has escaped the container entirely (e.g. browser focused the
      // address bar), pull it back to the first focusable.
      else if (activeEl && !container.contains(activeEl)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active, containerRef]);
}
