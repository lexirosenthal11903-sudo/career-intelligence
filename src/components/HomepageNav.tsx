"use client";

import { useState, useEffect } from "react";
import s from "@/app/page.module.css";
import AuthModal from "./AuthModal";

export default function HomepageNav() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalView, setModalView] = useState<"signup" | "signin">("signup");

  function openSignup() { setModalView("signup"); setModalOpen(true); }
  function openSignin() { setModalView("signin"); setModalOpen(true); }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("signin") === "required") openSignin();
  }, []);

  return (
    <>
      <div className={s.nav}>
        <div className={s.navIn}>
          <span className={s.navWordmark}>Career Intelligence</span>
          <div className={s.navRight}>
            <button className={s.navLogin} onClick={openSignin}>Log in</button>
            <button className={s.navCta} onClick={openSignup}>Sign up →</button>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialView={modalView}
      />
    </>
  );
}
