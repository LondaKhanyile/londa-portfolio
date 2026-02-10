"use client";

const PARTICLE_COUNT = 110;
const DISSOLVE_DURATION_MS = 2200;
const CENTER_X = 50;
const CENTER_Y = 50;
const MAX_DELAY_MS = 650; // outer particles start last

// Pre-generate: random positions, drift directions, delay by distance from center (center-out)
function getParticles() {
  const particles: { x: number; y: number; dx: number; dy: number; delay: number }[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const dist = Math.sqrt((x - CENTER_X) ** 2 + (y - CENTER_Y) ** 2);
    const normalizedDist = Math.min(dist / 50, 1); // 0 at center, ~1 at corners
    const delay = normalizedDist * MAX_DELAY_MS; // center first, edges last
    particles.push({
      x,
      y,
      dx: (Math.random() - 0.5) * 200,
      dy: (Math.random() - 0.5) * 200,
      delay,
    });
  }
  return particles;
}

const PARTICLES = getParticles();

export default function DissolveOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10"
      aria-hidden
    >
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="absolute h-[5px] w-[5px] rounded-full bg-neutral-400/90"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            transform: "translate(-50%, -50%)",
            animation: `thanos-dissolve ${DISSOLVE_DURATION_MS}ms ease-out forwards`,
            animationDelay: `${p.delay}ms`,
            ["--dissolve-x" as string]: `${p.dx}px`,
            ["--dissolve-y" as string]: `${p.dy}px`,
          }}
        />
      ))}
    </div>
  );
}
