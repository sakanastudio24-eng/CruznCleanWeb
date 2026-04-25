'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useBooking } from '@/components/providers/booking-provider';
import { getHomeServices } from '@/lib/site-data';

/**
 * Renders package cards previewed on the homepage.
 */
export function ServicesSection(): JSX.Element {
  const services = getHomeServices();
  const router = useRouter();
  const { vehicles, activeVehicleId, setActiveVehicleId, setVehiclePackage } = useBooking();

  /**
   * Seeds the selected homepage package into the active or first vehicle before moving to Services.
   */
  function handleSelectPackage(packageId: string): void {
    const targetVehicle = vehicles.find((vehicle) => vehicle.id === activeVehicleId) ?? vehicles[0];

    if (!targetVehicle) {
      router.push('/services');
      return;
    }

    setActiveVehicleId(targetVehicle.id);
    setVehiclePackage(targetVehicle.id, packageId);
    router.push('/services');
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="fade-in-up mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fog">Detail Packages</p>
          <h2 className="mt-2 font-heading text-3xl font-semibold text-white sm:text-4xl">Choose your service level</h2>
        </div>
        <Link href="/services" className="text-sm font-semibold text-fog transition duration-300 hover:text-white">
          Full service menu
        </Link>
      </div>
      <div className="grid gap-4 lg:grid-cols-6">
        {services.map((service, index) => (
          <button
            key={service.title}
            type="button"
            onClick={() => handleSelectPackage(service.id)}
            className={`fade-in-up rounded-2xl border border-white/10 bg-[#111111] p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-lg lg:col-span-2 ${
              index === 3 ? 'lg:col-start-2' : ''
            } text-left`}
            style={{ animationDelay: `${index * 120}ms` }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-fog">from {service.priceFrom}</p>
            <h3 className="mt-2 font-heading text-2xl font-semibold text-white">{service.title}</h3>
            <p className="mt-2 text-sm text-white/72">{service.description}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
