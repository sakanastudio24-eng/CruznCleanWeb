import type { VehicleProfile } from '@/lib/booking-types';

export const MAX_BOOKED_VEHICLES_PER_DAY = 3;
export const BOOKING_LIMIT_DISCLAIMER = 'Maximum 3 vehicles per customer per day.';

/**
 * Counts only vehicles that currently have at least one selected service.
 */
export function countSelectedVehicles(vehicles: VehicleProfile[]): number {
  return vehicles.filter((vehicle) => vehicle.serviceIds.length > 0).length;
}
