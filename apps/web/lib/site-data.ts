import { getPackageServices } from '@/lib/services-catalog';

export interface ServiceItem {
  id: string;
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
  rating: string;
  quote: string;
}

/**
 * Returns core service cards for the homepage teaser.
 */
export function getHomeServices(): ServiceItem[] {
  const descriptionById: Record<string, string> = {
    'pkg-mini': 'Quick exterior wash, vacuum, and light cleanup for vehicles that just need to look presentable again',
    'pkg-maintenance': 'Our most balanced upkeep detail for maintained vehicles that need consistent care',
    'pkg-full-reset': 'Full interior and exterior coverage when the vehicle needs the complete treatment',
  };

  return getPackageServices().map((service) => ({
    id: service.id,
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
      title: 'Paint Correction Results',
      detail: 'Daily-driven paint improved into a sharper finish with stronger gloss and reflection',
    },
    {
      title: 'Interior Detailing Results',
      detail: 'Cabins cleaned for better touchpoints, fresher fabric, and a more comfortable in-car feel',
    },
    {
      title: 'Ceramic Protection Added',
      detail: 'Sealants and coatings applied to help defend against road film, dust, and Southern California sun exposure',
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
      detail: 'Review packages, correction work, and coatings for each vehicle using the service planner',
    },
    {
      title: 'Submit Booking',
      detail: 'Send vehicle details, contact info, and service notes in one intake flow',
    },
    {
      title: 'Pay Your Deposit',
      detail: 'Choose the appointment time and pay the deposit through Stripe after scheduling is confirmed',
    },
  ];
}

/**
 * Returns testimonial highlights for trust and social proof.
 */
export function getHomeTestimonials(): TestimonialItem[] {
  return [
    {
      name: 'Jay Davis',
      rating: '5 star rating',
      quote:
        'I’ve had my car detailed a few times in the past but haven’t had the attentiveness and level of detail from Brian. Will def recommend and utilize his services in the future.',
    },
    {
      name: 'Shannon Kirkland',
      rating: '5 star rating',
      quote:
        'Brian has done an amazing job detailing my cars and I recommend him to everyone I know! He’s reliable, on time and offers fair pricing with monthly packages! He’s extremely knowledgeable and my referred friends and family have also been very happy.',
    },
    {
      name: 'Randy H',
      rating: '5 star rating',
      quote: 'Excellent service and results. Highly satisfied.',
    },
  ];
}
