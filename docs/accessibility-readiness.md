# Accessibility Readiness

## Implemented Baseline
- Skip link in app layout for fast keyboard navigation to `main`.
- Main content landmark with stable target (`id="main-content"`).
- Named navigation regions for primary, mobile, and footer navigation.
- `aria-current="page"` on active navigation links.
- `aria-expanded` and `aria-controls` on cart and quick-help interactive controls.
- Quick-help modal includes `role="dialog"`, title, and description linkage.
- Global focus-visible outline styling for links, buttons, and form controls.

## Manual QA Pass (Before Production Cutover)
1. Tab through header navigation, quick-help trigger, and cart controls.
2. Validate skip-link behavior from top of page on keyboard focus.
3. Verify dialog opens with focus and closes using `Escape`.
4. Verify bottom mobile nav remains reachable with screen zoom and safe-area insets.
5. Validate all informative images keep meaningful `alt` text.

## Recommended Automated Checks
1. Lighthouse Accessibility score on Vercel preview and production URLs.
2. Optional `axe-core` checks via Playwright/Cypress on `/`, `/services`, `/booking`, and `/contact`.

## Known Scope Limits
- No dedicated automated accessibility CI check is currently wired.
- Advanced screen-reader-only QA and WCAG conformance mapping are not yet documented as full audits.
