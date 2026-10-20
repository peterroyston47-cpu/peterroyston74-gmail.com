import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GalaxyParams, SpectralBand } from '../types/galaxy';
import { createSombreroGalaxy, GalaxySimulation } from '../galaxy/galaxyGenerator';

export interface GalaxyCanvasHandle {
  getRenderer: () => THREE.WebGLRenderer | null;
  getScene: () => THREE.Scene | null;
  getCamera: () => THREE.PerspectiveCamera | null;
  getExportableGroup: () => THREE.Group | null;
  setCameraPreset: (preset: 'edge-on' | 'polar' | 'core' | 'oblique' | 'auto') => void;
  setSpectralBand: (band: SpectralBand) => void;
  resetCamera: () => void;
}

interface GalaxyCanvasProps {
  params: GalaxyParams;
  onFpsUpdate?: (fps: number) => void;
  isAutoRotate: boolean;
}

export const GalaxyCanvas = forwardRef<GalaxyCanvasHandle, GalaxyCanvasProps>(
  ({ params, onFpsUpdate, isAutoRotate }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const simRef = useRef<GalaxySimulation | null>(null);
    const autoRotateRef = useRef<boolean>(isAutoRotate);
    const targetCamPos = useRef<THREE.Vector3 | null>(null);
    const targetLookAt = useRef<THREE.Vector3 | null>(null);

    // Keep auto-rotate ref synchronized
    useEffect(() => {
      autoRotateRef.current = isAutoRotate;
      if (controlsRef.current) {
        controlsRef.current.autoRotate = isAutoRotate;
        controlsRef.current.autoRotateSpeed = 0.85;
      }
    }, [isAutoRotate]);

    // Keep galaxy params synchronized
    useEffect(() => {
      if (simRef.current) {
        simRef.current.updateParams(params);
      }
    }, [params]);

    useImperativeHandle(ref, () => ({
      getRenderer: () => rendererRef.current,
      getScene: () => sceneRef.current,
      getCamera: () => cameraRef.current,
      getExportableGroup: () => simRef.current ? simRef.current.exportableGroup : null,
      setCameraPreset: (preset) => {
        if (!cameraRef.current || !controlsRef.current) return;
        if (preset === 'edge-on') {
          // Iconic Sombrero Edge-On Hubble perspective (~6 deg inclination)
          targetCamPos.current = new THREE.Vector3(0, 18, 280);
          targetLookAt.current = new THREE.Vector3(0, 0, 0);
        } else if (preset === 'polar') {
          // Top-Down Polar Galaxy View
          targetCamPos.current = new THREE.Vector3(0, 310, 20);
          targetLookAt.current = new THREE.Vector3(0, 0, 0);
        } else if (preset === 'core') {
          // Fly-In close to Supermassive Black Hole accretion disk
          targetCamPos.current = new THREE.Vector3(15, 6, 38);
          targetLookAt.current = new THREE.Vector3(0, 0, 0);
        } else if (preset === 'oblique') {
          // Isometric 45-degree angle
          targetCamPos.current = new THREE.Vector3(190, 140, 210);
          targetLookAt.current = new THREE.Vector3(0, 0, 0);
        } else if (preset === 'auto') {
          controlsRef.current.autoRotate = !controlsRef.current.autoRotate;
        }
      },
      setSpectralBand: (band: SpectralBand) => {
        if (simRef.current) {
          simRef.current.setSpectralBand(band);
        }
      },
      resetCamera: () => {
        targetCamPos.current = new THREE.Vector3(0, 24, 270);
        targetLookAt.current = new THREE.Vector3(0, 0, 0);
      },
    }));

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;

      // 1. Scene Setup
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x040407);
      // Soft distance fog to blend cosmic perimeter
      scene.fog = new THREE.FogExp2(0x040407, 0.0011);
      sceneRef.current = scene;

      // 2. Camera Setup
      const camera = new THREE.PerspectiveCamera(params.cameraFov, width / height, 0.1, 2000);
      // Default to edge-on classic Sombrero Hubble vantage point
      camera.position.set(0, 24, 270);
      cameraRef.current = camera;

      // 3. Renderer with PBR Color Pipeline
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: true, // Necessary for instant high-res screenshot capture
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      rendererRef.current = renderer;
      container.appendChild(renderer.domElement);

      // 4. Studio Environment Reflection (RoomEnvironment)
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();

      // 5. Lighting Rig (Key Light + Cool Fill + Relativistic Core Light)
      const keyLight = new THREE.DirectionalLight(0xffeedd, 1.4);
      keyLight.position.set(100, 120, 80);
      scene.add(keyLight);

      const hemiLight = new THREE.HemisphereLight(0x334466, 0x111122, 0.8);
      scene.add(hemiLight);

      const corePointLight = new THREE.PointLight(0xffeedd, 3.5, 300, 1.2);
      corePointLight.position.set(0, 0, 0);
      scene.add(corePointLight);

      // 6. Orbit Controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.minDistance = 20;
      controls.maxDistance = 750;
      controls.autoRotate = autoRotateRef.current;
      controls.autoRotateSpeed = 0.75;
      controls.maxPolarAngle = Math.PI - 0.05;
      controlsRef.current = controls;

      // 7. Initialize Sombrero Galaxy Simulation
      const simulation = createSombreroGalaxy(params);
      simRef.current = simulation;
      scene.add(simulation.root);

      // Pre-warm shaders
      renderer.compile(scene, camera);

      // 8. Animation Loop
      let animationFrameId: number;
      let lastTime = performance.now();
      let framesCount = 0;
      let fpsTimer = 0;

      const animate = (now: number) => {
        animationFrameId = requestAnimationFrame(animate);

        const delta = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;

        // FPS calculation
        framesCount++;
        fpsTimer += delta;
        if (fpsTimer >= 0.5) {
          if (onFpsUpdate) {
            onFpsUpdate(Math.round((framesCount / fpsTimer)));
          }
          framesCount = 0;
          fpsTimer = 0;
        }

        // Camera smoothly glides to target preset using exponential damping
        if (targetCamPos.current) {
          camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamPos.current.x, 3.5, delta);
          camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamPos.current.y, 3.5, delta);
          camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamPos.current.z, 3.5, delta);

          if (targetLookAt.current) {
            controls.target.x = THREE.MathUtils.damp(controls.target.x, targetLookAt.current.x, 3.5, delta);
            controls.target.y = THREE.MathUtils.damp(controls.target.y, targetLookAt.current.y, 3.5, delta);
            controls.target.z = THREE.MathUtils.damp(controls.target.z, targetLookAt.current.z, 3.5, delta);
          }

          if (camera.position.distanceTo(targetCamPos.current) < 0.8) {
            targetCamPos.current = null;
            targetLookAt.current = null;
          }
        }

        controls.update();
        simulation.update(delta);
        renderer.render(scene, camera);
      };

      animationFrameId = requestAnimationFrame(animate);

      // 9. Resize Observer
      const handleResize = () => {
        if (!container) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };

      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(container);

      // Cleanup
      return () => {
        cancelAnimationFrame(animationFrameId);
        resizeObserver.disconnect();
        controls.dispose();
        simulation.dispose();
        renderer.dispose();
        if (renderer.domElement.parentElement) {
          renderer.domElement.parentElement.removeChild(renderer.domElement);
        }
      };
    }, []);

    return (
      <div
        ref={containerRef}
        className="w-full h-full absolute inset-0 overflow-hidden select-none cursor-grab active:cursor-grabbing"
      />
    );
  }
);
