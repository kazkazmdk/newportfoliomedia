"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { EffectComposer, N8AO, Vignette } from "@react-three/postprocessing";
import FolioScene from "@/components/folio-scene";

export default function FolioCanvas() {
  return (
    <div className="fixed bottom-0 left-0 z-30 h-screen w-full">
      <Canvas
        shadows
        camera={{ position: [0, 1.5, 5] }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <color attach="background" args={["#f0f0f0"]} />
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <Suspense fallback={null}>
          <FolioScene />
        </Suspense>
        <EffectComposer enableNormalPass={false} multisampling={0}>
          <N8AO aoRadius={0.1} intensity={2} aoSamples={6} denoiseSamples={4} />
          <Vignette />
        </EffectComposer>
        <Environment preset="studio" environmentIntensity={0.5} />
      </Canvas>
    </div>
  );
}
