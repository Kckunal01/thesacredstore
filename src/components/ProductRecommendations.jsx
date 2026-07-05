import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-)$/g, '');
};

const ProductRecommendations = ({ currentProduct, products }) => {
  const recommendations = useMemo(() => {
    if (!currentProduct || !products || products.length === 0) return [];

    const currentId = currentProduct.id?.toString() || currentProduct.db_id?.toString();
    const currentSlug = currentProduct.slug || slugify(currentProduct.name);

    // Common check for eligible products
    const isEligible = (p) => {
      const pId = p.id?.toString() || p.db_id?.toString();
      const pSlug = p.slug || slugify(p.name);
      return (
        pId !== currentId &&
        pSlug !== currentSlug &&
        p.active !== false &&
        p.visible !== false &&
        (p.stock ?? 0) > 0
      );
    };

    const eligiblePool = products.filter(isEligible);
    const recommendedList = [];
    const recommendedIds = new Set();
    const recommendedSlugs = new Set();
    const recommendedCrystals = new Set();
    const recommendedCrystalCounts = new Map();

    const addRecommendation = (prod) => {
      if (!prod) return false;
      const prodId = prod.id?.toString() || prod.db_id?.toString();
      const prodSlug = prod.slug || slugify(prod.name);
      if (recommendedIds.has(prodId) || recommendedSlugs.has(prodSlug)) return false;

      recommendedList.push(prod);
      recommendedIds.add(prodId);
      recommendedSlugs.add(prodSlug);
      
      const crystal = getCrystalType(prod.name);
      if (crystal) {
        const count = recommendedCrystalCounts.get(crystal) || 0;
        if (count >= 2) return false; // limit to 2 forms per crystal
        recommendedCrystalCounts.set(crystal, count + 1);
        recommendedCrystals.add(crystal);
      }
      return true;
    };

    // Helper to get crystal type from product name
    function getCrystalType(name) {
      const lower = name.toLowerCase();
      const crystals = [
        'selenite', 'amethyst', 'citrine', 'rose quartz', 'clear quartz',
        'green aventurine', 'tiger eye', 'black tourmaline', 'pyrite',
        'obsidian', 'labradorite', 'carnelian', 'malachite', 'howlite',
        'hematite', 'sodalite', 'fluorite', 'lapis lazuli', 'smoky quartz'
      ];
      for (const crystal of crystals) {
        if (lower.includes(crystal)) return crystal;
      }
      return null;
    }

    const currentCrystal = getCrystalType(currentProduct.name);

    // --- Recommendation 1: Selenite Essential ---
    if (currentCrystal !== 'selenite') {
      const cat = (currentProduct.category || '').toLowerCase();
      let targetName = '';
      if (cat.includes('bracelet')) {
        targetName = 'selenite charging plate';
      } else if (cat.includes('pendant')) {
        targetName = 'selenite bowl';
      } else if (cat.includes('crystal')) {
        targetName = 'selenite charging plate';
      } else if (cat.includes('gemstone')) {
        targetName = 'selenite charging plate';
      }

      if (targetName) {
        const seleniteProd = eligiblePool.find(p => p.name.toLowerCase().includes(targetName));
        if (seleniteProd) {
          addRecommendation(seleniteProd);
        }
      }
    }

    // --- Recommendation 2: Same Crystal (Different Form/Category) ---
    if (currentCrystal) {
      const currentCat = (currentProduct.category || '').toLowerCase();
      const sameCrystalProd = eligiblePool.find(p => {
        const pId = p.id?.toString() || p.db_id?.toString();
        const pSlug = p.slug || slugify(p.name);
        if (recommendedIds.has(pId) || recommendedSlugs.has(pSlug)) return false;

        const pCrystal = getCrystalType(p.name);
        const pCat = (p.category || '').toLowerCase();
        return pCrystal === currentCrystal && pCat !== currentCat;
      });
      if (sameCrystalProd) {
        addRecommendation(sameCrystalProd);
      }
    }

    // --- Recommendation 3: Pairs Well With ---
    if (currentCrystal) {
      let matches = [];
      if (currentCrystal === 'black tourmaline' || currentCrystal === 'rose quartz') {
        matches = eligiblePool;
      } else if (currentCrystal === 'amethyst') {
        matches = eligiblePool.filter(p => {
          const c = getCrystalType(p.name);
          return c === 'citrine' || c === 'clear quartz';
        });
      } else if (currentCrystal === 'green aventurine') {
        matches = eligiblePool.filter(p => getCrystalType(p.name) === 'rose quartz');
      } else if (currentCrystal === 'tiger eye') {
        matches = eligiblePool.filter(p => getCrystalType(p.name) === 'tiger eye');
      }

      const pairsWellProd = matches.find(p => {
        const pId = p.id?.toString() || p.db_id?.toString();
        const pSlug = p.slug || slugify(p.name);
        return !recommendedIds.has(pId) && !recommendedSlugs.has(pSlug);
      });
      if (pairsWellProd) {
        addRecommendation(pairsWellProd);
      }
    }

    // --- Recommendation 4: Explore More ---
    const exploreMoreProd = eligiblePool.find(p => {
      const pId = p.id?.toString() || p.db_id?.toString();
      const pSlug = p.slug || slugify(p.name);
      if (recommendedIds.has(pId) || recommendedSlugs.has(pSlug)) return false;

      const pCrystal = getCrystalType(p.name);
      if (pCrystal && pCrystal === currentCrystal) return false;

      const pCat = (p.category || '').toLowerCase();
      const currentCat = (currentProduct.category || '').toLowerCase();
      return pCat !== currentCat;
    });
    if (exploreMoreProd) {
      addRecommendation(exploreMoreProd);
    }

    // --- Fallbacks to ensure exactly 4 slots ---
    if (recommendedList.length < 4) {
      for (const p of eligiblePool) {
        if (recommendedList.length >= 4) break;
        const pId = p.id?.toString() || p.db_id?.toString();
        const pSlug = p.slug || slugify(p.name);
        if (!recommendedIds.has(pId) && !recommendedSlugs.has(pSlug)) {
          addRecommendation(p);
        }
      }
    }

    return recommendedList.slice(0, 4);
  }, [currentProduct, products]);

  if (recommendations.length < 4) return null;

  return (
    <div className="mt-20 pt-16 max-w-6xl mx-auto px-4">
      <h3 className="font-display text-2xl md:text-3xl text-primary font-medium tracking-[0.2em] uppercase mb-12 text-center">
        Our Customers also Bought
      </h3>
      <div className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 pb-6 scrollbar-thin snap-x snap-mandatory justify-start">
        {recommendations.map((product) => {
          const mainImage = product.images && product.images.length > 0 ? product.images[0] : null;
          return (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="group flex flex-col bg-[#FEFBF1]/10 p-5 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 rounded-md snap-start shrink-0 w-[260px] xs:w-[290px] md:w-auto"
            >
              <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#FEFBF1] mb-5 rounded-sm">
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-105 p-2"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted text-xs uppercase tracking-widest font-semibold">
                    {product.name}
                  </div>
                )}
              </div>
              <span className="text-[9px] uppercase tracking-[0.2em] text-muted/80 font-bold mb-2 block">
                {product.category}
              </span>
              <h4 className="font-display text-base md:text-lg text-primary font-medium mb-2 line-clamp-1 transition-colors duration-300 group-hover:text-accent">
                {product.name}
              </h4>
              <span className="text-sm font-semibold text-accent mt-auto">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ProductRecommendations;
