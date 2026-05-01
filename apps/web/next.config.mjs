import { varlockNextConfigPlugin } from '@varlock/nextjs-integration/plugin';
import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    externalDir: true,
  },
  reactStrictMode: true,
};

const varlockConfig = varlockNextConfigPlugin()(nextConfig);
const shouldUploadSentrySourceMaps =
  process.env.SENTRY_UPLOAD_SOURCE_MAPS === 'true' && Boolean(process.env.SENTRY_AUTH_TOKEN);

export default withSentryConfig(varlockConfig, {
  org: process.env.SENTRY_ORG || 'zwardstudio',
  project: process.env.SENTRY_PROJECT || 'javascript-nextjs',
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: {
    disable: !shouldUploadSentrySourceMaps,
  },
  errorHandler: (err) => {
    console.warn('Sentry source map upload failed without blocking the Next.js build:', err.message);
  },
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
