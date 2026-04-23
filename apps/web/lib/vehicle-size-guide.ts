import type { VehicleSize } from '@/lib/booking-types';

export type { VehicleSize } from '@/lib/booking-types';

export interface VehicleGuideEntry {
  make: string;
  model: string;
  size: VehicleSize;
}

export const VEHICLE_SIZE_GUIDE: VehicleGuideEntry[] = [
  { make: 'Toyota', model: 'Corolla', size: 'sedan_coupe' },
  { make: 'Toyota', model: 'Camry', size: 'sedan_coupe' },
  { make: 'Honda', model: 'Civic', size: 'sedan_coupe' },
  { make: 'Honda', model: 'Accord', size: 'sedan_coupe' },
  { make: 'Hyundai', model: 'Elantra', size: 'sedan_coupe' },
  { make: 'Hyundai', model: 'Sonata', size: 'sedan_coupe' },
  { make: 'Nissan', model: 'Sentra', size: 'sedan_coupe' },
  { make: 'Nissan', model: 'Altima', size: 'sedan_coupe' },
  { make: 'Mazda', model: 'Mazda3', size: 'sedan_coupe' },
  { make: 'Kia', model: 'Forte', size: 'sedan_coupe' },
  { make: 'Kia', model: 'K5', size: 'sedan_coupe' },
  { make: 'Volkswagen', model: 'Jetta', size: 'sedan_coupe' },
  { make: 'Subaru', model: 'Impreza', size: 'sedan_coupe' },
  { make: 'Tesla', model: 'Model 3', size: 'sedan_coupe' },
  { make: 'BMW', model: '3 Series', size: 'sedan_coupe' },
  { make: 'Audi', model: 'A4', size: 'sedan_coupe' },
  { make: 'Mercedes', model: 'C-Class', size: 'sedan_coupe' },
  { make: 'Lexus', model: 'IS', size: 'sedan_coupe' },
  { make: 'Toyota', model: 'RAV4', size: 'small_suv_truck' },
  { make: 'Honda', model: 'CR-V', size: 'small_suv_truck' },
  { make: 'Nissan', model: 'Rogue', size: 'small_suv_truck' },
  { make: 'Mazda', model: 'CX-5', size: 'small_suv_truck' },
  { make: 'Subaru', model: 'Forester', size: 'small_suv_truck' },
  { make: 'Subaru', model: 'Outback', size: 'small_suv_truck' },
  { make: 'Hyundai', model: 'Tucson', size: 'small_suv_truck' },
  { make: 'Hyundai', model: 'Santa Fe', size: 'small_suv_truck' },
  { make: 'Kia', model: 'Sportage', size: 'small_suv_truck' },
  { make: 'Kia', model: 'Sorento', size: 'small_suv_truck' },
  { make: 'Ford', model: 'Escape', size: 'small_suv_truck' },
  { make: 'Ford', model: 'Maverick', size: 'small_suv_truck' },
  { make: 'Ford', model: 'Edge', size: 'small_suv_truck' },
  { make: 'Chevrolet', model: 'Equinox', size: 'small_suv_truck' },
  { make: 'Jeep', model: 'Cherokee', size: 'small_suv_truck' },
  { make: 'Tesla', model: 'Model Y', size: 'small_suv_truck' },
  { make: 'Lexus', model: 'RX', size: 'small_suv_truck' },
  { make: 'BMW', model: 'X3', size: 'small_suv_truck' },
  { make: 'Audi', model: 'Q5', size: 'small_suv_truck' },
  { make: 'Ford', model: 'F-150', size: 'large_suv_truck' },
  { make: 'Ram', model: '1500', size: 'large_suv_truck' },
  { make: 'Chevrolet', model: 'Silverado 1500', size: 'large_suv_truck' },
  { make: 'GMC', model: 'Sierra 1500', size: 'large_suv_truck' },
  { make: 'Toyota', model: 'Tundra', size: 'large_suv_truck' },
  { make: 'Nissan', model: 'Titan', size: 'large_suv_truck' },
  { make: 'Ford', model: 'Expedition', size: 'large_suv_truck' },
  { make: 'Chevrolet', model: 'Tahoe', size: 'large_suv_truck' },
  { make: 'Chevrolet', model: 'Suburban', size: 'large_suv_truck' },
  { make: 'GMC', model: 'Yukon', size: 'large_suv_truck' },
  { make: 'Cadillac', model: 'Escalade', size: 'large_suv_truck' },
  { make: 'Toyota', model: 'Sequoia', size: 'large_suv_truck' },
  { make: 'Honda', model: 'Odyssey', size: 'large_suv_truck' },
  { make: 'Toyota', model: 'Sienna', size: 'large_suv_truck' },
  { make: 'Mercedes-Benz', model: 'Sprinter', size: 'oversized' },
  { make: 'Ford', model: 'Transit', size: 'oversized' },
  { make: 'Chevrolet', model: 'Express', size: 'oversized' },
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
