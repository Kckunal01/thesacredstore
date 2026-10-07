import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import Container from '../components/ui/Container';
import Section from '../components/ui/Section';
import ProductCard from '../components/ui/ProductCard';
import { Search, X } from 'lucide-react';
import { ProductsContext } from '../context/ProductsContext';
import { CANONICAL_TAXONOMY, matchesTaxonomy } from '../data/taxonomy';
import Seo from '../components/Seo';
import { getPageSEO } from '../seo/seoHelpers';

const Shop = ({ initialFilter = null, pageTitle = null }) => {
  const { products } = useContext(ProductsContext);
  const [searchParams, setSearchParams] = useSearchParams();

  const queryCategory = searchParams.get('category') || initialFilter || 'All';
  const querySub = searchParams.get('sub') || 'All';
  const querySearch = searchParams.get('search') || '';
  const filterType = searchParams.get('filter') || (initialFilter && ['gift-shop', 'new-arrivals', 'festive-offers'].includes(initialFilter) ? initialFilter : null);

  const [activeCategory, setActiveCategory] = useState(queryCategory);
  const [activeSubcategory, setActiveSubcategory] = useState(querySub);
  const [searchQuery, setSearchQuery] = useState(querySearch);

  useEffect(() => {
    if (searchParams.get('category')) {
      setActiveCategory(searchParams.get('category'));
    } else if (initialFilter && !['gift-shop', 'new-arrivals', 'festive-offers'].includes(initialFilter)) {
      setActiveCategory(initialFilter);
    }
    if (searchParams.get('sub')) {
      setActiveSubcategory(searchParams.get('sub'));
    }
    if (searchParams.get('search')) {
      setSearchQuery(searchParams.get('search'));
    }
  }, [searchParams, initialFilter]);

  const activeCategoryObj = useMemo(() => {
    return CANONICAL_TAXONOMY.find(c => c.name.toLowerCase() === activeCategory.toLowerCase());
  }, [activeCategory]);

  const handleCategoryChange = (catName) => {
    setActiveCategory(catName);
    setActiveSubcategory('All');
    const newParams = new URLSearchParams(searchParams);
    if (catName === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', catName);
    }
    newParams.delete('sub');
    newParams.delete('filter');
    setSearchParams(newParams);
  };

  const handleSubcategoryChange = (subName) => {
    setActiveSubcategory(subName);
    const newParams = new URLSearchParams(searchParams);
    if (subName === 'All') {
      newParams.delete('sub');
    } else {
      newParams.set('sub', subName);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setActiveCategory('All');
    setActiveSubcategory('All');
    setSearchQuery('');
    setSearchParams(new URLSearchParams());
  };

  const displayedProducts = useMemo(() => {
    let list = products.filter(p => p && p.id && p.name && p.category?.toLowerCase() !== 'bundles' && !p.isBundle && !p.isCustomBundle && p.active !== false && p.visible !== false);

    // Special preset filters
    if (filterType === 'festive-offers') {
      list = list.filter(p => (p.originalPrice && p.price < p.originalPrice) || p.stamp === 'Sale' || p.featured);
    } else if (filterType === 'new-arrivals') {
      list = list.filter(p => p.stamp === 'Fresh' || p.featured || true).slice(0, 24);
    } else if (filterType === 'gift-shop') {
      list = list.filter(p => p.featured || p.stamp || (p.price >= 499));
    }

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      return list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Taxonomy filtering
    if (activeCategory !== 'All' && !filterType) {
      return list.filter(p => matchesTaxonomy(p, activeCategory, activeSubcategory));
    }

    return list;
  }, [products, searchQuery, activeCategory, activeSubcategory, filterType]);

  const computedTitle = pageTitle || (filterType === 'festive-offers'
    ? 'Festive Offers — Up to 30% Off'
    : filterType === 'new-arrivals'
    ? 'New Arrivals'
    : filterType === 'gift-shop'
    ? 'Sacred Gift Shop'
    : activeCategory !== 'All'
    ? `${activeCategory} Collection`
    : 'Shop Sacred Crystals & Jewelry');

  const shopSEO = getPageSEO({
    title: `${computedTitle} | The Sacred Store`,
    description: 'Explore high-quality crystals, gemstones, jewelry, and sacred tools designed to elevate your energy.',
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
              Authentic spiritual tools, intentional jewelry, and energised crystals crafted for your journey.
            </p>

            {/* Search Input */}
            <div className="max-w-md mx-auto relative mt-6 mb-6">
              <input
                type="text"
                placeholder="Search crystals, bracelets, pendants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface border border-accent/40 rounded-full px-5 py-3 pl-12 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-colors text-primary placeholder-muted/70 shadow-sm"
              />
              <Search className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-accent" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted hover:text-primary"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Filter Tabs */}
            {!filterType && (
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto pt-2">
                <button
                  onClick={() => handleCategoryChange('All')}
                  className={`px-4 py-2 rounded-full text-[11px] uppercase tracking-[0.12em] font-semibold transition-all duration-200 ${
                    activeCategory === 'All'
                      ? 'bg-primary text-background shadow-md'
                      : 'bg-surface text-muted hover:text-primary border border-border/80'
                  }`}
                >
                  All Products
                </button>
                {CANONICAL_TAXONOMY.map(cat => (
                  <button
                    key={cat.name}
                    onClick={() => handleCategoryChange(cat.name)}
                    className={`px-4 py-2 rounded-full text-[11px] uppercase tracking-[0.12em] font-semibold transition-all duration-200 ${
                      activeCategory === cat.name
                        ? 'bg-primary text-background shadow-md'
                        : 'bg-surface text-muted hover:text-primary border border-border/80'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}

            {/* Subcategory Chips if active category has subcategories */}
            {!filterType && activeCategoryObj && activeCategoryObj.subcategories.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 pt-3 border-t border-border/40 max-w-2xl mx-auto">
                <button
                  onClick={() => handleSubcategoryChange('All')}
                  className={`px-3 py-1 rounded-md text-[10px] uppercase tracking-wider font-medium transition-all ${
                    activeSubcategory === 'All'
                      ? 'bg-accent text-white font-bold'
                      : 'text-muted hover:text-primary bg-surface/60'
                  }`}
                >
                  All {activeCategory}
                </button>
                {activeCategoryObj.subcategories.map(sub => (
                  <button
                    key={sub}
                    onClick={() => handleSubcategoryChange(sub)}
                    className={`px-3 py-1 rounded-md text-[10px] uppercase tracking-wider font-medium transition-all ${
                      activeSubcategory === sub
                        ? 'bg-accent text-white font-bold'
                        : 'text-muted hover:text-primary bg-surface/60'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}

            {/* Active filter summary tag */}
            {(activeCategory !== 'All' || filterType || searchQuery) && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="text-xs text-muted">
                  Showing {displayedProducts.length} items
                </span>
                <button
                  onClick={clearFilters}
                  className="text-xs text-accent underline hover:text-primary transition-colors ml-2"
                >
                  Reset all filters
                </button>
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
                <p className="text-xs text-muted mb-4">Try clearing your filters or searching for something else.</p>
                <button
                  onClick={clearFilters}
                  className="px-5 py-2 bg-primary text-background text-xs uppercase tracking-wider font-bold rounded-full"
                >
                  View All Products
                </button>
              </div>
            )}
          </div>
        </Container>
      </Section>
    </>
  );
};

export default Shop;
