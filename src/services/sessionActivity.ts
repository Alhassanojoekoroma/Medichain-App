let lastMeaningfulActivityAt = Date.now();

export function recordMobileSessionActivity(): void {
  lastMeaningfulActivityAt = Date.now();
}

export function getLastMobileSessionActivity(): number {
  return lastMeaningfulActivityAt;
}
