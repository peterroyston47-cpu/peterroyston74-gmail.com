import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

/**
 * Exports the 3D Sombrero Galaxy scene to standard binary GLTF (.glb) format.
 * Compatible with OpenSea 3D NFT Viewer, Blender, Unreal Engine, and iOS QuickLook.
 */
export async function exportGalaxyToGLB(sourceGroup: THREE.Group): Promise<Blob> {
  const exporter = new GLTFExporter();

  return new Promise((resolve, reject) => {
    // Clone group or prepare clean hierarchy for export
    exporter.parse(
      sourceGroup,
      (gltf) => {
        if (gltf instanceof ArrayBuffer) {
          const blob = new Blob([gltf], { type: 'model/gltf-binary' });
          resolve(blob);
        } else {
          const output = JSON.stringify(gltf, null, 2);
          const blob = new Blob([output], { type: 'model/gltf+json' });
          resolve(blob);
        }
      },
      (error) => {
        console.error('An error occurred during GLTF export:', error);
        reject(error);
      },
      {
        binary: true,
        onlyVisible: true,
        embedImages: true,
        truncateDrawRange: false,
      }
    );
  });
}

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
