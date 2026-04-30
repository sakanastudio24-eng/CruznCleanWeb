export interface ServiceAreaZipRange {
  label: string;
  start: number;
  end: number;
}

export const SERVICE_AREA_CITIES = [
  'Yorba Linda',
  'Placentia',
  'Fullerton',
  'Anaheim',
  'Brea',
  'Orange',
  'La Habra',
  'Buena Park',
  'Cypress',
  'Irvine',
  'Huntington Beach',
  'Costa Mesa',
  'Tustin',
  'Garden Grove',
  'Santa Ana',
];

export const SERVICE_AREA_ZIP_RANGES: ServiceAreaZipRange[] = [
  { label: '92801-92809', start: 92801, end: 92809 },
  { label: '92821', start: 92821, end: 92821 },
  { label: '92823', start: 92823, end: 92823 },
  { label: '92831-92835', start: 92831, end: 92835 },
  { label: '92840-92846', start: 92840, end: 92846 },
  { label: '92865-92871', start: 92865, end: 92871 },
  { label: '92886-92887', start: 92886, end: 92887 },
  { label: '92602-92620', start: 92602, end: 92620 },
  { label: '92626-92628', start: 92626, end: 92628 },
  { label: '92683-92685', start: 92683, end: 92685 },
];

/**
 * Normalizes user-entered ZIP strings to the first five digits.
 */
export function normalizeZipCode(zipCode: string): string {
  return zipCode.replace(/\D/g, '').slice(0, 5);
}

/**
 * Checks whether a ZIP code falls inside the current online booking service area.
 */
export function isZipInServiceArea(zipCode: string): boolean {
  const normalizedZip = normalizeZipCode(zipCode);
  if (normalizedZip.length !== 5) {
    return false;
  }

  const zipNumber = Number(normalizedZip);
  return SERVICE_AREA_ZIP_RANGES.some((range) => zipNumber >= range.start && zipNumber <= range.end);
}

/**
 * Returns compact ZIP range copy for helper text and FAQ answers.
 */
export function getServiceAreaZipSummary(): string {
  return SERVICE_AREA_ZIP_RANGES.map((range) => range.label).join(', ');
}

/**
 * Returns compact city copy for customer-facing help surfaces.
 */
export function getServiceAreaCitySummary(): string {
  return SERVICE_AREA_CITIES.join(', ');
}
