import { NextRequest, NextResponse } from 'next/server';
import { checkExtractRateLimit } from '@/lib/ratelimit';

export async function POST(request: NextRequest) {
  const rateLimited = await checkExtractRateLimit(request);
  if (rateLimited) return rateLimited;

  let file: File | null = null;
  try {
    const formData = await request.formData();
    const entry = formData.get('file');
    if (entry instanceof File) file = entry;
  } catch {
    return NextResponse.json({ error: 'File parse error' }, { status: 400 });
  }

  if (!file) {
    return NextResponse.json({ error: 'No file received' }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (10MB max)' }, { status: 400 });
  }

  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    let text = '';

    if (ext === 'pdf') {
      const { extractText } = await import('unpdf');
      const result = await extractText(new Uint8Array(buffer), { mergePages: true });
      text = result.text;
    } else if (ext === 'docx') {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    const cleaned = text.replace(/\s{3,}/g, '\n').trim();
    return NextResponse.json({ text: cleaned });
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Extraction failed', detail }, { status: 500 });
  }
}
