"use client";

import ParticleTechStack from "@/components/ParticleTechStack/ParticleTechStack";
import DissolveOverlay from "@/components/DissolveOverlay/DissolveOverlay";
import YouWinSlide from "@/components/YouWinSlide/YouWinSlide";
import RetroTVPortfolio from "@/components/RetroTV/RetroTVPortfolio";
import JournalPage from "@/components/JournalPage/JournalPage";
import { JOURNAL_ENTRIES } from "@/data/journalEntries";
import { useState, useRef, useEffect } from "react";

type ActiveSection = "home" | "about" | "projects" | "writing" | "contact";

const MENU_ITEMS: { id: ActiveSection; href: string; label: string }[] = [
  { id: "home", href: "#", label: "Home" },
  { id: "about", href: "#about", label: "About Me" },
  { id: "projects", href: "#projects", label: "Projects" },
  { id: "writing", href: "#writing", label: "Writing" },
  { id: "contact", href: "#contact", label: "Contact" },
];

const SECTIONS: ActiveSection[] = ["home", "about", "projects", "writing", "contact"];

function getSectionFromHash(): ActiveSection {
  if (typeof window === "undefined") return "home";
  const h = window.location.hash.slice(1).toLowerCase();
  return (SECTIONS.includes(h as ActiveSection) ? h : "home") as ActiveSection;
}

const DISSOLVE_MS = 2200;
const BUILD_MS = 1000;

