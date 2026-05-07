import type { VehicleProfile } from '@/lib/booking-types';
import { findVehicleGuideMatch, type VehicleGuideEntry } from '@/lib/vehicle-size-guide';

/**
 * Returns a readable vehicle display label from known profile fields.
 */
export function getVehicleDisplayName(vehicle: VehicleProfile): string {
  if (vehicle.customLabel?.trim()) {
    return vehicle.customLabel.trim();
  }

  const details = [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ');
  if (details.trim().length > 0) {
    return details;
  }

  return vehicle.label;
}

/**
 * Returns an exact guide match when the current vehicle fields identify a supported standard vehicle.
 */
export function getStandardVehicleGuideMatch(vehicle: VehicleProfile): VehicleGuideEntry | undefined {
  const match = findVehicleGuideMatch(vehicle.make, vehicle.model);
  return match?.size === 'oversized' ? undefined : match;
}

/**
 * Returns true when the guide owns the vehicle size and the customer should not change it.
 */
export function isVehicleGuideSizeLocked(vehicle: VehicleProfile): boolean {
  if (vehicle.customLabel?.trim() || vehicle.sizeSource === 'manual') {
    return false;
  }

  const match = getStandardVehicleGuideMatch(vehicle);
  return Boolean(match && vehicle.size === match.size);
}

/**
 * Returns true when a custom or unsupported vehicle still needs an explicit size pick.
 */
export function needsManualVehicleSize(vehicle: VehicleProfile): boolean {
  if (vehicle.sizeSource === 'manual' || isVehicleGuideSizeLocked(vehicle)) {
    return false;
  }

  return Boolean(vehicle.customLabel?.trim() || (vehicle.make.trim() && vehicle.model.trim()));
}
