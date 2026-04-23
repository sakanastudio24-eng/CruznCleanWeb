# Design System Direction

## Color Tokens
- `charcoal`: `#262626`
- `ink`: `#111111`
- `fog`: `#a3a3a3`
- `canvas`: `#f8f8f8`

## Typography
- Headings: Manrope
- Body: Outfit

## Component Policy
- Primary: shadcn/ui
- Optional: MUI for targeted advanced components only

## Responsive Policy
- Mobile-first baseline
- Tablet and desktop breakpoints layered on top
- Mobile and tablet (`<=1023px`) use a fixed bottom navigation dock
- Respect iOS/Android safe-area insets for bottom navigation and overlays
- Breakpoints used:
- `<=479px`: compact phone spacing and tighter navigation heights
- `480px-767px`: standard phone layout
- `768px-1023px`: tablet layout with bottom navigation
- `>=1024px`: desktop header/nav layout

## Current Client Rule
- Keep the Cruzn Clean blueprint black, white, and grayscale only.
- Keep `/email-preview` available by direct URL for QA, but hide it from desktop and mobile navigation.
