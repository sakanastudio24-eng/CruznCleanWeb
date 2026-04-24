'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import { MAX_BOOKED_VEHICLES_PER_DAY } from '@/lib/booking-policy';
import type { ServiceOption, VehicleProfile, VehicleSize } from '@/lib/booking-types';
import { getAdjustedServicePrice } from '@/lib/pricing';
import { findServiceById } from '@/lib/services-catalog';

interface BookingContextValue {
  vehicles: VehicleProfile[];
  activeVehicleId: string;
  setActiveVehicleId: (vehicleId: string) => void;
  addVehicle: () => void;
  removeVehicle: (vehicleId: string) => void;
  updateVehicle: (vehicleId: string, updates: Partial<VehicleProfile>) => void;
  setVehiclePackage: (vehicleId: string, packageId: string) => void;
  toggleServiceForVehicle: (vehicleId: string, service: ServiceOption) => void;
  getVehicleTotal: (vehicleId: string) => number;
  getGrandTotal: () => number;
  getVehicleServices: (vehicleId: string) => ServiceOption[];
  getSelectedServiceCount: () => number;
  clearAll: () => void;
}

interface BookingProviderProps {
  children: React.ReactNode;
}

const STORAGE_KEY = 'cruzn-clean-booking-v2';

const BookingContext = createContext<BookingContextValue | undefined>(undefined);

/**
 * Creates a default vehicle profile for new entries in the dock.
 */
function createDefaultVehicle(index: number): VehicleProfile {
  return {
    id: `vehicle-${Date.now()}-${index}`,
    label: `Vehicle ${index + 1}`,
    make: '',
    model: '',
    year: '',
    color: '',
    size: 'sedan_coupe',
    serviceIds: [],
  };
}

/**
 * Normalizes persisted service IDs to supported catalog entries and one package max.
 */
function normalizeVehicleServices(serviceIds: string[]): string[] {
  const cleaned = serviceIds.filter(Boolean);
  const validServiceIds = cleaned.filter((serviceId) => Boolean(findServiceById(serviceId)));
  const selectedPackage = validServiceIds.find((serviceId) => serviceId.startsWith('pkg-'));
  const retainedOtherServices = validServiceIds.filter((serviceId) => !serviceId.startsWith('pkg-'));
  return selectedPackage ? [selectedPackage, ...retainedOtherServices] : retainedOtherServices;
}

/**
 * Maps persisted vehicle sizes from older storage versions onto the current 4-tier model.
 */
function normalizeVehicleSize(size: unknown): VehicleSize {
  if (size === 'sedan_coupe' || size === 'small_suv_truck' || size === 'large_suv_truck' || size === 'oversized') {
    return size;
  }

  if (size === 'small') {
    return 'sedan_coupe';
  }

  if (size === 'medium') {
    return 'small_suv_truck';
  }

  if (size === 'large') {
    return 'large_suv_truck';
  }

  return 'sedan_coupe';
}

/**
 * Provides multi-vehicle booking state for services and booking routes.
 */
