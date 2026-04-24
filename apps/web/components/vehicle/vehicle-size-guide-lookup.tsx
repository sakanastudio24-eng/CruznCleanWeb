'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import type { VehicleProfile, VehicleSize } from '@/lib/booking-types';
import {
  VEHICLE_SIZE_GUIDE,
  findVehicleGuideMatches,
  isVehicleGuideAmbiguous,
  searchVehicleGuide,
  type VehicleGuideEntry,
} from '@/lib/vehicle-size-guide';

interface VehicleSizeGuideLookupProps {
  activeVehicle: VehicleProfile;
  onApplyLookupMatch: (match: { make: string; model: string; size: VehicleSize }) => void;
  className?: string;
}

const SIZE_LABELS: Record<VehicleSize, string> = {
  sedan_coupe: 'Sedan / Coupe',
  small_suv_truck: 'Small SUV / Truck',
  large_suv_truck: 'Large SUV / Truck',
  oversized: 'Oversized',
};

/**
 * Builds a stable select option value for one vehicle entry.
 */
function getEntryValue(entry: VehicleGuideEntry): string {
  return `${entry.make}:::${entry.model}`;
}

/**
 * Renders dual-format vehicle lookup with match status and mismatch support links.
 */
export function VehicleSizeGuideLookup({
  activeVehicle,
  onApplyLookupMatch,
  className = '',
}: VehicleSizeGuideLookupProps): JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');

  const groupedEntries = useMemo(() => {
    return {
      sedan_coupe: VEHICLE_SIZE_GUIDE.filter((entry) => entry.size === 'sedan_coupe'),
      small_suv_truck: VEHICLE_SIZE_GUIDE.filter((entry) => entry.size === 'small_suv_truck'),
      large_suv_truck: VEHICLE_SIZE_GUIDE.filter((entry) => entry.size === 'large_suv_truck'),
      oversized: VEHICLE_SIZE_GUIDE.filter((entry) => entry.size === 'oversized'),
    };
  }, []);

  const vehicleFieldMatches = useMemo(
    () => findVehicleGuideMatches(activeVehicle.make, activeVehicle.model),
    [activeVehicle.make, activeVehicle.model],
  );
  const matchedByVehicleFields = vehicleFieldMatches.length === 1 ? vehicleFieldMatches[0] : undefined;
  const ambiguousVehicleMatch = useMemo(
    () => isVehicleGuideAmbiguous(activeVehicle.make, activeVehicle.model),
    [activeVehicle.make, activeVehicle.model],
  );

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    return searchVehicleGuide(searchQuery).slice(0, 8);
  }, [searchQuery]);

  const needsSupportRouting = ambiguousVehicleMatch || !matchedByVehicleFields || activeVehicle.size === 'oversized';

  /**
   * Applies one lookup result to active vehicle make/model/size.
   */
  function applyLookupEntry(entry: VehicleGuideEntry): void {
    onApplyLookupMatch({ make: entry.make, model: entry.model, size: entry.size });
    setSearchQuery(`${entry.make} ${entry.model}`);
  }

  /**
   * Resolves dropdown selections into lookup entry application.
   */
  function handleSelectChange(value: string): void {
    if (!value) {
      return;
    }

    const foundEntry = VEHICLE_SIZE_GUIDE.find((entry) => getEntryValue(entry) === value);
    if (!foundEntry) {
      return;
    }

    applyLookupEntry(foundEntry);
  }

  return (
    <div className={`rounded-xl border border-white/10 bg-white/[0.06] p-3 ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/55">Vehicle Size Guide</p>

      <label className="mt-2 block text-xs font-semibold text-ink/70">
        Quick Pick (Dropdown)
        <select
          value={matchedByVehicleFields && !ambiguousVehicleMatch ? getEntryValue(matchedByVehicleFields) : ''}
          onChange={(event) => handleSelectChange(event.target.value)}
          className="gray-field mt-1 w-full rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Select from top 50 vehicles</option>
          <optgroup label="Sedan / Coupe">
            {groupedEntries.sedan_coupe.map((entry) => (
              <option key={getEntryValue(entry)} value={getEntryValue(entry)}>
                {entry.make} {entry.model}
              </option>
            ))}
          </optgroup>
          <optgroup label="Small SUV / Truck">
            {groupedEntries.small_suv_truck.map((entry) => (
              <option key={getEntryValue(entry)} value={getEntryValue(entry)}>
                {entry.make} {entry.model}
              </option>
            ))}
          </optgroup>
          <optgroup label="Large SUV / Truck">
            {groupedEntries.large_suv_truck.map((entry) => (
              <option key={getEntryValue(entry)} value={getEntryValue(entry)}>
                {entry.make} {entry.model}
              </option>
            ))}
          </optgroup>
          <optgroup label="Oversized">
            {groupedEntries.oversized.map((entry) => (
              <option key={getEntryValue(entry)} value={getEntryValue(entry)}>
                {entry.make} {entry.model}
              </option>
            ))}
          </optgroup>
        </select>
      </label>

      <label className="mt-3 block text-xs font-semibold text-ink/70">
        Type Finder
        <div className="relative mt-1">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-ink/45" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Type make or model (e.g. Camry, Model Y)"
            className="gray-field w-full rounded-lg py-2 pl-8 pr-3 text-sm"
          />
        </div>
      </label>

      {searchQuery.trim() ? (
        <div className="mt-2 rounded-lg border border-white/10 bg-[#111111] p-2">
          {searchResults.length > 0 ? (
            <div className="space-y-1">
              {searchResults.map((entry) => (
                <button
                  key={getEntryValue(entry)}
                  type="button"
                  onClick={() => applyLookupEntry(entry)}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition hover:bg-white/10"
                >
                  <span className="text-ink">{entry.make} {entry.model}</span>
                  <span className="text-xs font-semibold text-ink/60">{SIZE_LABELS[entry.size]}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-ink/65">No catalog match yet. Use the size cards on this page or request a custom quote for specialty vehicles.</p>
          )}
        </div>
      ) : null}

      <div className={`mt-3 rounded-lg border px-3 py-2 text-xs ${
        ambiguousVehicleMatch
          ? 'border-amber-300 bg-amber-50 text-amber-900'
          : matchedByVehicleFields
          ? 'border-green-300 bg-green-50 text-green-900'
          : 'border-white/15 bg-white/[0.06] text-white/75'
      }`}>
        {ambiguousVehicleMatch ? (
          <>
            Multiple guide matches were found for this make/model.
            Select the closest exact match from the dropdown or type finder before you continue.
          </>
        ) : matchedByVehicleFields ? (
          <>
            Matched <span className="font-semibold">{matchedByVehicleFields.make} {matchedByVehicleFields.model}</span> and applied
            <span className="font-semibold"> {SIZE_LABELS[matchedByVehicleFields.size]}</span> sizing guidance.
          </>
        ) : (
          'This vehicle is not in our standard sizing guide yet. Use the size cards on this page, or request a custom quote if the vehicle is modified, lifted, or specialty fitment.'
        )}
      </div>

      {needsSupportRouting ? (
        <div className="mt-3 rounded-lg border border-white/10 bg-[#111111] px-3 py-3 text-xs text-ink/75">
          <p className="font-semibold text-ink">Mismatch check</p>
          <p className="mt-1">
            If this vehicle has modifications, lift kits, oversized wheels, accessories, or anything else that changes service time, request a custom quote before booking.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/quote" className="rounded-full bg-charcoal px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-ink">
              Request a Quote
            </Link>
            <Link href="/faq" className="rounded-full border border-white/20 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-white/10">
              Review Help + FAQ
            </Link>
          </div>
        </div>
      ) : null}

      <p className="mt-2 text-[11px] text-ink/55">
        Model-level matching only in v1. When your exact vehicle is not listed, confirm fitment through Quote or FAQ before submitting.
      </p>
    </div>
  );
}
