"use client";

import { useEffect, useRef } from "react";
import s from "./TailorCVModal.module.css";

interface Props {
  jobTitle: string;
  jobCompany?: string;
  tailoredCv: string;
  changes: string[];
  onClose: () => void;
}

export default function TailorCVModal({ jobTitle, jobCompany, tailoredCv, changes, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
    return () => dialogRef.current?.close();
  }, []);

  function handleBackdrop(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) onClose();
  }

  return (
    <dialog ref={dialogRef} className={s.dialog} onClick={handleBackdrop}>
      <div className={s.inner}>
        {/* Screen-only header */}
        <div className={s.header}>
          <div>
            <div className={s.label}>CV tailored for</div>
            <h2 className={s.title}>{jobTitle}{jobCompany ? ` — ${jobCompany}` : ""}</h2>
          </div>
          <div className={s.headerActions}>
            <button className={s.downloadBtn} type="button" onClick={() => window.print()}>
              Download PDF
            </button>
            <button className={s.closeBtn} type="button" onClick={onClose} aria-label="Close">✕</button>
          </div>
        </div>

        {/* Changes — the mentoring piece */}
        {changes.length > 0 && (
          <div className={s.changes}>
            <div className={s.changesLabel}>What I changed and why</div>
            <ul className={s.changesList}>
              {changes.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>
        )}

        {/* The tailored CV — this section is what prints */}
        <div id="cv-print-root" className={s.cvRoot}>
          <pre className={s.cvText}>{tailoredCv}</pre>
        </div>
      </div>
    </dialog>
  );
}
