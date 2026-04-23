import type { ServiceOption } from '@/lib/booking-types';

export const SERVICES: ServiceOption[] = [
  {
    id: 'pkg-basic',
    name: 'Basic Detail',
    description: 'Exterior wash, interior vacuum, windows, and tire shine.',
    price: 99,
    category: 'package',
    duration: '2-3 hrs',
  },
  {
    id: 'pkg-standard',
    name: 'Standard Detail',
    description: 'Includes basic package plus wax, clay bar, and deeper interior reset.',
    price: 189,
    category: 'package',
    duration: '4 hrs',
  },
  {
    id: 'pkg-premium',
    name: 'Premium Detail',
    description: 'Showroom package with advanced correction and protection layers.',
    price: 349,
    category: 'package',
    duration: '6 hrs',
  },
  {
    id: 'addon-ceramic',
    name: 'Ceramic Coating',
    description: 'Adds durable hydrophobic protection and easier maintenance.',
    price: 500,
    category: 'addon',
    duration: 'Adds 2-3 hrs',
  },
  {
    id: 'addon-headlight',
    name: 'Headlight Restoration',
    description: 'Improves clarity and nighttime visibility.',
    price: 75,
    category: 'addon',
    duration: 'Adds 45 mins',
  },
  {
    id: 'addon-air',
    name: 'Air Freshening Treatment',
    description: 'Ozone treatment to remove stubborn odors.',
    price: 125,
    category: 'addon',
    duration: 'Adds 1 hr',
  },
  {
    id: 'addon-engine',
    name: 'Engine Bay Detail',
    description: 'Controlled cleaning and dressing for bay presentation.',
    price: 100,
    category: 'addon',
    duration: 'Adds 1 hr',
  },
];

/**
 * Returns all package-level service options.
 */
export function getPackageServices(): ServiceOption[] {
  return SERVICES.filter((service) => service.category === 'package');
}

/**
 * Returns all add-on service options.
 */
export function getAddonServices(): ServiceOption[] {
  return SERVICES.filter((service) => service.category === 'addon');
}

/**
 * Looks up a service option by its unique id.
 */
export function findServiceById(serviceId: string): ServiceOption | undefined {
  return SERVICES.find((service) => service.id === serviceId);
}
