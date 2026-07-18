"use client";

import { useState } from "react";
import { faqs } from "@/lib/content";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-24 lg:py-32">
      <div className="container-x grid lg:grid-cols-[0.8fr_1.2fr] gap-12">
        <div>
          <p className="eyebrow">Good to know</p>
          <h2 className="display-lg mt-5 text-ink">Questions, answered.</h2>
        </div>

        <div className="divide-y divide-line border-t border-line">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-display text-lg font-semibold text-ink">
                    {item.q}
                  </span>
                  <span
                    className={`shrink-0 text-2xl text-terra transition-transform duration-300 ${
                      isOpen ? "rotate-45" : ""
                    }`}
                    aria-hidden
                  >
                    +
                  </span>
                </button>
                <div
                  className="grid transition-all duration-300 ease-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="pb-6 text-moss max-w-prose">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
