# Daisy Designs storefront design system

## Direction

Premium minimalist Egyptian children's goods. Use an editorial, tactile tone with clear Arabic hierarchy and generous but purposeful whitespace. Keep layouts right-to-left. Use monochrome photography, black actions, white cards, and warm off-white page surfaces. Avoid decorative color, gradients, heavy shadows, and oversized repeated marks.

## Runtime tokens

Tokens live in `src/app/globals.css` and are the source of truth:

- `--background`: warm off-white page surface (`#faf9f6`)
- `--foreground` / `--primary`: near-black type and primary actions
- `--muted`: warm stone surface for quiet grouping
- `--muted-foreground`: accessible secondary text
- `--border`: fine warm-gray separators and card edges
- `--card`: white image and content surface
- `--page-gutter`, `--content-width`, `--section-space`: shared responsive layout rhythm

## Type and layout

Use IBM Plex Sans Arabic for Arabic UI text. Keep headings concise, use a clear eyebrow/title/body hierarchy, and prefer logical properties (`padding-inline`, `margin-block`) for RTL layouts. Catalog and collection cards share a 4:5 image frame, thin border, white surface, and consistent metadata spacing. Editorial photography is grayscale; the Daisy logo placeholder remains contained and its source asset is unchanged.

## Interaction and accessibility

Use Lucide icons already installed in the project. Keep controls keyboard reachable, give icon-only controls accessible names, show a visible focus outline, and maintain touch targets around 44px. Use the existing Motion components selectively and preserve their reduced-motion behavior. Preview copy, preview-only availability, and all demo transaction protections are part of the interface contract.