export function BookingProvider({ children }: BookingProviderProps): JSX.Element {
  const [vehicles, setVehicles] = useState<VehicleProfile[]>([createDefaultVehicle(0)]);
  const [activeVehicleId, setActiveVehicleId] = useState<string>(vehicles[0].id);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as { vehicles: VehicleProfile[]; activeVehicleId: string };

      if (Array.isArray(parsed.vehicles) && parsed.vehicles.length > 0) {
        const normalizedVehicles = parsed.vehicles.map((vehicle, index) => ({
          ...createDefaultVehicle(index),
          ...vehicle,
          size: normalizeVehicleSize(vehicle.size),
          serviceIds: normalizeVehicleServices(Array.isArray(vehicle.serviceIds) ? vehicle.serviceIds : []),
        })).slice(0, MAX_BOOKED_VEHICLES_PER_DAY);
        const resolvedActiveVehicleId = normalizedVehicles.some((vehicle) => vehicle.id === parsed.activeVehicleId)
          ? parsed.activeVehicleId
          : normalizedVehicles[0].id;
        setVehicles(normalizedVehicles);
        setActiveVehicleId(resolvedActiveVehicleId);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ vehicles, activeVehicleId }));
  }, [activeVehicleId, vehicles]);

  /**
   * Adds a new vehicle to the customer dock and makes it active.
   */
  function addVehicle(): void {
    setVehicles((current) => {
      if (current.length >= MAX_BOOKED_VEHICLES_PER_DAY) {
        return current;
      }

      const nextVehicle = createDefaultVehicle(current.length);
      setActiveVehicleId(nextVehicle.id);
      return [...current, nextVehicle];
    });
  }

  /**
   * Removes an existing vehicle and reassigns active vehicle if needed.
   */
  function removeVehicle(vehicleId: string): void {
    setVehicles((current) => {
      if (current.length === 1) {
        return current;
      }

      const filtered = current.filter((vehicle) => vehicle.id !== vehicleId);
      if (activeVehicleId === vehicleId && filtered.length > 0) {
        setActiveVehicleId(filtered[0].id);
      }
      return filtered;
    });
  }

  /**
   * Updates editable vehicle details for the selected vehicle record.
   */
  function updateVehicle(vehicleId: string, updates: Partial<VehicleProfile>): void {
    setVehicles((current) =>
      current.map((vehicle) =>
        vehicle.id === vehicleId
          ? {
              ...vehicle,
              ...updates,
            }
          : vehicle,
      ),
    );
  }

  /**
   * Sets exactly one selected package for a vehicle while preserving non-package services.
   */
  function setVehiclePackage(vehicleId: string, packageId: string): void {
    setVehicles((current) =>
      current.map((vehicle) => {
        if (vehicle.id !== vehicleId) {
          return vehicle;
        }

        const retainedAddons = vehicle.serviceIds.filter((serviceId) => !serviceId.startsWith('pkg-'));
        return {
          ...vehicle,
          serviceIds: [packageId, ...retainedAddons],
        };
      }),
    );
  }

  /**
   * Adds or removes a service selection for one vehicle.
   */
  function toggleServiceForVehicle(vehicleId: string, service: ServiceOption): void {
    setVehicles((current) =>
      current.map((vehicle) => {
        if (vehicle.id !== vehicleId) {
          return vehicle;
        }

        const hasService = vehicle.serviceIds.includes(service.id);
        const nextServiceIds = hasService
          ? vehicle.serviceIds.filter((serviceId) => serviceId !== service.id)
          : [...vehicle.serviceIds, service.id];

        return {
          ...vehicle,
          serviceIds: nextServiceIds,
        };
      }),
    );
  }

  /**
   * Resolves selected service records for one vehicle.
   */
  function getVehicleServices(vehicleId: string): ServiceOption[] {
    const vehicle = vehicles.find((item) => item.id === vehicleId);
    if (!vehicle) {
      return [];
    }

    return vehicle.serviceIds
      .map((serviceId) => findServiceById(serviceId))
      .filter((service): service is ServiceOption => Boolean(service))
      .map((service) => ({
        ...service,
        price: getAdjustedServicePrice(service.price, vehicle.size),
      }));
  }

  /**
   * Calculates subtotal price for one vehicle by selected services.
   */
  function getVehicleTotal(vehicleId: string): number {
    return getVehicleServices(vehicleId).reduce((sum, service) => sum + service.price, 0);
  }

  /**
   * Calculates the grand total across all vehicles.
   */
  function getGrandTotal(): number {
    return vehicles.reduce((sum, vehicle) => sum + getVehicleTotal(vehicle.id), 0);
  }

  /**
   * Counts selected service rows across all vehicles.
   */
  function getSelectedServiceCount(): number {
    return vehicles.reduce((count, vehicle) => count + vehicle.serviceIds.length, 0);
  }

  /**
   * Clears dock state and resets to a single empty vehicle.
   */
  function clearAll(): void {
    const fallback = createDefaultVehicle(0);
    setVehicles([fallback]);
    setActiveVehicleId(fallback.id);
  }

  const value: BookingContextValue = {
    vehicles,
    activeVehicleId,
    setActiveVehicleId,
    addVehicle,
    removeVehicle,
    updateVehicle,
    setVehiclePackage,
    toggleServiceForVehicle,
    getVehicleTotal,
    getGrandTotal,
    getVehicleServices,
    getSelectedServiceCount,
    clearAll,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

/**
 * Returns the booking context and enforces provider presence.
 */
export function useBooking(): BookingContextValue {
  const context = useContext(BookingContext);

  if (!context) {
    throw new Error('useBooking must be used within BookingProvider.');
  }

  return context;
}
