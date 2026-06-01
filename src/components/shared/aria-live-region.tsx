"use client";

/** Announces toast-level updates to screen readers */
export function AriaLiveRegion() {
  return (
    <div
      id="aria-live-announcer"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  );
}
