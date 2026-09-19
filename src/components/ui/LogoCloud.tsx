"use client";

import Image from "next/image";
import { useReducedMotion } from "motion/react";
import { useState } from "react";

/* ─── Data ──────────────────────────────── */
type Logo = { name: string; src: string };

const ALL_LOGOS: Logo[] = [
  { name: "Notion",          src: "/logos/notion.svg"           },
  { name: "Google Calendar", src: "/logos/google-calendar.svg"  },
  { name: "GitHub",          src: "/logos/github.svg"           },
  { name: "Slack",           src: "/logos/slack.svg"            },
  { name: "Figma",           src: "/logos/figma.svg"            },
  { name: "Linear",          src: "/logos/linear.svg"           },
  { name: "Google Drive",    src: "/logos/google-drive.svg"     },
  { name: "Discord",         src: "/logos/discord.svg"          },
  { name: "Trello",          src: "/logos/trello.svg"           },
  { name: "Vercel",          src: "/logos/vercel.svg"           },
];

/* Split into two rows scrolling in opposite directions */
const ROW_A = ALL_LOGOS.slice(0, 5);   // → left
const ROW_B = ALL_LOGOS.slice(5, 10);  // → right

/* Repeat to fill viewport width seamlessly */
const repeat = <T,>(arr: T[], times = 6): T[] =>
  Array.from({ length: times }, () => arr).flat();

const TRACK_A = repeat(ROW_A);
const TRACK_B = repeat(ROW_B);

/* ─── Single logo pill ───────────────────── */
function LogoPill({ logo }: { logo: Logo }) {
  const [error, setError] = useState(false);

  return (
    <div
      className="flex items-center gap-2.5 rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] px-5 py-3
                 whitespace-nowrap transition-all duration-200
                 hover:border-[#3d3d3d] hover:bg-[#161818]"
      aria-label={logo.name}
    >
      {error ? (
        <span className="text-xs font-medium text-[#5a6270]">{logo.name}</span>
      ) : (
        <>
          <Image
            src={logo.src}
            alt={logo.name}
            width={20}
            height={20}
            className="h-5 w-5 object-contain grayscale invert brightness-[0.6]"
            onError={() => setError(true)}
          />
          <span className="text-[13px] font-medium text-[#5a6270]">
            {logo.name}
          </span>
        </>
      )}
    </div>
  );
}

/* ─── One marquee row ───────────────────── */
function MarqueeRow({
  logos,
  direction = "left",
  speed = 40,
  paused,
}: {
  logos: Logo[];
  direction?: "left" | "right";
  speed?: number;
  paused: boolean;
}) {
  const animName = direction === "left" ? "marquee-left" : "marquee-right";

  return (
    <div className="relative overflow-hidden">
      <div
        className="flex gap-3"
        style={{
          width: "max-content",
          animation: `${animName} ${speed}s linear infinite`,
          animationPlayState: paused ? "paused" : "running",
          willChange: "transform",
        }}
      >
        {logos.map((logo, i) => (
          <LogoPill key={`a-${i}`} logo={logo} />
        ))}
        {logos.map((logo, i) => (
          <LogoPill key={`b-${i}`} logo={logo} />
        ))}
      </div>

      {/* Left fade */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-24 sm:w-40 lg:w-56"
        style={{ background: "linear-gradient(to right, #000 0%, transparent 100%)" }}
      />
      {/* Right fade */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-24 sm:w-40 lg:w-56"
        style={{ background: "linear-gradient(to left, #000 0%, transparent 100%)" }}
      />
    </div>
  );
}

/* ─── Main export ────────────────────────── */
export default function LogoCloud() {
  const shouldReduceMotion = useReducedMotion();
  const [hovered, setHovered]   = useState(false);

  const paused = !!shouldReduceMotion || hovered;

  return (
    <section
      aria-labelledby="lc-heading"
      className="w-full overflow-hidden bg-black py-20 sm:py-24 lg:py-32"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header */}
      <div className="mx-auto mb-12 max-w-xl px-4 text-center sm:mb-16">
        <p className="mb-4 font-mono text-[10px] font-medium uppercase tracking-[0.25em] text-[#5a6270]">
          Integrations
        </p>
        <h2
          id="lc-heading"
          className="text-2xl font-bold tracking-[-0.03em] text-white sm:text-3xl lg:text-4xl"
        >
          Works with tools{" "}
          <span className="text-[#5a6270]">you already use.</span>
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-[#5a6270]">
          Life OS connects your workflow without making you start over.
        </p>
      </div>

      {/* Marquee rows */}
      <div className="flex flex-col gap-3">
        <MarqueeRow logos={TRACK_A} direction="left"  speed={40} paused={paused} />
        <MarqueeRow logos={TRACK_B} direction="right" speed={52} paused={paused} />
      </div>

      {/* Subtle caption */}
      <p className="mt-10 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-[#222]">
        Hover to pause
      </p>
    </section>
  );
}
