"use client";

import type { ChannelProject } from "./types";

type TvScreenContentProps = {
  project: ChannelProject;
  showStatic: boolean;
  onTuneIn: () => void;
  isTuning: boolean;
};

export default function TvScreenContent({
  project,
  showStatic,
  onTuneIn,
  isTuning,
}: TvScreenContentProps) {
  return (
    <div
      className="relative h-full w-full overflow-hidden bg-neutral-900"
      style={{
        width: 320,
        height: 240,
        boxShadow: "inset 0 0 60px rgba(0,0,0,0.8)",
      }}
    >
      {/* CRT scanlines */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.06]"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
        }}
        aria-hidden
      />

      {/* Subtle flicker */}
      <div
        className="pointer-events-none absolute inset-0 z-[8] bg-white mix-blend-overlay"
        style={{
          animation: "crt-flicker 0.15s ease-in-out infinite",
          opacity: 0.02,
        }}
        aria-hidden
      />

      {/* Static / white noise overlay */}
      {showStatic && (
        <div
          className="absolute inset-0 z-20 animate-none bg-neutral-900"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "200px 200px",
            animation: "static-flash 0.15s ease-out",
          }}
          aria-hidden
        />
      )}

      {/* Channel content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3">
        <div className="relative h-24 w-full flex-shrink-0 overflow-hidden rounded bg-neutral-800">
          {project.screenshot ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={project.screenshot}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-neutral-700" />
          )}
        </div>
        <p className="line-clamp-2 text-center text-xs font-medium text-neutral-300">
          {project.title}
        </p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTuneIn();
          }}
          disabled={isTuning}
          className="mt-1 rounded bg-amber-600 px-3 py-1.5 text-xs font-bold text-black transition hover:bg-amber-500 disabled:opacity-50"
        >
          {isTuning ? "Tuning…" : "Tune In"}
        </button>
      </div>
    </div>
  );
}
