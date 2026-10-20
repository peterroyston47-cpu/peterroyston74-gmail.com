import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Sliders,
  Compass,
  Layers,
  Sparkles,
  Download,
  RotateCcw,
} from 'lucide-react';
import { GalaxyParams, SpectralBand } from '../types/galaxy';

interface DockControlsProps {
  params: GalaxyParams;
  onChangeParams: (updated: Partial<GalaxyParams>) => void;
  onSetCameraPreset: (preset: 'edge-on' | 'polar' | 'core' | 'oblique') => void;
  onResetCamera: () => void;
  onOpenExportModal: () => void;
}

type TabType = 'spectra' | 'vantage' | 'astrophysics' | 'nft';

export const DockControls: React.FC<DockControlsProps> = ({
  params,
  onChangeParams,
  onSetCameraPreset,
  onResetCamera,
  onOpenExportModal,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('spectra');

  const spectralBands: Array<{
    id: SpectralBand;
    name: string;
    description: string;
    badge: string;
    color: string;
  }> = [
    {
      id: 'hubble',
      name: 'Hubble Optical',
      description: 'True-color luminous bulge & dense dark chocolate dust rim',
      badge: 'F606W / F814W',
      color: 'hover:border-amber-500/80',
    },
    {
      id: 'spitzer',
      name: 'Spitzer Infrared',
      description: 'Incandescent glowing amber dust lane & cool blue stellar bulge',
      badge: '3.6μm - 8.0μm',
      color: 'hover:border-orange-500/80',
    },
    {
      id: 'chandra',
      name: 'Chandra X-Ray',
      description: 'Relativistic polar jets & 10^9 M☉ black hole accretion corona',
      badge: '0.5 - 7 keV',
      color: 'hover:border-cyan-500/80',
    },
    {
      id: 'synthwave',
      name: 'Cyberpunk Neon',
      description: 'Ultra-saturated magenta & cyan holographic NFT aesthetics',
      badge: 'Web3 Edition',
      color: 'hover:border-fuchsia-500/80',
    },
    {
      id: 'deepspace',
      name: 'Deep UV Survey',
      description: 'High-contrast ultraviolet astrograph with intense core contrast',
      badge: 'GALEX NUV',
      color: 'hover:border-slate-400/80',
    },
    {
      id: 'rainbow',
      name: 'Prismatic Rainbow',
      description: 'Ultra-rare 1/1 iridescent chromatic Doppler aurora & rainbow dust',
      badge: '1/1 NFT Concept',
      color: 'hover:border-pink-500/80',
    },
  ];

  const cameraPresets: Array<{
    id: 'edge-on' | 'polar' | 'core' | 'oblique';
    label: string;
    desc: string;
  }> = [
    {
      id: 'edge-on',
      label: 'Hubble Edge-On (6°)',
      desc: 'Iconic wide-brimmed Sombrero silhouette',
    },
    {
      id: 'polar',
      label: 'Polar Zenith',
      desc: 'Top-down disk & concentric dust structure',
    },
    {
      id: 'core',
      label: 'Black Hole Accretion',
      desc: 'Close fly-in to central event horizon & jets',
    },
    {
      id: 'oblique',
      label: 'Isometric 45°',
      desc: 'Full 3D depth with halo clusters',
    },
  ];

  return (
    <div
      className={`fixed z-30 bottom-4 left-1/2 -translate-x-1/2 transition-transform duration-300 ease-out w-[95vw] max-w-[940px] ${
        isCollapsed ? 'translate-y-[calc(100%-36px)]' : 'translate-y-0'
      }`}
    >
      {/* Collapse/Expand Toggle Header Tab */}
      <div className="flex justify-center mb-1">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1.5 px-4 py-1 rounded-t-lg bg-neutral-900 border-t border-x border-neutral-700/80 text-[11px] font-mono text-neutral-300 hover:text-white transition-colors cursor-pointer shadow-lg"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>EXPAND CONTROLS</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              <span>COLLAPSE HUD (ZEN VIEW)</span>
            </>
          )}
        </button>
      </div>

      {/* Main Glassmorphic Dock Container */}
      <div className="bg-neutral-950/95 border border-neutral-800 rounded-2xl p-4 shadow-2xl backdrop-none">
        {/* Dock Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3 mb-3 gap-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('spectra')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                activeTab === 'spectra'
                  ? 'bg-neutral-800 text-cyan-300 border border-neutral-700'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>SPECTRAL BANDS</span>
            </button>

            <button
              onClick={() => setActiveTab('vantage')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                activeTab === 'vantage'
                  ? 'bg-neutral-800 text-cyan-300 border border-neutral-700'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>VANTAGE & VIEWS</span>
            </button>

            <button
              onClick={() => setActiveTab('astrophysics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                activeTab === 'astrophysics'
                  ? 'bg-neutral-800 text-cyan-300 border border-neutral-700'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>ASTROPHYSICS</span>
            </button>

            <button
              onClick={() => setActiveTab('nft')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                activeTab === 'nft'
                  ? 'bg-neutral-800 text-cyan-300 border border-neutral-700'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>NFT ASSET SUITE</span>
            </button>
          </div>

          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">GET OPENSEA ASSETS</span>
            <span className="sm:hidden">EXPORT</span>
          </button>
        </div>

        {/* Tab 1: Spectral Bands */}
        {activeTab === 'spectra' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {spectralBands.map((band) => {
              const isSelected = params.spectralBand === band.id;
              const isRainbow = band.id === 'rainbow';
              return (
                <button
                  key={band.id}
                  onClick={() => onChangeParams({ spectralBand: band.id })}
                  className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? isRainbow
                        ? 'bg-neutral-800/95 border-rose-400 text-white shadow-lg shadow-pink-950/60 ring-1 ring-pink-400/50'
                        : 'bg-neutral-800/90 border-cyan-400/90 text-white shadow-md shadow-cyan-950/40'
                      : isRainbow
                      ? 'bg-gradient-to-br from-neutral-900/90 via-neutral-900/60 to-pink-950/30 border-neutral-700/80 text-neutral-300 hover:border-pink-400/70'
                      : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200 ' +
                        band.color
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-medium block truncate ${
                        isRainbow
                          ? 'text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-300 to-cyan-300 font-bold'
                          : ''
                      }`}
                    >
                      {band.name}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1 rounded ${
                        isRainbow
                          ? 'bg-gradient-to-r from-pink-900/80 to-purple-900/80 text-pink-200 border border-pink-700/60'
                          : 'bg-black/40 text-neutral-400'
                      }`}
                    >
                      {band.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400 leading-tight mt-1 line-clamp-2">
                    {band.description}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {/* Tab 2: Camera Vantage & Angles */}
        {activeTab === 'vantage' && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1 w-full">
              {cameraPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => onSetCameraPreset(preset.id)}
                  className="text-left p-2.5 rounded-xl bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800 hover:border-neutral-700 transition-all cursor-pointer"
                >
                  <span className="text-xs font-mono font-medium text-neutral-200 block">
                    {preset.label}
                  </span>
                  <span className="text-[10px] text-neutral-400 block mt-0.5">
                    {preset.desc}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={onResetCamera}
              title="Reset to default edge-on view"
              className="p-2.5 rounded-xl bg-neutral-900/60 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors flex items-center justify-center gap-1.5 text-xs font-mono whitespace-nowrap self-stretch sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET CAMERA</span>
            </button>
          </div>
        )}

        {/* Tab 3: Astrophysics Parameter Controls */}
        {activeTab === 'astrophysics' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Dust Rim Opacity */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-neutral-400">Dust Rim Opacity</span>
                <span className="text-cyan-300">{Math.round(params.dustOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.02"
                value={params.dustOpacity}
                onChange={(e) => onChangeParams({ dustOpacity: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-neutral-500 block">
                Iconic interstellar absorption rim
              </span>
            </div>

            {/* Core Luminosity */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-neutral-400">Core Bulge Glow</span>
                <span className="text-cyan-300">{Math.round(params.coreLuminosity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="2.0"
                step="0.05"
                value={params.coreLuminosity}
                onChange={(e) => onChangeParams({ coreLuminosity: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-neutral-500 block">
                Sersic bulge stellar radiance
              </span>
            </div>

            {/* Relativistic Jet Intensity */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-neutral-400">Chandra X-Ray Jets</span>
                <span className="text-cyan-300">{Math.round(params.jetIntensity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="2.0"
                step="0.1"
                value={params.jetIntensity}
                onChange={(e) => onChangeParams({ jetIntensity: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-neutral-500 block">
                Polar synchrotron emission
              </span>
            </div>

            {/* Differential Rotation Speed */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-neutral-400">Rotation Velocity</span>
                <span className="text-cyan-300">{params.rotationSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="3.0"
                step="0.1"
                value={params.rotationSpeed}
                onChange={(e) => onChangeParams({ rotationSpeed: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-neutral-500 block">
                Galactic differential kinematics
              </span>
            </div>

            {/* Rainbow Chroma Cycle Speed (When Rainbow mode is active) */}
            {params.spectralBand === 'rainbow' && (
              <div className="space-y-1 sm:col-span-2 md:col-span-4 p-2.5 rounded-xl bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-blue-950/40 border border-pink-700/50">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-pink-300 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                    <span>Rainbow Chroma Shift Speed</span>
                  </span>
                  <span className="text-pink-300">{(params.rainbowCycleSpeed ?? 1.0).toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={params.rainbowCycleSpeed ?? 1.0}
                  onChange={(e) => onChangeParams({ rainbowCycleSpeed: parseFloat(e.target.value) })}
                  className="w-full accent-pink-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-pink-300/70 block">
                  1-of-1 Concept: Prismatic Doppler chromatic wave cycle frequency
                </span>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: OpenSea NFT Asset Suite */}
        {activeTab === 'nft' && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 bg-neutral-900/50 rounded-xl border border-neutral-800/80">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold text-neutral-200">
                  OpenSea 3D Asset Standard (GLTF / GLB 2.0)
                </span>
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded">
                  VERIFIED READY
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Ready for instant upload to OpenSea Studio or smart contract tokenURI with full 3D interactive viewer support.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={onOpenExportModal}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-mono bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-950/40"
              >
                <Download className="w-3.5 h-3.5" />
                <span>DOWNLOAD FULL BUNDLE (.ZIP)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
