import * as THREE from 'three';

/**
 * Captures a high-resolution poster render (1:1 Square or 16:9) of the current galaxy scene.
 * This satisfies OpenSea's requirement for a 2D cover image thumbnail before loading the 3D model.
 */
export async function capturePosterImage(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  resolution: number = 2048
): Promise<{ blob: Blob; dataUrl: string }> {
  // Store previous size
  const originalSize = new THREE.Vector2();
  renderer.getSize(originalSize);
  const originalPixelRatio = renderer.getPixelRatio();

  // Create an offscreen canvas or resize current renderer temporarily
  renderer.setPixelRatio(1);
  renderer.setSize(resolution, resolution, false);
  renderer.render(scene, camera);

  const canvas = renderer.domElement;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        // Restore renderer size
        renderer.setPixelRatio(originalPixelRatio);
        renderer.setSize(originalSize.x, originalSize.y, false);
        renderer.render(scene, camera);

        if (!blob) {
          reject(new Error('Failed to create poster Blob'));
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            blob,
            dataUrl: reader.result as string,
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      },
      'image/png',
      0.95
    );
  });
}
