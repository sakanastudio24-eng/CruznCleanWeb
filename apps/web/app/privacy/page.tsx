import { SiteShell } from '@/components/layout/site-shell';

interface PrivacySection {
  title: string;
  body?: string[];
  points?: string[];
}

const PUBLIC_CONTACT_EMAIL = 'hello@cruiznclean.com';

const PRIVACY_SECTIONS: PrivacySection[] = [
  {
    title: '1. Who Operates Cruizn Clean',
    body: [
      'Cruizn Clean is operated by Brian Morales. Until an LLC or separate business entity is formed and publicly identified, references to Cruizn Clean, we, us, or our mean Cruizn Clean as operated by Brian Morales.',
    ],
  },
  {
    title: '2. Information Collected',
    points: [
      'Contact details such as name, email address, phone number, ZIP code, and service address.',
      'Booking details such as selected services, vehicle year, make, model, color, size category, service notes, appointment details, and booking status.',
      'Quote or contact form details such as message content, service interest, photos or files submitted by the customer, and related communication history.',
      'Payment and checkout details handled through Stripe, such as payment status, payment identifiers, fraud prevention signals, and transaction records. Cruizn Clean does not intentionally collect full card numbers through its website.',
      'Scheduling details handled through Cal.com, such as appointment time, booking status, calendar metadata, and customer-provided scheduling information.',
      'Website activity data such as page visits, button clicks, service selections, booking starts, checkout starts, social clicks, browser/device data, approximate location from technical signals, and basic diagnostic logs.',
    ],
  },
  {
    title: '3. How Information Is Used',
    points: [
      'To review booking requests, schedule services, prepare accurate estimates, and provide detailing services.',
      'To communicate with customers about appointments, vehicle details, service questions, payment status, support issues, reminders, rescheduling, and follow-up.',
      'To process deposits, checkout, refunds, payment verification, fraud prevention, and accounting records.',
      'To improve the website, booking flow, service menu, customer experience, and operational reliability.',
      'To document service condition, respond to disputes, maintain records, protect the business, and comply with legal, tax, accounting, and operational obligations.',
    ],
  },
  {
    title: '4. Payments Through Stripe',
    body: [
      'Cruizn Clean may use Stripe to process deposits, checkout, payment verification, fraud review, refunds, and related payment records. Stripe may collect and process payment information under its own terms and privacy policy. Cruizn Clean does not intentionally store full payment card numbers on its website.',
    ],
  },
  {
    title: '5. Scheduling Through Cal.com',
    body: [
      'Cruizn Clean may use Cal.com to schedule appointments, manage appointment availability, and connect booking details to a calendar workflow. Information submitted through scheduling tools may be processed by Cal.com under its own terms and privacy policy.',
    ],
  },
  {
    title: '6. Emails, Texts, and Customer Communication',
    points: [
      'Cruizn Clean may use customer email addresses to send booking confirmations, service updates, support messages, receipts, reminders, and operational notices.',
      'Cruizn Clean may use phone numbers for calls or texts related to booking coordination, scheduling, service questions, payment verification, access instructions, and customer support.',
      'Marketing messages, if used in the future, should be handled separately from essential service communication and should include appropriate opt-out options.',
    ],
  },
  {
    title: '7. Photos, Files, and Vehicle Images',
    points: [
      'Customers may provide photos, files, or vehicle information when requesting a quote, asking for help, or documenting vehicle condition.',
      'Cruizn Clean may take photos or videos before, during, or after service for inspection, quality review, service records, dispute review, training, portfolio examples, or marketing.',
      'Cruizn Clean will avoid intentionally publishing private customer information such as addresses, license plates, phone numbers, emails, or personal documents.',
      `Customers may request review or removal of a published vehicle image by contacting ${PUBLIC_CONTACT_EMAIL}.`,
    ],
  },
  {
    title: '8. Cookies, Analytics, Local Storage, and Tracking Tools',
    points: [
      'The website may use cookies, browser local storage, analytics scripts, and similar tools to operate the website, remember simple preferences, support booking flows, and understand site activity.',
      'Cruizn Clean uses Google Analytics to understand website activity like page visits, button clicks, service selections, booking starts, checkout starts, and social clicks.',
      'Private customer information such as name, email, phone number, service address, notes, and private booking details is not intentionally sent to Google Analytics.',
      'Local storage may be used for limited browser-side functions such as booking drafts, cart selections, or acknowledgement of an informational analytics notice.',
    ],
  },
  {
    title: '9. Pending Analytics and Cookie Notice',
    body: [
      'Cruizn Clean may add or use a small analytics notice to explain basic analytics use. Before adding Google Ads, retargeting, advertising pixels, advanced ad tracking, or a broader consent workflow, Cruizn Clean should review whether a larger cookie or consent setup is needed.',
    ],
  },
  {
    title: '10. Third-Party Services',
    points: [
      'Cruizn Clean may use third-party services for payments, scheduling, website hosting, analytics, email delivery, domain services, maps, security, diagnostics, and business operations.',
      'Examples may include Stripe, Cal.com, Google Analytics, hosting providers, email providers, DNS/domain providers, and similar operational tools.',
      'Third-party services may process information under their own terms and privacy policies. Cruizn Clean is not responsible for third-party websites or services it does not control.',
    ],
  },
  {
    title: '11. How Information Is Shared',
    points: [
      'Information may be shared with service providers that help operate the website, process payments, schedule appointments, send communications, provide analytics, maintain records, or support business operations.',
      'Information may be shared if needed to comply with law, respond to legal requests, prevent fraud, protect rights or safety, resolve disputes, collect amounts owed, or enforce terms.',
      'Cruizn Clean does not sell private booking details to Google Analytics.',
    ],
  },
  {
    title: '12. Data Retention',
    body: [
      'Cruizn Clean keeps personal information for as long as reasonably needed for booking, service history, customer support, payment records, tax and accounting requirements, fraud prevention, legal obligations, operational review, and business administration. Retention periods may vary depending on the type of record and business need.',
    ],
  },
  {
    title: '13. Data Security',
    body: [
      'Cruizn Clean uses reasonable administrative, technical, and operational safeguards intended to protect information. No website, payment system, email system, or internet transmission can be guaranteed completely secure. Customers should avoid sending highly sensitive information through ordinary website forms or email.',
    ],
  },
  {
    title: '14. Customer Choices and Data Requests',
    body: [
      `Customers may contact Cruizn Clean to ask about personal information connected to their booking, request corrections, or request deletion where appropriate. Some records may need to be kept for payment, tax, fraud prevention, legal, service history, accounting, or operational reasons. Privacy and data requests can be sent to: ${PUBLIC_CONTACT_EMAIL}`,
      `Customers may also send take-down requests for customer-submitted files or published vehicle media to ${PUBLIC_CONTACT_EMAIL}.`,
    ],
  },
  {
    title: '15. California Privacy Note',
    body: [
      'Cruizn Clean operates in California and intends to handle customer information in a practical and responsible way. California residents may contact Cruizn Clean with privacy questions or requests using the contact email in this policy. This policy does not claim full CCPA, CPRA, GDPR, or other regulatory compliance unless Cruizn Clean has adopted the operational process required to support those rights.',
    ],
  },
  {
    title: '16. Children\'s Privacy',
    body: [
      'Cruizn Clean services and website are intended for customers who can book vehicle detailing services. The website is not directed to children under 13, and Cruizn Clean does not knowingly collect personal information from children under 13.',
    ],
  },
  {
    title: '17. External Links and Social Media',
    body: [
      'The website may link to third-party websites or social media platforms. Visiting those sites may allow the third party to collect information under its own terms and privacy policy. Cruizn Clean does not control those external sites.',
    ],
  },
  {
    title: '18. Changes to This Policy',
    body: [
      'Cruizn Clean may update this Privacy Policy as the website, services, vendors, booking flow, or legal requirements change. The updated version will be posted on this page with a revised date when appropriate.',
    ],
  },
  {
    title: '19. Contact',
    body: [
      `Privacy questions, data requests, correction requests, deletion requests, take-down requests, and general privacy concerns can be sent to ${PUBLIC_CONTACT_EMAIL}.`,
    ],
  },
];

/**
 * Renders the public privacy policy for Cruizn Clean.
 */
export default function PrivacyPage(): JSX.Element {
  return (
    <SiteShell>
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:py-12">
        <article className="gray-card rounded-3xl p-6 sm:p-8">
          <h1 className="font-heading text-3xl font-extrabold text-ink sm:text-4xl">Privacy Policy</h1>
          <p className="mt-3 text-sm text-ink/70">Last updated: May 16, 2026</p>
          <p className="mt-3 text-sm text-ink/80">
            Cruizn Clean is operated by Brian Morales. Until an LLC or separate business entity is formed and published, references to Cruizn Clean mean Cruizn Clean as operated by Brian Morales.
          </p>

          <div className="mt-8 space-y-8">
            {PRIVACY_SECTIONS.map((section) => (
              <section key={section.title} className="space-y-3">
                <h2 className="font-heading text-2xl font-semibold text-ink">{section.title}</h2>
                {section.body?.map((paragraph) => (
                  <p key={paragraph} className="text-sm text-ink/80">
                    {paragraph}
                  </p>
                ))}
                {section.points ? (
                  <ul className="list-disc space-y-2 pl-5 text-sm text-ink/80">
                    {section.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </article>
      </section>
    </SiteShell>
  );
}
