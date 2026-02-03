"use client";

import { useRef, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

type TvSceneProps = {
  powerOn?: boolean;
  channelIndex?: number;
  onTuneInComplete?: () => void;
};

export default function TvScene({ powerOn = true, channelIndex: _channelIndex = 0 }: TvSceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  const { scene } = useGLTF("/models/tv.glb");

  const { centeredScene, scale } = useMemo(() => {
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

    return { centeredScene: cloned, scale };
  }, [scene]);

  const dim = powerOn ? 1 : 0.15;

  return (
    <>
      <ambientLight intensity={0.85 * dim} />
      <pointLight position={[0.8, 0.6, 1.5]} intensity={2.2 * dim} color="#ffffff" />
      <pointLight position={[-0.6, 0.4, 1.2]} intensity={1.2 * dim} color="#e8eeff" />
      <pointLight position={[0.4, -0.2, 1]} intensity={0.8 * dim} color="#ffffff" />

      <group ref={groupRef} position={[0, 0, 0]} scale={scale} rotation={[0, Math.PI, 0]}>
        <primitive object={centeredScene} />
      </group>
    </>
  );
}
