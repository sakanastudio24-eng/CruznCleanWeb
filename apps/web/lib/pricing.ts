import type { VehicleSize } from '@/lib/booking-types';

export const SIZE_MULTIPLIERS: Record<VehicleSize, number> = {
  small: 1,
  medium: 1.15,
  large: 1.3,
};

/**
 * Returns the configured multiplier for a vehicle size tier.
 */
export function getSizeMultiplier(size: VehicleSize): number {
  return SIZE_MULTIPLIERS[size];
}

/**
 * Returns one adjusted service price using size-based multiplier and whole-dollar rounding.
 */
export function getAdjustedServicePrice(basePrice: number, size: VehicleSize): number {
  return Math.round(basePrice * getSizeMultiplier(size));
}

/**
 * Returns a compact UI label representing size-based price change.
 */
export function formatSizeAdjustmentLabel(size: VehicleSize): string {
  if (size === 'small') {
    return 'Base price';
  }

  const increase = Math.round((getSizeMultiplier(size) - 1) * 100);
  return `+${increase}% by size`;
}
