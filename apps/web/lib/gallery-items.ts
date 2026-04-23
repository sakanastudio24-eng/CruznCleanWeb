import type { StaticImageData } from 'next/image';

import enter1 from '../../../attachments/Enter1.jpg';
import entera from '../../../attachments/Entera.jpg';
import exter1 from '../../../attachments/Exter1.jpeg';
import exter10Rear from '../../../attachments/Exter10:Rear.jpg';
import exter12 from '../../../attachments/Exter12.jpg';
import exter13Rear from '../../../attachments/Exter13:Rear.jpg';
import exter14Headlights from '../../../attachments/Exter14:Headlights.jpg';
import exter2 from '../../../attachments/Exter2.jpg';
import exter3Tire from '../../../attachments/Exter3:Tire.jpg';
import exter4 from '../../../attachments/Exter4.jpg';
import exter5 from '../../../attachments/Exter5.jpg';
import exter6Headlights from '../../../attachments/Exter6:Headlights.jpg';
import exter7Tire from '../../../attachments/Exter7.:Tirejpg.jpg';
import exter8Rear from '../../../attachments/Exter8:Rear.jpg';
import inter8 from '../../../attachments/Inter8.jpg';
import leatherSeats from '../../../attachments/Leather-seats.jpg';
import tire1 from '../../../attachments/Tire.jpg';
import tire2 from '../../../attachments/Tire2.jpg';
import windowShot from '../../../attachments/Window.jpg';

export type GalleryCategory = 'exterior' | 'interior' | 'wheels-tires' | 'specialty';

export interface GalleryItem {
  id: string;
  label: string;
  category: GalleryCategory;
  src: StaticImageData;
}

/**
 * Returns the local gallery inventory using filename hints supplied with the attachments.
 */
export function getGalleryItems(): GalleryItem[] {
  return [
    { id: 'exterior-1', label: 'Exterior gloss finish', category: 'exterior', src: exter1 },
    { id: 'exterior-2', label: 'Exterior reset in natural light', category: 'exterior', src: exter2 },
    { id: 'exterior-3', label: 'Rear quarter exterior finish', category: 'exterior', src: exter10Rear },
    { id: 'exterior-4', label: 'Rear profile exterior detail', category: 'exterior', src: exter13Rear },
    { id: 'exterior-5', label: 'Body panel finish detail', category: 'exterior', src: exter12 },
    { id: 'exterior-6', label: 'Exterior finish pass', category: 'exterior', src: exter4 },
    { id: 'exterior-7', label: 'Exterior finish inspection', category: 'exterior', src: exter5 },
    { id: 'exterior-8', label: 'Rear exterior reflection', category: 'exterior', src: exter8Rear },
    { id: 'interior-1', label: 'Interior deep clean reset', category: 'interior', src: enter1 },
    { id: 'interior-2', label: 'Interior touchpoint cleanup', category: 'interior', src: entera },
    { id: 'interior-3', label: 'Interior finish detail', category: 'interior', src: inter8 },
    { id: 'interior-4', label: 'Leather seating treatment', category: 'interior', src: leatherSeats },
    { id: 'wheels-1', label: 'Wheel and tire finish', category: 'wheels-tires', src: tire1 },
    { id: 'wheels-2', label: 'Wheel face coating prep', category: 'wheels-tires', src: tire2 },
    { id: 'wheels-3', label: 'Tire sidewall detail', category: 'wheels-tires', src: exter3Tire },
    { id: 'wheels-4', label: 'Wheel close-up finish', category: 'wheels-tires', src: exter7Tire },
    { id: 'specialty-1', label: 'Window coating result', category: 'specialty', src: windowShot },
    { id: 'specialty-2', label: 'Headlight refinement result', category: 'specialty', src: exter14Headlights },
    { id: 'specialty-3', label: 'Headlight restoration detail', category: 'specialty', src: exter6Headlights },
  ];
}

/**
 * Returns a curated subset for the homepage gallery preview strip.
 */
export function getGalleryPreviewItems(): GalleryItem[] {
  return getGalleryItems().slice(0, 4);
}
