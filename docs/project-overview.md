# Project Overview

## Purpose
DetailFlow is a production-oriented portfolio project for a mobile car-detailing business. It demonstrates a conversion-focused frontend flow and a typed backend intake API with email automation support.

## High-Level Architecture
- `apps/web`: Next.js 14 App Router site (TypeScript + Tailwind CSS).
- `apps/api`: FastAPI service for booking/contact intake and health checks.
- `data/`: local JSON persistence for demo and local development.
- `docs/`: implementation, operations, and handoff documentation.

## Core Product Flows
1. Marketing pages explain packages, process, testimonials, and gallery proof.
2. Services flow supports multi-vehicle service selection and dynamic totals.
3. Booking flow submits validated intake payloads to API endpoints.
4. Contact flow supports non-booking customer messages.
5. Email preview route demonstrates customer/owner messaging design.

## Deployment Model
- Hosting: Vercel (web app on subdomain).
- Build target: `apps/web` via root `vercel.json` commands.
- API deployment: independent FastAPI host (set `NEXT_PUBLIC_API_BASE_URL` in Vercel).
- TLS: managed by Vercel once DNS records are attached to the custom subdomain.

## Accessibility Direction
- Shared skip link to jump to `main` content.
- Landmark-first layout (`header`, `main`, `footer`, named nav regions).
- Keyboard focus visibility for interactive controls.
- ARIA state management for expandable/cart and modal UI.

## Operational Notes
- Current persistence is file-based JSON and should be replaced before high-traffic production.
- Booking and contact anti-abuse protections need full rate limiting before live launch.
- Demo-safe mode behavior is documented in `README.md` and `docs/client-handoff-checklist.md`.
