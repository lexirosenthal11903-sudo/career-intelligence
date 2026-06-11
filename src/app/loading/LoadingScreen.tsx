"use client";

import { useState, useEffect } from "react";
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
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (index >= STATES.length - 1) return;

    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        setIndex((i) => i + 1);
        setFading(false);
      }, 400);
    }, 6000);

    return () => clearTimeout(timer);
  }, [index]);

  const current = STATES[index];

  return (
    <main className={s.stage}>
      <div className={`${s.group}${fading ? ` ${s.fading}` : ""}`}>
        <div
          className={s.face}
          dangerouslySetInnerHTML={{ __html: current.svg }}
        />
        <div className={s.name}>Arlo</div>
        <p className={s.phrase}>{current.text}</p>
        <p className={s.tagline}>About a minute.</p>
      </div>
    </main>
  );
}
