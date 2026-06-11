"use client";

import { useState, useRef } from "react";
import s from "./input.module.css";

const ARLO_64 = `<svg width="64" height="64" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="#B87040"/><circle cx="28" cy="38" r="5" fill="#2C1A0E"/><circle cx="52" cy="38" r="5" fill="#2C1A0E"/><path d="M23 36 Q28 33 33 36" stroke="#1A0E06" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M47 36 Q52 33 57 36" stroke="#1A0E06" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="29.5" cy="36.5" r="1.4" fill="white" opacity="0.4"/><circle cx="53.5" cy="36.5" r="1.4" fill="white" opacity="0.4"/><path d="M32 51 Q40 53 48 51" stroke="#7A3E10" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.7"/></svg>`;

const ARLO_24 = `<svg width="24" height="24" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="#B87040"/><circle cx="28" cy="38" r="5" fill="#2C1A0E"/><circle cx="52" cy="38" r="5" fill="#2C1A0E"/><path d="M23 36 Q28 33 33 36" stroke="#1A0E06" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M47 36 Q52 33 57 36" stroke="#1A0E06" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="29.5" cy="36.5" r="1.4" fill="white" opacity="0.4"/><circle cx="53.5" cy="36.5" r="1.4" fill="white" opacity="0.4"/><path d="M32 51 Q40 53 48 51" stroke="#7A3E10" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.7"/></svg>`;

type Msg =
  | { kind: "ai"; text: string }
  | { kind: "user"; text: string };

const PLACEHOLDERS = [
  "Tell me about yourself…",
  "I'm drawn to things where I can see the impact of what I do…",
  "e.g. London, open to remote, or need visa sponsorship",
];

export default function InputChat() {
  const [chatStarted, setChatStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [placeholder, setPlaceholder] = useState(PLACEHOLDERS[0]);
  const [showInput, setShowInput] = useState(true);
  const [showSubmit, setShowSubmit] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const startedRef = useRef(false);
  const listRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLInputElement>(null);
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
    commit();
    setMessages([{ kind: "user", text }]);
    setStep(1);
    setInputValue("");
    setPlaceholder(PLACEHOLDERS[1]);
    setTimeout(() => {
      pushAi("Got what I need.");
      setTimeout(() => {
        pushAi("Where are you trying to go? Even if it's vague — a direction you're drawn toward, or something you want to move away from. There's no wrong answer.");
        fieldRef.current?.focus();
      }, 600);
    }, 420);
  }

  function finishDirection(text: string) {
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
    pushUser(text);
    setStep(3);
    setInputValue("");
    setShowInput(false);
    setTimeout(() => {
      setShowSubmit(true);
      scrollBottom();
    }, 420);
  }

  function onSend() {
    const val = inputValue.trim();
    if (!val) return;
    if (step === 0) finishBackground(val);
    else if (step === 1) finishDirection(val);
    else if (step === 2) finishPractical(val);
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  function handleFile(file: File) {
    finishBackground(`CV: ${file.name}`);
  }

  function restart() {
    if (step > 0 && !confirm("Start over? Your answers won't be saved.")) return;
    window.location.reload();
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
        <button
          className={`${s.navRestart}${chatStarted ? ` ${s.show}` : ""}`}
          onClick={restart}
        >
          ← Start over
        </button>
      </nav>

      <main className={s.stage}>
        <div className={s.chatFrame}>

          {/* Welcome / resting state */}
          <div className={`${s.welcome}${chatStarted ? ` ${s.gone}` : ""}`}>
            <div
              className={s.welcomeFace}
              dangerouslySetInnerHTML={{ __html: ARLO_64 }}
            />
            <div className={s.welcomeName}>Arlo</div>
            <h1 className={s.welcomeHeading}>
              Hi — I&apos;m here to help you find your direction.
            </h1>
            <p className={s.welcomeSub}>
              I&apos;ll ask you two or three things. That&apos;s it.<br />
              Start by sharing your CV below, or just tell me about yourself.
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
            {showInput && (
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
                  >
                    {uploadIcon}
                  </button>
                )}
                <input
                  ref={fieldRef}
                  className={s.inputField}
                  type="text"
                  value={inputValue}
                  placeholder={chatStarted ? placeholder : PLACEHOLDERS[0]}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={onKey}
                />
                <button className={s.sendBtn} onClick={onSend} aria-label="Send">
                  {sendIcon}
                </button>
              </div>
            )}
            {showSubmit && (
              <div className={s.submitWrap}>
                <button
                  className={s.btnSubmit}
                  onClick={() => { window.location.href = "/loading"; }}
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
