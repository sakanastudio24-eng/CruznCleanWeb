import type { ServiceOption, VehicleSize } from '@/lib/booking-types';

export const SIZE_MULTIPLIERS: Record<VehicleSize, number> = {
  sedan_coupe: 1,
  small_suv_truck: 1.2,
  large_suv_truck: 1.4,
  oversized: 1.5,
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
  if (size === 'sedan_coupe') {
    return 'Base price';
  }

  const increase = Math.round((getSizeMultiplier(size) - 1) * 100);
  return `+${increase}% by size`;
}

export interface PricingServiceLine {
  service: ServiceOption;
  originalPrice: number;
  finalPrice: number;
  discountAmount: number;
}

export interface PricingSavingsLine {
  id: string;
  label: string;
  amount: number;
}

export interface PricingSuggestion {
  id: string;
  title: string;
  detail: string;
  actionLabel: string;
  serviceIds: string[];
}

export interface VehiclePricingBreakdown {
  serviceLines: PricingServiceLine[];
  savingsLines: PricingSavingsLine[];
  subtotalBeforeSavings: number;
  savingsTotal: number;
  total: number;
  suggestion?: PricingSuggestion;
}

export interface GrandPricingBreakdown {
  vehicleBreakdowns: Record<string, VehiclePricingBreakdown>;
  savingsLines: PricingSavingsLine[];
  subtotalBeforeSavings: number;
  savingsTotal: number;
  total: number;
}

export const PAINT_COATING_SERVICE_IDS = ['coat-ceramic-3y', 'coat-ceramic-6y'] as const;
export const GLASS_COATING_SERVICE_IDS = ['coat-glass-basic', 'coat-glass-polish'] as const;
export const WHEEL_COATING_SERVICE_IDS = ['coat-wheel-face', 'coat-wheel-complete'] as const;
const COATING_SERVICE_IDS = [...PAINT_COATING_SERVICE_IDS, ...GLASS_COATING_SERVICE_IDS, ...WHEEL_COATING_SERVICE_IDS];
const SAVINGS_RATE = 0.2;

/**
 * Identifies paint correction services that unlock coating savings.
 */
export function isPaintCorrectionService(serviceId: string): boolean {
  return serviceId.startsWith('corr-');
}

/**
 * Identifies paint coating services eligible for correction-based savings.
 */
export function isPaintCoatingService(serviceId: string): boolean {
  return PAINT_COATING_SERVICE_IDS.includes(serviceId as (typeof PAINT_COATING_SERVICE_IDS)[number]);
}

/**
 * Identifies glass coating services used by the coating bundle rule.
 */
export function isGlassCoatingService(serviceId: string): boolean {
  return GLASS_COATING_SERVICE_IDS.includes(serviceId as (typeof GLASS_COATING_SERVICE_IDS)[number]);
}

/**
 * Identifies wheel coating services used by the coating bundle rule.
 */
export function isWheelCoatingService(serviceId: string): boolean {
  return WHEEL_COATING_SERVICE_IDS.includes(serviceId as (typeof WHEEL_COATING_SERVICE_IDS)[number]);
}

/**
 * Returns passive savings tags for service cards without turning incentives into a promo section.
 */
export function getServiceSavingsTags(serviceId: string): string[] {
  if (isPaintCoatingService(serviceId)) {
    return ['20% with Paint Correction', 'Bundle Savings'];
  }

  if (isGlassCoatingService(serviceId) || isWheelCoatingService(serviceId)) {
    return ['Bundle Savings'];
  }

  return [];
}

/**
 * Builds one active-vehicle pricing breakdown with automatic non-stacking savings.
 */
