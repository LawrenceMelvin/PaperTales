export interface BookEntitlement {
  freePages: number;
  paidThrough: number;
  unlockedBy?: "tokens" | "paypal" | "free";
  unlockRef?: string;
}

/**
 * Computes the exact set of page numbers (1-indexed) the caller is entitled to generate/unblur.
 * Client-supplied flags (`freePagesLimit`, `unlockPagesOnly`) are never trusted here.
 */
export function allowedPages(
  totalPages: number,
  entitlement?: Partial<BookEntitlement> | null,
  isAnonymous: boolean = false
): Set<number> {
  const allowed = new Set<number>();
  if (totalPages <= 0) return allowed;

  // Master Page 1 proof is always allowed
  allowed.add(1);

  if (isAnonymous) {
    return allowed;
  }

  const maxPage = Math.min(
    totalPages,
    Math.max(1, entitlement?.freePages ?? 1, entitlement?.paidThrough ?? 0)
  );

  for (let p = 1; p <= maxPage; p++) {
    allowed.add(p);
  }
  return allowed;
}

export function isBookFullyUnlocked(
  totalPages: number,
  entitlement?: Partial<BookEntitlement> | null
): boolean {
  if (totalPages <= 5 && (entitlement?.freePages ?? 0) >= totalPages) {
    return true;
  }
  return (entitlement?.paidThrough ?? 0) >= totalPages;
}
