"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useGLTF } from "@react-three/drei";
import TvScene from "./TvScene";
import { TV_CHANNELS } from "./types";

useGLTF.preload("/models/tv.glb");

const R3FCanvas = dynamic(
  () => import("@react-three/fiber").then((mod) => mod.Canvas),
  { ssr: false }
);

type RetroTVPortfolioProps = {
  className?: string;
  onTuneInComplete?: () => void;
};

export default function RetroTVPortfolio({
  className = "",
  onTuneInComplete,
}: RetroTVPortfolioProps) {
  const [powerOn, setPowerOn] = useState(false);
  const [channelIndex, setChannelIndex] = useState(0);
  const [showStatic, setShowStatic] = useState(false);

  const STATIC_DURATION_MS = 250;

  const channelUp = () => {
    setShowStatic(true);
    setChannelIndex((i) => (i + 1) % TV_CHANNELS.length);
    setTimeout(() => setShowStatic(false), STATIC_DURATION_MS);
  };
  const channelDown = () => {
    setShowStatic(true);
    setChannelIndex((i) => (i - 1 + TV_CHANNELS.length) % TV_CHANNELS.length);
    setTimeout(() => setShowStatic(false), STATIC_DURATION_MS);
  };

  const channelNumber = channelIndex + 1;
  const channelLabel =
    channelNumber === 3 ? "Coming Soon" : TV_CHANNELS[channelIndex]?.title ?? "—";

  return (
    <div
      className={`relative h-full min-h-[320px] w-full overflow-hidden ${className}`}
    >
      {/* Channel label above the TV — only when TV is on */}
      {powerOn && (
        <p
          className="absolute left-1/2 top-0 z-10 -translate-x-1/2 text-center text-xs font-medium tracking-wider text-neutral-500"
          aria-live="polite"
        >
          Channel {channelNumber}: {channelLabel}
        </p>
      )}

      <div className="absolute inset-0">
        <R3FCanvas
          camera={{ position: [0, 0, 2.5], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
          dpr={[1, 2]}
        >
          <TvScene
            powerOn={powerOn}
            channelIndex={channelIndex}
            showStatic={showStatic}
            onTuneInComplete={onTuneInComplete}
          />
        </R3FCanvas>
      </div>

      {/* Remote - right side, on top of container */}
      <div className="absolute right-3 top-0 flex h-full flex-col items-center justify-center gap-3 py-4">
        <button
          type="button"
          onClick={() => setPowerOn((p) => !p)}
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-neutral-600 bg-neutral-800 text-neutral-400 transition hover:border-red-500/80 hover:bg-red-950/40 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/50"
          title={powerOn ? "Power off" : "Power on"}
          aria-label={powerOn ? "Power off" : "Power on"}
        >
          <span className="text-lg font-bold">⏻</span>
        </button>
        <span className="text-[10px] uppercase tracking-wider text-neutral-500">
          Power
        </span>

        <div className="my-1 h-px w-8 bg-neutral-700" />

        <button
          type="button"
          onClick={channelUp}
          disabled={!powerOn}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border-2 border-neutral-600 bg-neutral-800 text-neutral-400 transition hover:border-neutral-400 hover:bg-neutral-700 hover:text-neutral-200 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-neutral-600 disabled:hover:bg-neutral-800 disabled:hover:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-500"
          title="Channel up"
          aria-label="Channel up"
        >
          <span className="text-lg font-bold leading-none">+</span>
        </button>
        <span className="text-[10px] uppercase tracking-wider text-neutral-500">
          Ch +
        </span>

        <button
          type="button"
          onClick={channelDown}
          disabled={!powerOn}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border-2 border-neutral-600 bg-neutral-800 text-neutral-400 transition hover:border-neutral-400 hover:bg-neutral-700 hover:text-neutral-200 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-neutral-600 disabled:hover:bg-neutral-800 disabled:hover:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-500"
          title="Channel down"
          aria-label="Channel down"
        >
          <span className="text-lg font-bold leading-none">−</span>
        </button>
        <span className="text-[10px] uppercase tracking-wider text-neutral-500">
          Ch −
        </span>
      </div>
    </div>
  );
}
