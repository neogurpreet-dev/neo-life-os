"use client";

import Link from "next/link";
import { useState, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";

/* ─── Types ─────────────────────────────── */
type NavChild = {
  icon: string;
  title: string;
  desc: string;
  href: string;
};
type NavItem = {
  id: string;
  label: string;
  children: NavChild[];
};

/* ─── Nav data ───────────────────────────── */
const NAV_ITEMS: NavItem[] = [
  {
    id: "features",
    label: "Features",
    children: [
      { icon: "◈", title: "Dashboard",   desc: "Your personal command centre",      href: "#" },
      { icon: "✦", title: "Task Board",  desc: "Kanban that fits your brain",        href: "#" },
      { icon: "◎", title: "Focus Timer", desc: "Deep work sessions, tracked",         href: "#" },
      { icon: "⚡", title: "Analytics",   desc: "See where your time really goes",    href: "#" },
    ],
  },
  {
    id: "integrations",
    label: "Integrations",
    children: [
      { icon: "◻", title: "Notion",          desc: "Sync pages and databases",        href: "#" },
      { icon: "◻", title: "Google Calendar", desc: "Two-way calendar sync",           href: "#" },
      { icon: "◻", title: "GitHub",          desc: "Track commits and PRs",           href: "#" },
      { icon: "◻", title: "Slack",           desc: "Notifications and quick capture", href: "#" },
    ],
  },
  {
    id: "pricing",
    label: "Pricing",
    children: [
      { icon: "○", title: "Free",       desc: "Personal use, always free",  href: "#" },
      { icon: "○", title: "Pro",        desc: "Power users · $8 / mo",      href: "#" },
      { icon: "○", title: "Team",       desc: "Up to 10 seats · $24 / mo",  href: "#" },
      { icon: "○", title: "Enterprise", desc: "Unlimited · custom pricing",  href: "#" },
    ],
  },
];

/* ─── Animation variants ─────────────────── */
// Matches the GSAP perspective flip from the original artifact
const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_IN:  [number, number, number, number] = [0.4,  0, 1,   1];

const dropVariants = {
  hidden:  { opacity: 0, y: -8,  rotateX: -12, scale: 0.97 },
  visible: { opacity: 1, y: 0,   rotateX: 0,   scale: 1,
    transition: { duration: 0.22, ease: EASE_OUT } },
  exit:    { opacity: 0, y: -6,  rotateX: -8,  scale: 0.97,
    transition: { duration: 0.16, ease: EASE_IN  } },
};

const drawerVariants = {
  hidden:  { opacity: 0, y: -8, scaleY: 0.96 },
  visible: { opacity: 1, y: 0,  scaleY: 1,
    transition: { duration: 0.22, ease: EASE_OUT } },
  exit:    { opacity: 0, y: -8, scaleY: 0.96,
    transition: { duration: 0.18, ease: EASE_IN  } },
};

const accordionVariants = {
  hidden:  { opacity: 0, height: 0 },
  visible: { opacity: 1, height: "auto",
    transition: { duration: 0.18, ease: EASE_OUT } },
  exit:    { opacity: 0, height: 0,
    transition: { duration: 0.14, ease: EASE_IN  } },
};

/* ─── Component ──────────────────────────── */
export default function Navbar() {
  const [activeId, setActiveId]         = useState<string | null>(null);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [mobileExp, setMobileExp]       = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Hover open/close with 80ms delay (same as original) */
  const cancelClose = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const open = useCallback((id: string) => {
    cancelClose();
    setActiveId(id);
  }, [cancelClose]);

  const close = useCallback((id: string) => {
    timerRef.current = setTimeout(() => {
      setActiveId((cur) => (cur === id ? null : cur));
    }, 80);
  }, []);

  return (
    <>
      {/* ══════════ PILL NAVBAR ══════════ */}
      <nav
        className="fixed top-6 left-1/2 z-50 w-[calc(100%-3rem)] max-w-[860px] -translate-x-1/2"
        aria-label="Main navigation"
      >
        <div
          className="flex items-center justify-between rounded-full
                     border border-[#2a2a2a] bg-black/80 px-4 py-2.5
                     shadow-[0_4px_32px_rgba(0,0,0,0.6)]
                     backdrop-blur-xl"
        >
          {/* ── Logo ── */}
          <Link href="#" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="grid grid-cols-2 gap-[3px] h-7 w-7">
              <span className="block rounded-[3px] bg-white" />
              <span className="block rounded-[3px] bg-white/30" />
              <span className="block rounded-[3px] bg-white/55" />
              <span className="block rounded-[3px] bg-white" />
            </div>
            <span className="text-[15px] font-semibold tracking-[-0.02em] text-white">
              Life OS
            </span>
          </Link>

          {/* ── Center items (desktop) ── */}
          <div className="hidden items-center gap-0.5 md:flex">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.id}
                className="relative"
                onMouseEnter={() => open(item.id)}
                onMouseLeave={() => close(item.id)}
              >
                {/* Trigger button */}
                <button
                  className={`flex items-center gap-1 rounded-full px-3.5 py-[7px]
                               text-[14px] font-medium transition-all duration-150
                               ${activeId === item.id
                                 ? "bg-white/[0.06] text-white"
                                 : "text-[#888] hover:bg-white/[0.05] hover:text-white"
                               }`}
                  aria-expanded={activeId === item.id}
                >
                  {item.label}
                  <svg
                    className={`h-[14px] w-[14px] flex-shrink-0 opacity-50
                                 transition-transform duration-200
                                 ${activeId === item.id ? "rotate-180" : ""}`}
                    viewBox="0 0 16 16" fill="none"
                    stroke="currentColor" strokeWidth={2}
                  >
                    <path d="M4 6l4 4 4-4" />
                  </svg>
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {activeId === item.id && (
                    <motion.div
                      key="dropdown"
                      variants={dropVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      style={{
                        transformPerspective: 800,
                        transformOrigin: "top center",
                      }}
                      className="absolute left-1/2 top-[calc(100%+10px)] -translate-x-1/2
                                 min-w-[228px] rounded-2xl
                                 border border-[#2a2a2a] bg-[#0a0a0a]/95
                                 p-1.5 shadow-[0_8px_40px_rgba(0,0,0,0.8)]
                                 backdrop-blur-2xl"
                    >
                      {item.children.map((child) => (
                        <a
                          key={child.title}
                          href={child.href}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5
                                     transition-colors duration-150 hover:bg-white/[0.04]"
                        >
                          <span
                            className="flex h-8 w-8 flex-shrink-0 items-center justify-center
                                       rounded-lg bg-white/[0.04] text-base"
                          >
                            {child.icon}
                          </span>
                          <span className="flex flex-col gap-px">
                            <span className="text-[13.5px] font-medium text-white">
                              {child.title}
                            </span>
                            <span className="text-[12px] text-[#666]">
                              {child.desc}
                            </span>
                          </span>
                        </a>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* ── Right side ── */}
          <div className="flex items-center gap-2">
            {/* CTA (desktop) */}
            <button
              className="hidden rounded-full bg-[#3b82f6] px-4 py-[7px]
                         text-[13.5px] font-semibold text-white
                         transition-all duration-150
                         hover:bg-[#2563eb] active:scale-[0.97] md:block"
            >
              Open App
            </button>

            {/* Hamburger (mobile) */}
            <button
              className="flex h-8 w-8 flex-col items-center justify-center gap-[5px]
                         rounded-lg p-1 transition-colors hover:bg-white/[0.05] md:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => {
                setMobileOpen((o) => !o);
                setMobileExp(null);
              }}
            >
              <span
                className={`block h-[1.5px] w-[18px] rounded-full bg-white
                             transition-transform duration-200
                             ${mobileOpen ? "translate-y-[6.5px] rotate-45" : ""}`}
              />
              <span
                className={`block h-[1.5px] w-[18px] rounded-full bg-white
                             transition-opacity duration-200
                             ${mobileOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`block h-[1.5px] w-[18px] rounded-full bg-white
                             transition-transform duration-200
                             ${mobileOpen ? "-translate-y-[6.5px] -rotate-45" : ""}`}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* ══════════ MOBILE DRAWER ══════════ */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="drawer"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ transformOrigin: "top center" }}
            className="fixed left-4 right-4 top-[80px] z-40 overflow-hidden
                       rounded-2xl border border-[#2a2a2a] bg-[#0a0a0a]/95
                       p-3 shadow-[0_8px_40px_rgba(0,0,0,0.8)]
                       backdrop-blur-2xl md:hidden"
          >
            {NAV_ITEMS.map((item) => (
              <div key={item.id} className="mb-0.5 overflow-hidden rounded-xl">
                {/* Section trigger */}
                <button
                  className="flex w-full items-center justify-between rounded-xl
                             px-3.5 py-3 text-[15px] font-medium text-white
                             transition-colors hover:bg-white/[0.04]"
                  onClick={() =>
                    setMobileExp((cur) => (cur === item.id ? null : item.id))
                  }
                >
                  {item.label}
                  <svg
                    className={`h-4 w-4 text-[#666] transition-transform duration-200
                                 ${mobileExp === item.id ? "rotate-180" : ""}`}
                    viewBox="0 0 16 16" fill="none"
                    stroke="currentColor" strokeWidth={2}
                  >
                    <path d="M4 6l4 4 4-4" />
                  </svg>
                </button>

                {/* Accordion children */}
                <AnimatePresence>
                  {mobileExp === item.id && (
                    <motion.div
                      key="acc"
                      variants={accordionVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="overflow-hidden px-1.5 pb-2"
                    >
                      {item.children.map((child) => (
                        <a
                          key={child.title}
                          href={child.href}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5
                                     text-[14px] text-[#888]
                                     transition-colors hover:bg-white/[0.04] hover:text-white"
                        >
                          <span>{child.icon}</span>
                          {child.title}
                        </a>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {/* Mobile CTA */}
            <button
              className="mt-2 w-full rounded-xl bg-[#3b82f6] py-3
                         text-[15px] font-semibold text-white
                         transition-opacity hover:opacity-90"
            >
              Open App
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
