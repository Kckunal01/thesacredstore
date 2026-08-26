// src/components/home/RakhiCollectionSection.jsx
import React, { useContext } from 'react';
import HomeCarousel from '../common/HomeCarousel';
import ProductCard from '../ui/ProductCard';
import { ProductsContext } from '../../context/ProductsContext';

/**
 * RakhiCollectionSection
 *
 * Artwork-first editorial banner + product carousel.
 *
 * Structure (exactly three layers):
 *   <section>
 *     <img>           — the banner artwork (contains its own typography)
 *     <div.carousel>  — overlaps the banner bottom edge by 12–24px
 *   </section>
 *
 * The banner image IS the hero — it contains "THE SACRED STORE / RAKHI COLLECTION'26 / LIMITED"
 * object-position: center top ensures the heading is never cropped.
 */

const RakhiCollectionSection = () => {
  const { products } = useContext(ProductsContext);
  const rakhiProducts = products.filter(p => p.name && p.name.includes('Rakhi'));

  console.log("ALL PRODUCTS", products);
  console.log(
    "RAKHI PRODUCTS",
    products.filter(p => p.collection === "Rakhi'26")
  );

  return (
    <section className="relative w-full overflow-hidden flex flex-col items-center bg-[#FEFBF1]">
      {/* Background Image — now covers the entire section behind the cards */}
      <img
        src="/assets/images/Rakhi Collection'26 section.png"
        alt="The Sacred Store — Rakhi Collection 2026, Limited Edition"
        className="absolute inset-0 w-full h-full object-contain object-top md:object-cover md:object-top"
        draggable={false}
      />

      {/* Invisible spacer to maintain the exact layout/height for the typography */}
      <div className="rakhi-banner w-full" />

      {/* Carousel — overlaps the spacer and sits naturally over the background */}
      <div className="rakhi-carousel-wrapper w-full max-w-[1200px] mx-auto px-4 pb-16 relative z-10">
        {rakhiProducts.length > 0 ? (
          <HomeCarousel
            items={rakhiProducts}
            trackClassName="slides-rakhi"
            renderItem={(product) => (
              <ProductCard key={product.id} {...product} />
            )}
          />
        ) : (
          <div className="py-12 text-center text-muted font-light text-sm bg-background/60 backdrop-blur-sm rounded-lg mx-auto max-w-md">
            Loading Rakhi collection... (If this persists, there is a data mapping issue)
          </div>
        )}
      </div>
    </section>
  );
};

export default RakhiCollectionSection;
