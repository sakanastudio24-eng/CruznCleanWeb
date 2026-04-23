# Vercel Subdomain Deployment

## Goal
Deploy the Next.js frontend as a subdomain of your portfolio domain with a repeatable build path for this monorepo layout.

## Build Configuration In Repo
- Root `vercel.json` defines:
  - `installCommand`: `npm --prefix apps/web ci`
  - `buildCommand`: `npm run vercel-build`
  - `devCommand`: `npm --prefix apps/web run dev`
- Root `package.json` defines:
  - `vercel-build`: `npm --prefix apps/web run build`

This ensures Vercel builds the Next.js app from `apps/web` instead of assuming a root-level Next.js project.

## Vercel Project Setup
1. Import repository into Vercel.
2. Framework preset: `Next.js`.
3. Production branch: `main`.
4. Add environment variable `NEXT_PUBLIC_API_BASE_URL`.
5. Add `NEXT_PUBLIC_CAL_COM_URL` if used in production.
6. Deploy once and confirm successful build.

## Attach Subdomain
1. Open `Project Settings > Domains`.
2. Add the desired subdomain (example: `detailflow.yourdomain.com`).
3. Create DNS record(s) requested by Vercel.
4. Wait for domain verification and SSL certificate issuance.
5. Promote successful deployment to production.

## Troubleshooting
### Error: `No Next.js version detected`
Use this checklist:
1. Confirm the repository root in Vercel is this project.
2. Confirm `vercel.json` exists at repository root.
3. Confirm `apps/web/package.json` includes `next` in dependencies.
4. Re-deploy after clearing build cache.

### Warning: `Failed to fetch one or more git submodules`
- Remove stale submodule entries from `.gitmodules` in the source repo if submodules are not required.
- If submodules are required, verify Vercel Git integration has access to those repositories.
