# Approval Gates

Human approval is required before:

- deleting, moving, archiving, or renaming any repo file
- editing `.env*`, secrets, Vercel project settings, or deployment config
- installing or upgrading dependencies
- changing lockfiles
- running migrations or deploys
- changing auth, payment, Stripe, Cal.com, booking, API, webhook, or navigation behavior
- editing `data/*.json` or `attachments/*`
- changing legal, policy, or production deployment docs

Generated local artifacts may be proposed for cleanup, but deletion still requires approval.
