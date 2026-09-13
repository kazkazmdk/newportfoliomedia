"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, N8AO, Vignette } from "@react-three/postprocessing";
import FolioScene from "@/components/folio-scene";
import { useIsMobileViewport, usePrefersReducedMotion } from "@/lib/use-media-query";
import { clampDevicePixelRatio } from "@/lib/media";

export default function FolioCanvas() {
  const isMobile = useIsMobileViewport();
  const reducedMotion = usePrefersReducedMotion();
  const maxDpr = isMobile ? 1.5 : 2;

  return (
    <div
      className="fixed bottom-0 left-0 z-30 h-screen w-full"
      role="img"
      aria-label="Interactive 3D scene: a glass sphere and a black ring labeled Under Construction on a grid."
    >
      <Canvas
        shadows={!isMobile}
        camera={{ position: [0, 1.5, 5] }}
        dpr={[1, maxDpr]}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: isMobile ? "low-power" : "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.setPixelRatio(clampDevicePixelRatio(window.devicePixelRatio, maxDpr));
        }}
      >
        <color attach="background" args={["#f0f0f0"]} />
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <Suspense fallback={null}>
          <FolioScene />
        </Suspense>
        {!isMobile && !reducedMotion ? (
          <EffectComposer enableNormalPass={false} multisampling={0}>
            <N8AO aoRadius={0.1} intensity={2} aoSamples={4} denoiseSamples={4} />
            <Vignette />
          </EffectComposer>
        ) : null}
      </Canvas>
    </div>
  );
}
