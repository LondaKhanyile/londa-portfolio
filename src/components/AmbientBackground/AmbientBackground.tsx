export default function AmbientBackground() {
  return (
    <>
      {/* Subtle noise overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />
      {/* Slow gradient shift */}
      <div
        className="pointer-events-none fixed inset-0 z-0 animate-ambient-shift opacity-30"
        style={{
          background: `
            radial-gradient(
              ellipse 100% 80% at 30% 20%,
              rgba(120, 119, 198, 0.08),
              transparent 50%
            ),
            radial-gradient(
              ellipse 80% 100% at 80% 80%,
              rgba(100, 149, 237, 0.05),
              transparent 50%
            )
          `,
        }}
        aria-hidden
      />
    </>
  );
}
