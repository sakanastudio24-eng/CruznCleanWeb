import { SiteShell } from '@/components/layout/site-shell';

interface PolicySection {
  title: string;
  points: string[];
}

const POLICY_SECTIONS: PolicySection[] = [
  {
    title: '1. Appointments & Scheduling',
    points: [
      'All appointments must be booked in advance.',
      'Same-day booking requests may require rush fees.',
      'A confirmation is sent after the booking is approved.',
      'Please be on time or prepared for arrival to avoid delays or rescheduling.',
    ],
  },
  {
    title: '2. Deposits',
    points: [
      'A non-refundable deposit of $25-$100 may be required to secure your appointment.',
      'Any required deposit is applied toward the total service cost.',
      'No deposit means the booking is not guaranteed.',
    ],
  },
  {
    title: '3. Cancellations & Rescheduling',
    points: [
      'At least 24 hours notice is required to cancel or reschedule.',
      'Deposits may be forfeited for late cancellations or no-shows.',
      'Emergencies are handled case-by-case.',
    ],
  },
  {
    title: '4. Pricing',
    points: [
      'Listed prices are starting prices for sedans and coupes.',
      'Small SUVs and trucks add 20%, large SUVs and trucks add 40%, and vans or very lifted vehicles add 50%.',
      'Pricing can increase based on vehicle size, ride height, excess dirt, grime, stains, pet hair, or condition.',
      'Final price is confirmed after inspection.',
    ],
  },
  {
    title: '5. Vehicle Condition',
    points: [
      'Remove personal belongings before the appointment. Full compartments will not be cleaned.',
      'Cruzn Clean is not responsible for lost or damaged personal items left in the vehicle.',
    ],
  },
  {
    title: '6. Service Limitations',
    points: [
      'Best-effort results are provided, but not all stains, scratches, or imperfections can be fully removed.',
      'Paint correction and polishing improve defects but may not eliminate them completely.',
    ],
  },
  {
    title: '7. Ceramic Coating / Protection Services',
    points: [
      'Proper aftercare is required to maintain durability.',
      'Longevity claims such as 3-year or 6-year coatings depend on maintenance and environmental conditions.',
      'There are no guarantees against improper care after service completion.',
    ],
  },
  {
    title: '8. Weather Policy (Mobile Services)',
    points: [
      'Appointments may be rescheduled due to rain, extreme heat, or unsafe conditions.',
      'Cruzn Clean will contact you as early as possible if weather requires a change.',
    ],
  },
  {
    title: '9. Payment',
    points: [
      'Payment is due upon completion unless otherwise agreed.',
      'Accepted forms: Cash, Zelle, Venmo, Cash App, and PayPal.',
      'Debit and credit support may be added later through the booking site.',
      'Checks are not accepted.',
    ],
  },
  {
    title: '10. Satisfaction Guarantee',
    points: [
      'If you are not satisfied, notify Cruzn Clean before leaving or within 24 hours.',
      'Reasonable concerns are reviewed and addressed, though additional charges may apply for added scope.',
    ],
  },
  {
    title: '11. Liability',
    points: [
      'Pre-existing damage is documented before service when visible.',
      'Cruzn Clean is not responsible for damage caused by faulty parts, aftermarket installs, or prior vehicle conditions.',
    ],
  },
  {
    title: '12. Right to Refuse Service',
    points: [
      'Service may be refused or rescheduled for unsafe conditions.',
      'Service may be refused for biohazards, including mold or bodily fluids.',
      'Service may be refused for disrespectful behavior.',
      'Service may be refused when the vehicle was described inaccurately before scheduling.',
    ],
  },
];

/**
 * Renders the client-facing terms and policy summary for booking and mobile service.
 */
export default function TermsPage(): JSX.Element {
  return (
    <SiteShell>
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <h1 className="font-heading text-3xl font-extrabold text-ink sm:text-4xl">Terms of Service</h1>
        <p className="mt-4 text-sm text-ink/75">
          These terms outline appointment approval, pricing, deposits, weather rescheduling, and service limits for Cruzn Clean mobile detailing.
        </p>

        <div className="mt-8 space-y-4">
          {POLICY_SECTIONS.map((section) => (
            <section key={section.title} className="rounded-2xl border border-black/10 bg-white p-5">
              <h2 className="font-heading text-xl font-semibold text-ink">{section.title}</h2>
              <ul className="mt-3 space-y-2 text-sm text-ink/75">
                {section.points.map((point) => (
                  <li key={point}>• {point}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
