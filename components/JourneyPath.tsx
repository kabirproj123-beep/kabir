"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Hero signature: the journey path.
 * A single meandering line through the decision points Meridian guides students
 * past — stream, college, exams, offer, career. It encodes the whole-way promise
 * (not just study-abroad), and the line draws itself on load.
 */

type Milestone = { x: number; y: number; label: string; side: "left" | "right"; active?: boolean };

const D =
  "M 300 52 C 240 96, 205 116, 150 152 C 205 192, 360 214, 300 252 " +
  "C 240 290, 205 310, 150 348 C 205 388, 360 410, 300 448";

const MILESTONES: Milestone[] = [
  { x: 300, y: 52, label: "Stream", side: "left" },
  { x: 150, y: 152, label: "College", side: "right" },
  { x: 300, y: 252, label: "Exams", side: "left", active: true },
  { x: 150, y: 348, label: "Offer", side: "right" },
  { x: 300, y: 448, label: "Career", side: "left" },
];

export function JourneyPath({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <svg
      viewBox="0 0 440 500"
      className={className}
      fill="none"
      role="img"
      aria-label="A single guiding path connecting the milestones of a student's journey — stream, college, exams, offer, and career."
    >
      {/* faint dotted grid for depth */}
      <g stroke="var(--color-line)" strokeWidth="1" opacity="0.6">
        {[100, 200, 300, 400].map((y) => (
          <line key={y} x1="20" x2="420" y1={y} y2={y} strokeDasharray="1 10" />
        ))}
      </g>

      {/* the path */}
      <motion.path
        d={D}
        stroke="var(--color-forest)"
        strokeWidth="2"
        strokeLinecap="round"
        initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      />

      {/* milestones */}
      {MILESTONES.map((m, i) => (
        <motion.g
          key={m.label}
          initial={reduce ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.5 + i * 0.28, ease: "backOut" }}
          style={{ transformOrigin: `${m.x}px ${m.y}px` }}
        >
          {m.active && !reduce && (
            <motion.circle
              cx={m.x}
              cy={m.y}
              r="8"
              fill="var(--color-terra)"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 3.2, opacity: 0 }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut", delay: 2 }}
              style={{ transformOrigin: `${m.x}px ${m.y}px` }}
            />
          )}
          <circle cx={m.x} cy={m.y} r="8" fill={m.active ? "var(--color-terra)" : "var(--color-paper)"} stroke={m.active ? "var(--color-terra)" : "var(--color-forest)"} strokeWidth="2" />
          <text
            x={m.side === "left" ? m.x - 22 : m.x + 22}
            y={m.y + 4}
            textAnchor={m.side === "left" ? "end" : "start"}
            className="font-display"
            fontSize="15"
            fontWeight="600"
            fill="var(--color-ink)"
          >
            {m.label}
          </text>
        </motion.g>
      ))}
    </svg>
  );
}
