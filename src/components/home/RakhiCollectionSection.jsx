import React from 'react';
import HomeCarousel from '../common/HomeCarousel';

/**
 * RakhiCollectionSection
 *
 * Artwork-first editorial banner + "Coming Soon" carousel.
 *
 * Structure (exactly three layers):
 *   <section>
 *     <img>           — the banner artwork (contains its own typography)
 *     <div.carousel>  — overlaps the banner bottom edge by 12–24px
 *   </section>
 *
 * The banner image IS the hero — it contains "THE SACRED STORE /
 * RAKHI COLLECTION'26 / LIMITED" baked into the artwork.
 * object-position: center top ensures the heading is never cropped.
 *
 * All sizing, overlap, and card widths live in index.css under
 * the `.rakhi-*` class family — zero inline spacing hacks.
 */

const CARD_COUNT = 5;
const dummyCards = [...Array(CARD_COUNT)].map((_, i) => ({ id: i }));

const RakhiCollectionSection = () => (
  <section className="rakhi-section">
    {/* Banner — the artwork itself, not a background */}
    <img
      src="/assets/images/Rakhi Collection'26 section.png"
      alt="The Sacred Store — Rakhi Collection 2026, Limited Edition"
      className="rakhi-banner"
      draggable={false}
    />

    {/* Carousel — overlaps the banner's bottom edge */}
    <div className="rakhi-carousel">
      <HomeCarousel
        items={dummyCards}
        trackClassName="slides-rakhi"
        renderItem={() => (
          <div className="rakhi-card-inner">
            <img
              src="/assets/images/Coming Soon.png"
              alt="Coming Soon"
              className="rakhi-card-img"
              draggable={false}
            />
          </div>
        )}
      />
    </div>
  </section>
);

export default RakhiCollectionSection;
