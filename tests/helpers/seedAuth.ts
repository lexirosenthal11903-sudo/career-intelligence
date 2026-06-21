import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { Cookie } from '@playwright/test';

/**
 * Seeds a real authenticated Supabase session and returns it as the cookie(s)
 * the @supabase/ssr server/browser clients expect, so Playwright can drive the
 * dashboard exactly as a logged-in user — the state where Lexi hit
 * "This page couldn't load".
 *
 * We capture the exact storage value supabase-js writes (via a custom storage
 * shim) rather than reconstructing the session JSON by hand, then encode it the
 * way @supabase/ssr does (base64url, `base64-` prefix, chunked > 3180 chars).
 */

export function loadEnv(): Record<string, string> {
  const raw = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
  const env: Record<string, string> = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
  return env;
}

const TEST_EMAIL = 'e2e-test@meridian.test';
const TEST_PASSWORD = 'e2e-Test-Password-123!';

// Mirror @supabase/ssr's encoding (cookies.js: base64url + "base64-" prefix).
const BASE64_PREFIX = 'base64-';
const MAX_CHUNK_SIZE = 3180;

function stringToBase64URL(value: string): string {
  return Buffer.from(value, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function chunk(name: string, value: string): { name: string; value: string }[] {
  if (value.length <= MAX_CHUNK_SIZE) return [{ name, value }];
  const chunks: { name: string; value: string }[] = [];
  for (let i = 0, idx = 0; i < value.length; i += MAX_CHUNK_SIZE, idx++) {
    chunks.push({ name: `${name}.${idx}`, value: value.slice(i, i + MAX_CHUNK_SIZE) });
  }
  return chunks;
}

export async function seedAuthCookies(): Promise<Cookie[]> {
  const env = loadEnv();
  const url = env.SUPABASE_URL;
  const ref = url.match(/https:\/\/([^.]+)\./)![1];
  const cookieName = `sb-${ref}-auth-token`;

  // 1. Ensure the test user exists (idempotent).
  const admin = createClient(url, env.SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error: createErr } = await admin.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: 'E2E Test User' },
  });
  if (createErr && !/already (been )?registered|exists/i.test(createErr.message)) {
    throw new Error(`Failed to create test user: ${createErr.message}`);
  }

  // 2. Sign in, capturing the exact value supabase-js persists to storage.
  let storedValue: string | null = null;
  const captureStorage = {
    getItem: () => null,
    setItem: (_k: string, v: string) => { storedValue = v; },
    removeItem: () => {},
  };
  const anon = createClient(url, env.SUPABASE_ANON_KEY, {
    auth: { storage: captureStorage, persistSession: true, autoRefreshToken: false, storageKey: cookieName },
  });
  const { error: signInErr } = await anon.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });
  if (signInErr) throw new Error(`Test sign-in failed: ${signInErr.message}`);
  if (!storedValue) throw new Error('Did not capture a session storage value');

  // 3. Encode as @supabase/ssr would, then chunk.
  const encoded = BASE64_PREFIX + stringToBase64URL(storedValue);
  return chunk(cookieName, encoded).map(({ name, value }) => ({
    name,
    value,
    domain: 'localhost',
    path: '/',
    expires: -1,
    httpOnly: false,
    secure: false,
    sameSite: 'Lax' as const,
  }));
}

/** The seeded test user's email — used to look up its id for DB assertions. */
export const TEST_USER_EMAIL = 'e2e-test@meridian.test';

/** A service-role Supabase client for asserting on DB state from tests. */
export function adminClient() {
  const env = loadEnv();
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Resolve the seeded test user's auth id (it must already exist via seedAuthCookies). */
export async function getTestUserId(): Promise<string> {
  const admin = adminClient();
  const { data, error } = await admin.auth.admin.listUsers();
  if (error) throw new Error(`listUsers failed: ${error.message}`);
  const user = data.users.find((u) => u.email === TEST_USER_EMAIL);
  if (!user) throw new Error(`Test user ${TEST_USER_EMAIL} not found — run seedAuthCookies first`);
  return user.id;
}
