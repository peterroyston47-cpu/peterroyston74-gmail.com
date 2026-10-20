import * as THREE from 'three';
import { GalaxyParams, SpectralBand } from '../types/galaxy';
import {
  createStarSprite,
  createDustParticleSprite,
  createCoreGlowTexture,
  createAccretionDiskTexture,
  createDustRingPbrTexture,
} from './galaxyTextures';

// Pre-allocated math helper for zero-GC rendering loop
const _colorHelper = new THREE.Color();

export interface GalaxySimulation {
  root: THREE.Group;
  exportableGroup: THREE.Group;
  update: (delta: number) => void;
  updateParams: (params: GalaxyParams) => void;
  setSpectralBand: (band: SpectralBand) => void;
  getStarCount: () => number;
  dispose: () => void;
}

export function createSombreroGalaxy(initialParams: GalaxyParams): GalaxySimulation {
  let params = { ...initialParams };

  const root = new THREE.Group();
  root.name = 'SombreroGalaxy_M104_Live';

  // Exportable group specifically constructed with PBR meshes + particles for GLTF/OpenSea
  const exportableGroup = new THREE.Group();
  exportableGroup.name = 'SombreroGalaxy_M104_Asset';
  root.add(exportableGroup);

  // Shared procedural textures
  const starTex = createStarSprite();
  const dustTex = createDustParticleSprite();
  const glowTex = createCoreGlowTexture();
  const accretionTex = createAccretionDiskTexture();
  const { colorMap: dustColorMap, alphaMap: dustAlphaMap } = createDustRingPbrTexture();

  // 1. Central Supermassive Black Hole & Accretion Disk (M104 Black Hole ~1 Billion M_sun)
  const blackHoleGeom = new THREE.SphereGeometry(4.5, 32, 32);
  const blackHoleMat = new THREE.MeshBasicMaterial({
    color: 0x010103,
  });
  const blackHoleMesh = new THREE.Mesh(blackHoleGeom, blackHoleMat);
  blackHoleMesh.name = 'Supermassive_Black_Hole_M104';
  exportableGroup.add(blackHoleMesh);

  // Accretion Disk
  const accretionGeom = new THREE.RingGeometry(5.2, 18, 64);
  const accretionMat = new THREE.MeshBasicMaterial({
    map: accretionTex,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const accretionMesh = new THREE.Mesh(accretionGeom, accretionMat);
  accretionMesh.rotation.x = Math.PI / 2;
  exportableGroup.add(accretionMesh);

  // Core Glow Volumetric Spheres
  const coreGlowMat = new THREE.SpriteMaterial({
    map: glowTex,
    color: 0xffeedd,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const coreGlowSprite = new THREE.Sprite(coreGlowMat);
  coreGlowSprite.scale.set(130, 95, 1);
  exportableGroup.add(coreGlowSprite);

  const coreGlowOuterMat = new THREE.SpriteMaterial({
    map: glowTex,
    color: 0xffaa66,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const coreGlowOuter = new THREE.Sprite(coreGlowOuterMat);
  coreGlowOuter.scale.set(240, 160, 1);
  exportableGroup.add(coreGlowOuter);

  // 2. Physical 3D Dust Ring (Meshes for clean OpenSea GLTF rendering)
  // Sombrero's iconic rim!
  const dustRingGeom = new THREE.RingGeometry(115, 168, 128, 8);
  const dustRingMat = new THREE.MeshStandardMaterial({
    map: dustColorMap,
    alphaMap: dustAlphaMap,
    transparent: true,
    opacity: 0.94,
    side: THREE.DoubleSide,
    roughness: 0.92,
    metalness: 0.08,
    depthWrite: true,
  });
  const dustRingMesh = new THREE.Mesh(dustRingGeom, dustRingMat);
  dustRingMesh.rotation.x = Math.PI / 2;
  dustRingMesh.name = 'Iconic_Sombrero_Dust_Rim';
  exportableGroup.add(dustRingMesh);

  // Secondary sub-ring for fine layered rim depth
  const dustRingUpperGeom = new THREE.RingGeometry(124, 162, 96);
  const dustRingUpperMat = new THREE.MeshBasicMaterial({
    map: dustAlphaMap,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const dustRingUpper = new THREE.Mesh(dustRingUpperGeom, dustRingUpperMat);
  dustRingUpper.rotation.x = Math.PI / 2;
  dustRingUpper.position.y = 1.2;
  exportableGroup.add(dustRingUpper);

  const dustRingLower = dustRingUpper.clone();
  dustRingLower.position.y = -1.2;
  exportableGroup.add(dustRingLower);

  // 3. Relativistic Polar Jets (Cone / Cylinders along Y axis)
  const jetGeom = new THREE.ConeGeometry(8, 110, 32, 1, true);
  const jetMat = new THREE.MeshBasicMaterial({
    color: 0x66bbff,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const northJet = new THREE.Mesh(jetGeom, jetMat);
  northJet.position.y = 55;
  exportableGroup.add(northJet);

  const southJet = new THREE.Mesh(jetGeom, jetMat);
  southJet.rotation.z = Math.PI;
  southJet.position.y = -55;
  exportableGroup.add(southJet);

  // 4. Particle Systems:
  // (a) Core Bulge Stars (Oblate spheroid, massive central concentration)
  const coreStarCount = Math.floor(params.starCount * 0.38);
  const corePositions = new Float32Array(coreStarCount * 3);
  const coreColors = new Float32Array(coreStarCount * 3);
  const coreVelocities = new Float32Array(coreStarCount); // orbital speeds
  const coreRadii = new Float32Array(coreStarCount);
  const coreAngles = new Float32Array(coreStarCount);
  const coreHeightRatios = new Float32Array(coreStarCount);

  for (let i = 0; i < coreStarCount; i++) {
    // Sersic-like exponential falloff
    const r = Math.pow(Math.random(), 2.8) * params.coreRadius;
    const theta = Math.random() * Math.PI * 2;
    // Flattened oblate spheroid (y is compressed by 0.45)
    const phi = (Math.random() - 0.5) * Math.PI;
    const yRatio = Math.sin(phi) * 0.46;
    const x = r * Math.cos(theta) * Math.cos(phi);
    const z = r * Math.sin(theta) * Math.cos(phi);
    const y = r * yRatio;

    corePositions[i * 3] = x;
    corePositions[i * 3 + 1] = y;
    corePositions[i * 3 + 2] = z;

    coreRadii[i] = Math.sqrt(x * x + z * z);
    coreAngles[i] = Math.atan2(z, x);
    coreHeightRatios[i] = y / Math.max(1, coreRadii[i]);
    // Keplarian core differential rotation
    coreVelocities[i] = 1.6 / (Math.sqrt(coreRadii[i] + 4) * 0.3 + 1);

    // Warm golden-white core population
    const brightness = 0.7 + Math.random() * 0.3;
    coreColors[i * 3] = 1.0 * brightness;
    coreColors[i * 3 + 1] = (0.86 + Math.random() * 0.12) * brightness;
    coreColors[i * 3 + 2] = (0.68 + Math.random() * 0.22) * brightness;
  }

  const coreGeom = new THREE.BufferGeometry();
  coreGeom.setAttribute('position', new THREE.BufferAttribute(corePositions, 3));
  coreGeom.setAttribute('color', new THREE.BufferAttribute(coreColors, 3));

  const coreStarMat = new THREE.PointsMaterial({
    size: 2.4,
    map: starTex,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const coreStars = new THREE.Points(coreGeom, coreStarMat);
  coreStars.name = 'Core_Bulge_Stars';
  exportableGroup.add(coreStars);

  // (b) Outer Stellar Disk (Thin disk with tightly wound spiral density waves)
  const diskStarCount = Math.floor(params.starCount * 0.45);
  const diskPositions = new Float32Array(diskStarCount * 3);
  const diskColors = new Float32Array(diskStarCount * 3);
  const diskRadii = new Float32Array(diskStarCount);
  const diskAngles = new Float32Array(diskStarCount);
  const diskHeights = new Float32Array(diskStarCount);
  const diskSpeeds = new Float32Array(diskStarCount);

  for (let i = 0; i < diskStarCount; i++) {
    // Disk distribution from inner radius to edge
    const rFraction = Math.random();
    const r = 24 + Math.pow(rFraction, 1.3) * (params.diskRadius - 24);
    // SA(s)a galaxy tight spiral arms (3 spiral arm branches)
    const armIndex = i % 3;
    const armOffset = (armIndex * 2 * Math.PI) / 3;
    // Logarithmic spiral angle theta = a * ln(r)
    const spiralAngle = Math.log(r / 20) * 3.4 + armOffset;
    // Scatter around spiral arm
    const dispersion = (Math.random() - 0.5) * (0.45 + r * 0.003);
    const angle = spiralAngle + dispersion;

    // Thin disk height: Sombrero is remarkably flat at the disk
    const h = (Math.random() - 0.5) * (4.2 + (r / params.diskRadius) * 4.5);

    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const y = h;

    diskPositions[i * 3] = x;
    diskPositions[i * 3 + 1] = y;
    diskPositions[i * 3 + 2] = z;

    diskRadii[i] = r;
    diskAngles[i] = angle;
    diskHeights[i] = h;
    // Flat galactic rotation curve
    diskSpeeds[i] = (0.55 / (r * 0.02 + 1)) * 0.85;

    // Disk star colors: gradient from yellow-white in inner disk to sapphire-cyan young stars on edge
    const normalizedR = (r - 24) / (params.diskRadius - 24);
    if (normalizedR < 0.4) {
      diskColors[i * 3] = 1.0;
      diskColors[i * 3 + 1] = 0.92;
      diskColors[i * 3 + 2] = 0.75;
    } else if (normalizedR < 0.75) {
      diskColors[i * 3] = 0.9;
      diskColors[i * 3 + 1] = 0.93;
      diskColors[i * 3 + 2] = 1.0;
    } else {
      diskColors[i * 3] = 0.72;
      diskColors[i * 3 + 1] = 0.85;
      diskColors[i * 3 + 2] = 1.0;
    }
  }

  const diskGeom = new THREE.BufferGeometry();
  diskGeom.setAttribute('position', new THREE.BufferAttribute(diskPositions, 3));
  diskGeom.setAttribute('color', new THREE.BufferAttribute(diskColors, 3));

  const diskStarMat = new THREE.PointsMaterial({
    size: 2.1,
    map: starTex,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const diskStars = new THREE.Points(diskGeom, diskStarMat);
  diskStars.name = 'Disk_Stars';
  exportableGroup.add(diskStars);
  const baseDiskColors = new Float32Array(diskColors);

  // (c) Iconic Dark Dust Ring Particles (Cold gas & absorption lanes)
  const dustParticleCount = Math.floor(params.starCount * 0.17);
  const dustPositions = new Float32Array(dustParticleCount * 3);
  const dustColors = new Float32Array(dustParticleCount * 3);
  const dustRadii = new Float32Array(dustParticleCount);
  const dustAngles = new Float32Array(dustParticleCount);
  const dustSpeeds = new Float32Array(dustParticleCount);

  for (let i = 0; i < dustParticleCount; i++) {
    // Dense ring between dustRingInner and dustRingOuter
    const ringT = Math.random();
    const r = params.dustRingInner + ringT * (params.dustRingOuter - params.dustRingInner);
    const angle = Math.random() * Math.PI * 2;
    // Extremely tight vertical confinement: ~3-5 units
    const y = (Math.random() - 0.5) * (3.8 * Math.sin(ringT * Math.PI) + 1.2);

    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;

    dustPositions[i * 3] = x;
    dustPositions[i * 3 + 1] = y;
    dustPositions[i * 3 + 2] = z;

    dustRadii[i] = r;
    dustAngles[i] = angle;
    dustSpeeds[i] = (0.52 / (r * 0.02 + 1)) * 0.85;

    // Default optical appearance: deep interstellar chocolate/charcoal dust with occasional ionized star-forming clumps
    const isHIIKnot = Math.random() < 0.08;
    if (isHIIKnot) {
      // H-II emission knots (pink / cyan stellar nurseries embedded in the ring)
      dustColors[i * 3] = 1.0;
      dustColors[i * 3 + 1] = 0.35 + Math.random() * 0.4;
      dustColors[i * 3 + 2] = 0.65 + Math.random() * 0.35;
    } else {
      const shade = 0.08 + Math.random() * 0.14;
      dustColors[i * 3] = shade * 1.3;
      dustColors[i * 3 + 1] = shade * 0.95;
      dustColors[i * 3 + 2] = shade * 0.75;
    }
  }

  const dustGeom = new THREE.BufferGeometry();
  dustGeom.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  dustGeom.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));
  const baseDustColors = new Float32Array(dustColors);

  const dustMat = new THREE.PointsMaterial({
    size: 3.5,
    map: dustTex,
    vertexColors: true,
    transparent: true,
    opacity: 0.92,
    blending: THREE.NormalBlending, // Normal blending allows dust to cast realistic silhouette over the core!
    depthWrite: false,
  });

  const dustStars = new THREE.Points(dustGeom, dustMat);
  dustStars.name = 'Dust_Lane_Particles';
  exportableGroup.add(dustStars);

  // (d) Globular Cluster Swarm (M104 has >1,500 globular clusters!)
  const globularCount = params.haloCount;
  const globularPositions = new Float32Array(globularCount * 3);
  const globularColors = new Float32Array(globularCount * 3);

  for (let i = 0; i < globularCount; i++) {
    // Large spherical halo up to 260 radius
    const r = 35 + Math.pow(Math.random(), 0.8) * 230;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta) * 0.8; // slightly oblate halo
    const z = r * Math.cos(phi);

    globularPositions[i * 3] = x;
    globularPositions[i * 3 + 1] = y;
    globularPositions[i * 3 + 2] = z;

    // Aged stellar clusters (golden-orange hues)
    const b = 0.7 + Math.random() * 0.3;
    globularColors[i * 3] = 1.0 * b;
    globularColors[i * 3 + 1] = 0.88 * b;
    globularColors[i * 3 + 2] = 0.65 * b;
  }

  const globularGeom = new THREE.BufferGeometry();
  globularGeom.setAttribute('position', new THREE.BufferAttribute(globularPositions, 3));
  globularGeom.setAttribute('color', new THREE.BufferAttribute(globularColors, 3));

  const globularMat = new THREE.PointsMaterial({
    size: 3.2,
    map: starTex,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const globularClusters = new THREE.Points(globularGeom, globularMat);
  globularClusters.name = 'Globular_Clusters_Halo';
  exportableGroup.add(globularClusters);

  // 5. Deep Space Distant Stars & Background Field (Non-exportable or background only)
  const bgStarsCount = 2500;
  const bgPositions = new Float32Array(bgStarsCount * 3);
  const bgColors = new Float32Array(bgStarsCount * 3);
  for (let i = 0; i < bgStarsCount; i++) {
    const r = 650 + Math.random() * 350;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    bgPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    bgPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    bgPositions[i * 3 + 2] = r * Math.cos(phi);

    const hue = Math.random();
    if (hue < 0.2) {
      bgColors[i * 3] = 0.7; bgColors[i * 3 + 1] = 0.8; bgColors[i * 3 + 2] = 1.0;
    } else if (hue < 0.4) {
      bgColors[i * 3] = 1.0; bgColors[i * 3 + 1] = 0.75; bgColors[i * 3 + 2] = 0.6;
    } else {
      bgColors[i * 3] = 0.9; bgColors[i * 3 + 1] = 0.9; bgColors[i * 3 + 2] = 0.95;
    }
  }
  const bgGeom = new THREE.BufferGeometry();
  bgGeom.setAttribute('position', new THREE.BufferAttribute(bgPositions, 3));
  bgGeom.setAttribute('color', new THREE.BufferAttribute(bgColors, 3));
  const bgMat = new THREE.PointsMaterial({
    size: 1.8,
    map: starTex,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
  });
  const bgField = new THREE.Points(bgGeom, bgMat);
  root.add(bgField);

  // Apply default inclination (~6° edge-on Sombrero tilt)
  root.rotation.x = (params.inclinationDeg * Math.PI) / 180;

  // Apply spectral filter
  function applySpectralBand(band: SpectralBand) {
    params.spectralBand = band;

    if (band === 'hubble') {
      // Natural True-Color Optical
      coreGlowMat.color.setHex(0xffeedd);
      coreGlowOuterMat.color.setHex(0xffaa66);
      dustRingMat.color.setHex(0x1a120c);
      dustRingMat.opacity = params.dustOpacity;
      dustRingUpperMat.color.setHex(0x150f09);
      dustMat.blending = THREE.NormalBlending;
      dustMat.opacity = params.dustOpacity;
      accretionMat.color.setHex(0xffffff);
      jetMat.color.setHex(0x66bbff);
      jetMat.opacity = 0.25 * params.jetIntensity;
    } else if (band === 'spitzer') {
      // Infrared (Spitzer / JWST): Glowing red-orange dust ring, translucent blue core!
      coreGlowMat.color.setHex(0x5599ff);
      coreGlowOuterMat.color.setHex(0x2244bb);
      dustRingMat.color.setHex(0xff4411);
      dustRingMat.opacity = 0.96;
      dustRingUpperMat.color.setHex(0xff7722);
      dustMat.blending = THREE.AdditiveBlending;
      dustMat.opacity = 0.88;
      accretionMat.color.setHex(0xffaa33);
      jetMat.color.setHex(0xff3366);
      jetMat.opacity = 0.45 * params.jetIntensity;

      // Tint dust particles into glowing infrared emission
      const colors = dustGeom.attributes.color.array as Float32Array;
      for (let i = 0; i < dustParticleCount; i++) {
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.35 + Math.random() * 0.45;
        colors[i * 3 + 2] = 0.1;
      }
      dustGeom.attributes.color.needsUpdate = true;
    } else if (band === 'chandra') {
      // High-Energy X-Ray: Cyan-violet glowing supermassive nucleus & high energy relativistic jets
      coreGlowMat.color.setHex(0x00ffff);
      coreGlowOuterMat.color.setHex(0x7700ff);
      dustRingMat.color.setHex(0x220044);
      dustRingMat.opacity = 0.7;
      dustRingUpperMat.color.setHex(0x440088);
      dustMat.blending = THREE.AdditiveBlending;
      dustMat.opacity = 0.55;
      accretionMat.color.setHex(0x00ffff);
      jetMat.color.setHex(0x00ffff);
      jetMat.opacity = 0.85 * params.jetIntensity;
    } else if (band === 'synthwave') {
      // Cyberpunk NFT: Electric Magenta & Cyan
      coreGlowMat.color.setHex(0xff007f);
      coreGlowOuterMat.color.setHex(0x7928ca);
      dustRingMat.color.setHex(0x00f0ff);
      dustRingMat.opacity = 0.85;
      dustRingUpperMat.color.setHex(0xff00a0);
      dustMat.blending = THREE.AdditiveBlending;
      dustMat.opacity = 0.9;
      accretionMat.color.setHex(0x00f0ff);
      jetMat.color.setHex(0xff00aa);
      jetMat.opacity = 0.7 * params.jetIntensity;
    } else if (band === 'deepspace') {
      // Deep Space High-Contrast Ultraviolet
      coreGlowMat.color.setHex(0xffffff);
      coreGlowOuterMat.color.setHex(0x8899bb);
      dustRingMat.color.setHex(0x050505);
      dustRingMat.opacity = 0.98;
      dustRingUpperMat.color.setHex(0x0a0a0a);
      dustMat.blending = THREE.NormalBlending;
      dustMat.opacity = 0.95;
      accretionMat.color.setHex(0xffffff);
      jetMat.color.setHex(0x88bbff);
      jetMat.opacity = 0.3 * params.jetIntensity;
    } else if (band === 'rainbow') {
      // Cosmic Rainbow Prismatic Aurora (1-of-1 Mythic NFT Concept)
      coreGlowMat.color.setHex(0xffffff);
      coreGlowOuterMat.color.setHex(0xff00cc);
      dustRingMat.color.setHex(0x00f0ff);
      dustRingMat.opacity = 0.92;
      dustRingUpperMat.color.setHex(0xff00aa);
      dustMat.blending = THREE.AdditiveBlending;
      dustMat.opacity = 0.95;
      accretionMat.color.setHex(0xffe600);
      jetMat.color.setHex(0x00ffcc);
      jetMat.opacity = 0.95 * params.jetIntensity;
    }

    // Restore pristine base colors if moving away from rainbow or spitzer
    if (band !== 'rainbow') {
      const dColors = diskGeom.attributes.color.array as Float32Array;
      dColors.set(baseDiskColors);
      diskGeom.attributes.color.needsUpdate = true;
      if (band !== 'spitzer') {
        const duColors = dustGeom.attributes.color.array as Float32Array;
        duColors.set(baseDustColors);
        dustGeom.attributes.color.needsUpdate = true;
      }
    }
  }

  applySpectralBand(params.spectralBand);

  // Animation update loop
  let elapsed = 0;
  function update(delta: number) {
    elapsed += delta * params.rotationSpeed;

    // Rotate accretion disk and black hole
    accretionMesh.rotation.z += delta * 1.8 * params.rotationSpeed;
    blackHoleMesh.rotation.y += delta * 0.4 * params.rotationSpeed;

    // Differential orbital movement of stars
    const corePos = coreGeom.attributes.position.array as Float32Array;
    for (let i = 0; i < coreStarCount; i++) {
      coreAngles[i] += coreVelocities[i] * delta * 0.25 * params.rotationSpeed;
      const r = coreRadii[i];
      corePos[i * 3] = Math.cos(coreAngles[i]) * r;
      corePos[i * 3 + 2] = Math.sin(coreAngles[i]) * r;
    }
    coreGeom.attributes.position.needsUpdate = true;

    const diskPos = diskGeom.attributes.position.array as Float32Array;
    for (let i = 0; i < diskStarCount; i++) {
      diskAngles[i] += diskSpeeds[i] * delta * 0.25 * params.rotationSpeed;
      const r = diskRadii[i];
      diskPos[i * 3] = Math.cos(diskAngles[i]) * r;
      diskPos[i * 3 + 2] = Math.sin(diskAngles[i]) * r;
    }
    diskGeom.attributes.position.needsUpdate = true;

    const dustPos = dustGeom.attributes.position.array as Float32Array;
    for (let i = 0; i < dustParticleCount; i++) {
      dustAngles[i] += dustSpeeds[i] * delta * 0.25 * params.rotationSpeed;
      const r = dustRadii[i];
      dustPos[i * 3] = Math.cos(dustAngles[i]) * r;
      dustPos[i * 3 + 2] = Math.sin(dustAngles[i]) * r;
    }
    dustGeom.attributes.position.needsUpdate = true;

    // Dynamic Rainbow Chromatic Dispersion Animation
    if (params.spectralBand === 'rainbow') {
      const rainbowSpeed = params.rainbowCycleSpeed ?? 1.0;
      const dColors = diskGeom.attributes.color.array as Float32Array;
      for (let i = 0; i < diskStarCount; i++) {
        const rNorm = (diskRadii[i] - 24) / (params.diskRadius - 24);
        // Multi-spectral chromatic rainbow gradient across spiral arms
        const hue = (rNorm * 1.35 + (diskAngles[i] / (Math.PI * 2)) + elapsed * 0.16 * rainbowSpeed) % 1.0;
        const normHue = (hue + 1.0) % 1.0;
        _colorHelper.setHSL(normHue, 0.95, 0.64);
        dColors[i * 3] = _colorHelper.r;
        dColors[i * 3 + 1] = _colorHelper.g;
        dColors[i * 3 + 2] = _colorHelper.b;
      }
      diskGeom.attributes.color.needsUpdate = true;

      const duColors = dustGeom.attributes.color.array as Float32Array;
      for (let i = 0; i < dustParticleCount; i++) {
        const rNorm = (dustRadii[i] - params.dustRingInner) / (params.dustRingOuter - params.dustRingInner);
        const hue = (rNorm * 0.9 + (dustAngles[i] / (Math.PI * 2)) * 0.7 - elapsed * 0.22 * rainbowSpeed) % 1.0;
        const normHue = (hue + 1.0) % 1.0;
        _colorHelper.setHSL(normHue, 1.0, 0.68);
        duColors[i * 3] = _colorHelper.r;
        duColors[i * 3 + 1] = _colorHelper.g;
        duColors[i * 3 + 2] = _colorHelper.b;
      }
      dustGeom.attributes.color.needsUpdate = true;

      // Prismatic core aura and relativistic jets chromatic cycle
      coreGlowOuterMat.color.setHSL((elapsed * 0.12 * rainbowSpeed) % 1.0, 0.95, 0.6);
      jetMat.color.setHSL((elapsed * 0.2 * rainbowSpeed + 0.4) % 1.0, 0.95, 0.65);
      dustRingMat.color.setHSL((elapsed * 0.14 * rainbowSpeed + 0.2) % 1.0, 0.92, 0.55);
      dustRingUpperMat.color.setHSL((elapsed * 0.14 * rainbowSpeed + 0.7) % 1.0, 0.92, 0.55);
    }

    // Subtle breathing pulse on core glow
    const pulse = 1 + Math.sin(elapsed * 1.5) * 0.04;
    coreGlowSprite.scale.set(130 * pulse * params.coreLuminosity, 95 * pulse * params.coreLuminosity, 1);

    // Slowly precess globular cluster halo
    globularClusters.rotation.y += delta * 0.02 * params.rotationSpeed;

    // Rotate physical dust ring slightly
    dustRingMesh.rotation.z += delta * 0.05 * params.rotationSpeed;
    dustRingUpper.rotation.z += delta * 0.05 * params.rotationSpeed;
    dustRingLower.rotation.z += delta * 0.05 * params.rotationSpeed;

    // Faint twinkle in deep background
    bgField.rotation.y += delta * 0.003;
  }

  function updateParams(newParams: GalaxyParams) {
    params = { ...newParams };
    root.rotation.x = (params.inclinationDeg * Math.PI) / 180;
    dustRingMat.opacity = params.dustOpacity;
    dustMat.opacity = params.dustOpacity;
    jetMat.opacity = 0.4 * params.jetIntensity;
    applySpectralBand(params.spectralBand);
  }

  function dispose() {
    coreGeom.dispose();
    coreStarMat.dispose();
    diskGeom.dispose();
    diskStarMat.dispose();
    dustGeom.dispose();
    dustMat.dispose();
    globularGeom.dispose();
    globularMat.dispose();
    bgGeom.dispose();
    bgMat.dispose();
    blackHoleGeom.dispose();
    blackHoleMat.dispose();
    accretionGeom.dispose();
    accretionMat.dispose();
    coreGlowMat.dispose();
    coreGlowOuterMat.dispose();
    dustRingGeom.dispose();
    dustRingMat.dispose();
    dustRingUpperGeom.dispose();
    dustRingUpperMat.dispose();
    jetGeom.dispose();
    jetMat.dispose();

    starTex.dispose();
    dustTex.dispose();
    glowTex.dispose();
    accretionTex.dispose();
    dustColorMap.dispose();
    dustAlphaMap.dispose();
  }

  return {
    root,
    exportableGroup,
    update,
    updateParams,
    setSpectralBand: applySpectralBand,
    getStarCount: () => coreStarCount + diskStarCount + dustParticleCount + globularCount,
    dispose,
  };
}
