"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const BLOCK_COLS = 5;
const BLOCK_ROWS = 1;
const BLOCK_W = 72;
const BLOCK_H = 72;
const BLOCK_GAP = 12;
const BLOCK_COUNT = BLOCK_COLS * BLOCK_ROWS;

const CANNON_PIVOT_FROM_BOTTOM = 24;
/* Muzzle center in SVG is at y=7, pivot at y=40 → 33px from pivot */
const CANNON_BARREL_LENGTH = 33;
const CANNON_OFFSET_RIGHT_PX = 8;
const PROJECTILE_SPEED = 11;
const AIM_ANGLE_MIN = -Math.PI;
const AIM_ANGLE_MAX = 0;

type Projectile = { x: number; y: number; vx: number; vy: number };

type YouWinSlideProps = { onReplay?: () => void };

export default function YouWinSlide({ onReplay }: YouWinSlideProps) {
  const [revealed, setRevealed] = useState(false);
  const [blocksBroken, setBlocksBroken] = useState<boolean[]>(
    () => Array(BLOCK_COUNT).fill(false)
  );
  const [aimAngle, setAimAngle] = useState((-90 * Math.PI) / 180);
  const [projectile, setProjectile] = useState<Projectile | null>(null);
  const [mobileCannonRect, setMobileCannonRect] = useState<DOMRect | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const blocksContainerRef = useRef<HTMLDivElement>(null);
  const blocksBrokenRef = useRef(blocksBroken);
  blocksBrokenRef.current = blocksBroken;

  const allBroken = blocksBroken.every(Boolean);

  // Position fixed cannon from container rect on mobile so bullet and muzzle align
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setMobileCannonRect(rect.width > 0 && rect.height > 0 ? rect : null);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const angleFromClient = useCallback((clientX: number, clientY: number): number => {
    const el = containerRef.current;
    if (!el) return (-90 * Math.PI) / 180;
    const rect = el.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const pivotX = rect.left + w / 2 + CANNON_OFFSET_RIGHT_PX;
    const pivotY = rect.top + h - CANNON_PIVOT_FROM_BOTTOM;
    const angle = Math.atan2(clientY - pivotY, clientX - pivotX);
    return Math.max(AIM_ANGLE_MIN, Math.min(AIM_ANGLE_MAX, angle));
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      setAimAngle(angleFromClient(e.clientX, e.clientY));
    },
    [angleFromClient]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (e.touches.length === 0) return;
      e.preventDefault();
      const t = e.touches[0];
      setAimAngle(angleFromClient(t.clientX, t.clientY));
    },
    [angleFromClient]
  );

  const handleFire = useCallback(() => {
    if (revealed || projectile) return;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vx = PROJECTILE_SPEED * Math.cos(aimAngle);
    const vy = PROJECTILE_SPEED * Math.sin(aimAngle);

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    let mouthX: number;
    let mouthY: number;

    if (isMobile) {
      // Use container-relative coords so bullet matches fixed cannon (which is positioned from container rect)
      const pivotX = rect.width / 2 + CANNON_OFFSET_RIGHT_PX;
      const pivotY = rect.height - 96; // bottom-24 = 6rem
      mouthX = pivotX + CANNON_BARREL_LENGTH * Math.cos(aimAngle);
      mouthY = pivotY + CANNON_BARREL_LENGTH * Math.sin(aimAngle);
    } else {
      const w = rect.width;
      const h = rect.height;
      const pivotY = h - CANNON_PIVOT_FROM_BOTTOM;
      const pivotX = w / 2 + CANNON_OFFSET_RIGHT_PX;
      mouthX = pivotX + CANNON_BARREL_LENGTH * Math.cos(aimAngle);
      mouthY = pivotY + CANNON_BARREL_LENGTH * Math.sin(aimAngle);
    }

    setProjectile({ x: mouthX, y: mouthY, vx, vy });
  }, [revealed, projectile, aimAngle]);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (e.changedTouches.length === 0) return;
      e.preventDefault();
      handleFire();
    },
    [handleFire]
  );

  useEffect(() => {
    if (allBroken) {
      setRevealed(true);
    }
  }, [allBroken]);

  const hasProjectile = projectile !== null;

  useEffect(() => {
    const el = containerRef.current;
    const blocksEl = blocksContainerRef.current;
    if (!el || !blocksEl || !projectile) return;

    let rafId: number;
    const loop = () => {
      const containerRect = el.getBoundingClientRect();
      const blocksRect = blocksEl.getBoundingClientRect();
      const w = containerRect.width;
      const h = containerRect.height;
      const broken = blocksBrokenRef.current;

      setProjectile((p) => {
        if (!p) return null;
        const nx = p.x + p.vx;
        const ny = p.y + p.vy;
        const projScreenX = containerRect.left + nx;
        const projScreenY = containerRect.top + ny;

        for (let i = 0; i < BLOCK_COUNT; i++) {
          if (broken[i]) continue;
          const col = i % BLOCK_COLS;
          const row = Math.floor(i / BLOCK_COLS);
          const left = blocksRect.left + col * (BLOCK_W + BLOCK_GAP);
          const top = blocksRect.top + row * (BLOCK_H + BLOCK_GAP);
          const hit =
            projScreenX >= left &&
            projScreenX <= left + BLOCK_W &&
            projScreenY >= top &&
            projScreenY <= top + BLOCK_H;
          if (hit) {
            setBlocksBroken((prev) => {
              const next = [...prev];
              next[i] = true;
              return next;
            });
            return null;
          }
        }

        if (ny < -20 || ny > h + 20 || nx < -20 || nx > w + 20) return null;
        return { ...p, x: nx, y: ny };
      });
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
    // Only run when projectile starts flying; [projectile] would re-run every frame (position updates)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [hasProjectile]);

  const aimDeg = (aimAngle * 180) / Math.PI;

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full flex-col overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setAimAngle((-90 * Math.PI) / 180)}
    >
      {/* "You Win!" + Replay – visible only when all blocks broken, above cannon zone when revealed */}
      <div
        className={`absolute inset-0 flex flex-1 flex-col items-center justify-center gap-6 ${revealed ? "z-20" : ""}`}
        aria-hidden={!revealed}
      >
        <p
          className={`select-none text-center font-extrabold tracking-tight text-neutral-100 sm:text-5xl md:text-6xl lg:text-7xl ${
            revealed ? "you-win-reveal" : "opacity-0"
          }`}
          style={{
            textShadow: revealed
              ? "0 0 40px rgba(255,255,255,0.15), 0 0 80px rgba(255,255,255,0.08)"
              : undefined,
          }}
        >
          You Win!
        </p>
        {revealed && onReplay && (
          <button
            type="button"
            onClick={onReplay}
            className="flex flex-col items-center gap-1.5 rounded p-2 text-neutral-500 transition-colors hover:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 focus:ring-offset-neutral-950"
            aria-label="Replay"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M1 4v6h6" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            <span className="text-xs font-medium tracking-wide">Replay</span>
          </button>
        )}
      </div>

      {/* Instruction at top */}
      <p
        className="absolute left-1/2 top-6 z-10 -translate-x-1/2 text-center text-sm font-medium tracking-wide text-neutral-400"
        aria-hidden={revealed}
      >
        Shoot the blocks to reveal the message
      </p>

      {/* Breakable blocks – one row of 4 */}
      <div
        ref={blocksContainerRef}
        className="absolute left-1/2 top-24 z-0 -translate-x-1/2"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${BLOCK_COLS}, ${BLOCK_W}px)`,
          gap: BLOCK_GAP,
        }}
        aria-hidden={revealed}
      >
        {Array.from({ length: BLOCK_COUNT }, (_, i) => (
          <div
            key={i}
            className={`you-win-block h-[72px] w-[72px] rounded-none bg-neutral-600/90 shadow-md transition-all duration-200 ${
              blocksBroken[i] ? "you-win-block-broken scale-0 opacity-0" : ""
            }`}
          />
        ))}
      </div>

      {/* Cannon zone – click/tap to shoot; touch: drag to aim, release to fire. Extra bottom padding on mobile so hit area sits above "Available for work" bar. */}
      <div
        className={`absolute bottom-0 left-0 right-0 top-[11rem] z-10 flex touch-none items-end justify-center pb-36 md:pb-4 ${
          revealed ? "pointer-events-none cursor-default" : "cursor-crosshair"
        }`}
        onClick={revealed ? undefined : handleFire}
        onTouchStart={(e) => {
          if (revealed || projectile) return;
          e.preventDefault();
        }}
        onTouchMove={revealed ? undefined : handleTouchMove}
        onTouchEnd={revealed ? undefined : handleTouchEnd}
        role={revealed ? undefined : "button"}
        tabIndex={revealed ? -1 : 0}
        aria-label={revealed ? undefined : "Aim and click or release finger to fire"}
        onKeyDown={
          revealed
            ? undefined
            : (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleFire();
                }
              }
        }
      >
        {/* Cannon graphic – absolute in flow on desktop */}
        <div
          className="you-win-cannon absolute bottom-6 left-1/2 hidden w-12 transition-transform duration-75 md:block"
          style={{
            transform: `translateX(calc(-50% + ${CANNON_OFFSET_RIGHT_PX}px)) rotate(${aimDeg + 90}deg)`,
            transformOrigin: "50% 100%",
          }}
          aria-hidden
        >
          <svg
            viewBox="0 0 48 40"
            className="h-auto w-full text-neutral-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="square"
            aria-hidden
          >
            <path d="M8 36h32v4H8z" fill="currentColor" className="text-neutral-700" />
            <path d="M12 32h8v4h-8zM28 32h8v4h-8z" fill="currentColor" className="text-neutral-600" />
            <rect x="20" y="8" width="8" height="28" rx="1" fill="currentColor" className="text-neutral-500" />
            <rect x="21" y="9" width="6" height="26" fill="currentColor" className="text-neutral-400 opacity-60" />
            <rect x="19" y="4" width="10" height="6" fill="currentColor" className="text-neutral-400" />
          </svg>
        </div>
      </div>

      {/* Mobile: fixed cannon above "Available for work" bar (z-30) so it’s visible; touch handled by zone above */}
      {!revealed && (
        <div
          className="pointer-events-none fixed z-30 w-12 md:hidden"
          style={
            mobileCannonRect
              ? {
                  left: mobileCannonRect.left + mobileCannonRect.width / 2 - 24 + CANNON_OFFSET_RIGHT_PX,
                  top: mobileCannonRect.bottom - 96 - 40,
                  transform: `rotate(${aimDeg + 90}deg)`,
                  transformOrigin: "50% 100%",
                }
              : {
                  left: "50%",
                  bottom: 96,
                  transform: `translateX(-50%) translateX(${CANNON_OFFSET_RIGHT_PX}px) rotate(${aimDeg + 90}deg)`,
                  transformOrigin: "50% 100%",
                }
          }
          aria-hidden
        >
          <svg
            viewBox="0 0 48 40"
            className="h-auto w-full text-neutral-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="square"
            aria-hidden
          >
            <path d="M8 36h32v4H8z" fill="currentColor" className="text-neutral-700" />
            <path d="M12 32h8v4h-8zM28 32h8v4h-8z" fill="currentColor" className="text-neutral-600" />
            <rect x="20" y="8" width="8" height="28" rx="1" fill="currentColor" className="text-neutral-500" />
            <rect x="21" y="9" width="6" height="26" fill="currentColor" className="text-neutral-400 opacity-60" />
            <rect x="19" y="4" width="10" height="6" fill="currentColor" className="text-neutral-400" />
          </svg>
        </div>
      )}

      {/* Projectile – rotated to face direction of motion (tail behind) */}
      {projectile && (
        <div
          className="pointer-events-none absolute z-20"
          style={{
            left: projectile.x,
            top: projectile.y,
            transform: `translate(-50%, -50%) rotate(${(Math.atan2(projectile.vy, projectile.vx) * 180) / Math.PI}deg)`,
          }}
          aria-hidden
        >
          <div className="h-2 w-2 rounded-full bg-amber-200 shadow-[0_0_10px_rgba(253,230,138,0.9)]" />
          <div className="absolute left-0 top-1/2 h-0.5 w-3 -translate-y-1/2 -translate-x-full bg-gradient-to-r from-transparent to-amber-400/70" />
        </div>
      )}
    </div>
  );
}
