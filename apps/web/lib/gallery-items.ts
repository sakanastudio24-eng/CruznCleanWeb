import type { StaticImageData } from 'next/image';

import oneStepPaintCorrection from '../../../photo_refrences/1-Step Paint Correction.jpg';
import basicExteriorDetail from '../../../photo_refrences/Basic Exterior Detail.jpg';
import basicInteriorDetail from '../../../photo_refrences/Basic Interior Detail.jpg';
import deepInteriorDetail from '../../../photo_refrences/Deep Interior Detail.jpg';
import fullExteriorDetail from '../../../photo_refrences/Full Exterior Detail.jpg';
import fullInteriorDetail from '../../../photo_refrences/Full Interior Detail.jpg';
import handWashedAndSealed from '../../../photo_refrences/Hand Washed and Sealed.jpg';
import headlightRestoration from '../../../photo_refrences/Headlight Restoration.jpg';
import paintEnhancementPolish from '../../../photo_refrences/Paint Enhancing Polish.jpeg';
import spotlessShine from '../../../photo_refrences/Spotless Shine.jpg';
import spotlessWheelsAndTires from '../../../photo_refrences/Spotless Wheels and Tires.jpg';
import wheelsBarrelCleaning from '../../../photo_refrences/Wheels + Barrels Spotless.jpg';

export type GalleryCategory = 'exterior' | 'interior' | 'wheels-tires' | 'specialty';

export interface GalleryItem {
  id: string;
  filename: string;
  label: string;
  description: string;
  category: GalleryCategory;
  src: StaticImageData;
}

/**
 * Returns the current client photo references with filename-backed labels.
 */
export function getGalleryItems(): GalleryItem[] {
  return [
    {
      id: 'full-exterior-detail',
      filename: 'Full Exterior Detail.jpg',
      label: 'Full Exterior Detail',
      description: 'Glossy full exterior detail',
      category: 'exterior',
      src: fullExteriorDetail,
    },
    {
      id: 'one-step-paint-correction',
      filename: '1-Step Paint Correction.jpg',
      label: 'One-Step Paint Correction',
      description: 'Cleaner glossy paint finish',
      category: 'specialty',
      src: oneStepPaintCorrection,
    },
    {
      id: 'basic-exterior-detail',
      filename: 'Basic Exterior Detail.jpg',
      label: 'Basic Exterior Detail',
      description: 'Simple clean exterior finish',
      category: 'exterior',
      src: basicExteriorDetail,
    },
    {
      id: 'basic-interior-detail',
      filename: 'Basic Interior Detail.jpg',
      label: 'Basic Interior Detail',
      description: 'Simple everyday interior reset',
      category: 'interior',
      src: basicInteriorDetail,
    },
    {
      id: 'deep-interior-detail',
      filename: 'Deep Interior Detail.jpg',
      label: 'Deep Interior Detail',
      description: 'Deep cabin interior cleaning',
      category: 'interior',
      src: deepInteriorDetail,
    },
    {
      id: 'full-interior-detail',
      filename: 'Full Interior Detail.jpg',
      label: 'Full Interior Detail',
      description: 'Clean comfortable full interior',
      category: 'interior',
      src: fullInteriorDetail,
    },
    {
      id: 'hand-wash-seal',
      filename: 'Hand Washed and Sealed.jpg',
      label: 'Hand Wash & Seal',
      description: 'Protected glossy hand wash',
      category: 'exterior',
      src: handWashedAndSealed,
    },
    {
      id: 'headlight-restoration',
      filename: 'Headlight Restoration.jpg',
      label: 'Headlight Restoration',
      description: 'Clearer brighter headlight lenses',
      category: 'specialty',
      src: headlightRestoration,
    },
    {
      id: 'paint-enhancement-polish',
      filename: 'Paint Enhancing Polish.jpeg',
      label: 'Paint Enhancement Polish',
      description: 'Better gloss and reflection',
      category: 'specialty',
      src: paintEnhancementPolish,
    },
    {
      id: 'spotless-shine-finish',
      filename: 'Spotless Shine.jpg',
      label: 'Spotless Shine Finish',
      description: 'Clean glossy final finish',
      category: 'exterior',
      src: spotlessShine,
    },
    {
      id: 'spotless-wheels-tires',
      filename: 'Spotless Wheels and Tires.jpg',
      label: 'Spotless Wheels & Tires',
      description: 'Crisp wheels and tires',
      category: 'wheels-tires',
      src: spotlessWheelsAndTires,
    },
    {
      id: 'wheels-barrel-cleaning',
      filename: 'Wheels + Barrels Spotless.jpg',
      label: 'Wheels + Barrel Cleaning',
      description: 'Deeper wheel barrel cleaning',
      category: 'wheels-tires',
      src: wheelsBarrelCleaning,
    },
  ];
}

/**
 * Returns a curated subset for the homepage gallery preview strip.
 */
export function getGalleryPreviewItems(): GalleryItem[] {
  return getGalleryItems().slice(0, 4);
}
