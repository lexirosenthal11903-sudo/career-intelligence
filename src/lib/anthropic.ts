import { requireEnv } from '@/lib/env';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

export async function callClaude(
  body: Record<string, unknown>,
  options?: { beta?: string }
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-api-key': requireEnv('ANTHROPIC_API_KEY'),
    'anthropic-version': '2023-06-01',
  };
  if (options?.beta) headers['anthropic-beta'] = options.beta;

  return fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

interface ContentBlock {
  type: string;
  name?: string;
  input?: Record<string, unknown>;
}

export function findToolUse(
  content: ContentBlock[] | undefined,
  toolName: string
): Record<string, unknown> | null {
  const block = content?.find((b) => b.type === 'tool_use' && b.name === toolName);
  return block?.input ?? null;
}
