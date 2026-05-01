import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    integrations: [
      Sentry.replayIntegration({
        blockAllMedia: true,
        maskAllInputs: true,
        maskAllText: true,
      }),
    ],
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
  });
}

/** Captures App Router navigation spans for Sentry performance traces. */
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
