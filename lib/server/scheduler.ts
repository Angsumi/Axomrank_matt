import "server-only";

const DAILY_INTERVAL_MS = 24 * 60 * 60 * 1000;

declare global {
  var controlCenterCollectorTimer: NodeJS.Timeout | undefined;
  var controlCenterCollectorStartupTimer: NodeJS.Timeout | undefined;
  var controlCenterCollectorRunning: boolean | undefined;
}

function msUntilNext1AM() {
  const now = new Date();
  const next1AM = new Date(now);
  next1AM.setHours(1, 0, 0, 0);
  if (now.getTime() >= next1AM.getTime()) {
    next1AM.setDate(next1AM.getDate() + 1);
  }
  return next1AM.getTime() - now.getTime();
}

function localBaseUrl() {
  const port = process.env.PORT || "3000";
  return `http://127.0.0.1:${port}`;
}

async function refreshAllCollectors() {
  if (globalThis.controlCenterCollectorRunning) return;
  globalThis.controlCenterCollectorRunning = true;
  try {
    const baseUrl = localBaseUrl();
    await Promise.allSettled([
      "/api/cron/sync",
      "/api/live/industry?refresh=1",
      "/api/live/mentions?refresh=1",
      "/api/live/audience",
      "/api/live/newsletters?refresh=1",
    ].map(async (path) => {
      const response = await fetch(`${baseUrl}${path}`, {
        cache: "no-store",
        signal: AbortSignal.timeout(path.startsWith("/api/live/newsletters") ? 300_000 : 60_000),
      });
      await response.body?.cancel();
    }));
  } finally {
    globalThis.controlCenterCollectorRunning = false;
  }
}

export function startLocalCollectorScheduler() {
  if (globalThis.controlCenterCollectorTimer || globalThis.controlCenterCollectorStartupTimer) return;
  const delayUntil1AM = msUntilNext1AM();
  globalThis.controlCenterCollectorStartupTimer = setTimeout(() => {
    globalThis.controlCenterCollectorStartupTimer = undefined;
    void refreshAllCollectors();
    globalThis.controlCenterCollectorTimer = setInterval(() => void refreshAllCollectors(), DAILY_INTERVAL_MS);
    globalThis.controlCenterCollectorTimer.unref();
  }, delayUntil1AM);
  globalThis.controlCenterCollectorStartupTimer.unref();
}
