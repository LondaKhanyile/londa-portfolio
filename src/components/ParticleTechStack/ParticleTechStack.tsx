"use client";

import { useEffect, useRef, useState } from "react";

const TECH_ITEMS = [
  "TypeScript",
  "Next.js",
  "React",
  "Tailwind",
  "Node.js",
  "Supabase",
  "PostgreSQL",
  "Git",
  "Artificial intelligence",
  "Payment integrations",
] as const;

// Define 4 constellations with 10 star positions each (x, y as % of container)
const CONSTELLATIONS = [
  {
    name: "Orion",
    positions: [
      { x: 28, y: 12 }, { x: 72, y: 14 }, { x: 32, y: 42 }, { x: 50, y: 45 },
      { x: 68, y: 42 }, { x: 35, y: 78 }, { x: 70, y: 82 }, { x: 50, y: 58 },
      { x: 42, y: 68 }, { x: 58, y: 68 },
    ],
    edges: [[0, 1], [0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [3, 7], [4, 6], [5, 6], [5, 8], [6, 9], [7, 8], [7, 9]],
  },
  {
    name: "Aries",
    positions: [
      { x: 45, y: 20 }, { x: 60, y: 18 }, { x: 70, y: 22 }, { x: 55, y: 35 },
      { x: 48, y: 48 }, { x: 38, y: 55 }, { x: 62, y: 58 }, { x: 50, y: 68 },
      { x: 42, y: 78 }, { x: 58, y: 75 },
    ],
    edges: [[0, 1], [1, 2], [1, 3], [3, 4], [4, 5], [3, 6], [6, 7], [5, 8], [6, 9], [7, 8], [7, 9]],
  },
  {
    name: "Sagittarius",
    positions: [
      { x: 35, y: 15 }, { x: 50, y: 12 }, { x: 65, y: 18 }, { x: 42, y: 32 },
      { x: 58, y: 35 }, { x: 50, y: 48 }, { x: 38, y: 62 }, { x: 62, y: 65 },
      { x: 48, y: 78 }, { x: 55, y: 82 },
    ],
    edges: [[0, 1], [1, 2], [0, 3], [2, 4], [3, 5], [4, 5], [5, 6], [5, 7], [6, 8], [7, 9], [8, 9]],
  },
  {
    name: "Leo",
    positions: [
      { x: 25, y: 25 }, { x: 45, y: 22 }, { x: 60, y: 28 }, { x: 72, y: 35 },
      { x: 50, y: 45 }, { x: 38, y: 58 }, { x: 55, y: 62 }, { x: 45, y: 72 },
      { x: 35, y: 80 }, { x: 62, y: 78 },
    ],
    edges: [[0, 1], [1, 2], [2, 3], [1, 4], [4, 5], [4, 6], [5, 7], [6, 9], [7, 8]],
  },
] as const;

const LINE_OPACITY = 0.38;
const CONSTELLATION_DURATION = 16000; // 16s per constellation
const TRANSITION_DURATION = 10000; // 10s smooth morph between constellations

type ParticleTechStackProps = { embedded?: boolean };

export default function ParticleTechStack({ embedded = false }: ParticleTechStackProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const particleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [currentConstellation, setCurrentConstellation] = useState(0);
  const [lines, setLines] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const swipeStartXRef = useRef<number | null>(null);

  const goToNext = () => goToConstellation((currentConstellation + 1) % CONSTELLATIONS.length);
  const goToPrev = () =>
    goToConstellation((currentConstellation - 1 + CONSTELLATIONS.length) % CONSTELLATIONS.length);

  const goToConstellation = (index: number) => {
    setCurrentConstellation(index);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentConstellation((prev) => (prev + 1) % CONSTELLATIONS.length);
    }, CONSTELLATION_DURATION);
  };

  // Auto-cycle through constellations
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentConstellation((prev) => (prev + 1) % CONSTELLATIONS.length);
    }, CONSTELLATION_DURATION);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Update constellation line positions from particle positions
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateLines = () => {
      const rect = container.getBoundingClientRect();
      const positions: { x: number; y: number }[] = [];

      particleRefs.current.forEach((el) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        positions.push({
          x: r.left - rect.left + r.width / 2,
          y: r.top - rect.top + r.height / 2,
        });
      });

      const edges = CONSTELLATIONS[currentConstellation].edges;
      const newLines = edges
        .filter(([i, j]) => positions[i] && positions[j])
        .map(([i, j]) => ({
          x1: positions[i].x,
          y1: positions[i].y,
          x2: positions[j].x,
          y2: positions[j].y,
        }));
      setLines(newLines);
    };

    updateLines();
    const raf = requestAnimationFrame(function tick() {
      updateLines();
      requestAnimationFrame(tick);
    });

    return () => cancelAnimationFrame(raf);
  }, [currentConstellation]);

  const constellation = CONSTELLATIONS[currentConstellation];

  return (
    <div
      className={
        embedded
          ? "absolute inset-0 flex flex-col items-center justify-center pb-12"
          : "absolute left-[64%] top-[53%] flex h-[min(80vh,600px)] w-[min(45vw,420px)] -translate-x-1/2 -translate-y-1/2 flex-col items-center"
      }
      aria-label="Tech stack"
    >
      {/* Constellation label */}
      <p className="mb-4 text-xs font-medium tracking-[0.2em] text-neutral-500 uppercase transition-opacity duration-300">
        {constellation.name}
      </p>

      {/* Particle area - swipe left/right to cycle constellations */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full min-h-0"
        onTouchStart={(e) => {
          swipeStartXRef.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          const start = swipeStartXRef.current;
          swipeStartXRef.current = null;
          if (start === null) return;
          const end = e.changedTouches[0].clientX;
          const diff = start - end;
          if (Math.abs(diff) > 50) {
            if (diff > 0) goToNext();
            else goToPrev();
          }
        }}
      >
      {/* Constellation lines */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden
      >
        {lines.map((line, i) => (
          <line
            key={i}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="rgba(120,119,198,0.55)"
            strokeWidth={0.8}
            strokeOpacity={LINE_OPACITY}
            className="transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]"
          />
        ))}
      </svg>

      {/* Particles that morph between constellation positions with subtle drift */}
      {TECH_ITEMS.map((tech, i) => (
        <div
          key={tech}
          ref={(el) => {
            particleRefs.current[i] = el;
          }}
          className="particle-dot group absolute flex items-center justify-center"
          style={{
            left: `${constellation.positions[i].x}%`,
            top: `${constellation.positions[i].y}%`,
            transition: `left ${TRANSITION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1), top ${TRANSITION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            animation: `constellation-drift-${(i % 10) + 1} ${6 + (i % 3)}s ease-in-out ${i * 0.5}s infinite`,
          }}
          onPointerEnter={() => setHoveredIndex(i)}
          onPointerLeave={() => setHoveredIndex(null)}
        >
          <span
            className="particle-label absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-neutral-900/90 px-2 py-1 text-xs font-medium text-neutral-300 backdrop-blur-sm transition-opacity duration-200"
            style={{
              opacity: hoveredIndex === i ? 1 : 0,
              animation: hoveredIndex === i ? "none" : `particle-forefront ${12 + i}s ease-in-out ${i * 1.5}s infinite`,
            }}
          >
            {tech}
          </span>
          <span
            className="h-2 w-2 shrink-0 rounded-full bg-neutral-500/70 transition-all duration-300 group-hover:scale-150 group-hover:bg-neutral-400/90"
            aria-label={tech}
          />
        </div>
      ))}
      </div>

      {/* Constellation nav dots */}
      <nav
        className="relative z-10 mt-0 flex shrink-0 items-center justify-center gap-5 py-2"
        style={{ pointerEvents: "auto" }}
        aria-label="Constellation navigation"
      >
        {CONSTELLATIONS.map((c, i) => (
          <button
            key={c.name}
            type="button"
            onClick={() => goToConstellation(i)}
            className={`h-2 w-2 cursor-pointer rounded-full transition-all duration-300 hover:scale-125 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 focus:ring-offset-neutral-950 ${
              i === currentConstellation
                ? "scale-125 bg-neutral-400"
                : "bg-neutral-600/60 hover:bg-neutral-500/80"
            }`}
            aria-label={`Show ${c.name} constellation`}
            aria-current={i === currentConstellation ? "true" : undefined}
          />
        ))}
      </nav>
    </div>
  );
}
