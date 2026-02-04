"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useCursor } from "@react-three/drei";
import * as THREE from "three";
import { TV_CHANNELS } from "./types";

const CANVAS_W = 512;
const CANVAS_H = 384; // 4:3 aspect ratio (1024×768)
const OVERSCAN = 0.06; // Crop ~6% of edges (CRT overscan)
const SCANLINE_HEIGHT = 2;
const SCANLINE_GAP = 2;
const ON_OFF_ANIM_DURATION_SEC = 0.35;
const BEAM_SPOT_DURATION_SEC = 0.2;
const BEAM_SPOT_COLOR = "#93c5fd"; // soft blue, matches TV accent
type BandDirection = "expand" | "collapse";

function drawStaticNoise(ctx: CanvasRenderingContext2D) {
  const imageData = ctx.createImageData(CANVAS_W, CANVAS_H);
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = Math.random() > 0.5 ? 200 : 40;
    d[i] = d[i + 1] = d[i + 2] = v;
    d[i + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
}

function drawScanlines(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
  for (let y = 0; y < CANVAS_H; y += SCANLINE_HEIGHT + SCANLINE_GAP) {
    ctx.fillRect(0, y, CANVAS_W, SCANLINE_HEIGHT);
  }
}

function drawScreenshotToCanvas(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  bandProgress?: number,
  bandDirection?: BandDirection
) {
  const c = OVERSCAN / 2;
  const sx = img.width * c;
  const sy = img.height * c;
  const sw = img.width * (1 - OVERSCAN);
  const sh = img.height * (1 - OVERSCAN);

  const cy = CANVAS_H / 2;
  const hasBand = bandProgress !== undefined && bandDirection !== undefined;
  const bandHeight =
    hasBand && bandDirection === "expand"
      ? CANVAS_H * bandProgress
      : hasBand && bandDirection === "collapse"
        ? CANVAS_H * (1 - bandProgress)
        : CANVAS_H;

  if (hasBand && bandHeight <= 0) return;

  if (hasBand) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, cy - bandHeight / 2, CANVAS_W, bandHeight);
    ctx.clip();
  }

  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, CANVAS_W, CANVAS_H);
  drawScanlines(ctx);

  if (hasBand) ctx.restore();
}

function drawChannelToCanvas(
  ctx: CanvasRenderingContext2D,
  channel: (typeof TV_CHANNELS)[number],
  screenshotImg: HTMLImageElement | null,
  powerOn: boolean,
  showStatic: boolean,
  bandProgress?: number,
  bandDirection?: BandDirection
) {
  ctx.fillStyle = "#0a0e14";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  if (!powerOn && bandProgress === undefined) return;

  // Channel change static
  if (showStatic) {
    drawStaticNoise(ctx);
    drawScanlines(ctx);
    return;
  }

  // Channel closed: static (noise)
  if (!channel.screenshot) {
    const cy = CANVAS_H / 2;
    const hasBand = bandProgress !== undefined && bandDirection !== undefined;
    const bandHeight =
      hasBand && bandDirection === "expand"
        ? CANVAS_H * bandProgress
        : hasBand && bandDirection === "collapse"
          ? CANVAS_H * (1 - bandProgress)
          : CANVAS_H;
    if (hasBand && bandHeight <= 0) return;
    if (hasBand) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, cy - bandHeight / 2, CANVAS_W, bandHeight);
      ctx.clip();
    }
    drawStaticNoise(ctx);
    drawScanlines(ctx);
    if (hasBand) ctx.restore();
    return;
  }

  // Project channel with screenshot
  if (screenshotImg && screenshotImg.complete && screenshotImg.naturalWidth) {
    drawScreenshotToCanvas(ctx, screenshotImg, bandProgress, bandDirection);
  } else {
    ctx.fillStyle = "#1a1e24";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    drawScanlines(ctx);
  }
}

