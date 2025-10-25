// src/lib/analytics.ts
export function trackEvent(name: string, props?: Record<string, unknown>) {
  try {
    // If posthog is available, send the event there
    const ph = (globalThis as any).posthog;
    if (ph && typeof ph.capture === "function") {
      ph.capture(name, props ?? {});
      return;
    }
  } catch (e) {
    // ignore
  }
  // fallback to console for now
  console.log("[analytics]", name, props ?? {});
}