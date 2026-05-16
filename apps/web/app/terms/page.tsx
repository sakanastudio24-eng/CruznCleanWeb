import { SiteShell } from '@/components/layout/site-shell';

interface PolicySection {
  title: string;
  points: string[];
}

const PUBLIC_CONTACT_EMAIL = 'hello@cruiznclean.com';

const POLICY_SECTIONS: PolicySection[] = [
  {
    title: '1. Business Identity',
    points: [
      'Cruizn Clean is operated by Brian Morales.',
      'Until an LLC or separate business entity is formed and publicly identified, references to Cruizn Clean, we, us, or our mean Cruizn Clean as operated by Brian Morales.',
      `Questions about these terms may be sent to ${PUBLIC_CONTACT_EMAIL}.`,
    ],
  },
  {
    title: '2. Appointments and Booking',
    points: [
      'Appointments should be booked in advance through the website or direct communication with Cruizn Clean.',
      'A booking request is not final until it is reviewed, accepted, and confirmed.',
      'Customers are responsible for providing accurate contact information, service address, vehicle details, selected services, and any important access instructions.',
      'Cruizn Clean may contact customers to confirm details, clarify service scope, request vehicle information, or adjust scheduling before service begins.',
    ],
  },
  {
    title: '3. Estimates and Final Pricing',
    points: [
      'Website prices, package totals, and booking estimates are estimates based on the services selected and information provided by the customer.',
      'Final pricing may change after vehicle inspection, condition review, service scope confirmation, vehicle size review, added services, heavy soil, pet hair, stains, excessive buildup, odor treatment, or other factors that require additional time or materials.',
      'Cruizn Clean will communicate material pricing changes before performing added work when reasonably possible.',
    ],
  },
  {
    title: '4. Deposits, Payments, and Remaining Balance',
    points: [
      'A deposit may be required to reserve an appointment or start a checkout process.',
      'Deposits are applied toward the final service total unless otherwise stated during booking.',
      'The remaining balance is due when service is completed unless Cruizn Clean has agreed to another arrangement in writing.',
      'Payment processing may be handled by Stripe or another supported payment provider. Cruizn Clean does not control third-party payment processor terms or bank authorization decisions.',
    ],
  },
  {
    title: '5. Cancellations, Rescheduling, and Missed Appointments',
    points: [
      'Customers should contact Cruizn Clean as soon as possible if they need to cancel or reschedule.',
      'Late cancellations, missed appointments, unavailable vehicles, unsafe conditions, or denied access may result in deposit forfeiture or rescheduling at Cruizn Clean\'s discretion.',
      'Cruizn Clean understands that emergencies happen and may review unusual circumstances case by case.',
    ],
  },
  {
    title: '6. Weather, Working Conditions, and Controlled Environments',
    points: [
      'Mobile detailing appointments may be delayed, adjusted, or rescheduled because of rain, extreme heat, heavy wind, poor lighting, unsafe surroundings, water or power access issues, or other working conditions that could affect safety or service quality.',
      'Depending on weather, services requested, vehicle condition, and time needed, Cruizn Clean may ask that the vehicle be kept in a controlled environment such as a garage, covered area, or approved indoor/workspace location.',
      'A controlled environment may matter for paint correction, coatings, longer interior work, or weather-sensitive services.',
      'If required working conditions cannot be provided, Cruizn Clean may recommend rescheduling, changing the service scope, or moving the vehicle to a safer or more suitable location.',
    ],
  },
  {
    title: '7. Customer Responsibilities',
    points: [
      'Customers should remove valuables, personal belongings, car seats, important documents, and loose items before service.',
      'Customers are responsible for disclosing known vehicle issues, aftermarket modifications, fragile parts, leaks, electrical problems, prior damage, repaint work, loose trim, failing clear coat, or sensitive surfaces before work begins.',
      'Customers should provide legal access to the vehicle, enough space to work safely, and any water or power access agreed to before the appointment.',
    ],
  },
  {
    title: '8. Service Limitations and Results',
    points: [
      'Cruizn Clean provides professional detailing services on a best-effort basis, but results depend on vehicle condition, age, materials, prior care, stains, defects, weather exposure, and service selected.',
      'Not all stains, scratches, odors, water spots, oxidation, etching, wear, or defects can be fully removed.',
      'Paint correction, polishing, coatings, and protection services can improve appearance and protection, but they do not make a vehicle new or prevent all future damage.',
      'Some issues may require body shop, upholstery, mechanical, glass, paint, or specialty repair outside the scope of detailing.',
    ],
  },
  {
    title: '9. Pre-Existing Damage and Inspection',
    points: [
      'Cruizn Clean may inspect and document visible vehicle condition before, during, or after service.',
      'Cruizn Clean is not responsible for pre-existing damage, weak or failing materials, prior repairs, loose parts, failing clear coat, worn interiors, brittle plastics, leaking seals, electrical issues, or damage caused by conditions that existed before service.',
      'Customers should point out known concerns before service begins so they can be considered when choosing products, tools, and process.',
    ],
  },
  {
    title: '10. Photos and Media',
    points: [
      'Cruizn Clean may take photos or videos of vehicles for inspection, documentation, service records, quality review, before-and-after examples, or business marketing.',
      'Cruizn Clean will avoid intentionally publishing private customer information such as addresses, license plates, phone numbers, emails, or personal documents.',
      'Customers who want a photo removed or who do not want their vehicle used in marketing may contact Cruizn Clean at the public contact email.',
    ],
  },
  {
    title: '11. Third-Party Services',
    points: [
      'The website and booking flow may use third-party services such as Stripe for payments, Cal.com for scheduling, hosting providers, email providers, analytics providers, maps, or other operational tools.',
      'Third-party services may have their own terms, privacy policies, availability, fees, verification rules, or technical limitations.',
      'Cruizn Clean is not responsible for third-party outages, declined payments, scheduling platform issues, or external website behavior outside its reasonable control.',
    ],
  },
  {
    title: '12. Website Use',
    points: [
      'Customers may use this website to review services, request quotes, submit booking information, and contact Cruizn Clean.',
      'Do not misuse the website, attempt unauthorized access, interfere with the booking flow, submit false information, scrape content, or use the site for unlawful purposes.',
      'Website content, branding, photos, copy, and service descriptions may not be copied or reused without permission except where allowed by law.',
    ],
  },
  {
    title: '13. Insurance Note',
    points: [
      'Cruizn Clean aims to operate responsibly and may maintain insurance appropriate for its business operations.',
      'Insurance coverage, if applicable, may be subject to policy terms, exclusions, deductibles, documentation, investigation, and insurer review.',
      'This section is informational and does not create a separate guarantee, warranty, or promise of coverage for every claim or circumstance.',
    ],
  },
  {
    title: '14. Limitation of Liability',
    points: [
      'To the extent allowed by law, Cruizn Clean is not liable for indirect, incidental, special, consequential, punitive, or lost-profit damages related to use of the website or services.',
      'Cruizn Clean\'s responsibility for a service issue, when accepted, is generally limited to a reasonable correction, partial refund, or refund of the amount paid for the affected service, depending on the circumstances.',
      'Nothing in these terms is intended to limit rights or responsibilities that cannot legally be limited.',
    ],
  },
  {
    title: '15. Governing Law',
    points: [
      'These terms are governed by the laws of the State of California, without regard to conflict-of-law rules.',
      'Any dispute should first be raised directly with Cruizn Clean so the issue can be reviewed in good faith.',
    ],
  },
  {
    title: '16. Contact',
    points: [
      `For questions about these terms, scheduling, or service concerns, contact Cruizn Clean at ${PUBLIC_CONTACT_EMAIL}.`,
    ],
  },
];

/**
 * Renders the client-facing terms for booking and mobile service.
 */
export default function TermsPage(): JSX.Element {
  return (
    <SiteShell>
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:py-12">
        <article className="gray-card rounded-3xl p-6 sm:p-8">
          <h1 className="font-heading text-3xl font-extrabold text-ink sm:text-4xl">Terms of Service</h1>
          <p className="mt-4 text-sm text-ink/80">
            These terms explain how Cruizn Clean handles booking, pricing, service conditions, payments, and customer responsibilities.
          </p>
          <p className="mt-3 text-sm text-ink/80">
            Cruizn Clean is operated by Brian Morales. Until an LLC or separate business entity is formed and published, references to Cruizn Clean mean Cruizn Clean as operated by Brian Morales.
          </p>

          <div className="mt-8 space-y-8">
            {POLICY_SECTIONS.map((section) => (
              <section key={section.title} className="space-y-3">
                <h2 className="font-heading text-2xl font-semibold text-ink">{section.title}</h2>
                <ul className="list-disc space-y-2 pl-5 text-sm text-ink/80">
                  {section.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </article>
      </section>
    </SiteShell>
  );
}
