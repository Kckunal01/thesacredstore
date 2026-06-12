# Implementation Plan for Image Compression and WebP Conversion

## Goal Description

Compress all images located under `public/assets/images` and convert them to WebP format while preserving visual quality. Create responsive optimized versions targeting file size ranges:
- Blog/About images: **150–250 KB** per image.
- Product images: **100–200 KB** per image.

Update all image references in the React codebase to point to the newly generated WebP files, preserving existing layout, styling, Tailwind classes, and functionality.

## User Review Required

- Confirm the acceptable quality/size trade‑off (e.g., JPEG quality factor or cwebp quality settings).
- Approve the naming convention for the generated assets (e.g., original filename with `.webp` suffix, or separate folders like `public/assets/images/webp/`).
- Approve whether to delete the original image files after conversion or keep them as fallback.

## Open Questions

> [!IMPORTANT]
> - Do you want the original JPEG/PNG files retained for browsers that do not support WebP, or can we safely remove them?
> - Should the responsive versions be generated as multiple resolutions (e.g., `image-1x.webp`, `image-2x.webp`) and referenced via `<picture>` tags, or is a single optimized WebP per image sufficient?
> - Preferred quality setting for `cwebp` (range 0‑100). A typical balance is 80‑85; confirm.

## Proposed Changes

---
### Asset Processing Scripts
- Add a new Node.js script `scripts/optimize-images.js` that:
  1. Recursively scans `public/assets/images`.
  2. Classifies images into **blog/about** (folders `Blogs/`, `About/` etc.) and **product** (e.g., `Products/`).
  3. Uses the `sharp` library (or `cwebp` CLI) to convert each image to WebP with appropriate quality settings to meet the target size ranges.
  4. Generates responsive variants (`@1x`, `@2x`) if needed.
  5. Writes the new files alongside originals (e.g., `MyImage.webp`).
  6. Optionally removes original files based on user consent.

### Dependency Updates
- Add `sharp` (or `cwebp-bin`) to `package.json` under `devDependencies`.

### Code Refactoring
- Search all React components for `<img src="/assets/images/...` references.
- Replace each reference with the new WebP path (e.g., `src="/assets/images/Blogs/What is an Electromagnetic Field (Aura).webp"`).
- For responsive handling, optionally wrap images in a `<picture>` element with `<source type="image/webp" srcSet="..."/>` and fallback `<img>` pointing to the original file.
- Ensure imports are removed; use direct public paths.

### Build Adjustments
- No changes to Webpack/Vite config required because images are served statically from `public/`.

### Verification Plan
- Run `npm run dev` and manually visit the About and Blogs pages to confirm images load correctly without broken links.
- Inspect network panel to verify MIME type `image/webp`.
- Use a script to check that each generated WebP file size falls within the target range.
- Run automated tests (if any) to ensure no regressions.

---
## Verification Plan

### Automated Tests
- None currently exist for images; we will add a simple jest test that scans the `public/assets/images` directory and asserts that for each original image a corresponding `.webp` file exists.

### Manual Verification
- Launch the dev server (`npm run dev`).
- Navigate to About page and each Blog entry, confirming the displayed images are the new WebP assets.
- Verify responsive behavior on different viewport widths.
- Confirm file sizes using browser dev tools.

---
**End of Plan**
