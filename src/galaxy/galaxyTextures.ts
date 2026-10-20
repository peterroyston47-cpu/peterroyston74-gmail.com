import * as THREE from 'three';

/**
 * Procedural texture generators for stars, dust, and galactic core glows.
 * 100% code-generated (zero external image requests, zero 404 dependencies).
 */

export function createStarSprite(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.12, 'rgba(240, 245, 255, 0.9)');
  gradient.addColorStop(0.35, 'rgba(200, 220, 255, 0.45)');
  gradient.addColorStop(0.7, 'rgba(120, 160, 255, 0.12)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createDustParticleSprite(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
  gradient.addColorStop(0.35, 'rgba(220, 200, 180, 0.4)');
  gradient.addColorStop(0.75, 'rgba(150, 120, 90, 0.1)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createCoreGlowTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, 'rgba(255, 255, 245, 1)');
  gradient.addColorStop(0.18, 'rgba(255, 235, 195, 0.8)');
  gradient.addColorStop(0.45, 'rgba(255, 195, 120, 0.35)');
  gradient.addColorStop(0.75, 'rgba(210, 140, 80, 0.08)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createAccretionDiskTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 512, 512);

  // Concentric striated ripples for black hole accretion ring
  for (let r = 70; r < 240; r += 2) {
    const alpha = (1 - (r - 70) / 170) * (0.4 + 0.6 * Math.sin(r * 0.4));
    ctx.strokeStyle = `rgba(255, 220, 180, ${alpha * 0.7})`;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(256, 256, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createDustRingPbrTexture(): { colorMap: THREE.Texture; alphaMap: THREE.Texture } {
  const canvasColor = document.createElement('canvas');
  canvasColor.width = 512;
  canvasColor.height = 512;
  const ctxC = canvasColor.getContext('2d')!;

  const canvasAlpha = document.createElement('canvas');
  canvasAlpha.width = 512;
  canvasAlpha.height = 512;
  const ctxA = canvasAlpha.getContext('2d')!;

  // Noise bands in polar coordinates
  for (let y = 0; y < 512; y++) {
    const v = y / 512;
    // Edge falloff
    const edge = Math.sin(v * Math.PI);
    for (let x = 0; x < 512; x++) {
      const u = x / 512;
      const noise = (Math.sin(u * 40 + v * 12) * 0.5 + 0.5) * 0.4 +
                    (Math.cos(u * 90 - v * 8) * 0.5 + 0.5) * 0.3 + 0.3;
      
      const rVal = Math.floor(45 + noise * 40);
      const gVal = Math.floor(35 + noise * 30);
      const bVal = Math.floor(25 + noise * 25);
      ctxC.fillStyle = `rgb(${rVal}, ${gVal}, ${bVal})`;
      ctxC.fillRect(x, y, 1, 1);

      const alpha = Math.floor(edge * (0.5 + noise * 0.5) * 255);
      ctxA.fillStyle = `rgb(${alpha}, ${alpha}, ${alpha})`;
      ctxA.fillRect(x, y, 1, 1);
    }
  }

  const colorMap = new THREE.CanvasTexture(canvasColor);
  colorMap.colorSpace = THREE.SRGBColorSpace;
  colorMap.wrapS = THREE.RepeatWrapping;
  colorMap.wrapT = THREE.ClampToEdgeWrapping;

  const alphaMap = new THREE.CanvasTexture(canvasAlpha);
  alphaMap.wrapS = THREE.RepeatWrapping;
  alphaMap.wrapT = THREE.ClampToEdgeWrapping;

  return { colorMap, alphaMap };
}
