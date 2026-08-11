"use client";

/**
 * Site-wide enquiry form.
 *
 * The dedicated pages (counselling, contact, a college's own page) each carry a
 * LeadForm tuned to their context. This is the catch-all for everywhere else —
 * rankings, courses, exams, the college list — where a visitor is interested
 * but there is nothing on the page to capture that.
 *
 * It also opens itself once, a few seconds in. That is the point of the thing:
 * most visitors never scroll to a form. Once per visitor, though — an invite
 * that reappears on every page turn is an annoyance, and `sessionStorage`
 * keeps this one to a single ask per browsing session.
 *
 * Built on the native <dialog> element: focus trapping, Escape-to-close and the
 * top layer come for free, so nothing here has to fight the sticky header or
 * the mobile action bar for z-index. The entry/exit animation is CSS
 * (`dialog.modal` in globals.css) rather than a JS animation library.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { STREAMS } from "@/lib/colleges";
import { LeadForm } from "./LeadForm";

/** How long a visitor gets to read the page before we ask. */
const AUTO_OPEN_MS = 8000;
const SEEN_KEY = "enquiry-prompted";

export function EnquiryWidget() {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  /** Bumped on each open so a reopened dialog shows a blank form, not the
   *  previous submission's success card. */
  const [round, setRound] = useState(0);

  const show = useCallback(() => {
    const el = ref.current;
    if (!el || el.open) return;
    setRound((n) => n + 1);
    setOpen(true);
    el.showModal();
  }, []);

  const hide = useCallback(() => ref.current?.close(), []);

  // The one unprompted ask. Skipped if they've already seen it this session, or
  // already submitted — sessionStorage is set on both.
  useEffect(() => {
    try {
      if (sessionStorage.getItem(SEEN_KEY)) return;
    } catch {
      // Private mode / storage disabled: don't auto-open rather than risk
      // showing the dialog on every single page view.
      return;
    }

    const id = setTimeout(() => {
      // Don't interrupt someone already typing in one of the page's own forms.
      const active = document.activeElement?.tagName;
      if (active === "INPUT" || active === "SELECT" || active === "TEXTAREA") return;

      sessionStorage.setItem(SEEN_KEY, "1");
      show();
    }, AUTO_OPEN_MS);

    return () => clearTimeout(id);
  }, [show]);

  // showModal() blocks interaction but not scrolling — the page still moves
  // under the dialog on wheel/touch without this.
  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [open]);

  function markSeen() {
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* storage disabled — nothing to remember it with */
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          markSeen();
          show();
        }}
        aria-haspopup="dialog"
        className="btn btn-primary fixed right-4 bottom-20 z-40 gap-2 px-4 py-3 text-sm shadow-lg shadow-navy/20 lg:right-6 lg:bottom-6"
      >
        <span aria-hidden className="text-base leading-none">
          💬
        </span>
        Enquire now
      </button>

      <dialog
        ref={ref}
        aria-labelledby="enquiry-title"
        onClose={() => setOpen(false)}
        // Clicks land on the dialog itself only when they hit the backdrop —
        // the panel inside stops them.
        onClick={(e) => {
          if (e.target === ref.current) hide();
        }}
        className="modal m-auto w-[min(28rem,calc(100vw-2rem))] rounded-2xl border border-line bg-white p-0 text-ink backdrop:bg-navy/60 backdrop:backdrop-blur-sm"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 id="enquiry-title" className="font-display text-lg font-bold">
              Send an enquiry
            </h2>
            <p className="mt-0.5 text-sm text-muted">
              Free, no obligation. A counsellor replies within one working day.
            </p>
          </div>
          <button
            type="button"
            onClick={hide}
            aria-label="Close enquiry form"
            className="-mt-1 -mr-1 grid size-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-paper-2 hover:text-ink"
          >
            <span aria-hidden>✕</span>
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
          <LeadForm
            key={round}
            source="enquiry"
            compact
            submitLabel="Send enquiry"
            successBody="A counsellor will call you within 24 hours. You can close this window."
            onDone={markSeen}
            extraFields={[
              {
                name: "course",
                label: "What are you interested in?*",
                type: "select",
                required: true,
                options: [...STREAMS, "Study abroad", "Education loan", "Not sure yet"],
              },
              { name: "city", label: "Preferred city (optional)" },
              { name: "message", label: "Anything we should know?" },
            ]}
          />
        </div>
      </dialog>
    </>
  );
}
