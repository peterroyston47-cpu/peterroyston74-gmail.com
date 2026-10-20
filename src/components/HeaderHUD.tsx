import React from 'react';
import { Volume2, VolumeX, Eye, Download, Sparkles, Orbit } from 'lucide-react';
import { SpectralBand } from '../types/galaxy';

interface HeaderHUDProps {
  fps: number;
  starCount: number;
  spectralBand: SpectralBand;
  isAudioActive: boolean;
  onToggleAudio: () => void;
  onOpenOpenSeaModal: () => void;
  onOpenExportModal: () => void;
  isAutoRotate: boolean;
  onToggleAutoRotate: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  fps,
  starCount,
  spectralBand,
  isAudioActive,
  onToggleAudio,
  onOpenOpenSeaModal,
  onOpenExportModal,
  isAutoRotate,
  onToggleAutoRotate,
}) => {
  const spectralNames: Record<SpectralBand, { label: string; color: string }> = {
    hubble: { label: 'HUBBLE OPTICAL', color: 'text-amber-300' },
    spitzer: { label: 'SPITZER INFRARED', color: 'text-orange-400' },
    chandra: { label: 'CHANDRA X-RAY', color: 'text-cyan-300' },
    synthwave: { label: 'SYNTHWAVE NEON', color: 'text-fuchsia-400' },
    deepspace: { label: 'ULTRAVIOLET SURVEY', color: 'text-slate-300' },
    rainbow: {
      label: '1/1 RAINBOW CONCEPT',
      color: 'text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-300 via-emerald-300 via-cyan-300 to-fuchsia-400 font-bold',
    },
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-20 pointer-events-none p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      {/* Galaxy Spec Identity */}
      <div className="pointer-events-auto bg-neutral-950/90 border border-neutral-800/80 rounded-xl px-4 py-3 shadow-2xl">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-emerald-300/40" />
          <h1 className="text-sm sm:text-base font-semibold tracking-wider text-neutral-100 font-mono">
            MESSIER 104 • SOMBRERO GALAXY
          </h1>
          <span className="text-[10px] font-mono tracking-widest px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700/60 uppercase">
            NGC 4594
          </span>
        </div>
        <p className="text-[11px] font-mono text-neutral-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>29.35 MLY DISTANCE</span>
          <span className="text-neutral-600">•</span>
          <span>RA 12ʰ 39ᵐ 59.4ˢ</span>
          <span className="text-neutral-600">•</span>
          <span>DEC -11° 37′ 23″</span>
          <span className="text-neutral-600">•</span>
          <span className={spectralNames[spectralBand].color}>
            {spectralNames[spectralBand].label}
          </span>
        </p>
      </div>

      {/* Telemetry & Actions */}
      <div className="pointer-events-auto flex flex-wrap items-center gap-2.5">
        {/* Real-time stats */}
        <div className="hidden sm:flex items-center gap-3 bg-neutral-950/90 border border-neutral-800/80 rounded-xl px-3.5 py-2 text-xs font-mono text-neutral-300">
          <div>
            <span className="text-neutral-500 text-[10px] block">SIMULATED STARS</span>
            <span className="text-neutral-200 font-medium">{starCount.toLocaleString()}</span>
          </div>
          <div className="w-px h-6 bg-neutral-800" />
          <div>
            <span className="text-neutral-500 text-[10px] block">FPS</span>
            <span className="text-emerald-400 font-medium">{fps || 60}</span>
          </div>
        </div>

        {/* Orbit Toggle */}
        <button
          onClick={onToggleAutoRotate}
          title={isAutoRotate ? 'Pause Orbit' : 'Resume Galactic Orbit'}
          className={`px-3 py-2 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-colors border ${
            isAutoRotate
              ? 'bg-neutral-800/90 text-cyan-300 border-cyan-800/60'
              : 'bg-neutral-950/90 text-neutral-400 border-neutral-800/80 hover:text-neutral-200'
          }`}
        >
          <Orbit className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isAutoRotate ? 'ORBIT ON' : 'ORBIT OFF'}</span>
        </button>

        {/* Space Ambient Audio Toggle */}
        <button
          onClick={onToggleAudio}
          title={isAudioActive ? 'Mute Deep Space Drone' : 'Enable Deep Space Drone'}
          className={`px-3 py-2 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-colors border ${
            isAudioActive
              ? 'bg-neutral-800/90 text-amber-300 border-amber-800/60'
              : 'bg-neutral-950/90 text-neutral-400 border-neutral-800/80 hover:text-neutral-200'
          }`}
        >
          {isAudioActive ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">COSMIC DRONE</span>
        </button>

        {/* OpenSea Preview Button */}
        <button
          onClick={onOpenOpenSeaModal}
          className="px-3.5 py-2 rounded-xl text-xs font-medium font-mono bg-blue-950/80 hover:bg-blue-900/90 text-blue-200 border border-blue-700/60 transition-colors flex items-center gap-1.5 shadow-lg shadow-blue-950/30"
        >
          <Eye className="w-3.5 h-3.5 text-blue-400" />
          <span>OPENSEA CARD</span>
        </button>

        {/* Full Asset Download Center */}
        <button
          onClick={onOpenExportModal}
          className="px-4 py-2 rounded-xl text-xs font-medium font-mono bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400/40 transition-all flex items-center gap-2 shadow-xl shadow-emerald-950/40 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span className="font-semibold tracking-wide">DOWNLOAD ASSET</span>
          <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded text-emerald-200 font-mono">
            GLB / ZIP
          </span>
        </button>
      </div>
    </header>
  );
};
