"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import s from "./input.module.css";

const ARLO_64 = `<svg width="64" height="64" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="#B87040"/><line x1="2" y1="40" x2="78" y2="40" stroke="#F5E9DD" stroke-width="1.6" opacity="0.5"/><ellipse cx="40" cy="40" rx="14" ry="38" stroke="#F5E9DD" stroke-width="1.6" fill="none" opacity="0.5"/><circle cx="40" cy="40" r="3" fill="#F5E9DD" opacity="0.85"/></svg>`;

const ARLO_24 = `<svg width="24" height="24" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="#B87040"/><line x1="2" y1="40" x2="78" y2="40" stroke="#F5E9DD" stroke-width="1.6" opacity="0.5"/><ellipse cx="40" cy="40" rx="14" ry="38" stroke="#F5E9DD" stroke-width="1.6" fill="none" opacity="0.5"/><circle cx="40" cy="40" r="3" fill="#F5E9DD" opacity="0.85"/></svg>`;

type Msg =
  | { kind: "ai"; text: string }
  | { kind: "user"; text: string };

const PLACEHOLDERS = [
  "Tell me about yourself…",
  "I'm drawn to things where I can see the impact of what I do…",
  "e.g. London, open to remote, or need visa sponsorship",
];

export default function InputChat() {
  const router = useRouter();
  const [chatStarted, setChatStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [placeholder, setPlaceholder] = useState(PLACEHOLDERS[0]);
  const [dragOver, setDragOver] = useState(false);
  const [confirmRestart, setConfirmRestart] = useState(false);
  const [extracting, setExtracting] = useState(false);

  // Collected data for the analysis
  const [cvText, setCvText] = useState("");
  const [direction, setDirection] = useState("");
  const [location, setLocation] = useState("");

  const startedRef = useRef(false);
  const listRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function scrollBottom() {
    setTimeout(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }, 40);
  }

  function pushAi(text: string) {
    setMessages((prev) => [...prev, { kind: "ai", text }]);
    scrollBottom();
  }

  function pushUser(text: string) {
    setMessages((prev) => [...prev, { kind: "user", text }]);
    scrollBottom();
  }

  function commit() {
    if (startedRef.current) return;
    startedRef.current = true;
    setChatStarted(true);
  }

  function finishBackground(text: string) {
    // Prefer extracted CV text; fall back to what the user typed
    if (!cvText) setCvText(text);
    commit();
    setMessages([{ kind: "user", text }]);
    setStep(1);
    setInputValue("");
    setPlaceholder(PLACEHOLDERS[1]);
    setTimeout(() => {
      pushAi("Got it.");
      setTimeout(() => {
        pushAi("Where are you trying to go? Even if it's vague — a direction you're drawn toward, or something you want to move away from. There's no wrong answer.");
        fieldRef.current?.focus();
      }, 600);
    }, 420);
  }

  function finishDirection(text: string) {
    setDirection(text);
    pushUser(text);
    setStep(2);
    setInputValue("");
    setPlaceholder(PLACEHOLDERS[2]);
    setTimeout(() => {
      pushAi("That helps.");
      setTimeout(() => {
        pushAi("One last thing — where can you work, and any restrictions I should know about?");
        fieldRef.current?.focus();
      }, 600);
    }, 420);
  }

  function finishPractical(text: string) {
    setLocation(text);
    pushUser(text);
    setStep(3);
    setInputValue("");
    setTimeout(() => scrollBottom(), 420);
  }

  function onSend() {
    if (extracting) return;
    const val = inputValue.trim();
    if (!val) return;
    if (step === 0) finishBackground(val);
    else if (step === 1) finishDirection(val);
    else if (step === 2) finishPractical(val);
    // Collapse textarea back to single row after send
    if (fieldRef.current) fieldRef.current.style.height = "auto";
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }

  async function handleFile(file: File) {
    setInputValue(`CV: ${file.name}`);
    setExtracting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/extract", { method: "POST", body: formData });
      const data = await res.json();
      if (data.text) {
        setCvText(data.text);
      }
    } catch {
      // Extraction failed — user can still type their background manually
    } finally {
      setExtracting(false);
      fieldRef.current?.focus();
    }
  }

  function restart() {
    if (step > 0) { setConfirmRestart(true); return; }
    window.location.reload();
  }

  function confirmRestartYes() { window.location.reload(); }
  function confirmRestartNo() { setConfirmRestart(false); }

  function handleSubmit() {
    sessionStorage.setItem("analysis-inputs", JSON.stringify({
      cvText,
      direction,
      location,
    }));
    router.push("/loading");
  }

  const sendIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );

  const uploadIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 17v2a1 1 0 001 1h14a1 1 0 001-1v-2M12 4v11M8 8l4-4 4 4" />
    </svg>
  );

  return (
    <>
      <nav className={s.nav}>
        <a className={s.navBrand} href="/">Career Intelligence</a>
        {confirmRestart ? (
          <div className={s.restartConfirm}>
            <span className={s.restartConfirmText}>Your answers won&apos;t be saved.</span>
            <button className={s.restartConfirmYes} onClick={confirmRestartYes}>Start over</button>
            <button className={s.restartConfirmNo} onClick={confirmRestartNo}>Cancel</button>
          </div>
        ) : (
          <button
            className={`${s.navRestart}${chatStarted ? ` ${s.show}` : ""}`}
            onClick={restart}
          >
            ← Start over
          </button>
        )}
      </nav>

      <main className={s.stage}>
        <div className={`${s.chatFrame}${!chatStarted ? ` ${s.inWelcome}` : ""}`}>

          {/* Welcome / resting state */}
          <div className={`${s.welcome}${chatStarted ? ` ${s.gone}` : ""}`}>
            <div
              className={s.welcomeFace}
              dangerouslySetInnerHTML={{ __html: ARLO_64 }}
            />
            <div className={s.welcomeName}>Arlo</div>
            <h1 className={s.welcomeHeading}>
              You don&apos;t need to have it figured out.
            </h1>
            <p className={s.welcomeSub}>
              Share your background — a CV, a few sentences, whatever you&apos;ve got.<br />
              I&apos;ll take it from there.
            </p>
          </div>

          {/* Chat messages */}
          <div
            ref={listRef}
            className={`${s.messages}${chatStarted ? ` ${s.show}` : ""}`}
          >
            {messages.map((msg, i) => {
              if (msg.kind === "ai") {
                return (
                  <div key={i} className={s.aiRow}>
                    <div className={s.aiMeta}>
                      <div
                        className={s.aiMetaFace}
                        dangerouslySetInnerHTML={{ __html: ARLO_24 }}
                      />
                      <span className={s.aiMetaName}>Arlo</span>
                    </div>
                    <div className={s.aiBubble}>{msg.text}</div>
                  </div>
                );
              }
              return (
                <div key={i} className={s.userRow}>
                  <div className={s.userBubble}>{msg.text}</div>
                </div>
              );
            })}
          </div>

          {/* Input area */}
          <div className={s.inputArea}>
            {step < 3 && (
              <div
                className={`${s.inputCard}${dragOver ? ` ${s.dragActive}` : ""}`}
                onDragOver={(e) => { e.preventDefault(); if (!chatStarted) setDragOver(true); }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (!chatStarted) {
                    const f = e.dataTransfer.files[0];
                    if (f) handleFile(f);
                  }
                }}
              >
                {!chatStarted && (
                  <button
                    className={s.attachBtn}
                    onClick={() => fileRef.current?.click()}
                    aria-label="Upload CV"
                    title="Upload your CV"
                    disabled={extracting}
                  >
                    {uploadIcon}
                  </button>
                )}
                <textarea
                  ref={fieldRef}
                  className={s.inputField}
                  rows={1}
                  value={extracting ? "Reading your CV…" : inputValue}
                  placeholder={chatStarted ? placeholder : PLACEHOLDERS[0]}
                  onChange={(e) => {
                    if (!extracting) {
                      setInputValue(e.target.value);
                      autoResize(e.target);
                    }
                  }}
                  onKeyDown={onKey}
                  disabled={extracting}
                  readOnly={extracting}
                />
                <button
                  className={s.sendBtn}
                  onClick={onSend}
                  aria-label="Send"
                  disabled={extracting}
                >
                  {sendIcon}
                </button>
              </div>
            )}
            {step >= 3 && (
              <div className={s.submitWrap}>
                <button
                  className={s.btnSubmit}
                  onClick={handleSubmit}
                >
                  Find my direction →
                </button>
              </div>
            )}
          </div>

        </div>
      </main>

      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.doc,.docx"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
    </>
  );
}
