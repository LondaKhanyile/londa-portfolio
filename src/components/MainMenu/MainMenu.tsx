"use client";

import ParticleTechStack from "@/components/ParticleTechStack/ParticleTechStack";
import DissolveOverlay from "@/components/DissolveOverlay/DissolveOverlay";
import YouWinSlide from "@/components/YouWinSlide/YouWinSlide";
import RetroTVPortfolio from "@/components/RetroTV/RetroTVPortfolio";
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
  const [transitionPhase, setTransitionPhase] = useState<"idle" | "dissolving" | "building">("idle");
  const nextSectionRef = useRef<ActiveSection | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

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
              <div className="notepad-surface w-full max-h-[min(65vh,520px)] shrink-0">
                <div className="notepad-surface-page flex h-full min-h-0 flex-col p-5 sm:p-6 md:p-7">
                  <div
                    className="notepad-scroll relative min-h-0 flex-1 overflow-auto"
                    style={{
                      animation: buildFor("about") ? "build-item-in 400ms ease-out both" : "none",
                      animationDelay: buildFor("about") ? "100ms" : undefined,
                    }}
                  >
                    <div className="space-y-4 pr-2 text-sm leading-relaxed text-neutral-400">
                      <p>
                        I grew up in the early 2000s, when gizmos and gadgets were everywhere and every new thing felt a bit magical. The PS2 era in particular showed me what software could do—how it could pull you into a world that felt real. That sense of wonder stuck. As I got older, I kept wanting to recreate a little of that magic for others.
                      </p>
                      <p>
                        My path into software wasn’t a straight line, but when I finally got here, it felt like home. I get to turn ideas—mine and others’—into reality through code. That means unleashing creativity while solving real problems, which matters more than ever now that so much of life runs on what we build.
                      </p>
                      <p>
                        I take a practical view when building: I don’t build for looks alone. The end product has to serve a clear purpose or achieve something specific. Pretty is nice; useful is what I aim for.
                      </p>
                      <p>
                        I’m kind, I work well in a team, and I don’t give up when things get hard. I’m also adaptive—something that’s essential in the fast-paced world of software. That’s a little about me.
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

        {/* Writing view (placeholder) */}
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
            <p
              className="mb-4 text-xs font-medium tracking-[0.2em] text-neutral-500 uppercase"
              style={{
                animation: buildFor("writing") ? "build-item-in 400ms ease-out both" : "none",
                animationDelay: buildFor("writing") ? "100ms" : undefined,
              }}
            >
              Writing
            </p>
            <div className="relative min-h-0 flex-1 w-full overflow-auto pr-2 text-sm leading-relaxed text-neutral-500">
              Placeholder. Essays and notes.
            </div>
          </div>
          {showDissolveOn("writing") && <DissolveOverlay />}
        </div>

        {/* Contact view (placeholder) */}
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
            <p
              className="mb-4 text-xs font-medium tracking-[0.2em] text-neutral-500 uppercase"
              style={{
                animation: buildFor("contact") ? "build-item-in 400ms ease-out both" : "none",
                animationDelay: buildFor("contact") ? "100ms" : undefined,
              }}
            >
              Contact
            </p>
            <div className="relative min-h-0 flex-1 w-full overflow-auto pr-2 text-sm leading-relaxed text-neutral-500">
              Placeholder. How to reach you.
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

      <p className="mt-16 text-xs tracking-widest text-neutral-500 sm:mt-20">
        Available for work
      </p>
    </section>
  );
}
