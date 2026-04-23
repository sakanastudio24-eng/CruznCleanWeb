import type { VehicleSize } from '@/lib/booking-types';

export type { VehicleSize } from '@/lib/booking-types';

export interface VehicleGuideEntry {
  make: string;
  model: string;
  size: VehicleSize;
}

export const VEHICLE_SIZE_GUIDE: VehicleGuideEntry[] = [
  { make: 'Toyota', model: 'Corolla', size: 'small' },
  { make: 'Toyota', model: 'Camry', size: 'small' },
  { make: 'Honda', model: 'Civic', size: 'small' },
  { make: 'Honda', model: 'Accord', size: 'small' },
  { make: 'Hyundai', model: 'Elantra', size: 'small' },
  { make: 'Hyundai', model: 'Sonata', size: 'small' },
  { make: 'Nissan', model: 'Sentra', size: 'small' },
  { make: 'Nissan', model: 'Altima', size: 'small' },
  { make: 'Mazda', model: 'Mazda3', size: 'small' },
  { make: 'Kia', model: 'Forte', size: 'small' },
  { make: 'Kia', model: 'K5', size: 'small' },
  { make: 'Volkswagen', model: 'Jetta', size: 'small' },
  { make: 'Subaru', model: 'Impreza', size: 'small' },
  { make: 'Tesla', model: 'Model 3', size: 'small' },
  { make: 'BMW', model: '3 Series', size: 'small' },
  { make: 'Audi', model: 'A4', size: 'small' },
  { make: 'Mercedes', model: 'C-Class', size: 'small' },
  { make: 'Lexus', model: 'IS', size: 'small' },
  { make: 'Toyota', model: 'RAV4', size: 'medium' },
  { make: 'Honda', model: 'CR-V', size: 'medium' },
  { make: 'Nissan', model: 'Rogue', size: 'medium' },
  { make: 'Mazda', model: 'CX-5', size: 'medium' },
  { make: 'Subaru', model: 'Forester', size: 'medium' },
  { make: 'Subaru', model: 'Outback', size: 'medium' },
  { make: 'Hyundai', model: 'Tucson', size: 'medium' },
  { make: 'Hyundai', model: 'Santa Fe', size: 'medium' },
  { make: 'Kia', model: 'Sportage', size: 'medium' },
  { make: 'Kia', model: 'Sorento', size: 'medium' },
  { make: 'Ford', model: 'Escape', size: 'medium' },
  { make: 'Ford', model: 'Edge', size: 'medium' },
  { make: 'Chevrolet', model: 'Equinox', size: 'medium' },
  { make: 'Jeep', model: 'Cherokee', size: 'medium' },
  { make: 'Tesla', model: 'Model Y', size: 'medium' },
  { make: 'Lexus', model: 'RX', size: 'medium' },
  { make: 'BMW', model: 'X3', size: 'medium' },
  { make: 'Audi', model: 'Q5', size: 'medium' },
  { make: 'Ford', model: 'F-150', size: 'large' },
  { make: 'Ram', model: '1500', size: 'large' },
  { make: 'Chevrolet', model: 'Silverado 1500', size: 'large' },
  { make: 'GMC', model: 'Sierra 1500', size: 'large' },
  { make: 'Toyota', model: 'Tundra', size: 'large' },
  { make: 'Nissan', model: 'Titan', size: 'large' },
  { make: 'Ford', model: 'Expedition', size: 'large' },
  { make: 'Chevrolet', model: 'Tahoe', size: 'large' },
  { make: 'Chevrolet', model: 'Suburban', size: 'large' },
  { make: 'GMC', model: 'Yukon', size: 'large' },
  { make: 'Cadillac', model: 'Escalade', size: 'large' },
  { make: 'Toyota', model: 'Sequoia', size: 'large' },
  { make: 'Honda', model: 'Odyssey', size: 'large' },
  { make: 'Toyota', model: 'Sienna', size: 'large' },
];

/**
 * Normalizes freeform vehicle search input for comparison.
 */
export function normalizeVehicleQuery(input: string): string {
  return input.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, ' ');
}

/**
 * Returns vehicle guide matches against make, model, or combined label.
 */
export function searchVehicleGuide(query: string): VehicleGuideEntry[] {
  const normalized = normalizeVehicleQuery(query);
  if (!normalized) {
    return VEHICLE_SIZE_GUIDE;
  }

  return VEHICLE_SIZE_GUIDE.filter((entry) => {
    const make = normalizeVehicleQuery(entry.make);
    const model = normalizeVehicleQuery(entry.model);
    const combined = `${make} ${model}`;
    return combined.includes(normalized) || make.includes(normalized) || model.includes(normalized);
  });
}

/**
 * Resolves one exact guide match from make/model fields.
 */
export function findVehicleGuideMatch(make: string, model: string): VehicleGuideEntry | undefined {
  const matches = findVehicleGuideMatches(make, model);
  return matches.length === 1 ? matches[0] : undefined;
}

/**
 * Returns all guide matches for provided make/model fields.
 */
export function findVehicleGuideMatches(make: string, model: string): VehicleGuideEntry[] {
  const makeNormalized = normalizeVehicleQuery(make);
  const modelNormalized = normalizeVehicleQuery(model);
  const hasMake = Boolean(makeNormalized);
  const hasModel = Boolean(modelNormalized);

  if (!hasMake && !hasModel) {
    return [];
  }

  const exactMatches = VEHICLE_SIZE_GUIDE.filter((entry) => {
    const entryMake = normalizeVehicleQuery(entry.make);
    const entryModel = normalizeVehicleQuery(entry.model);
    const makeMatches = !hasMake || entryMake === makeNormalized;
    const modelMatches = !hasModel || entryModel === modelNormalized;
    return makeMatches && modelMatches;
  });

  if (hasMake && hasModel && exactMatches.length > 0) {
    return exactMatches;
  }

  return VEHICLE_SIZE_GUIDE.filter((entry) => {
    const entryMake = normalizeVehicleQuery(entry.make);
    const entryModel = normalizeVehicleQuery(entry.model);
    if (hasMake && hasModel) {
      return entryMake.includes(makeNormalized) && entryModel.includes(modelNormalized);
    }
    if (hasMake) {
      return entryMake.includes(makeNormalized);
    }
    return entryModel.includes(modelNormalized);
  });
}

/**
 * Returns true when make/model fields produce more than one possible guide match.
 */
export function isVehicleGuideAmbiguous(make: string, model: string): boolean {
  return findVehicleGuideMatches(make, model).length > 1;
}
