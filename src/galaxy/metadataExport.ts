import { GalaxyParams, OpenSeaNFTMetadata } from '../types/galaxy';

export function generateOpenSeaMetadata(
  params: GalaxyParams,
  options: {
    tokenId?: number;
    title?: string;
    description?: string;
    imageUri?: string;
    animationUri?: string;
    externalUrl?: string;
  } = {}
): OpenSeaNFTMetadata {
  const tokenId = options.tokenId || 104;
  const title = options.title || `Messier 104: Sombrero Galaxy #${String(tokenId).padStart(3, '0')}`;
  const imageUri = options.imageUri || 'ipfs://QmSombreroGalaxyPosterPreview/sombrero-m104.png';
  const animationUri = options.animationUri || 'ipfs://QmSombreroGalaxy3DModel/sombrero-m104.glb';
  const externalUrl = options.externalUrl || 'https://opensea.io/collection/sombrero-galaxy-3d-nft';

  const spectralLabels: Record<string, string> = {
    hubble: 'Hubble Space Telescope (Optical F606W/F814W)',
    spitzer: 'Spitzer Space Telescope (Infrared 3.6μm - 8.0μm)',
    chandra: 'Chandra X-Ray Observatory (0.5 - 7 keV)',
    synthwave: 'Cyberpunk Deep Space Neon',
    deepspace: 'Ultraviolet & Deep Astrographic Survey',
    rainbow: 'Prismatic Rainbow Aurora (Doppler Wavelength Dispersion 380-750nm)',
  };

  const spectralRarity: Record<string, string> = {
    hubble: 'Legendary Optical',
    spitzer: 'Exotic Infrared',
    chandra: 'Relativistic High-Energy',
    synthwave: 'Mythic Cybernetic',
    deepspace: 'Cosmic Survey',
    rainbow: '1-of-1 Mythic Rainbow Genesis',
  };

  return {
    name: title,
    description:
      options.description ||
      'Interactive 3D Live simulation of the Sombrero Galaxy (Messier 104 / NGC 4594), an unbarred lenticular galaxy located in the constellation Virgo at a distance of 29.35 million light-years. Featuring an extraordinary bright nucleus, a massive 1-billion solar mass central black hole, a spherical halo of over 1,500 globular clusters, and its world-famous equatorial interstellar dark dust lane viewed at a nearly edge-on 6-degree inclination.',
    image: imageUri,
    animation_url: animationUri,
    external_url: externalUrl,
    background_color: '050508',
    attributes: [
      {
        trait_type: 'Galaxy Catalog',
        value: 'Messier 104 (NGC 4594)',
      },
      {
        trait_type: 'Galaxy Morphology',
        value: 'SA(s)a / Lenticular Spiral',
      },
      {
        trait_type: 'Constellation',
        value: 'Virgo (Bordering Corvus)',
      },
      {
        trait_type: 'Spectral Observation Band',
        value: spectralLabels[params.spectralBand] || params.spectralBand,
      },
      {
        trait_type: 'Rarity Tier',
        value: spectralRarity[params.spectralBand] || 'Mythic Cosmic',
      },
      {
        trait_type: 'Distance',
        value: '29.35 Million Light-Years',
      },
      {
        trait_type: 'Central Supermassive Black Hole',
        value: '1.0 Billion Solar Masses (10^9 M☉)',
      },
      {
        trait_type: 'Inclination Angle',
        value: `${params.inclinationDeg}° (Nearly Edge-On)`,
      },
      {
        trait_type: 'Equatorial Dust Rim Density',
        value: `${Math.round(params.dustOpacity * 100)}%`,
      },
      {
        trait_type: 'Globular Cluster Population',
        value: '1,200 - 2,000 Clusters',
      },
      {
        display_type: 'number',
        trait_type: 'Simulated Star Count',
        value: params.starCount,
      },
      {
        display_type: 'number',
        trait_type: 'Apparent Magnitude (V)',
        value: 8.0,
      },
      {
        display_type: 'boost_percentage',
        trait_type: 'Core Relativistic Luminosity',
        value: Math.round(params.coreLuminosity * 100),
      },
      {
        trait_type: '3D Format',
        value: 'GLTF / Binary GLB 2.0 PBR',
      },
      ...(params.spectralBand === 'rainbow'
        ? [
            {
              trait_type: 'NFT Special Concept',
              value: '1-of-1 Cosmic Rainbow Genesis Edition',
            },
            {
              trait_type: 'Chromatic Dispersion Range',
              value: 'Full Visible Octave (380nm - 750nm)',
            },
            {
              trait_type: 'Doppler Aurora Effect',
              value: 'Active Multi-Spectral Wavelength Shift',
            },
          ]
        : []),
    ],
  };
}
