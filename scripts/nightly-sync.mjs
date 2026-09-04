#!/usr/bin/env node

const port = process.env.PORT || "3000";
const host = process.env.APP_HOST || "http://127.0.0.1";
const cronSecret = process.env.CRON_SECRET || "";

const endpoint = `${host}:${port}/api/cron/sync`;

console.log(`[Nightly Sync] Triggering 1:00 AM job synchronization: ${endpoint}`);

try {
  const headers = {};
  if (cronSecret) {
    headers["authorization"] = `Bearer ${cronSecret}`;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    signal: AbortSignal.timeout(120_000),
  });

  const text = await response.text();
  console.log(`[Nightly Sync] Status: ${response.status}`);
  console.log(`[Nightly Sync] Result: ${text}`);

  if (!response.ok) {
    process.exit(1);
  }
} catch (error) {
  console.error(`[Nightly Sync] Execution error:`, error);
  process.exit(1);
}
