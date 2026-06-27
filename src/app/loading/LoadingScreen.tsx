"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import s from "./loading.module.css";

function face({
  eyeR = 5,
  lb,
  rb,
  mouth,
}: {
  eyeR?: number;
  lb: string;
  rb: string;
  mouth: string;
}) {
  return `<svg width="96" height="96" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="40" fill="#B87040"/>
    <circle cx="28" cy="38" r="${eyeR}" fill="#2C1A0E"/>
    <circle cx="52" cy="38" r="${eyeR}" fill="#2C1A0E"/>
    <path d="${lb}" stroke="#1A0E06" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="${rb}" stroke="#1A0E06" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <circle cx="29.5" cy="36.5" r="1.4" fill="white" opacity="0.4"/>
    <circle cx="53.5" cy="36.5" r="1.4" fill="white" opacity="0.4"/>
    <path d="${mouth}" stroke="#7A3E10" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.7"/>
  </svg>`;
}

const STATES = [
  {
    text: "I'm taking a minute with this — it's worth doing properly.",
    svg: face({ lb: "M23 36 Q28 35 33 36", rb: "M47 36 Q52 35 57 36", mouth: "M33 51 Q40 52 47 51" }),
  },
  {
    text: "Reading what you've built, and what it says between the lines.",
    svg: face({ lb: "M23 36 Q28 33 33 36", rb: "M47 36 Q52 33 57 36", mouth: "M32 51 Q40 53 48 51" }),
  },
  {
    text: "Finding the roles where someone like you would actually do well.",
    svg: face({ lb: "M23 36 Q28 31 33 36", rb: "M47 36 Q52 31 57 36", mouth: "M30 50 Q40 55 50 50" }),
  },
  {
    text: "Almost there.",
    svg: face({ eyeR: 5.5, lb: "M23 36 Q28 31 33 36", rb: "M47 36 Q52 31 57 36", mouth: "M28 49 Q40 57 52 49" }),
  },
];

export default function LoadingScreen() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysisError, setAnalysisError] = useState(false);

  // SSE fetch — starts the real analysis
  useEffect(() => {
    let inputs: Record<string, string> | null = null;
    try {
      const stored = sessionStorage.getItem('analysis-inputs');
      if (stored) inputs = JSON.parse(stored);
    } catch {
      // sessionStorage unavailable
    }

    if (!inputs || (!inputs.cvText && !inputs.direction)) {
      router.push('/input');
      return;
    }

    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch('/api/analyse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(inputs),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          setAnalysisError(true);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        let receivedComplete = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            // Stream closed without a complete event — Vercel timeout or network drop
            if (!receivedComplete) setAnalysisError(true);
            break;
          }
          buffer += decoder.decode(value, { stream: true });

          const chunks = buffer.split('\n\n');
          buffer = chunks.pop() ?? '';

          for (const chunk of chunks) {
            if (!chunk.startsWith('data: ')) continue;
            try {
              const event = JSON.parse(chunk.slice(6)) as {
                event: string;
                result?: unknown;
                message?: string;
              };

              if (event.event === 'complete' && event.result) {
                try {
                  sessionStorage.setItem('analysis-result', JSON.stringify(event.result));
                  sessionStorage.removeItem('analysis-inputs');
                } catch {
                  // sessionStorage write failed — continue anyway
                }

                // Save to Supabase — fire and forget, result is in sessionStorage
                fetch('/api/save-result', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ data: event.result }),
                }).catch(() => undefined);

                receivedComplete = true;
                setAnalysisComplete(true);
              } else if (event.event === 'error') {
                setAnalysisError(true);
              }
            } catch {
              // Malformed SSE chunk — skip
            }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setAnalysisError(true);
        }
      }
    })();

    return () => controller.abort();
  }, [router]);

  // Navigate to error page
  useEffect(() => {
    if (analysisError) router.push('/analysis-error');
  }, [analysisError, router]);

  // On complete: jump to "Almost there", then navigate
  useEffect(() => {
    if (!analysisComplete) return;
    // Drives a one-off timed transition (jump to the final state, then navigate) in
    // response to an external completion signal — sequencing, not derivable state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFading(false);
    setIndex(STATES.length - 1);
    const t = setTimeout(() => router.push('/onboarding-bridge'), 1500);
    return () => clearTimeout(t);
  }, [analysisComplete, router]);

  // Phrase cycling — stops at the last phrase; navigation driven by SSE
  useEffect(() => {
    if (analysisComplete || analysisError) return;
    if (index >= STATES.length - 1) return;

    const t = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        setIndex((i) => i + 1);
        setFading(false);
      }, 400);
    }, 6000);

    return () => clearTimeout(t);
  }, [index, analysisComplete, analysisError]);

  const current = STATES[index];

  return (
    <main className={s.stage}>
      <div className={`${s.group}${fading ? ` ${s.fading}` : ""}`}>
        <div
          className={s.face}
          dangerouslySetInnerHTML={{ __html: current.svg }}
        />
        <div className={s.name}>Career Intelligence</div>
        <p className={s.phrase}>{current.text}</p>
        <p className={s.tagline}>About a minute.</p>
      </div>
    </main>
  );
}
