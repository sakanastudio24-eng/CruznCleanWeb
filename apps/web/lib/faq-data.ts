import { getServiceAreaCitySummary, getServiceAreaZipSummary } from '@/lib/service-area';

export interface FaqRecord {
  q: string;
  a: string;
  category: 'booking' | 'services' | 'pricing' | 'preparation' | 'maintenance' | 'service-area';
}

/**
 * Returns FAQ records used by category filtering and public FAQ schema.
 */
export function getFaqRecords(): FaqRecord[] {
  return [
    { q: 'How many vehicles can I submit in one day?', a: 'The booking flow supports up to 4 vehicles per customer per day, and actual capacity depends on the length of the selected services.', category: 'booking' },
    { q: 'What are your booking hours?', a: 'Standard booking hours are Monday through Saturday from 8am to 6pm.', category: 'booking' },
    { q: 'How long do the main services take?', a: 'Maintenance Detail is roughly 90 minutes. Full Interior or Full Exterior is about 3 hours. A Full Reset usually lands around 6 to 8 hours depending on condition.', category: 'services' },
    { q: 'Can I book coatings or paint correction without a detail package?', a: 'Yes. Protection and correction services can be booked on their own, though final prep requirements are confirmed after inspection.', category: 'services' },
    {
      q: 'What service areas can book online?',
      a: `Online booking is focused on these service-area cities: ${getServiceAreaCitySummary()}. Standard online ZIP coverage includes ${getServiceAreaZipSummary()}. If your ZIP is outside that area, request a quote so travel and availability can be reviewed.`,
      category: 'service-area',
    },
    {
      q: 'What if my ZIP code is outside the service area?',
      a: 'Use Request a Quote instead of standard booking. Outside-area appointments may still be possible, but they need a manual review for travel time, scheduling, and final approval.',
      category: 'service-area',
    },
    { q: 'How does pricing change by vehicle size?', a: 'Listed pricing starts with sedans and coupes. Small SUVs and trucks add 20%, large SUVs and trucks add 40%, and vans or very lifted vehicles add 50%.', category: 'pricing' },
    { q: 'How is final pricing confirmed?', a: 'Final pricing is confirmed after inspection and may increase for larger vehicles, excess dirt, pet hair, staining, ride height, or condition-related labor.', category: 'pricing' },
    { q: 'Do you need water or power on-site?', a: 'You do not need to provide water. Share access, parking, gate, or setup notes during booking so the appointment can be approved correctly.', category: 'preparation' },
    {
      q: 'How should I prepare my vehicle before appointment time?',
      a: 'Remove loose items and personal belongings before arrival. Full compartments will not be cleaned, and the vehicle should be parked in an accessible location with at least 8 feet of clearance from other vehicles.',
      category: 'preparation',
    },
    {
      q: 'What should I do while the service is being completed?',
      a: 'Please stay clear of the vehicle during active service to help prevent accidents or injury. Have the keys ready at the scheduled time and be available for any needed approval.',
      category: 'preparation',
    },
    {
      q: 'Can my quote change after booking?',
      a: 'Yes. The service quote is subject to change if the vehicle was booked incorrectly, condition is different than described, or the job needs extended attention after inspection.',
      category: 'pricing',
    },
    {
      q: 'Does my deposit need to be confirmed?',
      a: 'Yes. After your Cal.com scheduling step is confirmed, the Pay Deposit button appears. Deposit confirmation is required before the appointment is treated as locked in.',
      category: 'booking',
    },
    {
      q: 'What should I know about coatings and correction results?',
      a: 'Paint correction improves defects but may not remove every scratch or imperfection. Ceramic coating longevity depends on aftercare and environmental exposure.',
      category: 'preparation',
    },
    { q: 'How often should I book a maintenance detail?', a: 'Most maintained vehicles benefit from recurring service every 4 to 8 weeks, depending on driving conditions and storage habits.', category: 'maintenance' },
    { q: 'What payment methods do you accept?', a: 'Deposits are paid online through Stripe. Any remaining balance can be handled through the accepted payment options confirmed by Cruizn Clean.', category: 'maintenance' },
  ];
}
