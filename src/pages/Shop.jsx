import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import Container from '../components/ui/Container';
import Section from '../components/ui/Section';
import ProductCard from '../components/ui/ProductCard';
import { ProductsContext } from '../context/ProductsContext';
import { CANONICAL_TAXONOMY, matchesTaxonomy } from '../data/taxonomy';
import Seo from '../components/Seo';
import { getPageSEO } from '../seo/seoHelpers';

const SORT_OPTIONS = [
  { value: 'default', label: 'All' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'alpha', label: 'A → Z' },
  { value: 'featured', label: 'Featured' },
];

const Shop = ({ initialCategory = null, initialFilter = null, pageTitle = null, description = null }) => {
  const { products } = useContext(ProductsContext);
  const [searchParams, setSearchParams] = useSearchParams();

  // Route-based category (if on dedicated category page) or query-param category
  const activeCategory = initialCategory || searchParams.get('category') || 'All';
  const querySub = searchParams.get('sub') || 'All';
  const querySearch = searchParams.get('search') || '';
  const filterType = searchParams.get('filter') || (initialFilter && ['gift-shop', 'new-arrivals', 'festive-offers'].includes(initialFilter) ? initialFilter : null);

  const [activeSubcategory, setActiveSubcategory] = useState(querySub === 'All' ? null : querySub);
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    if (searchParams.get('sub')) {
      setActiveSubcategory(searchParams.get('sub'));
    } else {
      setActiveSubcategory(null);
    }
  }, [searchParams, activeCategory]);

  const activeCategoryObj = useMemo(() => {
    return CANONICAL_TAXONOMY.find(c => c.name.toLowerCase() === activeCategory.toLowerCase());
  }, [activeCategory]);

  const handleSubcategoryChange = (subName) => {
    const newSub = activeSubcategory === subName ? null : subName;
    setActiveSubcategory(newSub);
    const newParams = new URLSearchParams(searchParams);
    if (!newSub) {
      newParams.delete('sub');
    } else {
      newParams.set('sub', newSub);
    }
    setSearchParams(newParams);
  };

  const displayedProducts = useMemo(() => {
    let list = products.filter(p => p && p.id && p.name && p.category?.toLowerCase() !== 'bundles' && !p.isBundle && !p.isCustomBundle && p.active !== false && p.visible !== false);

    // Global search: searches across ALL products from all categories
    if (querySearch.trim() !== '') {
      const q = querySearch.toLowerCase().trim();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
      return list;
    }

    // Special preset collection filters
    if (filterType === 'festive-offers') {
      // Show all festive offers, sorted by highest absolute discount
      list = list
        .filter(p => p.is_festive_offer)
        .sort((a, b) => {
          const discA = (a.originalPrice || a.price) - a.price;
          const discB = (b.originalPrice || b.price) - b.price;
          return discB - discA;
        });
      return list;
    } else if (filterType === 'new-arrivals') {
      // Show all new arrivals, latest first
      list = list
        .filter(p => p.is_new_arrival)
        .sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        });
      return list;
    } else if (filterType === 'gift-shop') {
      // Show all gift shop items
      list = list.filter(p => p.is_gift_shop);
      return list;
    }

    // Category & subcategory filtering
    if (activeCategory !== 'All' && !filterType) {
      list = list.filter(p => matchesTaxonomy(p, activeCategory, activeSubcategory));
    }

    // Apply sorting
    if (sortBy === 'price-asc') {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list = [...list].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'alpha') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'featured') {
      list = [...list].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return list;
  }, [products, querySearch, activeCategory, activeSubcategory, filterType, sortBy]);

  const computedTitle = pageTitle || (querySearch
    ? `Search Results for "${querySearch}"`
    : filterType === 'festive-offers'
    ? 'Festive Offers — Up to 30% Off'
    : filterType === 'new-arrivals'
    ? 'New Arrivals'
    : filterType === 'gift-shop'
    ? 'Sacred Gift Shop'
    : activeCategory !== 'All'
    ? `${activeCategory}`
    : 'Shop Sacred Crystals & Jewelry');

  const shopSEO = getPageSEO({
    title: `${computedTitle} | The Sacred Store`,
    description: description || 'Explore high-quality crystals, gemstones, jewelry, and sacred tools designed to elevate your energy.',
    slug: '/shop',
  });

  return (
    <>
      <Seo {...shopSEO} />
      <Section className="bg-background pt-28 md:pt-36 min-h-screen pb-20">
        <Container>
          <div className="text-center mb-8 md:mb-12">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#B89968] font-bold block mb-2">
              100% Reiki Charged &amp; Cleansed
            </span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-medium text-primary mb-4">
              {computedTitle}
            </h1>
            <p className="text-xs md:text-sm text-muted font-light max-w-lg mx-auto">
              {description || 'Authentic spiritual tools, intentional jewelry, and energised crystals crafted for your journey.'}
            </p>

            {/* Subcategory navigation — shown only if category has subcategories, and no search/collection filter */}
            {!filterType && !querySearch && activeCategoryObj && activeCategoryObj.subcategories.length > 0 && (
              <div className="flex overflow-x-auto scrollbar-none items-center justify-center gap-2 mt-6 pt-2 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 max-w-2xl sm:mx-auto">
                {activeCategoryObj.subcategories.map(sub => (
                  <button
                    key={sub}
                    onClick={() => handleSubcategoryChange(sub)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-[11px] uppercase tracking-[0.12em] font-semibold transition-all duration-200 ${
                      activeSubcategory === sub
                        ? 'bg-primary text-background shadow-md'
                        : 'bg-surface text-muted hover:text-primary border border-border/80'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}

            {/* Sort Controls — minimal dropdown */}
            {!filterType && !querySearch && (
              <div className="flex items-center justify-center mt-4">
                <div className="relative flex items-center">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent border-none text-[10px] uppercase tracking-[0.1em] font-bold text-[#B89968] hover:text-primary cursor-pointer focus:outline-none focus:ring-0 appearance-none pr-4"
                    style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                  >
                    <option value="default">Sort Options</option>
                    <option value="price-asc">Price: Low → High</option>
                    <option value="price-desc">Price: High → Low</option>
                    <option value="alpha">A → Z</option>
                    <option value="featured">Featured</option>
                  </select>
                  <svg className="w-3 h-3 text-[#B89968] absolute right-0 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            )}
          </div>

          {/* Product Grid — 2 cols on mobile, 3 on sm, 4 on lg */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-10">
            {displayedProducts.length > 0 ? (
              displayedProducts.map(product => (
                <ProductCard key={product.id} {...product} />
              ))
            ) : (
              <div className="col-span-full text-center text-muted py-16 bg-surface/40 rounded-2xl border border-border/50">
                <p className="text-base font-display text-primary mb-2">No products found</p>
                <p className="text-xs text-muted mb-4">
                  {querySearch ? `We couldn't find anything matching "${querySearch}".` : 'No items currently in this section.'}
                </p>
              </div>
            )}
          </div>
        </Container>
      </Section>
    </>
  );
};

export default Shop;
