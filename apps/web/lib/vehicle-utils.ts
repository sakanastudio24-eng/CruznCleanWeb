import type { VehicleProfile } from '@/lib/booking-types';

/**
 * Returns a readable vehicle display label from known profile fields.
 */
export function getVehicleDisplayName(vehicle: VehicleProfile): string {
  const details = [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ');
  if (details.trim().length > 0) {
    return details;
  }

  return vehicle.label;
}
