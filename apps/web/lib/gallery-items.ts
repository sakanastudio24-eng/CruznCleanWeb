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
import fullInteriorDetailBatchCabin from '../assets/gallery/batch-1/full-interior-detail-cabin.jpg';
import fullInteriorDetailBatchFront from '../assets/gallery/batch-1/full-interior-detail-front.jpg';
import headlightRestorationBatch from '../assets/gallery/batch-1/headlight-restoration-02.jpg';
import maintenanceDetail01 from '../assets/gallery/batch-1/maintenance-detail-01.jpg';
import maintenanceDetail03 from '../assets/gallery/batch-1/maintenance-detail-03.jpg';
import maintenanceDetail04 from '../assets/gallery/batch-1/maintenance-detail-04.jpg';
import maintenanceDetail05 from '../assets/gallery/batch-1/maintenance-detail-05.jpg';
import maintenanceDetail06 from '../assets/gallery/batch-1/maintenance-detail-06.jpg';
import paintCorrectionWorkBatch from '../assets/gallery/batch-1/paint-correction-work.jpg';
import spotlessWheelsAndTiresBatch from '../assets/gallery/batch-1/spotless-wheels-and-tires.jpg';
import wheelCeramicCoatingBatch from '../assets/gallery/batch-1/wheel-ceramic-coating.jpg';

export type GalleryCategory = 'exterior' | 'interior' | 'wheels-tires' | 'specialty';

export interface GalleryItem {
  id: string;
  filename: string;
  label: string;
  description: string;
  alt: string;
  category: GalleryCategory;
  src: StaticImageData;
}

const GALLERY_NEWEST_FIRST_RANK: Record<string, number> = {
  'batch-maintenance-detail-04': 240,
  'batch-maintenance-detail-01': 239,
  'batch-paint-correction-work': 238,
  'batch-headlight-restoration': 237,
  'batch-maintenance-detail-03': 236,
  'batch-full-interior-detail-front': 235,
  'batch-full-interior-detail-cabin': 234,
  'batch-maintenance-detail-05': 233,
  'batch-wheel-ceramic-coating': 232,
  'batch-spotless-wheels-tires': 231,
  'batch-maintenance-detail-06': 230,
  'wheels-barrel-cleaning': 129,
  'headlight-restoration': 128,
  'full-interior-detail': 127,
  'basic-exterior-detail': 126,
  'hand-wash-seal': 125,
  'deep-interior-detail': 124,
  'one-step-paint-correction': 123,
  'full-exterior-detail': 122,
  'basic-interior-detail': 121,
  'spotless-shine-finish': 120,
  'spotless-wheels-tires': 119,
  'paint-enhancement-polish': 118,
};

function sortNewestFirst(items: GalleryItem[]): GalleryItem[] {
  return items.sort((first, second) => {
    const firstRank = GALLERY_NEWEST_FIRST_RANK[first.id] ?? 0;
    const secondRank = GALLERY_NEWEST_FIRST_RANK[second.id] ?? 0;

    return secondRank - firstRank;
  });
}

/**
 * Returns the current client photo references with filename-backed labels.
 */
