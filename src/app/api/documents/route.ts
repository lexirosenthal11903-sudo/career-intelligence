import { NextResponse } from 'next/server';
import { getAuthedUser } from '@/lib/supabase/server';
import { jsonNoStore } from '@/lib/api-response';

export async function GET(request: Request) {
  const { user, supabase } = await getAuthedUser();
  if (!user) return jsonNoStore({ documents: [] });

  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  let query = supabase
    .from('documents')
    .select('id, job_id, type, content, metadata, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (jobId) query = query.eq('job_id', jobId);

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return jsonNoStore({ documents: data ?? [] });
}

// PATCH one interview-prep answer. The user edits their own answer to a question in the
// Prep section of an application; this writes it back into that role's interview_prep
// document metadata, keyed by the canonical job_id + the question's index. The answer is
// the user's own words — never sanitised. A zero-row match is a 404 so a lost edit can't
// report success.
export async function PATCH(request: Request) {
  const { user, supabase } = await getAuthedUser();
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  let jobId: unknown, questionIndex: unknown, answer: unknown;
  try {
    ({ jobId, questionIndex, answer } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
  if (typeof jobId !== 'string' || !jobId) return NextResponse.json({ error: 'jobId required' }, { status: 400 });
  if (typeof questionIndex !== 'number' || !Number.isInteger(questionIndex) || questionIndex < 0) {
    return NextResponse.json({ error: 'questionIndex required' }, { status: 400 });
  }
  if (typeof answer !== 'string') return NextResponse.json({ error: 'answer required' }, { status: 400 });

  const { data: doc, error: readErr } = await supabase
    .from('documents')
    .select('id, metadata')
    .eq('user_id', user.id)
    .eq('job_id', jobId)
    .eq('type', 'interview_prep')
    .maybeSingle();
  if (readErr) return NextResponse.json({ error: readErr.message }, { status: 500 });
  if (!doc) return NextResponse.json({ error: 'No prep found for that role' }, { status: 404 });

  const metadata = (doc.metadata ?? {}) as { questions?: Array<{ q: string; a: string }> };
  const questions = Array.isArray(metadata.questions) ? [...metadata.questions] : [];
  if (questionIndex >= questions.length) return NextResponse.json({ error: 'questionIndex out of range' }, { status: 400 });
  questions[questionIndex] = { ...questions[questionIndex], a: answer.slice(0, 4000) };

  const { error: updErr } = await supabase
    .from('documents')
    .update({ metadata: { ...metadata, questions } })
    .eq('id', doc.id)
    .eq('user_id', user.id);
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });
  return jsonNoStore({ ok: true });
}
