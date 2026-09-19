"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

type Logo = { name: string; src: string };

const LOGO_SETS: readonly Logo[][] = [
  [
    { name: "Notion", src: "/logos/notion.svg" },
    { name: "Google Calendar", src: "/logos/google-calendar.svg" },
    { name: "GitHub", src: "/logos/github.svg" },
    { name: "Slack", src: "/logos/slack.svg" },
    { name: "Figma", src: "/logos/figma.svg" },
  ],
  [
    { name: "Linear", src: "/logos/linear.svg" },
    { name: "Google Drive", src: "/logos/google-drive.svg" },
    { name: "Discord", src: "/logos/discord.svg" },
    { name: "Trello", src: "/logos/trello.svg" },
    { name: "Vercel", src: "/logos/vercel.svg" },
  ],
];

const ROTATION_INTERVAL = 3000;
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EASE_IN:  [number, number, number, number] = [0.4, 0, 1, 1];

export default function LogoCloud() {
  const shouldReduceMotion = useReducedMotion();
  const [activeSet, setActiveSet] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion || LOGO_SETS.length <= 1) return;
    const id = window.setInterval(
      () => setActiveSet((c) => (c + 1) % LOGO_SETS.length),
      ROTATION_INTERVAL
    );
    return () => window.clearInterval(id);
  }, [shouldReduceMotion]);

  const visibleSet = shouldReduceMotion ? 0 : activeSet;

  return (
    <section
      aria-labelledby="life-os-integrations"
      className="relative overflow-hidden bg-black py-16 sm:py-20 lg:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.045),transparent_42%)]"
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10 lg:mb-12">
          <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.3em] text-zinc-500 sm:text-xs">
            Built around your workflow
          </p>
          <h2
            id="life-os-integrations"
            className="text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl"
          >
            Everything you already use.
          </h2>
          <p className="mt-3 text-sm leading-6 text-zinc-500 sm:mt-4 sm:text-base">
            Life OS brings your systems together without forcing you to rebuild
            the way you work.
          </p>
        </div>

        {/* Card */}
        <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.015] px-4 py-8 shadow-[0_0_80px_rgba(255,255,255,0.02)] sm:rounded-2xl sm:px-8 sm:py-10 lg:px-12 lg:py-12">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-black to-transparent sm:h-14" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-gradient-to-t from-black to-transparent sm:h-14" />

          <div className="relative flex min-h-[72px] items-center justify-center sm:min-h-[88px] lg:min-h-[100px]">
            <AnimatePresence mode="popLayout" initial={!shouldReduceMotion}>
              <motion.div
                key={visibleSet}
                initial={shouldReduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.35 }}
                className="flex w-full flex-wrap items-center justify-center gap-x-6 gap-y-6 sm:gap-x-10 sm:gap-y-8 lg:gap-x-14"
              >
                {LOGO_SETS[visibleSet].map((logo, index) => (
                  <LogoItem
                    key={logo.name}
                    logo={logo}
                    index={index}
                    reduceMotion={!!shouldReduceMotion}
                    easeOut={EASE_OUT}
                    easeIn={EASE_IN}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Dot indicators */}
        {!shouldReduceMotion && LOGO_SETS.length > 1 && (
          <div
            aria-label={`Logo group ${activeSet + 1} of ${LOGO_SETS.length}`}
            className="mt-5 flex justify-center gap-1.5"
          >
            {LOGO_SETS.map((_, i) => (
              <span
                key={i}
                aria-hidden="true"
                className={`h-1 rounded-full transition-all duration-300 ${
                  activeSet === i ? "w-5 bg-white" : "w-1 bg-white/25"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

type LogoItemProps = {
  logo: Logo;
  index: number;
  reduceMotion: boolean;
  easeOut: [number, number, number, number];
  easeIn:  [number, number, number, number];
};

function LogoItem({ logo, index, reduceMotion, easeOut, easeIn }: LogoItemProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <motion.div
      initial={reduceMotion ? undefined : { opacity: 0, y: 24, filter: "blur(8px)" }}
      animate={
        reduceMotion
          ? { opacity: 0.55 }
          : {
              opacity: 0.55,
              y: 0,
              filter: "blur(0px)",
              transition: { delay: index * 0.1, duration: 0.5, ease: easeOut },
            }
      }
      exit={
        reduceMotion
          ? undefined
          : {
              opacity: 0,
              y: -24,
              filter: "blur(8px)",
              transition: { duration: 0.3, ease: easeIn },
            }
      }
      whileHover={reduceMotion ? undefined : { opacity: 1, scale: 1.04 }}
      className="flex h-8 min-w-[80px] items-center justify-center sm:h-9 sm:min-w-[100px] lg:h-10 lg:min-w-[110px]"
    >
      {hasError ? (
        <span className="max-w-full truncate text-xs font-medium text-zinc-600 transition-colors hover:text-zinc-400 sm:text-sm">
          {logo.name}
        </span>
      ) : (
        <Image
          src={logo.src}
          alt={logo.name}
          width={110}
          height={32}
          sizes="(max-width: 640px) 80px, (max-width: 1024px) 100px, 110px"
          className="h-auto max-h-6 w-auto max-w-[90px] object-contain grayscale invert opacity-70 transition-opacity duration-200 hover:opacity-100 sm:max-h-7 sm:max-w-[110px]"
          onError={() => setHasError(true)}
        />
      )}
    </motion.div>
  );
}