export function getGalleryItems(): GalleryItem[] {
  return sortNewestFirst([
    {
      id: 'full-exterior-detail',
      filename: 'Full Exterior Detail.jpg',
      label: 'Full Exterior Detail',
      description: 'Full exterior detail with a clean, glossy finish.',
      alt: 'Red vehicle after a Cruizn Clean full exterior detail',
      category: 'exterior',
      src: fullExteriorDetail,
    },
    {
      id: 'one-step-paint-correction',
      filename: '1-Step Paint Correction.jpg',
      label: 'One Step Paint Correction',
      description: 'Paint correction that improved gloss and clarity.',
      alt: 'Vehicle paint after one step paint correction',
      category: 'specialty',
      src: oneStepPaintCorrection,
    },
    {
      id: 'basic-exterior-detail',
      filename: 'Basic Exterior Detail.jpg',
      label: 'Basic Exterior Detail',
      description: 'Basic exterior detail with a clean final finish.',
      alt: 'Vehicle exterior after a basic exterior detail',
      category: 'exterior',
      src: basicExteriorDetail,
    },
    {
      id: 'basic-interior-detail',
      filename: 'Basic Interior Detail.jpg',
      label: 'Basic Interior Detail',
      description: 'Basic interior detail focused on everyday cabin cleanup.',
      alt: 'Vehicle interior after a basic interior detail',
      category: 'interior',
      src: basicInteriorDetail,
    },
    {
      id: 'deep-interior-detail',
      filename: 'Deep Interior Detail.jpg',
      label: 'Deep Interior Detail',
      description: 'Deep interior detail focused on seats, carpets, and touchpoints.',
      alt: 'Vehicle cabin after a deep interior detail',
      category: 'interior',
      src: deepInteriorDetail,
    },
    {
      id: 'full-interior-detail',
      filename: 'Full Interior Detail.jpg',
      label: 'Full Interior Detail',
      description: 'Full interior detail for a cleaner, more comfortable cabin.',
      alt: 'Vehicle interior after a full interior detail',
      category: 'interior',
      src: fullInteriorDetail,
    },
    {
      id: 'hand-wash-seal',
      filename: 'Hand Washed and Sealed.jpg',
      label: 'Basic Exterior Detail',
      description: 'Basic exterior detail with a clean, protected finish.',
      alt: 'Vehicle exterior after hand wash and seal service',
      category: 'exterior',
      src: handWashedAndSealed,
    },
    {
      id: 'headlight-restoration',
      filename: 'Headlight Restoration.jpg',
      label: 'Headlight Restoration',
      description: 'Headlight restoration for a clearer front end finish.',
      alt: 'Vehicle headlight after restoration work',
      category: 'specialty',
      src: headlightRestoration,
    },
    {
      id: 'paint-enhancement-polish',
      filename: 'Paint Enhancing Polish.jpeg',
      label: 'Paint Enhancement Polish',
      description: 'Paint enhancement polish for better gloss and reflection.',
      alt: 'Vehicle paint after paint enhancement polish',
      category: 'specialty',
      src: paintEnhancementPolish,
    },
    {
      id: 'spotless-shine-finish',
      filename: 'Spotless Shine.jpg',
      label: 'Basic Exterior Detail',
      description: 'Basic exterior detail with a clean, glossy final finish.',
      alt: 'Vehicle exterior with a glossy final finish',
      category: 'exterior',
      src: spotlessShine,
    },
    {
      id: 'spotless-wheels-tires',
      filename: 'Spotless Wheels and Tires.jpg',
      label: 'Wheel Cleaning',
      description: 'Wheel and tire cleaning with a crisp finished look.',
      alt: 'Wheel and tire after cleaning',
      category: 'wheels-tires',
      src: spotlessWheelsAndTires,
    },
    {
      id: 'wheels-barrel-cleaning',
      filename: 'Wheels + Barrels Spotless.jpg',
      label: 'Wheels + Barrel Cleaning',
      description: 'Wheel barrel cleaning for a more complete wheel detail.',
      alt: 'Wheel barrel after deeper wheel cleaning',
      category: 'wheels-tires',
      src: wheelsBarrelCleaning,
    },
    {
      id: 'batch-full-interior-detail-front',
      filename: 'full-interior-detail-front.jpg',
      label: 'Full Interior Detail',
      description: 'Full interior detail focused on seats, carpets, and high touch areas.',
      alt: 'Vehicle interior after a Cruizn Clean full interior detail',
      category: 'interior',
      src: fullInteriorDetailBatchFront,
    },
    {
      id: 'batch-full-interior-detail-cabin',
      filename: 'full-interior-detail-cabin.jpg',
      label: 'Full Interior Detail',
      description: 'Interior detail work for a cleaner cabin and touchpoints.',
      alt: 'Vehicle cabin after interior detail work',
      category: 'interior',
      src: fullInteriorDetailBatchCabin,
    },
    {
      id: 'batch-spotless-wheels-tires',
      filename: 'spotless-wheels-and-tires.jpg',
      label: 'Wheel Cleaning',
      description: 'Wheel and tire cleaning with a crisp, finished look.',
      alt: 'Wheel and tire after Cruizn Clean wheel cleaning',
      category: 'wheels-tires',
      src: spotlessWheelsAndTiresBatch,
    },
    {
      id: 'batch-maintenance-detail-01',
      filename: 'maintenance-detail-01.jpg',
      label: 'Maintenance Detail',
      description: 'Maintenance detail for a clean, ready to drive finish.',
      alt: 'Vehicle after a Cruizn Clean maintenance detail',
      category: 'exterior',
      src: maintenanceDetail01,
    },
    {
      id: 'batch-maintenance-detail-03',
      filename: 'maintenance-detail-03.jpg',
      label: 'Maintenance Detail',
      description: 'Maintenance detailing for a cleaner exterior presentation.',
      alt: 'Vehicle exterior after maintenance detailing',
      category: 'exterior',
      src: maintenanceDetail03,
    },
    {
      id: 'batch-maintenance-detail-04',
      filename: 'maintenance-detail-04.jpg',
      label: 'Maintenance Detail',
      description: 'Maintenance detail with a clean finish for regular vehicle care.',
      alt: 'Vehicle after regular maintenance detailing',
      category: 'exterior',
      src: maintenanceDetail04,
    },
    {
      id: 'batch-maintenance-detail-05',
      filename: 'maintenance-detail-05.jpg',
      label: 'Maintenance Detail',
      description: 'Maintenance detailing focused on a fresh exterior finish.',
      alt: 'Vehicle exterior with a fresh maintenance detail finish',
      category: 'exterior',
      src: maintenanceDetail05,
    },
    {
      id: 'batch-maintenance-detail-06',
      filename: 'maintenance-detail-06.jpg',
      label: 'Maintenance Detail',
      description: 'Maintenance detail for consistent upkeep and a clean look.',
      alt: 'Vehicle after consistent maintenance detailing',
      category: 'exterior',
      src: maintenanceDetail06,
    },
    {
      id: 'batch-headlight-restoration',
      filename: 'headlight-restoration-02.jpg',
      label: 'Headlight Restoration',
      description: 'Headlight restoration for a clearer front end finish.',
      alt: 'Headlight after restoration work',
      category: 'specialty',
      src: headlightRestorationBatch,
    },
    {
      id: 'batch-paint-correction-work',
      filename: 'paint-correction-work.jpg',
      label: 'Paint Correction',
      description: 'Paint correction that improved gloss and clarity.',
      alt: 'Vehicle paint after correction',
      category: 'specialty',
      src: paintCorrectionWorkBatch,
    },
    {
      id: 'batch-wheel-ceramic-coating',
      filename: 'wheel-ceramic-coating.jpg',
      label: 'Wheel Ceramic Coating',
      description: 'Wheel ceramic coating applied for added wheel face protection.',
      alt: 'Wheel after ceramic coating application',
      category: 'wheels-tires',
      src: wheelCeramicCoatingBatch,
    },
  ]);
}

/**
 * Returns a curated subset for the homepage gallery preview strip.
 */
export function getGalleryPreviewItems(): GalleryItem[] {
  return getGalleryItems().slice(0, 4);
}
