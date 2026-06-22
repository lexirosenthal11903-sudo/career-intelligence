import { NextResponse } from 'next/server';

/* Company logo resolver (progressive enhancement for the roles list).
   Adzuna/Reed give us a company *name*, not a domain — so we resolve name → domain
   via the Logo.dev Brand Search API (server-side, secret key), then hand back the
   Logo.dev image URL built with the publishable token. Everything degrades safely:
   no keys, no match, or any error → `{ url: null }` and the UI keeps the colour+letter
   tile. Results are cached in-process so we don't re-search the same employer.

   Env:
     LOGODEV_SECRET_KEY                 — server, Brand Search (sk_…)
     NEXT_PUBLIC_LOGODEV_PUBLISHABLE_KEY — image token (pk_…, public by design) */

const SEARCH_URL = 'https://api.logo.dev/search';
const cache = new Map<string, string | null>();

interface LogoDevHit {
  name?: string;
  domain?: string;
}

async function resolveDomain(company: string): Promise<string | null> {
  const secret = process.env.LOGODEV_SECRET_KEY;
  if (!secret) return null;
  try {
    const res = await fetch(`${SEARCH_URL}?q=${encodeURIComponent(company)}`, {
      headers: { Authorization: `Bearer ${secret}` },
      // Logo.dev data is stable; let the platform cache it for a day.
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const hits = (await res.json()) as LogoDevHit[];
    return Array.isArray(hits) && hits[0]?.domain ? hits[0].domain : null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const company = new URL(request.url).searchParams.get('company')?.trim();
  if (!company) return NextResponse.json({ url: null });

  const token = process.env.NEXT_PUBLIC_LOGODEV_PUBLISHABLE_KEY;
  if (!token) return NextResponse.json({ url: null });

  const key = company.toLowerCase();
  if (cache.has(key)) return NextResponse.json({ url: cache.get(key) });

  const domain = await resolveDomain(company);
  // fallback=404 makes the <img> error when there's no real logo for the domain,
  // so the client falls back to the tile rather than showing a generated monogram.
  const url = domain
    ? `https://img.logo.dev/${domain}?token=${token}&size=80&format=png&fallback=404`
    : null;

  cache.set(key, url);
  return NextResponse.json({ url });
}
