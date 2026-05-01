import { notFound } from 'next/navigation';
import { SentryTestButton } from './sentry-test-button';

export const metadata = {
  title: 'Sentry Smoke Test | Cruizn Clean',
  robots: {
    index: false,
    follow: false,
  },
};

/** Direct-only Sentry verification route, hidden unless explicitly enabled. */
export default function SentryExamplePage() {
  if (process.env.NEXT_PUBLIC_SENTRY_TEST_PAGE_ENABLED !== 'true') {
    notFound();
  }

  return (
    <main className="site-frame py-24">
      <section className="gray-card max-w-2xl space-y-5 p-8">
        <p className="eyebrow text-burgundyAccent">Internal verification</p>
        <h1 className="font-heading text-4xl font-bold text-white">Sentry smoke test</h1>
        <p className="max-w-xl text-lg text-fog">
          This page intentionally calls <code>myUndefinedFunction()</code> so the browser error
          can be verified in Sentry
        </p>
        <SentryTestButton />
      </section>
    </main>
  );
}
