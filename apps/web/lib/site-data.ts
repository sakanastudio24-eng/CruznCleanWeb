import { getPackageServices } from '@/lib/services-catalog';

export interface ServiceItem {
  title: string;
  description: string;
  priceFrom: string;
}

export interface ResultItem {
  title: string;
  detail: string;
}

export interface ProcessItem {
  title: string;
  detail: string;
}

export interface TestimonialItem {
  name: string;
  quote: string;
  service: string;
}

/**
 * Returns core service cards for the homepage teaser.
 */
export function getHomeServices(): ServiceItem[] {
  const descriptionById: Record<string, string> = {
    'pkg-mini': 'Quick exterior wash, vacuum, and light reset for vehicles that just need to look presentable again.',
    'pkg-maintenance': 'Our most balanced upkeep detail for maintained vehicles that need consistent care.',
    'pkg-full-reset': 'Full interior and exterior coverage when the vehicle needs the full day reset.',
  };

  return getPackageServices().map((service) => ({
    title: service.name,
    description: descriptionById[service.id] ?? service.description,
    priceFrom: `$${service.price}`,
  }));
}

/**
 * Returns key outcome highlights displayed in the homepage results section.
 */
export function getHomeResults(): ResultItem[] {
  return [
    {
      title: 'Paint Clarity Restored',
      detail: 'Daily-driven paint corrected into a cleaner, sharper finish with stronger gloss and reflection.',
    },
    {
      title: 'Interior Reset',
      detail: 'Cabins reset for cleaner touchpoints, fresher fabric, and a calmer in-car feel.',
    },
    {
      title: 'Protection Layered',
      detail: 'Sealants and coatings added to help defend against road film, dust, and Southern California sun exposure.',
    },
  ];
}

/**
 * Returns the customer journey steps featured on the homepage.
 */
export function getHomeProcess(): ProcessItem[] {
  return [
    {
      title: 'Choose Service Plan',
      detail: 'Review packages, correction work, and coatings for each vehicle using the service planner.',
    },
    {
      title: 'Submit Booking Intake',
      detail: 'Send vehicle details, contact info, and service notes in one intake flow.',
    },
    {
      title: 'Confirm on Cal.com',
      detail: 'Choose the final appointment time through Cal.com after the intake is saved.',
    },
  ];
}

/**
 * Returns testimonial highlights for trust and social proof.
 */
export function getHomeTestimonials(): TestimonialItem[] {
  return [
    {
      name: 'Jordan R.',
      quote: 'The sedan looked sharper the same afternoon, and the booking flow stayed simple from phone to calendar.',
      service: 'Maintenance Detail',
    },
    {
      name: 'Amanda T.',
      quote: 'Clear pricing, quick scheduling, and the SUV came back looking noticeably cleaner than expected.',
      service: 'Full Exterior + 3 Year Ceramic Coating',
    },
    {
      name: 'Chris M.',
      quote: 'Setting up two vehicles in one booking felt organized instead of messy.',
      service: 'Two-Vehicle Booking',
    },
  ];
}
