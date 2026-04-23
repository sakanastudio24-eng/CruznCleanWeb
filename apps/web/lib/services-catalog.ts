import type { ServiceOption } from '@/lib/booking-types';

export const SERVICES: ServiceOption[] = [
  {
    id: 'pkg-mini',
    name: 'Mini Detail',
    description: 'Friendly reset for vehicles that do not need a perfection-level detail.',
    price: 60,
    category: 'package',
    duration: 'About 60-90 mins',
    highlights: [
      'Foam Bath + Hand Wash',
      'Wheels + Tires Clean',
      'Tire shine',
      'Light Wipe down + Vacuum',
      '1 month spray wax',
    ],
  },
  {
    id: 'pkg-maintenance',
    name: 'Maintenance Detail',
    description: 'Built for maintained cars that need a dependable inside-out reset.',
    price: 99,
    category: 'package',
    duration: 'About 90 mins',
    highlights: [
      'Designed for maintained cars',
      'Foam Bath + Hand Wash',
      'Wheels + Tires Clean',
      'Scrub/Wipe Down + Vacuum',
      'Tire Shine',
      '3 Months Ceramic Sealant',
    ],
  },
  {
    id: 'pkg-full-interior',
    name: 'Full Interior',
    description: 'Deep interior service for fabric, leather, odor, and full touchpoint reset.',
    price: 179,
    category: 'package',
    duration: 'About 3 hrs',
    highlights: [
      'Vacuum',
      'Upholstery + Carpet Shampoo/Extraction',
      'Thorough scrub/wipe down of full interior',
      'Odor Improvement',
      'Clean Door jambs',
      'Clean Windows',
      'Leather conditioner (if applicable)',
    ],
  },
  {
    id: 'pkg-full-exterior',
    name: 'Full Exterior',
    description: 'Exterior decontamination, gloss enhancement, and durable protection.',
    price: 279,
    category: 'package',
    duration: 'About 3 hrs',
    highlights: [
      'Foam Bath + Hand Wash',
      'Wheels + Tires Clean',
      'Clay Bar + Iron Decon',
      'Light gloss enhancing polish',
      '12 months Graphene Ceramic Sealant',
      'Plastic trim conditioner',
      'Clean windows',
    ],
  },
  {
    id: 'pkg-full-reset',
    name: 'The Full Reset',
    description: 'Full interior and exterior coverage for a complete vehicle reset.',
    price: 399,
    category: 'package',
    duration: 'About 6-8 hrs',
    highlights: [
      'Full Interior',
      'Full Exterior',
    ],
  },
  {
    id: 'coat-ceramic-3y',
    name: '3 Year Ceramic Coating',
    description: 'Longer-term coating for painted surfaces after required prep.',
    price: 499,
    category: 'protection',
    duration: 'Requires prep',
    highlights: [
      'Covers painted surfaces',
    ],
  },
  {
    id: 'coat-ceramic-6y',
    name: '6 Year Ceramic Coating',
    description: 'Extended coating package for painted surfaces after prep and inspection.',
    price: 799,
    category: 'protection',
    duration: 'Requires prep',
    highlights: [
      'Covers painted surfaces',
    ],
  },
  {
    id: 'coat-wheel-face',
    name: 'Wheel Face Ceramic Coating',
    description: 'Focused wheel-face protection for the visible outer surface.',
    price: 249,
    category: 'protection',
    duration: 'Adds specialty time',
    highlights: [
      'Covers visible face of wheel',
    ],
  },
  {
    id: 'coat-wheel-complete',
    name: 'Wheel Face + Barrel + Caliper Ceramic Coating',
    description: 'Wheel-off coating service for the full visible wheel and caliper area.',
    price: 499,
    category: 'protection',
    duration: 'Wheel-off service',
    highlights: [
      'Wheels off car on jack stands',
      'Covers Visible Face of wheel + Barrel of wheel + Calipers',
    ],
  },
  {
    id: 'coat-glass-basic',
    name: 'Glass Ceramic Coating',
    description: 'Exterior glass coating when no corrective polish is needed.',
    price: 200,
    category: 'protection',
    duration: 'No polish needed',
    highlights: [
      'Coats Exterior of windows',
      'Long lasting "invisible" windows',
    ],
  },
  {
    id: 'coat-glass-polish',
    name: 'Glass Ceramic Coating + Polish',
    description: 'Exterior glass coating with prep polish when the glass needs correction.',
    price: 279,
    category: 'protection',
    duration: 'Includes polish',
    highlights: [
      'Coats Exterior of windows',
      'Long lasting "invisible" windows',
      'Includes polish when needed',
    ],
  },
  {
    id: 'corr-1-step',
    name: '1 Step Paint Correction',
    description: 'Single-step gloss enhancement for defect reduction after prep.',
    price: 449,
    category: 'correction',
    duration: 'Correction service',
    highlights: [
      'Deep Polish',
      'Removes 70-80% of Defects',
    ],
  },
  {
    id: 'corr-2-step',
    name: '2 Step Paint Correction',
    description: 'Cut and polish service for heavier defect reduction after prep.',
    price: 649,
    category: 'correction',
    duration: 'Correction service',
    highlights: [
      'Cut + Polish',
      'Removes 80-95% of Defects',
    ],
  },
  {
    id: 'corr-3-step',
    name: '3 Step Paint Correction',
    description: 'Deep cut, polish, and refining pass for the highest correction tier.',
    price: 799,
    category: 'correction',
    duration: 'Correction service',
    highlights: [
      'Deep Cut + Polish + Refining Polish',
      'Removes 95-99% of Defects',
    ],
  },
];

/**
 * Returns all package-level service options.
 */
export function getPackageServices(): ServiceOption[] {
  return SERVICES.filter((service) => service.category === 'package');
}

/**
 * Returns all protection and coating service options.
 */
export function getProtectionServices(): ServiceOption[] {
  return SERVICES.filter((service) => service.category === 'protection');
}

/**
 * Returns all paint-correction service options.
 */
export function getCorrectionServices(): ServiceOption[] {
  return SERVICES.filter((service) => service.category === 'correction');
}

/**
 * Looks up a service option by its unique id.
 */
export function findServiceById(serviceId: string): ServiceOption | undefined {
  return SERVICES.find((service) => service.id === serviceId);
}