export function getVehiclePricingBreakdown(services: ServiceOption[], size: VehicleSize): VehiclePricingBreakdown {
  const selectedIds = services.map((service) => service.id);
  const hasCorrection = selectedIds.some(isPaintCorrectionService);
  const hasPaintCoating = selectedIds.some(isPaintCoatingService);
  const hasGlassCoating = selectedIds.some(isGlassCoatingService);
  const hasWheelCoating = selectedIds.some(isWheelCoatingService);
  const hasAnyCoating = selectedIds.some((serviceId) => COATING_SERVICE_IDS.includes(serviceId as (typeof COATING_SERVICE_IDS)[number]));
  const bundleQualified = hasPaintCoating && hasGlassCoating && hasWheelCoating;

  const eligibleForBundle = (serviceId: string) =>
    isPaintCoatingService(serviceId) || isGlassCoatingService(serviceId) || isWheelCoatingService(serviceId);
  const eligibleForCorrection = (serviceId: string) => hasCorrection && isPaintCoatingService(serviceId);
  const savingsLabel = bundleQualified ? 'Bundle Savings Applied' : 'Correction Coating Savings Applied';
  const shouldDiscount = (serviceId: string) => (bundleQualified ? eligibleForBundle(serviceId) : eligibleForCorrection(serviceId));

  const serviceLines = services.map((service) => {
    const originalPrice = getAdjustedServicePrice(service.price, size);
    const discountAmount = shouldDiscount(service.id) ? Math.round(originalPrice * SAVINGS_RATE) : 0;

    return {
      service: {
        ...service,
        price: originalPrice - discountAmount,
      },
      originalPrice,
      finalPrice: originalPrice - discountAmount,
      discountAmount,
    };
  });

  const subtotalBeforeSavings = serviceLines.reduce((sum, line) => sum + line.originalPrice, 0);
  const savingsTotal = serviceLines.reduce((sum, line) => sum + line.discountAmount, 0);
  const savingsLines = savingsTotal > 0 ? [{ id: bundleQualified ? 'coating-bundle' : 'correction-coating', label: savingsLabel, amount: savingsTotal }] : [];
  const missingBundleGroups = [
    hasPaintCoating ? null : 'paint coating',
    hasGlassCoating ? null : 'glass coating',
    hasWheelCoating ? null : 'wheel coating',
  ].filter((group): group is string => Boolean(group));

  let suggestion: PricingSuggestion | undefined;
  if (hasCorrection && !hasPaintCoating) {
    suggestion = {
      id: 'add-paint-coating',
      title: 'Unlock paint coating savings',
      detail: 'Add a 3 Year or 6 Year Ceramic Coating to optimize this correction package',
      actionLabel: 'Add Ceramic Coating',
      serviceIds: ['coat-ceramic-3y'],
    };
  } else if (hasAnyCoating && !bundleQualified) {
    const serviceIds = [
      hasPaintCoating ? null : 'coat-ceramic-3y',
      hasGlassCoating ? null : 'coat-glass-basic',
      hasWheelCoating ? null : 'coat-wheel-face',
    ].filter((serviceId): serviceId is string => Boolean(serviceId));

    suggestion = {
      id: 'complete-coating-bundle',
      title: 'Complete coating bundle',
      detail: `Add ${missingBundleGroups.join(' + ')} to apply 20% coating bundle savings.`,
      actionLabel: 'Complete Bundle',
      serviceIds,
    };
  }

  return {
    serviceLines,
    savingsLines,
    subtotalBeforeSavings,
    savingsTotal,
    total: subtotalBeforeSavings - savingsTotal,
    suggestion,
  };
}

/**
 * Combines per-vehicle pricing into one grand booking breakdown.
 */
export function getGrandPricingBreakdown(
  vehicleBreakdowns: Record<string, VehiclePricingBreakdown>,
): GrandPricingBreakdown {
  const breakdowns = Object.values(vehicleBreakdowns);
  const subtotalBeforeSavings = breakdowns.reduce((sum, breakdown) => sum + breakdown.subtotalBeforeSavings, 0);
  const savingsTotal = breakdowns.reduce((sum, breakdown) => sum + breakdown.savingsTotal, 0);

  return {
    vehicleBreakdowns,
    savingsLines: breakdowns.flatMap((breakdown) => breakdown.savingsLines),
    subtotalBeforeSavings,
    savingsTotal,
    total: subtotalBeforeSavings - savingsTotal,
  };
}
