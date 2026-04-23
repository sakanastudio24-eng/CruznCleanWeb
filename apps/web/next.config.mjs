import { varlockNextConfigPlugin } from '@varlock/nextjs-integration/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default varlockNextConfigPlugin()(nextConfig);
