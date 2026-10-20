import React, { useState, useRef, useCallback } from 'react';
import { GalaxyParams, SpectralBand } from './types/galaxy';
import { GalaxyCanvas, GalaxyCanvasHandle } from './components/GalaxyCanvas';
import { HeaderHUD } from './components/HeaderHUD';
import { DockControls } from './components/DockControls';
import { ExportModal } from './components/ExportModal';
import { OpenSeaModal } from './components/OpenSeaModal';
import { spaceAudio } from './audio/spaceAudio';

const DEFAULT_GALAXY_PARAMS: GalaxyParams = {
  starCount: 120000,
  coreRadius: 45,
  diskRadius: 215,
  dustRingInner: 115,
  dustRingOuter: 168,
  dustOpacity: 0.94,
  haloCount: 1400,
  rotationSpeed: 1.0,
  coreLuminosity: 1.0,
  jetIntensity: 1.0,
  spectralBand: 'hubble',
  inclinationDeg: 6, // Sombrero's famous edge-on tilt
  cameraFov: 45,
  rainbowCycleSpeed: 1.0,
};

export default function App() {
  const [params, setParams] = useState<GalaxyParams>(DEFAULT_GALAXY_PARAMS);
  const [fps, setFps] = useState(60);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isOpenSeaModalOpen, setIsOpenSeaModalOpen] = useState(false);

  const canvasRef = useRef<GalaxyCanvasHandle>(null);

  const handleUpdateParams = useCallback((updated: Partial<GalaxyParams>) => {
    setParams((prev) => ({ ...prev, ...updated }));
  }, []);

  const handleToggleAudio = useCallback(() => {
    const newState = spaceAudio.toggle();
    setIsAudioActive(newState);
  }, []);

  const handleToggleAutoRotate = useCallback(() => {
    setIsAutoRotate((prev) => !prev);
  }, []);

  const handleSetCameraPreset = useCallback(
    (preset: 'edge-on' | 'polar' | 'core' | 'oblique') => {
      canvasRef.current?.setCameraPreset(preset);
    },
    []
  );

  const handleResetCamera = useCallback(() => {
    canvasRef.current?.resetCamera();
  }, []);

  return (
    <main className="relative w-screen h-screen bg-[#040407] text-white overflow-hidden select-none font-sans">
      {/* 3D WebGL Canvas Layer */}
      <GalaxyCanvas
        ref={canvasRef}
        params={params}
        onFpsUpdate={setFps}
        isAutoRotate={isAutoRotate}
      />

      {/* Top Header HUD (Telemetry, Messier spec badge, audio, OpenSea link, export button) */}
      <HeaderHUD
        fps={fps}
        starCount={params.starCount}
        spectralBand={params.spectralBand}
        isAudioActive={isAudioActive}
        onToggleAudio={handleToggleAudio}
        onOpenOpenSeaModal={() => setIsOpenSeaModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        isAutoRotate={isAutoRotate}
        onToggleAutoRotate={handleToggleAutoRotate}
      />

      {/* Sleek Collapsible Bottom Dock Controls (Zero viewport occlusion) */}
      <DockControls
        params={params}
        onChangeParams={handleUpdateParams}
        onSetCameraPreset={handleSetCameraPreset}
        onResetCamera={handleResetCamera}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* Full Asset Export Modal (.ZIP Bundle, .GLB, 2K/4K Poster, Metadata JSON, Mint Guide) */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        exportableGroup={canvasRef.current?.getExportableGroup() ?? null}
        renderer={canvasRef.current?.getRenderer() ?? null}
        scene={canvasRef.current?.getScene() ?? null}
        camera={canvasRef.current?.getCamera() ?? null}
        params={params}
      />

      {/* OpenSea Collection Gallery Inspector Modal */}
      <OpenSeaModal
        isOpen={isOpenSeaModalOpen}
        onClose={() => setIsOpenSeaModalOpen(false)}
        params={params}
        onOpenExportModal={() => {
          setIsOpenSeaModalOpen(false);
          setIsExportModalOpen(true);
        }}
      />
    </main>
  );
}
