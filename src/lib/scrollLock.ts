let savedScrollY = 0;
let lockCount = 0;

export function getScrollPosition(): number {
  return window.scrollY;
}

export function lockBodyScroll(): void {
  if (lockCount === 0) {
    savedScrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflow = 'hidden';
  }
  lockCount++;
}

export function unlockBodyScroll(): void {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.overflow = '';
    window.scrollTo({ top: savedScrollY, behavior: 'instant' as ScrollBehavior });
  }
}

export function restoreScrollPosition(y: number): void {
  window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior });
}
