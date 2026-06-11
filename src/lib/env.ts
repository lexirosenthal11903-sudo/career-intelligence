/**
 * Environment variable validation.
 *
 * Fail fast with a clear message rather than a cryptic runtime crash when a
 * required key is missing. Call `requireEnv` at the top of any route that
 * depends on a given service.
 */

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Add it to .env.local for local development and to the Vercel project settings for deployment.`
    );
  }
  return value;
}

/**
 * Returns null instead of throwing — for optional services where the route can
 * degrade gracefully (e.g. rate limiting falls back to allow-all if Upstash is
 * not configured in a given environment).
 */
export function optionalEnv(name: string): string | null {
  return process.env[name] || null;
}
