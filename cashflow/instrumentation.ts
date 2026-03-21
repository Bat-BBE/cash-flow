/**
 * Next.js instrumentation hook (project root).
 * Ensures Turbopack loads this file instead of any stray `instrumentation.js`
 * elsewhere on disk (e.g. corrupted placeholder files).
 */
export async function register() {
  // Add OpenTelemetry / startup hooks here if needed.
}
