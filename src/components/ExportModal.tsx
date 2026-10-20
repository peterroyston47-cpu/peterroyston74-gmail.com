import React, { useState } from 'react';
import {
  X,
  Download,
  FileCode,
  Image,
  Box,
  FileArchive,
  BookOpen,
  CheckCircle2,
  Loader2,
  Sparkles,
} from 'lucide-react';
import * as THREE from 'three';
import { GalaxyParams } from '../types/galaxy';
import { exportGalaxyToGLB, triggerDownload } from '../galaxy/gltfExport';
import { capturePosterImage } from '../galaxy/posterExport';
import { generateOpenSeaMetadata } from '../galaxy/metadataExport';
import { createFullNftAssetZipBundle } from '../galaxy/zipBundle';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportableGroup: THREE.Group | null;
  renderer: THREE.WebGLRenderer | null;
  scene: THREE.Scene | null;
  camera: THREE.Camera | null;
  params: GalaxyParams;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  exportableGroup,
  renderer,
  scene,
  camera,
  params,
}) => {
  const [isBundling, setIsBundling] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [progressPct, setProgressPct] = useState(0);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1. Download Complete ZIP Package
  const handleDownloadFullZip = async () => {
    if (!exportableGroup || !renderer || !scene || !camera) {
      alert('Simulation is initializing. Please wait a moment.');
      return;
    }
    try {
      setIsBundling(true);
      const zipBlob = await createFullNftAssetZipBundle(
        exportableGroup,
        renderer,
        scene,
        camera,
        params,
        (msg, pct) => {
          setProgressMsg(msg);
          setProgressPct(pct);
        }
      );
      triggerDownload(zipBlob, 'Sombrero_Galaxy_M104_OpenSea_NFT_Package.zip');
      setDownloadSuccess('Full Asset Bundle (.ZIP) downloaded successfully!');
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err) {
      console.error('Failed to create bundle:', err);
      alert('Export failed. Please check the console log.');
    } finally {
      setIsBundling(false);
      setProgressPct(0);
      setProgressMsg('');
    }
  };

  // 2. Download 3D Binary GLB File
  const handleDownloadGLB = async () => {
    if (!exportableGroup) return;
    try {
      setIsBundling(true);
      setProgressMsg('Exporting binary GLTF (.glb)...');
      setProgressPct(50);
      const glbBlob = await exportGalaxyToGLB(exportableGroup);
      triggerDownload(glbBlob, 'sombrero-galaxy-m104.glb');
      setDownloadSuccess('3D Model (sombrero-galaxy-m104.glb) downloaded!');
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err) {
      console.error(err);
      alert('GLB export failed.');
    } finally {
      setIsBundling(false);
      setProgressPct(0);
      setProgressMsg('');
    }
  };

  // 3. Download High-Res Poster PNG
  const handleDownloadPoster = async () => {
    if (!renderer || !scene || !camera) return;
    try {
      setIsBundling(true);
      setProgressMsg('Rendering 2048x2048 Poster...');
      setProgressPct(60);
      const { blob } = await capturePosterImage(renderer, scene, camera, 2048);
      triggerDownload(blob, 'sombrero-galaxy-poster-2048.png');
      setDownloadSuccess('Cover Poster (sombrero-galaxy-poster-2048.png) downloaded!');
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err) {
      console.error(err);
      alert('Poster render failed.');
    } finally {
      setIsBundling(false);
      setProgressPct(0);
      setProgressMsg('');
    }
  };

  // 4. Download OpenSea Metadata JSON
  const handleDownloadMetadata = () => {
    const metadata = generateOpenSeaMetadata(params);
    const jsonStr = JSON.stringify(metadata, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    triggerDownload(blob, 'metadata.json');
    setDownloadSuccess('OpenSea Metadata (metadata.json) downloaded!');
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="relative w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-2xl text-neutral-100 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-1">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-mono tracking-wide text-white">
              OPENSEA 3D NFT ASSET DOWNLOAD FORGE
            </h2>
            <p className="text-xs text-neutral-400 font-mono">
              Complete production asset suite for Messier 104 Sombrero Galaxy collection
            </p>
          </div>
        </div>

        {/* Feedback message */}
        {downloadSuccess && (
          <div className="my-3 p-3 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        {/* Progress Bar (if active) */}
        {isBundling && (
          <div className="my-4 p-4 rounded-xl bg-neutral-900 border border-cyan-800/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-2 text-cyan-300">
                <Loader2 className="w-4 h-4 animate-spin" />
                {progressMsg || 'Processing 3D assets...'}
              </span>
              <span className="text-cyan-400">{progressPct}%</span>
            </div>
            <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-cyan-500 h-full transition-all duration-300 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Primary All-in-One Download Hero */}
        <div className="my-5 p-5 rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-cyan-950/40 border border-cyan-700/60 relative overflow-hidden group">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <FileArchive className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm sm:text-base font-bold font-mono text-white">
                  FULL ASSET BUNDLE (.ZIP)
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-900/80 text-cyan-300 border border-cyan-700">
                  RECOMMENDED FOR OPENSEA
                </span>
              </div>
              <p className="text-xs text-neutral-300 max-w-md leading-relaxed">
                One-click archive containing the 3D binary model (<code className="text-cyan-300">.glb</code>), 2K cover poster (<code className="text-cyan-300">.png</code>), verified OpenSea <code className="text-cyan-300">metadata.json</code>, and step-by-step minting guide.
              </p>
            </div>

            <button
              onClick={handleDownloadFullZip}
              disabled={isBundling}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-bold text-xs font-mono tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>DOWNLOAD BUNDLE (.ZIP)</span>
            </button>
          </div>
        </div>

        {/* Individual File Downloads Grid */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-mono font-semibold text-neutral-400 uppercase tracking-wider">
            INDIVIDUAL OPENSEA ASSETS
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 3D GLB File */}
            <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between hover:border-neutral-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-neutral-800 text-cyan-400">
                  <Box className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-mono font-medium text-neutral-200">
                    sombrero-galaxy-m104.glb
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    OpenSea 3D Model (<code className="text-cyan-400">animation_url</code>)
                  </div>
                </div>
              </div>
              <button
                onClick={handleDownloadGLB}
                disabled={isBundling}
                className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white transition-colors cursor-pointer"
                title="Download 3D GLB"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            {/* Poster PNG */}
            <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between hover:border-neutral-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-neutral-800 text-amber-400">
                  <Image className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-mono font-medium text-neutral-200">
                    sombrero-poster-2048.png
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    High-Res 2K Cover (<code className="text-amber-400">image</code>)
                  </div>
                </div>
              </div>
              <button
                onClick={handleDownloadPoster}
                disabled={isBundling}
                className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white transition-colors cursor-pointer"
                title="Download Poster PNG"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            {/* Metadata JSON */}
            <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between hover:border-neutral-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-neutral-800 text-emerald-400">
                  <FileCode className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-mono font-medium text-neutral-200">
                    metadata.json
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    ERC-721/1155 OpenSea Traits Spec
                  </div>
                </div>
              </div>
              <button
                onClick={handleDownloadMetadata}
                className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white transition-colors cursor-pointer"
                title="Download Metadata JSON"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            {/* Minting Guide */}
            <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between hover:border-neutral-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-neutral-800 text-purple-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-mono font-medium text-neutral-200">
                    OPENSEA_MINT_GUIDE.md
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    IPFS Pinning & OpenSea Studio Steps
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  const content = `# OpenSea 3D NFT Mint & Pinning Guide\n\n1. Upload sombrero-galaxy-m104.glb to IPFS (e.g. Pinata or NFT.Storage)\n2. Upload sombrero-poster-2048.png to IPFS\n3. Set animation_url in metadata.json to your GLB IPFS CID\n4. Create collection in OpenSea Studio (https://opensea.io/studio)\n`;
                  const blob = new Blob([content], { type: 'text/markdown' });
                  triggerDownload(blob, 'OPENSEA_MINT_GUIDE.md');
                }}
                className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white transition-colors cursor-pointer"
                title="Download Mint Guide"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick OpenSea Mint Instructions preview */}
        <div className="mt-5 p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 text-neutral-400 text-xs font-mono space-y-1.5">
          <div className="flex items-center gap-1.5 text-neutral-200 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>HOW TO USE ON OPENSEA:</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            1. Navigate to <strong>OpenSea Studio</strong> (https://opensea.io/studio).<br />
            2. Drag & drop <strong className="text-cyan-300">sombrero-galaxy-m104.glb</strong> into the Media item creator.<br />
            3. Upload <strong className="text-amber-300">sombrero-poster-2048.png</strong> as the thumbnail preview.<br />
            4. Collectors will be able to orbit, spin, zoom, and inspect your Live Sombrero Galaxy directly on OpenSea in 3D!
          </p>
        </div>
      </div>
    </div>
  );
};
