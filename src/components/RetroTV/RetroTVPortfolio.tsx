"use client";

import { useState, useEffect } from "react";
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
  const [maxDpr, setMaxDpr] = useState(2);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const set = () => setMaxDpr(mq.matches ? 1.5 : 2);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

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
  const channelLabel = TV_CHANNELS[channelIndex]?.title ?? "—";

  return (
    <div
      className={`relative flex h-full min-h-[320px] w-full flex-col overflow-hidden ${className}`}
    >
      {/* Mobile: instruction + channel beneath navbar, then remote in a row; label area always reserves space so TV doesn't move when power on */}
      <div className="flex shrink-0 flex-col justify-start gap-3 px-2 pt-10 pb-1 mb-4 md:hidden">
        <div className="flex min-h-[2.75rem] flex-col items-center justify-center gap-0.5 text-center">
          {powerOn && (
            <>
              {TV_CHANNELS[channelIndex]?.url && (
                <p className="text-[10px] uppercase tracking-widest text-neutral-400">
                  Click on screen to view project
                </p>
              )}
              <p
                className="text-xs font-medium tracking-wider text-neutral-500"
                aria-live="polite"
              >
                Channel {channelNumber}: {channelLabel}
              </p>
            </>
          )}
        </div>
        <div className="flex flex-row items-center justify-center gap-3">
          <div className="flex flex-col items-center gap-0.5">
            <button
              type="button"
              onClick={() => setPowerOn((p) => !p)}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-neutral-600 bg-neutral-800 text-neutral-400 transition hover:border-red-500/80 hover:bg-red-950/40 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              title={powerOn ? "Power off" : "Power on"}
              aria-label={powerOn ? "Power off" : "Power on"}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                <line x1="12" y1="2" x2="12" y2="12" />
              </svg>
            </button>
            <span className="text-[10px] uppercase tracking-wider text-neutral-500">
              Power
            </span>
          </div>
          <div className="h-8 w-px bg-neutral-700" />
          <div className="flex flex-col items-center gap-0.5">
            <button
              type="button"
              onClick={channelDown}
              disabled={!powerOn}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border-2 border-neutral-600 bg-neutral-800 text-neutral-400 transition hover:border-neutral-400 hover:bg-neutral-700 hover:text-neutral-200 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-neutral-500"
              title="Channel down"
              aria-label="Channel down"
            >
              <span className="text-base font-bold leading-none">−</span>
            </button>
            <span className="text-[10px] uppercase tracking-wider text-neutral-500">
              Ch −
            </span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <button
              type="button"
              onClick={channelUp}
              disabled={!powerOn}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border-2 border-neutral-600 bg-neutral-800 text-neutral-400 transition hover:border-neutral-400 hover:bg-neutral-700 hover:text-neutral-200 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-neutral-500"
              title="Channel up"
              aria-label="Channel up"
            >
              <span className="text-base font-bold leading-none">+</span>
            </button>
            <span className="text-[10px] uppercase tracking-wider text-neutral-500">
              Ch +
            </span>
          </div>
        </div>
      </div>

      {/* Desktop: instruction + channel above TV (only when power on) */}
      {powerOn && (
        <div className="absolute left-1/2 top-0 z-10 hidden -translate-x-1/2 flex-col items-center gap-1 pt-1 text-center md:flex">
          {TV_CHANNELS[channelIndex]?.url && (
            <p className="text-[10px] uppercase tracking-widest text-neutral-400">
              Click on screen to view project
            </p>
          )}
          <p
            className="text-xs font-medium tracking-wider text-neutral-500"
            aria-live="polite"
          >
            Channel {channelNumber}: {channelLabel}
          </p>
        </div>
      )}

      {/* TV canvas */}
      <div className="relative min-h-0 flex-1 md:absolute md:inset-0">
        <R3FCanvas
          camera={{ position: [0, 0, 2.5], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
          dpr={[1, maxDpr]}
        >
          <TvScene
            powerOn={powerOn}
            channelIndex={channelIndex}
            showStatic={showStatic}
            onTuneInComplete={onTuneInComplete}
          />
        </R3FCanvas>
      </div>

      {/* Desktop: remote on the right, vertical */}
      <div className="absolute right-3 top-0 hidden h-full flex-col items-center justify-center gap-3 py-4 md:flex">
        <button
          type="button"
          onClick={() => setPowerOn((p) => !p)}
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-neutral-600 bg-neutral-800 text-neutral-400 transition hover:border-red-500/80 hover:bg-red-950/40 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/50"
          title={powerOn ? "Power off" : "Power on"}
          aria-label={powerOn ? "Power off" : "Power on"}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
            <line x1="12" y1="2" x2="12" y2="12" />
          </svg>
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
