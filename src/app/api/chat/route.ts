import { NextResponse } from 'next/server';
import { callClaude } from '@/lib/anthropic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await callClaude(body, { beta: 'web-search-2025-03-05' });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
