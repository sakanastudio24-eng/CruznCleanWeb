# Design System Direction

## Brand Colors
- Deep Red: `#56070f`
- Brand Black: `#10150f`
- Water Blue: `#8cc0d6`
- Neutral Gray: `#f8f8f8`

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
