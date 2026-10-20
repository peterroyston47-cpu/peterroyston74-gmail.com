import React, { useState } from 'react';
import {
  X,
  BadgeCheck,
  Share2,
  ExternalLink,
  Box,
  Copy,
  Check,
  Download,
  Info,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { GalaxyParams } from '../types/galaxy';
import { generateOpenSeaMetadata } from '../galaxy/metadataExport';

interface OpenSeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  params: GalaxyParams;
  onOpenExportModal: () => void;
}

export const OpenSeaModal: React.FC<OpenSeaModalProps> = ({
  isOpen,
  onClose,
  params,
  onOpenExportModal,
}) => {
  const [copied, setCopied] = useState(false);
  const [showJson, setShowJson] = useState(false);

  if (!isOpen) return null;

  const metadata = generateOpenSeaMetadata(params);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(metadata, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85">
      <div className="relative w-full max-w-4xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl text-neutral-100 max-h-[92vh] overflow-y-auto">
        {/* Modal Top Bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-neutral-950/95 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs font-mono font-bold tracking-wider text-neutral-300 uppercase">
              OpenSea Gallery Simulation & Item Inspector
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Main Item Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column: 3D Asset Preview Card */}
            <div className="md:col-span-5 space-y-3">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden relative group">
                {/* 3D Interactive Badge */}
                <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-neutral-950/80 border border-neutral-700/80 text-[11px] font-mono text-cyan-300 flex items-center gap-1.5 shadow-lg">
                  <Box className="w-3.5 h-3.5 text-cyan-400" />
                  <span>3D INTERACTIVE</span>
                </div>

                <div className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-neutral-950/80 border border-neutral-700/80 text-neutral-400">
                  <Share2 className="w-3.5 h-3.5" />
                </div>

                {/* Simulated 3D Viewport in Card */}
                <div className="w-full aspect-square bg-gradient-to-b from-[#0d0f1a] to-[#040407] flex flex-col items-center justify-center p-6 text-center relative">
                  <div className="w-36 h-36 rounded-full border border-cyan-500/30 flex items-center justify-center relative animate-[spin_40s_linear_infinite]">
                    <div className="w-28 h-7 rounded-full border border-amber-500/40 rotate-[12deg]" />
                    <div className="w-8 h-8 rounded-full bg-amber-200/90 shadow-[0_0_25px_rgba(255,200,100,0.8)]" />
                  </div>
                  <div className="mt-4 text-xs font-mono text-neutral-400">
                    sombrero-galaxy-m104.glb
                  </div>
                  <span className="text-[10px] text-cyan-400/80 font-mono mt-1">
                    [Live 3D Renderer active in background]
                  </span>
                </div>

                {/* Card Footer */}
                <div className="p-3 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-400">Standard: GLTF 2.0 PBR</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <BadgeCheck className="w-3.5 h-3.5" /> OpenSea Certified
                  </span>
                </div>
              </div>

              {/* Download GLB Button */}
              <button
                onClick={onOpenExportModal}
                className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-neutral-950 font-bold text-xs font-mono tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-950/40"
              >
                <Download className="w-4 h-4" />
                <span>DOWNLOAD .GLB & ASSETS</span>
              </button>
            </div>

            {/* Right Column: Collection & Item Details */}
            <div className="md:col-span-7 space-y-4">
              {/* Collection Breadcrumb */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-blue-400 hover:underline cursor-pointer">
                  <span>Cosmic Relics: Messier Deep Space Collection</span>
                  <BadgeCheck className="w-3.5 h-3.5 fill-blue-500 text-neutral-950" />
                </div>
                <h1 className="text-2xl font-bold font-mono tracking-wide text-white mt-1 flex flex-wrap items-center gap-2">
                  <span>
                    {params.spectralBand === 'rainbow'
                      ? 'Messier 104: Sombrero Galaxy #104 [1/1 Rainbow Genesis]'
                      : metadata.name}
                  </span>
                  {params.spectralBand === 'rainbow' && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 border border-pink-400/60 text-pink-300 font-bold">
                      1-of-1 CONCEPT
                    </span>
                  )}
                </h1>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-neutral-400 font-mono">
                  <span>Owned by <strong className="text-neutral-200">teretto6420</strong></span>
                  <span>•</span>
                  <span>Virgo Supercluster</span>
                </div>
              </div>

              {/* Price Floor & Actions Box */}
              <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-3">
                <div className="text-xs font-mono text-neutral-400 flex items-center justify-between">
                  <span>Current Price</span>
                  {params.spectralBand === 'rainbow' && (
                    <span className="text-[11px] text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-amber-300 to-cyan-300 font-bold">
                      ★ 1-OF-1 MYTHIC RARITY GRAIL
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-white">
                    {params.spectralBand === 'rainbow' ? '10.40 ETH' : '2.45 ETH'}
                  </span>
                  <span className="text-xs font-mono text-neutral-400">
                    {params.spectralBand === 'rainbow' ? '($29,120.00 USD)' : '($6,840.00 USD)'}
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={onOpenExportModal}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs font-mono tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-blue-950/40"
                  >
                    <span>EXPORT FOR MINTING</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleCopyJson}
                    className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-mono text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'COPIED' : 'COPY METADATA'}</span>
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-cyan-400" /> Description
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed font-sans bg-neutral-900/40 p-3 rounded-xl border border-neutral-800/80">
                  {metadata.description}
                </p>
              </div>

              {/* Traits & Properties Grid */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" /> OpenSea Traits & Attributes ({metadata.attributes.length})
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {metadata.attributes.map((attr, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-blue-950/30 border border-blue-900/50 text-center space-y-0.5"
                    >
                      <div className="text-[10px] font-mono text-blue-400 uppercase tracking-wider truncate">
                        {attr.trait_type}
                      </div>
                      <div className="text-xs font-mono font-semibold text-neutral-100 truncate">
                        {attr.value}
                      </div>
                      <div className="text-[9px] font-mono text-blue-300/70">
                        {attr.display_type ? `Type: ${attr.display_type}` : 'Rarity Factor: High'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Raw JSON metadata collapsible toggle */}
              <div className="pt-2">
                <button
                  onClick={() => setShowJson(!showJson)}
                  className="flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  {showJson ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  <span>{showJson ? 'HIDE RAW METADATA JSON' : 'INSPECT RAW OPENSEA METADATA JSON'}</span>
                </button>

                {showJson && (
                  <pre className="mt-2 p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-cyan-300/90 overflow-x-auto max-h-48 leading-tight">
                    {JSON.stringify(metadata, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
