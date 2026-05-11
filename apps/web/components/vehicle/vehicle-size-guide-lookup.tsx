'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { useMemo, useState, type KeyboardEvent } from 'react';

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
  onApplyTypedVehicle?: (details: { label: string; year?: string; make?: string; model?: string }) => void;
  className?: string;
  includeOversized?: boolean;
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
 * Converts free-form typed vehicle text into the existing year/make/model fields.
 */
function parseTypedVehicleDetails(value: string): { label: string; year?: string; make?: string; model?: string } | null {
  const cleanedValue = value.replace(/[^a-zA-Z0-9\s.'+-]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleanedValue) {
    return null;
  }

  const parts = cleanedValue.split(' ');
  const yearIndex = parts.findIndex((part) => /^(19|20)\d{2}$/.test(part));
  const year = yearIndex >= 0 ? parts[yearIndex] : undefined;
  const vehicleParts = yearIndex >= 0 ? parts.filter((_, index) => index !== yearIndex) : parts;

  if (vehicleParts.length === 0) {
    return null;
  }

  return {
    label: cleanedValue,
    year,
    make: vehicleParts[0],
    model: vehicleParts.slice(1).join(' ') || undefined,
  };
}

/**
 * Renders dual-format vehicle lookup with match status and mismatch support links.
 */
export function VehicleSizeGuideLookup({
  activeVehicle,
  onApplyLookupMatch,
  onApplyTypedVehicle,
  className = '',
  includeOversized = true,
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
  const selectedDropdownEntry =
    !activeVehicle.customLabel?.trim() && matchedByVehicleFields && (includeOversized || matchedByVehicleFields.size !== 'oversized')
      ? matchedByVehicleFields
      : undefined;
  const ambiguousVehicleMatch = useMemo(
    () => isVehicleGuideAmbiguous(activeVehicle.make, activeVehicle.model),
    [activeVehicle.make, activeVehicle.model],
  );

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    return searchVehicleGuide(searchQuery)
      .filter((entry) => includeOversized || entry.size !== 'oversized')
      .slice(0, 8);
  }, [includeOversized, searchQuery]);
  const typedVehicleDetails = useMemo(() => parseTypedVehicleDetails(searchQuery), [searchQuery]);

  const hasVehicleDetails = Boolean(activeVehicle.make.trim() || activeVehicle.model.trim() || activeVehicle.customLabel?.trim());
  const isCustomVehicle = Boolean(activeVehicle.customLabel?.trim());
  const showSupportLinks = ambiguousVehicleMatch || isCustomVehicle || (hasVehicleDetails && !matchedByVehicleFields) || activeVehicle.size === 'oversized';

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

  /**
   * Applies the typed finder text to the active vehicle when it is not in the guide.
   */
  function handleApplyTypedVehicle(): void {
    if (!typedVehicleDetails || !onApplyTypedVehicle) {
      return;
    }

    onApplyTypedVehicle(typedVehicleDetails);
    setSearchQuery(typedVehicleDetails.label);
  }

  /**
   * Applies the current finder value without requiring a visible secondary action.
   */
  function handleTypedVehicleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key !== 'Enter') {
      return;
    }

    if (searchResults.length === 1) {
      event.preventDefault();
      applyLookupEntry(searchResults[0]);
      return;
    }

    if (!typedVehicleDetails || !onApplyTypedVehicle) {
      return;
    }

    event.preventDefault();
    handleApplyTypedVehicle();
  }

  return (
    <div className={`rounded-xl border border-line bg-transparent p-3 ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Vehicle Lookup</p>

      <label className="mt-2 block text-xs font-semibold text-white/78">
        Quick Pick (Dropdown)
        <select
          value={selectedDropdownEntry && !ambiguousVehicleMatch ? getEntryValue(selectedDropdownEntry) : ''}
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
          {includeOversized ? (
            <optgroup label="Oversized">
              {groupedEntries.oversized.map((entry) => (
                <option key={getEntryValue(entry)} value={getEntryValue(entry)}>
                  {entry.make} {entry.model}
                </option>
              ))}
            </optgroup>
          ) : null}
        </select>
      </label>

      <div className="relative mt-3">
        <label className="block text-xs font-semibold text-white/78">
          Type Finder
          <div className="relative mt-1">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-ink/45" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={handleTypedVehicleKeyDown}
              placeholder="Type make or model (e.g. Camry, Model Y)"
              className="gray-field w-full rounded-lg py-2 pl-8 pr-3 text-sm"
            />
          </div>
          {onApplyTypedVehicle ? (
            <span className="mt-1 hidden text-[11px] font-medium text-white/68 sm:block">
              Press Enter to use typed vehicle details.
            </span>
          ) : null}
        </label>

        {onApplyTypedVehicle && typedVehicleDetails && searchResults.length === 0 ? (
          <button
            type="button"
            onClick={handleApplyTypedVehicle}
            className="mt-2 rounded-full bg-burgundy px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-burgundyAccent"
          >
            Use typed vehicle
          </button>
        ) : null}

        {searchQuery.trim() ? (
          <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 max-h-56 overflow-y-auto rounded-lg border border-line bg-[#141414] p-2 shadow-2xl">
            {searchResults.length > 0 ? (
              <div className="space-y-1">
                {searchResults.map((entry) => (
                  <button
                    key={getEntryValue(entry)}
                    type="button"
                    onClick={() => applyLookupEntry(entry)}
                    className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition hover:bg-burgundy/10"
                  >
                    <span className="text-ink">{entry.make} {entry.model}</span>
                    <span className="text-xs font-semibold text-ink/60">{SIZE_LABELS[entry.size]}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-white/72">Vehicle not in guide yet. Press Enter to use typed vehicle details.</p>
            )}
          </div>
        ) : null}
      </div>

      <div className={`mt-3 rounded-lg border px-3 py-2 text-xs ${
        ambiguousVehicleMatch
          ? 'border-burgundyAccent bg-burgundy/15 text-white'
          : matchedByVehicleFields
          ? 'border-burgundyAccent/55 bg-burgundy/10 text-white'
          : 'border-white/15 bg-white/[0.06] text-white/75'
      }`}>
        {ambiguousVehicleMatch ? (
          <>
            Multiple guide matches were found for this make/model
            Select the closest exact match from the dropdown or type finder before you continue
          </>
        ) : isCustomVehicle ? (
          'Custom vehicle.'
        ) : matchedByVehicleFields ? (
          <>
            Size set by vehicle guide:
            <span className="font-semibold"> {SIZE_LABELS[matchedByVehicleFields.size]}</span>
          </>
        ) : (
          hasVehicleDetails
            ? 'Vehicle not in guide yet. Choose the closest size category to continue.'
            : 'Select from the guide or type your vehicle.'
        )}
      </div>

      {showSupportLinks ? (
        <div className="mt-3 rounded-lg border border-line bg-[#141414] px-3 py-3 text-xs text-white/76">
          <p>For lifted, modified, or specialty vehicles, final pricing may be confirmed after inspection.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/quote" className="rounded-full bg-burgundy px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-burgundyAccent">
              Request a Quote
            </Link>
            <Link href="/faq" className="rounded-full border border-white/20 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:border-burgundyAccent hover:bg-burgundy/10">
              Review Help + FAQ
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