/** Draw the final beam spot (center dot) that fades and shrinks. progress 0 = bright, 1 = gone */
function drawBeamSpot(ctx: CanvasRenderingContext2D, progress: number) {
  ctx.fillStyle = "#0a0e14";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  if (progress >= 1) return;
  const cx = CANVAS_W / 2;
  const cy = CANVAS_H / 2;
  const maxRadius = 14;
  const radius = maxRadius * (1 - progress);
  const opacity = 1 - progress;
  ctx.fillStyle = BEAM_SPOT_COLOR;
  ctx.globalAlpha = opacity;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

type TvSceneProps = {
  powerOn?: boolean;
  channelIndex?: number;
  showStatic?: boolean;
  onTuneInComplete?: () => void;
};

type AnimPhase = "idle" | "turningOn" | "turningOff" | "beamSpot";

export default function TvScene({
  powerOn = true,
  channelIndex = 0,
  showStatic = false,
}: TvSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const prevPowerOnRef = useRef(powerOn);
  const animPhaseRef = useRef<AnimPhase>("idle");
  const animProgressRef = useRef(0);
  const screenshotCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const [loadedScreenshot, setLoadedScreenshot] = useState<string | null>(null);
  const [screenHovered, setScreenHovered] = useState(false);
  const channel = TV_CHANNELS[channelIndex];
  const hasClickableChannel = !!channel?.url;
  useCursor(screenHovered && powerOn && hasClickableChannel);

  const { scene } = useGLTF("/models/tv.glb");

  const { centeredScene, scale, screenMaterial, screenOriginal, screenMesh, canvas, canvasTexture } =
    useMemo((): {
      centeredScene: THREE.Object3D;
      scale: number;
      screenMaterial: THREE.MeshStandardMaterial | null;
      screenOriginal: { emissive: THREE.Color; emissiveIntensity: number; color: THREE.Color } | null;
      screenMesh: THREE.Mesh | null;
      canvas: HTMLCanvasElement;
      canvasTexture: THREE.CanvasTexture;
    } => {
    const box = new THREE.Box3().setFromObject(scene);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    const maxDim = Math.max(size.x, size.y, size.z);
    const targetSize = 1.6;
    const scale = maxDim > 0 ? targetSize / maxDim : 1;

    const cloned = scene.clone();
    cloned.position.sub(center);
    cloned.updateMatrixWorld(true);

    let screenMaterial: THREE.MeshStandardMaterial | null = null;
    let screenOriginal: {
      emissive: THREE.Color;
      emissiveIntensity: number;
      color: THREE.Color;
    } | null = null;
    let screenMesh: THREE.Mesh | null = null;

    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mat = Array.isArray(child.material) ? child.material[0] : child.material;
        if (mat instanceof THREE.MeshStandardMaterial && mat.name === "TVScreen") {
          screenMaterial = mat;
          screenMesh = child;
          screenOriginal = {
            emissive: mat.emissive.clone(),
            emissiveIntensity: mat.emissiveIntensity,
            color: mat.color.clone(),
          };
        }
      }
    });

    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const canvasTexture = new THREE.CanvasTexture(canvas);
    canvasTexture.colorSpace = THREE.SRGBColorSpace;
    canvasTexture.minFilter = THREE.LinearFilter;
    canvasTexture.magFilter = THREE.LinearFilter;

    return { centeredScene: cloned, scale, screenMaterial, screenOriginal, screenMesh, canvas, canvasTexture };
  }, [scene]);

  const screenshotImg = channel?.screenshot
    ? screenshotCacheRef.current.get(channel.screenshot) ?? null
    : null;

  // Load screenshot when channel has one
  useEffect(() => {
    const path = channel?.screenshot;
    if (!path || screenshotCacheRef.current.has(path)) return;
    const img = new Image();
    img.onload = () => {
      screenshotCacheRef.current.set(path, img);
      setLoadedScreenshot(path);
    };
    img.src = path;
  }, [channel?.screenshot]);

  // Start classic TV on/off animation when power toggles
  useEffect(() => {
    if (prevPowerOnRef.current !== powerOn) {
      prevPowerOnRef.current = powerOn;
      if (powerOn) {
        animPhaseRef.current = "turningOn";
        animProgressRef.current = 0;
      } else {
        animPhaseRef.current = "turningOff";
        animProgressRef.current = 0;
      }
    }
  }, [powerOn]);

  // Redraw canvas when content changes (only when not animating)
  useEffect(() => {
    if (animPhaseRef.current !== "idle") return;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const ch = TV_CHANNELS[channelIndex] ?? TV_CHANNELS[0];
    const img = ch?.screenshot ? screenshotCacheRef.current.get(ch.screenshot) ?? null : null;
    drawChannelToCanvas(ctx, ch, img, powerOn, showStatic);
    // Three.js CanvasTexture requires imperative mutation
    // eslint-disable-next-line react-hooks/immutability -- Three.js texture API
    canvasTexture.needsUpdate = true;
  }, [powerOn, channelIndex, showStatic, loadedScreenshot, canvas, canvasTexture]);

  // Material: on when power on or still playing turn-off animation
  useEffect(() => {
    if (!screenMaterial || !screenOriginal) return;
    const mat = screenMaterial as THREE.MeshStandardMaterial;
    const orig = screenOriginal as { emissive: THREE.Color; emissiveIntensity: number; color: THREE.Color };
    const stayOn =
      powerOn ||
      animPhaseRef.current === "turningOff" ||
      animPhaseRef.current === "beamSpot";
    /* eslint-disable react-hooks/immutability -- Three.js material API requires imperative mutation */
    if (stayOn) {
      mat.map = canvasTexture;
      mat.emissiveMap = canvasTexture;
      mat.emissive.set(1, 1, 1);
      mat.emissiveIntensity = 1;
      mat.color.set(1, 1, 1);
    } else {
      mat.map = null;
      mat.emissiveMap = null;
      mat.emissive.copy(orig.emissive);
      mat.emissiveIntensity = orig.emissiveIntensity;
      mat.color.set(0.02, 0.02, 0.02);
    }
    /* eslint-enable react-hooks/immutability */
  }, [powerOn, screenMaterial, screenOriginal, canvasTexture]);

  useFrame((_, delta) => {
    const phase = animPhaseRef.current;
    if (phase === "idle") return;
    if (!canvas || !screenMaterial || !screenOriginal) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const duration =
      phase === "beamSpot" ? BEAM_SPOT_DURATION_SEC : ON_OFF_ANIM_DURATION_SEC;
    animProgressRef.current += delta / duration;
    const progress = Math.min(1, animProgressRef.current);

    if (phase === "turningOn") {
      drawChannelToCanvas(
        ctx,
        channel,
        screenshotImg,
        true,
        false,
        progress,
        "expand"
      );
      if (progress >= 1) animPhaseRef.current = "idle";
    } else if (phase === "turningOff") {
      drawChannelToCanvas(
        ctx,
        channel,
        screenshotImg,
        true,
        false,
        progress,
        "collapse"
      );
      if (progress >= 1) {
        animPhaseRef.current = "beamSpot";
        animProgressRef.current = 0;
      }
    } else if (phase === "beamSpot") {
      drawBeamSpot(ctx, progress);
      if (progress >= 1 && screenMaterial && screenOriginal) {
        animPhaseRef.current = "idle";
        /* eslint-disable react-hooks/immutability -- Three.js material API in useFrame */
        screenMaterial.map = null;
        screenMaterial.emissiveMap = null;
        screenMaterial.emissive.copy(screenOriginal.emissive);
        screenMaterial.emissiveIntensity = screenOriginal.emissiveIntensity;
        screenMaterial.color.set(0.02, 0.02, 0.02);
        /* eslint-enable react-hooks/immutability */
      }
    }
    /* eslint-disable-next-line react-hooks/immutability -- Three.js texture API */
    canvasTexture.needsUpdate = true;
  });

  return (
    <>
      <ambientLight intensity={0.85} />
      <pointLight position={[0.8, 0.6, 1.5]} intensity={2.2} color="#ffffff" />
      <pointLight position={[-0.6, 0.4, 1.2]} intensity={1.2} color="#e8eeff" />
      <pointLight position={[0.4, -0.2, 1]} intensity={0.8} color="#ffffff" />

      <group
        ref={groupRef}
        position={[0, 0, 0]}
        scale={scale}
        rotation={[0, Math.PI, 0]}
        onPointerDown={(e) => {
          const hit = e.intersections[0];
          if (!hit || !screenMesh || hit.object !== screenMesh) return;
          if (!powerOn || !channel?.url) return;
          e.stopPropagation();
          window.open(channel.url, "_blank", "noopener,noreferrer");
        }}
        onPointerOver={(e) => {
          setScreenHovered(e.intersections.some((i) => i.object === screenMesh));
        }}
        onPointerOut={() => setScreenHovered(false)}
      >
        <primitive object={centeredScene} />
      </group>
    </>
  );
}
