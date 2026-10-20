export type SpectralBand = 'hubble' | 'spitzer' | 'chandra' | 'synthwave' | 'deepspace' | 'rainbow';

export interface GalaxyParams {
  starCount: number;
  coreRadius: number;
  diskRadius: number;
  dustRingInner: number;
  dustRingOuter: number;
  dustOpacity: number;
  haloCount: number;
  rotationSpeed: number;
  coreLuminosity: number;
  jetIntensity: number;
  spectralBand: SpectralBand;
  inclinationDeg: number;
  cameraFov: number;
  rainbowCycleSpeed?: number;
}

export interface OpenSeaAttribute {
  trait_type: string;
  value: string | number;
  display_type?: string;
  max_value?: number;
}

export interface OpenSeaNFTMetadata {
  name: string;
  description: string;
  image: string;
  animation_url: string;
  external_url: string;
  background_color?: string;
  youtube_url?: string;
  attributes: OpenSeaAttribute[];
}
