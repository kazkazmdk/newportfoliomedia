"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Cylinder,
  Decal,
  Grid,
  MeshTransmissionMaterial,
  PerspectiveCamera,
  PresentationControls,
  RenderTexture,
  Sparkles,
  Sphere,
  Stage,
  Text,
} from "@react-three/drei";
import { DoubleSide, type Mesh } from "three";

export default function FolioScene() {
  const ring = useRef<Mesh>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.matchMedia("(max-width: 768px)").matches);
  }, []);

  useFrame(({ clock }) => {
    if (ring.current) {
      ring.current.rotation.y = clock.getElapsedTime() / 2;
    }
  });

  return (
    <PresentationControls
      enabled
      global={false}
      cursor
      snap={false}
      speed={1}
      zoom={1}
      rotation={[0, 0, 0]}
      polar={[0, Math.PI / 2]}
      azimuth={[-Infinity, Infinity]}
    >
      <Stage
        intensity={0.5}
        adjustCamera={isMobile ? 1 : 2}
        preset="rembrandt"
        shadows={{ type: "accumulative", color: "#9d4b4b" }}
        environment={{ preset: "studio", blur: 1 }}
      >
        <Sphere position-y={0} castShadow receiveShadow>
          <MeshTransmissionMaterial
            color="lightgrey"
            thickness={0.2}
            chromaticAberration={0.05}
            anisotropy={1.5}
            clearcoat={1}
            clearcoatRoughness={0.2}
            envMapIntensity={1}
            distortionScale={0.2}
            temporalDistortion={0.1}
            transparent
          />
          <Sparkles scale={0.5} threshold={15} color="#9d4b4b" />
        </Sphere>
        <Cylinder
          ref={ring}
          args={[0.8, 0.8, 0.1, 64, 2, true]}
          position={[0, 0, 0]}
          rotation={[Math.PI / 15, 0, Math.PI / 12]}
          scale={[1, 1, 1]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color="#000000" side={DoubleSide} />
          <Decal position={[0, 0, -0.4]} rotation={[0, 0, 0]} scale={[1, 0.1, 1]}>
            <meshStandardMaterial
              roughness={0.6}
              transparent
              polygonOffset
              polygonOffsetFactor={-1}
            >
              <RenderTexture attach="map" anisotropy={16}>
                <PerspectiveCamera makeDefault manual aspect={5.5} position={[0, 0, 5]} />
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} />
                <Text rotation={[0, Math.PI, 0]} fontSize={3} color="white">
                  Under Construction
                </Text>
              </RenderTexture>
            </meshStandardMaterial>
          </Decal>
        </Cylinder>
      </Stage>
      <Grid
        args={[2, 2]}
        cellSize={0.6}
        cellThickness={1}
        cellColor="#6f6f6f"
        fadeDistance={3}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid
        sectionSize={3.3}
        sectionThickness={1.5}
        sectionColor="#9d4b4b"
        position={[0, -0.6, 0]}
      />
    </PresentationControls>
  );
}
