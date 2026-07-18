"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Signature motif: the route map.
 * A single hub (home) with terracotta arcs reaching out to study destinations.
 * The arcs draw themselves on load; the destination nodes settle in after.
 * Re-used at small scale as a section divider (see RouteDivider).
 */

type Node = { code: string; x: number; y: number };

const HOME = { x: 296, y: 250 };
const NODES: Node[] = [
  { code: "CA", x: 132, y: 64 },
  { code: "US", x: 78, y: 150 },
  { code: "UK", x: 232, y: 58 },
  { code: "IE", x: 176, y: 104 },
  { code: "DE", x: 372, y: 78 },
  { code: "AU", x: 486, y: 322 },
];

function arc(a: { x: number; y: number }, b: Node) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const lift = 70; // pull the control point "up" for a flight-path curve
  return `M ${a.x} ${a.y} Q ${mx} ${my - lift} ${b.x} ${b.y}`;
}

export function RouteMap({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();

  return (
    <svg
      viewBox="0 0 560 360"
      className={className}
      fill="none"
      role="img"
      aria-label="A map of study-abroad routes fanning out from home to universities across the world."
    >
      {/* faint dotted graticule for an atlas feel */}
      <g stroke="var(--color-line)" strokeWidth="1" opacity="0.7">
        {[70, 140, 210, 280].map((y) => (
          <line key={y} x1="0" x2="560" y1={y} y2={y} strokeDasharray="1 9" />
        ))}
        {[93, 186, 279, 372, 465].map((x) => (
          <line key={x} x1={x} x2={x} y1="0" y2="360" strokeDasharray="1 9" />
        ))}
      </g>

      {/* arcs */}
      {NODES.map((n, i) => (
        <motion.path
          key={n.code}
          d={arc(HOME, n)}
          stroke="var(--color-terra)"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={reduce ? { pathLength: 1, opacity: 0.85 } : { pathLength: 0, opacity: 0.85 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, delay: 0.25 + i * 0.14, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}

      {/* destination nodes */}
      {NODES.map((n, i) => (
        <motion.g
          key={`${n.code}-node`}
          initial={reduce ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 1.1 + i * 0.12, ease: "backOut" }}
          style={{ transformOrigin: `${n.x}px ${n.y}px` }}
        >
          <circle cx={n.x} cy={n.y} r="4.5" fill="var(--color-forest)" />
          <circle cx={n.x} cy={n.y} r="9" stroke="var(--color-forest)" strokeWidth="1" opacity="0.35" />
          <text
            x={n.x}
            y={n.y - 15}
            textAnchor="middle"
            className="font-display"
            fontSize="11"
            fontWeight="600"
            letterSpacing="0.08em"
            fill="var(--color-moss)"
          >
            {n.code}
          </text>
        </motion.g>
      ))}

      {/* home hub */}
      <g>
        <motion.circle
          cx={HOME.x}
          cy={HOME.y}
          r="7"
          fill="var(--color-terra)"
          initial={reduce ? { scale: 1 } : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, ease: "backOut" }}
          style={{ transformOrigin: `${HOME.x}px ${HOME.y}px` }}
        />
        {!reduce && (
          <motion.circle
            cx={HOME.x}
            cy={HOME.y}
            r="7"
            fill="var(--color-terra)"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut", delay: 1.6 }}
            style={{ transformOrigin: `${HOME.x}px ${HOME.y}px` }}
          />
        )}
        <text
          x={HOME.x}
          y={HOME.y + 26}
          textAnchor="middle"
          className="font-display"
          fontSize="11"
          fontWeight="700"
          letterSpacing="0.08em"
          fill="var(--color-ink)"
        >
          YOU
        </text>
      </g>
    </svg>
  );
}

/** Small horizontal variant used to separate sections. */
export function RouteDivider() {
  return (
    <div className="container-x" aria-hidden>
      <svg viewBox="0 0 1200 24" className="w-full h-6" fill="none" preserveAspectRatio="none">
        <line x1="0" y1="12" x2="1200" y2="12" stroke="var(--color-line)" strokeWidth="1" strokeDasharray="1 9" />
        <circle cx="600" cy="12" r="4" fill="var(--color-terra)" />
        <path d="M 480 12 Q 540 -8 600 12" stroke="var(--color-terra)" strokeWidth="1.25" opacity="0.6" />
        <path d="M 600 12 Q 660 -8 720 12" stroke="var(--color-terra)" strokeWidth="1.25" opacity="0.6" />
      </svg>
    </div>
  );
}
