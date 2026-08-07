import React, { useState } from 'react';
import Container from '../components/ui/Container';
import Section from '../components/ui/Section';
import ProductCard from '../components/ui/ProductCard';
import { Search } from 'lucide-react';
import { useContext } from 'react';
import { ProductsContext } from '../context/ProductsContext';

const ShopCrystals = () => {
  const { products } = useContext(ProductsContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filterMatches = (p, filter) => {
    if (filter === 'All') return true;
    const name = p.name.toLowerCase();
    if (filter === 'Clusters') return name.includes('cluster');
    if (filter === 'Points') return name.includes('point');
    if (filter === 'Tumbles') return name.includes('tumble');
    if (filter === 'Spheres (Balls)') return name.includes('ball') || name.includes('sphere');
    if (filter === 'Malas') return name.includes('mala');
    return true;
  };

  const displayedProducts = searchQuery.trim() !== ''
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products.filter(p => p.category === 'Crystals' && filterMatches(p, activeFilter));

  const filterOptions = [
    { label: 'All', value: 'All' },
    { label: 'Clusters', value: 'Clusters' },
    { label: 'Points', value: 'Points' },
    { label: 'Tumbles', value: 'Tumbles' },
    { label: 'Spheres (Balls)', value: 'Spheres (Balls)' },
    { label: 'Malas', value: 'Malas' },
  ];

  return (
    <Section className="bg-background pt-32 min-h-screen">
      <Container>
        <div className="text-center mb-12">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#000000] font-bold block mb-4">Ethically Sourced</span>
          <h1 className="text-5xl md:text-6xl font-display font-medium text-primary mb-8">Crystals</h1>
          
          <div className="max-w-md mx-auto relative mb-8">
            <input 
              type="text" 
              placeholder="Search all crystals, gems, and jewellery..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FFBD59]/10 border border-accent px-4 py-3 pl-12 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-colors text-primary placeholder-accent/70"
            />
            <Search className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-accent" />
          </div>

          {searchQuery.trim() === '' && (
            <div className="flex flex-wrap items-center justify-center gap-2 border border-border/80 p-1.5 inline-flex mx-auto bg-surface/50 rounded-sm">
              {filterOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setActiveFilter(opt.value)}
                  className={`px-4 py-2 text-[10px] uppercase tracking-[0.15em] font-bold transition-all duration-200 ${
                    activeFilter === opt.value
                      ? 'bg-primary text-background shadow-sm'
                      : 'text-muted hover:text-primary'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Grid — 2 cols on mobile, 2 on sm, 4 on lg */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-6 md:gap-x-8 md:gap-y-16">
          {displayedProducts.length > 0 ? (
            displayedProducts.map(product => (
              <ProductCard key={product.id} {...product} />
            ))
          ) : (
            <div className="col-span-full text-center text-muted py-12">
              No products found matching active filters.
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
};

export default ShopCrystals;
