# Implementation Plan for Regression Fix

## Goal
Restore the original homepage hero, fix the hero carousel, clean up shop UI, update consultation pricing, revamp the reels section, recreate the Lapis Lazuli product, and verify everything works without affecting checkout or admin functionality.

## User Review Required
[!IMPORTANT] 
- **Original Hero Markup**: Provide the exact JSX/HTML markup of the hero section from the live Git version (or a commit hash) so we can restore it precisely.
- **Carousel Assets**: List the filenames for the two carousel images located in `src/assets/carousel/` (or equivalent) to ensure correct usage.
- **Reels Placeholder Images**: Provide thumbnail images (or names) for the video cards to be used in the new Reels section.
- **Lapis Lazuli Images**: Confirm the folder path containing the new Lapis Lazuli images (e.g., `src/assets/images/Lapis Lazuli/`).

## Open Questions
- Are there any CSS utility classes or custom styles specifically tied to the original hero that need to be re‑added? If so, please share the CSS or Tailwind classes used.
- Should the consultation price be updated in any JSON/metadata files besides component JSX (e.g., SEO meta, schema.org data)?
- Do we need to adjust any translation files or constants for the new price (`₹799`)?

## Proposed Changes
---
### 1. Restore Hero Section
- **[MODIFY]** `src/pages/Home.jsx`: Replace the current hero JSX (lines 73‑98) with the original markup.
- **[MODIFY]** Any related CSS (e.g., `src/styles/hero.css` or Tailwind classes) to match original spacing, fonts, and background.

### 2. Hero Carousel
- **[MODIFY]** `src/components/ui/HeroCarousel.jsx`:
  - Ensure two slides only, using the confirmed asset filenames.
  - Slide 1 links to `/bundles` (Bundle Builder page).
  - Slide 2 triggers a smooth‑scroll to the `#best-sellers` section on the homepage.
- Add smooth‑scroll helper if not present.

### 3. Shop Cleanup – Remove Related Collection
- **[DELETE]** Component/UI responsible for the Related Collection (likely `src/components/ui/RelatedCollection.jsx` or similar).
- **[MODIFY]** `src/pages/Product.jsx` (or product detail page) to remove the import and JSX block rendering the Related Collection.
- Clean up any unused imports and CSS.

### 4. Consultation Price Update
- Search and replace all hard‑coded price strings:
  - In `Home.jsx` consultation button text if it displays price.
  - In the Consultation page component (`src/pages/Consultation.jsx` or similar).
  - In any card components showing pricing.
  - In SEO/meta JSON files (`src/seo/*`).
- Update any constants file (e.g., `src/constants/pricing.js`).

### 5. Reels Section Revamp
- **[MODIFY]** `src/components/ui/ReelsSection.jsx`:
  - Change heading texts to the new wording.
  - Remove Instagram embed code.
  - Introduce a grid of video placeholder cards with props: `thumbnail`, `title`, `duration`, `onClick` (future MP4 support).
  - Add minimal CSS/utility classes for layout.
- Add placeholder thumbnail images to `src/assets/reels/`.

### 6. Lapis Lazuli Product Re‑creation
- **[DELETE]** Existing Lapis Lazuli entry from `src/data/products.js` (identified by name).
- **[ADD]** New product object with fresh fields (title, description, benefits, properties, uses, care, specs, SEO, slug, tags, image URLs pointing to the new folder).
- Ensure `image_url` and `gallery_images` reference the correct assets.
- Run the seed script (`scratch/seed_new_products.js`) to update the Supabase database (already added earlier). Verify presence.

### 7. QA / Verification Script
- Extend `scratch/verify_all.js` to also check:
  - Hero section exists (DOM query).
  - Carousel slide count = 2 and links behave as expected (simulate click actions).
  - Consultation price appears as `₹799` in rendered markup.
  - Reels section contains the new heading.
  - Lapis Lazuli product is searchable and visible in Admin (via API check).

### 8. Build
- Run `npm run build` and capture the result.

## Verification Plan
- **Automated**: Execute `npm run test` (if tests exist) and the updated `verify_all.js` script.
- **Manual**: Quick local dev run (`npm run dev`) to inspect hero layout, carousel navigation, consultation price, reels placeholders, and product presence.
- Confirm `npm run build` completes without errors.

---
**End of Plan**
