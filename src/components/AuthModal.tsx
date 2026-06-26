"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import s from "./auth-modal.module.css";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const googleIcon = (
  <svg className={s.googleIcon} viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

type AuthView =
  | "signup"
  | "signin"
  | "otp"
  | "otp-error"
  | "otp-expired"
  | "send-error"
  | "account-exists" // tried to sign up with an email that already has an account
  | "no-account"; // tried to sign in with an email that has no account

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialView?: "signup" | "signin";
  /** When set, overrides the isNewUser routing after auth completes. */
  redirectTo?: string;
  /** Called when the user explicitly clicks the secondary dismiss action. */
  onContinueWithoutSaving?: () => void;
  /** Label for that secondary action (default "Continue without saving"). */
  continueLabel?: string;
  /**
   * When set, OTP verification completes IN PLACE — no navigation. Used by the
   * first session so signing in doesn't tear down the conversation. (Google OAuth
   * still round-trips via redirectTo; it can't complete without leaving the page.)
   */
  onAuthed?: () => void;
}

export default function AuthModal({ isOpen, onClose, initialView = "signup", redirectTo, onContinueWithoutSaving, onAuthed, continueLabel }: Props) {
  const [view, setView] = useState<AuthView>(initialView);
  const [email, setEmail] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  // Distinguishes a rate-limit ("you asked for a code recently") from a real failure,
  // so the send-error copy is calm and specific rather than a scary "something went wrong".
  const [rateLimited, setRateLimited] = useState(false);
  const otpRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    if (isOpen) {
      // Reset the form to a clean state each time the modal opens — synchronising
      // internal state to an external open/close trigger, not derivable in render.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setView(initialView);
      setEmail("");
      setOtpValue("");
      setCodeSent(false);
      setLoading(false);
      setRateLimited(false);
    }
  }, [isOpen, initialView]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (view === "otp" || view === "otp-error" || view === "otp-expired") {
      setTimeout(() => otpRef.current?.focus(), 80);
    }
  }, [view]);

  function formatOtp(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 6);
    if (digits.length > 3) return digits.slice(0, 3) + " " + digits.slice(3);
    return digits;
  }

  function handleOtpChange(e: React.ChangeEvent<HTMLInputElement>) {
    setOtpValue(formatOtp(e.target.value));
  }

  async function handleGoogleSignIn() {
    const callbackUrl = redirectTo
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`
      : `${window.location.origin}/auth/callback`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl },
    });
  }

  // Mild email-enumeration check (see /api/auth/check-email). On any lookup failure
  // we return false so a flaky check never blocks a legitimate signup.
  async function emailHasAccount(addr: string): Promise<boolean> {
    try {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: addr }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      return data?.exists === true;
    } catch {
      return false;
    }
  }

  function isRateLimit(message?: string): boolean {
    return /rate|after \d+ second|request this after|too many|seconds?\b/i.test(message ?? "");
  }
  function isNoAccount(message?: string): boolean {
    return /signups? not allowed|user not found|no user|not found/i.test(message ?? "");
  }

  function handleSendError(message?: string) {
    setRateLimited(isRateLimit(message));
    setView("send-error");
  }

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    const addr = email.trim();
    if (!addr || loading) return;
    setLoading(true);
    try {
      if (view === "signup") {
        // Don't create a duplicate — point an existing account to log in instead.
        if (await emailHasAccount(addr)) {
          setView("account-exists");
          return;
        }
        const { error } = await supabase.auth.signInWithOtp({
          email: addr,
          options: { shouldCreateUser: true },
        });
        if (error) return handleSendError(error.message);
        setView("otp");
      } else {
        // Sign in — must be an existing account; shouldCreateUser:false makes
        // Supabase error for unknown emails so we can say "no account found".
        const { error } = await supabase.auth.signInWithOtp({
          email: addr,
          options: { shouldCreateUser: false },
        });
        if (error) {
          if (isNoAccount(error.message)) {
            setView("no-account");
            return;
          }
          return handleSendError(error.message);
        }
        setView("otp");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const digits = otpValue.replace(/\D/g, "");
    if (digits.length < 6 || loading) return;
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: digits,
      type: "email",
    });
    setLoading(false);
    if (error) {
      if (error.message?.toLowerCase().includes("expired")) {
        setView("otp-expired");
      } else {
        setView("otp-error");
      }
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    onClose();
    // In-place completion (first session) — continue the conversation without a
    // page navigation that would discard it.
    if (onAuthed) {
      onAuthed();
      return;
    }
    if (redirectTo) {
      router.push(redirectTo);
    } else if (user) {
      const createdAt = new Date(user.created_at).getTime();
      const lastSignIn = new Date(user.last_sign_in_at ?? user.created_at).getTime();
      const isNewUser = lastSignIn - createdAt < 10000;
      router.push(isNewUser ? "/workspace?view=first" : "/workspace");
    } else {
      router.push("/workspace");
    }
  }

  async function handleResend() {
    setOtpValue("");
    setCodeSent(true);
    setView("otp");
    await supabase.auth.signInWithOtp({ email: email.trim() });
  }

  if (!isOpen) return null;

  const isOtpView = view === "otp" || view === "otp-error" || view === "otp-expired";
  const isSendError = view === "send-error";
  const isCrossPrompt = view === "account-exists" || view === "no-account";
  const isEmailEntry = !isOtpView && !isSendError && !isCrossPrompt;

  return (
    <div className={s.backdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>

        <div className={s.wordmark}>Career Intelligence</div>

        {/* ── Email entry states ── */}
        {isEmailEntry && (
          <>
            <h2 className={s.heading}>
              {view === "signup" ? "Save your results." : "Sign in."}
            </h2>
            <p className={s.sub}>
              {view === "signup"
                ? "Create an account to keep your analysis, track applications, and come back whenever you're ready."
                : "Pick up where you left off, or start fresh."}
            </p>

            <button className={s.btnGoogle} onClick={handleGoogleSignIn} disabled={loading}>
              {googleIcon}
              Continue with Google
            </button>

            <div className={s.divider}>
              <div className={s.dividerLine} />
              <span className={s.dividerText}>or</span>
              <div className={s.dividerLine} />
            </div>

            <form onSubmit={handleSendCode}>
              <input
                ref={emailRef}
                className={s.inputField}
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
              />
              <button className={s.btnPrimary} type="submit" disabled={loading}>
                {loading ? "Sending…" : "Send me a code"}
              </button>
            </form>

            {/* Standard cross-link between the two entry points. */}
            <p className={s.switchPrompt}>
              {view === "signup" ? (
                <>Already have an account?{" "}
                  <button type="button" className={s.switchLink} onClick={() => setView("signin")}>Log in</button>
                </>
              ) : (
                <>New here?{" "}
                  <button type="button" className={s.switchLink} onClick={() => setView("signup")}>Create an account</button>
                </>
              )}
            </p>

            {view === "signup" && (
              <button className={s.linkSecondary} onClick={onContinueWithoutSaving ?? onClose}>
                <span>{continueLabel ?? "Continue without saving"}</span>
              </button>
            )}
          </>
        )}

        {/* ── Already have an account (tried to sign up with an existing email) ── */}
        {view === "account-exists" && (
          <>
            <h2 className={s.heading}>You already have an account.</h2>
            <p className={s.sub}>
              <strong className={s.emailStrong}>{email}</strong> is already registered. Log in and we&apos;ll
              pick up right where you left off.
            </p>
            <button className={s.btnPrimary} onClick={() => setView("signin")}>Log in instead</button>
          </>
        )}

        {/* ── No account (tried to sign in with an unknown email) ── */}
        {view === "no-account" && (
          <>
            <h2 className={s.heading}>We couldn&apos;t find that account.</h2>
            <p className={s.sub}>
              There&apos;s no account for <strong className={s.emailStrong}>{email}</strong> yet. Create one and
              your analysis will be saved as you go.
            </p>
            <button className={s.btnPrimary} onClick={() => setView("signup")}>Create an account</button>
          </>
        )}

        {/* ── Send error state — calm + specific for the common rate-limit case ── */}
        {isSendError && (
          <>
            <h2 className={s.heading}>
              {rateLimited ? "Just a moment." : "That didn't send."}
            </h2>
            <p className={s.sub}>
              {rateLimited ? (
                <>You asked for a code very recently. Wait about a minute, then try again — a fresh one will go to{" "}
                  <strong className={s.emailStrong}>{email}</strong>.</>
              ) : (
                <>We couldn&apos;t send a code to <strong className={s.emailStrong}>{email}</strong> just now. Check
                  the address and try again.</>
              )}
            </p>
            <button className={s.btnPrimary} onClick={() => setView(initialView)}>Try again</button>
          </>
        )}

        {/* ── OTP states ── */}
        {isOtpView && (
          <>
            <h2 className={s.heading}>Check your inbox.</h2>
            <p className={s.sub}>
              We sent a 6-digit code to{" "}
              <strong className={s.emailStrong}>{email || "your email"}</strong>
            </p>

            <form onSubmit={handleVerify}>
              <input
                ref={otpRef}
                className={`${s.otpInput}${view === "otp-error" ? ` ${s.otpError}` : ""}`}
                type="text"
                inputMode="numeric"
                placeholder="· · · · · ·"
                value={otpValue}
                onChange={handleOtpChange}
                autoComplete="one-time-code"
                disabled={loading}
              />

              {view === "otp-error" && (
                <div className={`${s.statusMsg} ${s.statusError}`}>
                  That code didn&apos;t match — try again, or resend.
                </div>
              )}
              {view === "otp-expired" && (
                <div className={`${s.statusMsg} ${s.statusInfo}`}>
                  That code has expired — we&apos;ve sent you a fresh one.
                </div>
              )}
              {view === "otp" && !codeSent && (
                <p className={s.waitingHint}>Takes about 30 seconds to arrive.</p>
              )}
              {view === "otp" && codeSent && (
                <div className={`${s.statusMsg} ${s.statusInfo}`}>
                  New code on its way.
                </div>
              )}

              <button className={s.btnPrimary} type="submit" disabled={loading}>
                {loading ? "Verifying…" : view === "otp-error" ? "Try again" : "Verify"}
              </button>
            </form>

            <div className={s.resendRow}>
              <span>Didn&apos;t get it?</span>
              <button className={s.resendLink} onClick={handleResend} disabled={loading}>
                {view === "otp-expired" ? "Resend again" : "Resend"}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
