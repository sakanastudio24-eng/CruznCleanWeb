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
    'pkg-basic': 'Exterior wash, vacuum, windows, and tire shine for weekly upkeep.',
    'pkg-standard': 'Inside-out refresh with deep interior clean, clay bar, and wax protection.',
    'pkg-premium': 'Showroom-level correction and long-lasting surface protection package.',
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
      detail: 'Swirl-heavy surfaces transformed with deeper gloss and better reflection.',
    },
    {
      title: 'Interior Reset',
      detail: 'Fabric, plastics, and touchpoints cleaned for a fresh and odor-free cabin.',
    },
    {
      title: 'Protection Layered',
      detail: 'Finish sealed to resist weather, road film, and short-term contamination.',
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
      detail: 'Pick a package and add-ons for each vehicle using the service planner.',
    },
    {
      title: 'Submit Booking Intake',
      detail: 'Add contact, vehicle details, and service notes in the booking flow.',
    },
    {
      title: 'Confirm on Cal.com',
      detail: 'Select your final appointment slot through Cal.com after intake submission.',
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
      quote: 'Paint came back to life and the interior felt factory-new. Booking flow was easy.',
      service: 'Standard + Headlight Restoration',
    },
    {
      name: 'Amanda T.',
      quote: 'Fast response, clear pricing, and the SUV looked better than delivery day.',
      service: 'Premium + Ceramic Coating',
    },
    {
      name: 'Chris M.',
      quote: 'Loved that I could set up two cars in one booking without any confusion.',
      service: 'Two-Vehicle Booking',
    },
  ];
}