export default function MainMenu() {
  const [activeSection, setActiveSection] = useState<ActiveSection>("home");
  const [aboutSlide, setAboutSlide] = useState(0);
  const [aboutReplayKey, setAboutReplayKey] = useState(0);
  const [writingSlide, setWritingSlide] = useState(0);
  const [writingFlippingTo, setWritingFlippingTo] = useState<number | null>(null);
  const writingFlipInnerRef = useRef<HTMLDivElement | null>(null);
  const [transitionPhase, setTransitionPhase] = useState<"idle" | "dissolving" | "building">("idle");
  const nextSectionRef = useRef<ActiveSection | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Booklet page flip: trigger flip when flippingTo is set, then reset on transition end
  useEffect(() => {
    if (writingFlippingTo === null) return;
    const el = writingFlipInnerRef.current;
    if (!el) return;
    const raf = requestAnimationFrame(() => {
      el.classList.add("booklet-flip-active");
    });
    const onEnd = () => {
      const targetSlide = writingFlippingTo;
      setWritingSlide(targetSlide);
      // Reset transform after React has re-rendered (front face has new content) to avoid glitch
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.classList.remove("booklet-flip-active");
          el.style.transition = "none";
          el.style.transform = "";
          void el.offsetHeight;
          el.style.transition = "";
          setWritingFlippingTo(null);
        });
      });
    };
    el.addEventListener("transitionend", onEnd, { once: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("transitionend", onEnd);
    };
  }, [writingFlippingTo]);

  // Sync activeSection from URL hash after mount (avoids hydration mismatch: server has no hash)
  useEffect(() => {
    const section = getSectionFromHash();
    if (section !== "home") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: sync from URL on mount
      setActiveSection(section);
    }
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      if (transitionPhase !== "idle") return;
      setActiveSection(getSectionFromHash());
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [transitionPhase]);

  // Update URL hash when transitioning (side effect, avoids immutability lint)
  useEffect(() => {
    if (transitionPhase === "dissolving" && nextSectionRef.current) {
      const hash = nextSectionRef.current === "home" ? "" : nextSectionRef.current;
      const url = hash ? `${window.location.pathname}#${hash}` : window.location.pathname;
      window.history.replaceState(null, "", url);
    }
  }, [transitionPhase]);

  const handleNavClick = (item: (typeof MENU_ITEMS)[number]) => {
    if (item.id === activeSection && transitionPhase === "idle") return;
    if (transitionPhase !== "idle") return;

    nextSectionRef.current = item.id;
    setTransitionPhase("dissolving");

    timeoutRef.current = setTimeout(() => {
      setActiveSection(item.id);
      setTransitionPhase("building");
      nextSectionRef.current = null;

      timeoutRef.current = setTimeout(() => {
        setTransitionPhase("idle");
        timeoutRef.current = null;
      }, BUILD_MS);
    }, DISSOLVE_MS);
  };

  const isDissolving = transitionPhase === "dissolving";
  const isBuilding = transitionPhase === "building";

  const showFor = (section: ActiveSection) => activeSection === section;
  const showDissolveOn = (section: ActiveSection) =>
    isDissolving && activeSection === section;
  const buildFor = (section: ActiveSection) =>
    activeSection === section && isBuilding;

  const showHome = showFor("home");
  const showAbout = showFor("about");
  const showProjects = showFor("projects");
  const showWriting = showFor("writing");
  const showContact = showFor("contact");

  return (
    <section
      className="relative z-10 flex min-h-screen flex-col justify-center px-6 pt-12 sm:pl-12 sm:pr-12 sm:pt-16"
      aria-label="Main menu"
    >
      {/* Right panel: constellation, About Me, or Projects (overflow-hidden so dissolving particles don't cause page scroll). Wider when About or Projects (TV). */}
      <div
        className={`absolute overflow-hidden ${
          activeSection === "about"
            ? "left-[44%] right-[10%] top-[10%] bottom-[5%]"
            : activeSection === "projects"
              ? "left-[32%] right-[10%] top-[53%] h-[min(80vh,600px)] -translate-y-1/2"
              : "left-[64%] w-[min(45vw,420px)] top-[53%] h-[min(80vh,600px)] -translate-x-1/2 -translate-y-1/2"
        }`}
        aria-live="polite"
      >
        {/* Constellation view (4 dots) */}
        <div
          className="absolute inset-0 flex flex-col items-center"
          style={{
            opacity: showHome ? 1 : 0,
            transition: showHome ? "opacity 400ms ease-out" : "none",
            pointerEvents: activeSection === "home" && transitionPhase === "idle" ? "auto" : "none",
          }}
        >
          <div
            className="flex h-full w-full flex-col items-center transition-opacity duration-[2200ms] ease-out"
            style={{
              opacity: showDissolveOn("home") ? 0 : 1,
              animation: buildFor("home") ? `build-reveal ${BUILD_MS}ms ease-out forwards` : "none",
              clipPath: buildFor("home") ? "circle(0% at 50% 50%)" : undefined,
            }}
          >
            <ParticleTechStack embedded />
          </div>
          {showDissolveOn("home") && <DissolveOverlay />}
        </div>

        {/* About Me view (2 dots) */}
        <div
          className="absolute inset-0 flex flex-col"
          style={{
            opacity: showAbout ? 1 : 0,
            transition: showAbout ? "opacity 400ms ease-out" : "none",
            pointerEvents: activeSection === "about" && transitionPhase === "idle" ? "auto" : "none",
          }}
        >
          <div
            className="flex h-full w-full flex-col transition-opacity duration-[2200ms] ease-out"
            style={{
              opacity: showDissolveOn("about") ? 0 : 1,
              animation: buildFor("about") ? `build-reveal ${BUILD_MS}ms ease-out forwards` : "none",
              clipPath: buildFor("about") ? "circle(0% at 50% 50%)" : undefined,
            }}
          >
            <div className="flex h-full flex-col justify-center">
              {aboutSlide === 0 ? (
              <div className="notepad-surface h-[min(65vh,520px)] w-full shrink-0">
                <div className="notepad-surface-page flex h-full min-h-0 flex-col p-5 sm:p-6 md:p-7">
                  <div
                    className="notepad-scroll relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain"
                    style={{
                      animation: buildFor("about") ? "build-item-in 400ms ease-out both" : "none",
                      animationDelay: buildFor("about") ? "100ms" : undefined,
                    }}
                  >
                    <div className="space-y-4 pr-2 text-sm leading-relaxed text-neutral-400">
                      <p>
                        I grew up in the early 2000s, when gizmos and gadgets were everywhere and every new thing felt a bit magical. The PS2 era in particular showed me what software could doâ€”how it could pull you into a world that felt real. That sense of wonder stuck. As I got older, I kept wanting to recreate a little of that magic for others.
                      </p>
                      <p>
                        My path into software wasnâ€™t a straight line, but when I finally got here, it felt like home. I get to turn ideasâ€”mine and othersâ€™â€”into reality through code. That means unleashing creativity while solving real problems, which matters more than ever now that so much of life runs on what we build.
                      </p>
                      <p>
                        I take a practical view when building: I donâ€™t build for looks alone. The end product has to serve a clear purpose or achieve something specific. Pretty is nice; useful is what I aim for.
                      </p>
                      <p>
                        Iâ€™m kind, I work well in a team, and I donâ€™t give up when things get hard. Iâ€™m also adaptiveâ€”something thatâ€™s essential in the fast-paced world of software. Thatâ€™s a little about me.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              ) : (
                <YouWinSlide key={aboutReplayKey} onReplay={() => setAboutReplayKey((k) => k + 1)} />
              )}
              <nav
                className="relative z-10 mt-6 flex shrink-0 items-center justify-center gap-3 pb-2"
                aria-label="About section navigation"
                style={{
                  pointerEvents: "auto",
                  animation: buildFor("about") ? "build-item-in 400ms ease-out both" : "none",
                  animationDelay: buildFor("about") ? "340ms" : undefined,
                }}
              >
                {[0, 1].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAboutSlide(i)}
                    className={`h-1.5 w-1.5 cursor-pointer rounded-full transition-all duration-300 hover:scale-125 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 focus:ring-offset-neutral-950 ${
                      i === aboutSlide
                        ? "scale-125 bg-neutral-400"
                        : "bg-neutral-600/60 hover:bg-neutral-500/80"
                    }`}
                    aria-label={`About slide ${i + 1}`}
                    aria-current={i === aboutSlide ? "true" : undefined}
                  />
                ))}
              </nav>
            </div>
          </div>
          {showDissolveOn("about") && <DissolveOverlay />}
        </div>

        {/* Projects view: Retro TV */}
        <div
          className="absolute inset-0 flex flex-col"
          style={{
            opacity: showProjects ? 1 : 0,
            transition: showProjects ? "opacity 400ms ease-out" : "none",
            pointerEvents: activeSection === "projects" && transitionPhase === "idle" ? "auto" : "none",
          }}
        >
          <div
            className="flex h-full w-full flex-col transition-opacity duration-[2200ms] ease-out"
            style={{
              opacity: showDissolveOn("projects") ? 0 : 1,
              animation: buildFor("projects") ? `build-reveal ${BUILD_MS}ms ease-out forwards` : "none",
              clipPath: buildFor("projects") ? "circle(0% at 50% 50%)" : undefined,
            }}
          >
            <div className="relative min-h-0 flex-1 w-full">
              <RetroTVPortfolio className="h-full min-h-[320px]" />
            </div>
          </div>
          {showDissolveOn("projects") && <DissolveOverlay />}
        </div>

        {/* Writing view: booklet (cover + pages), same dots as About */}
        <div
          className="absolute inset-0 flex flex-col"
          style={{
            opacity: showWriting ? 1 : 0,
            transition: showWriting ? "opacity 400ms ease-out" : "none",
            pointerEvents: activeSection === "writing" && transitionPhase === "idle" ? "auto" : "none",
          }}
        >
          <div
            className="flex h-full w-full flex-col transition-opacity duration-[2200ms] ease-out"
            style={{
              opacity: showDissolveOn("writing") ? 0 : 1,
              animation: buildFor("writing") ? `build-reveal ${BUILD_MS}ms ease-out forwards` : "none",
              clipPath: buildFor("writing") ? "circle(0% at 50% 50%)" : undefined,
            }}
          >
            <div className="flex h-full flex-col justify-center">
              <div className="booklet-surface h-[min(65vh,520px)] w-full shrink-0">
                <div className="booklet-flip h-full w-full">
                  <div
                    ref={writingFlipInnerRef}
                    className="booklet-flip-inner h-full w-full"
                  >
                    <div className="booklet-face booklet-face-front">
                {writingSlide === 0 ? (
                  <div className="booklet-cover flex h-full flex-col items-center justify-center gap-2 px-8 py-10 text-center">
                    <h2 className="text-center text-lg font-bold tracking-wide text-neutral-300 sm:text-xl">
                      My Dev Journal
                    </h2>
                    <p className="text-xs tracking-[0.3em] text-neutral-500">
                      — essays & notes —
                    </p>
                    <p className="mt-6 text-[10px] uppercase tracking-widest text-neutral-600">
                      Read the manual
                    </p>
                  </div>
                ) : writingSlide === 1 ? (
                  <JournalPage
                    entry={JOURNAL_ENTRIES[0]}
                    pageNumber={1}
                    buildFor={buildFor("writing")}
                  />
                ) : (
                  <JournalPage
                    entry={JOURNAL_ENTRIES[1]}
                    pageNumber={2}
                    buildFor={buildFor("writing")}
                  />
                )}
                    </div>
                    <div className="booklet-face booklet-face-back">
                      {writingFlippingTo === 0 ? (
                        <div className="booklet-cover flex h-full flex-col items-center justify-center gap-2 px-8 py-10 text-center">
                          <h2 className="text-center text-lg font-bold tracking-wide text-neutral-300 sm:text-xl">
                            My Dev Journal
                          </h2>
                          <p className="text-xs tracking-[0.3em] text-neutral-500">
                            — essays & notes —
                          </p>
                          <p className="mt-6 text-[10px] uppercase tracking-widest text-neutral-600">
                            Read the manual
                          </p>
                        </div>
                      ) : writingFlippingTo === 1 ? (
                        <JournalPage
                          entry={JOURNAL_ENTRIES[0]}
                          pageNumber={1}
                          buildFor={buildFor("writing")}
                        />
                      ) : writingFlippingTo === 2 ? (
                        <JournalPage
                          entry={JOURNAL_ENTRIES[1]}
                          pageNumber={2}
                          buildFor={buildFor("writing")}
                        />
                      ) : (
                        <div className="booklet-cover flex h-full flex-col items-center justify-center gap-2 px-8 py-10 text-center">
                          <h2 className="text-center text-lg font-bold tracking-wide text-neutral-300 sm:text-xl">
                            My Dev Journal
                          </h2>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <nav
                className="relative z-10 mt-6 flex shrink-0 items-center justify-center gap-3 pb-2"
                aria-label="Writing section navigation"
                style={{
                  pointerEvents: "auto",
                  animation: buildFor("writing") ? "build-item-in 400ms ease-out both" : "none",
                  animationDelay: buildFor("writing") ? "340ms" : undefined,
                }}
              >
                {[0, 1, 2].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      if (i !== writingSlide && writingFlippingTo === null) {
                        setWritingFlippingTo(i);
                      }
                    }}
                    disabled={writingFlippingTo !== null}
                    className={`h-1.5 w-1.5 cursor-pointer rounded-full transition-all duration-300 hover:scale-125 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 focus:ring-offset-neutral-950 disabled:cursor-not-allowed disabled:opacity-60 ${
                      i === writingSlide
                        ? "scale-125 bg-neutral-400"
                        : "bg-neutral-600/60 hover:bg-neutral-500/80"
                    }`}
                    aria-label={i === 0 ? "Booklet cover" : `Page ${i}`}
                    aria-current={i === writingSlide ? "true" : undefined}
                  />
                ))}
              </nav>
            </div>
          </div>
          {showDissolveOn("writing") && <DissolveOverlay />}
        </div>

        {/* Contact view */}
        <div
          className="absolute inset-0 flex flex-col"
          style={{
            opacity: showContact ? 1 : 0,
            transition: showContact ? "opacity 400ms ease-out" : "none",
            pointerEvents: activeSection === "contact" && transitionPhase === "idle" ? "auto" : "none",
          }}
        >
          <div
            className="flex h-full w-full flex-col transition-opacity duration-[2200ms] ease-out"
            style={{
              opacity: showDissolveOn("contact") ? 0 : 1,
              animation: buildFor("contact") ? `build-reveal ${BUILD_MS}ms ease-out forwards` : "none",
              clipPath: buildFor("contact") ? "circle(0% at 50% 50%)" : undefined,
            }}
          >
            <div className="flex h-full flex-col justify-center">
              <div
                className="contact-card mx-auto w-full max-w-md shrink-0 px-6 py-8 sm:px-8 sm:py-10"
                style={{
                  animation: buildFor("contact") ? "build-item-in 400ms ease-out both" : "none",
                  animationDelay: buildFor("contact") ? "100ms" : undefined,
                }}
              >
                <p
                  className="mb-1 text-[10px] font-medium tracking-[0.25em] text-neutral-500 uppercase"
                  aria-hidden
                >
                  Get in touch
                </p>
                <h2 className="mb-1 text-xl font-semibold tracking-tight text-neutral-200 sm:text-2xl">
                  Let&apos;s work together
                </h2>
                <p className="mb-8 text-sm text-neutral-400">
                  Londa Sihe Khanyile
                </p>
                <ul className="contact-list space-y-6" role="list">
                  <li className="contact-list-item">
                    <span className="contact-label">Email</span>
                    <a
                      href="mailto:lskhanyile98@gmail.com"
                      className="contact-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      lskhanyile98@gmail.com
                    </a>
                  </li>
                  <li className="contact-list-item">
                    <span className="contact-label">Phone</span>
                    <a
                      href="tel:+27718723121"
                      className="contact-link"
                    >
                      +27 71 872 3121
                    </a>
                  </li>
                  <li className="contact-list-item">
                    <span className="contact-label">GitHub</span>
                    <a
                      href="https://github.com/londakhanyile"
                      className="contact-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      github.com/londakhanyile
                    </a>
                  </li>
                  <li className="contact-list-item">
                    <span className="contact-label">LinkedIn</span>
                    <a
                      href="https://www.linkedin.com/in/londakhanyile"
                      className="contact-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      linkedin.com/in/londakhanyile
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          {showDissolveOn("contact") && <DissolveOverlay />}
        </div>
      </div>

      <nav
        className="flex flex-col gap-6 sm:gap-8"
        aria-label="Primary navigation"
      >
        {MENU_ITEMS.map((item) => {
          const isActive = item.id === activeSection;
          const isInactiveGray = !isActive;

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => handleNavClick(item)}
              className={`group relative w-fit cursor-pointer text-left text-2xl font-extrabold tracking-[0.1em] transition-all duration-300 hover:scale-105 hover:text-neutral-100 hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.15)] sm:text-3xl md:text-4xl ${
                isActive
                  ? "scale-105 text-neutral-100 drop-shadow-[0_0_6px_rgba(255,255,255,0.2)]"
                  : isInactiveGray
                    ? "text-neutral-500"
                    : "text-neutral-300"
              }`}
              aria-current={isActive ? "true" : undefined}
              disabled={transitionPhase !== "idle"}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <p className="animate-available-glow mt-16 text-xs tracking-widest text-neutral-500 sm:mt-20">
        Available for work
      </p>
    </section>
  );
}
