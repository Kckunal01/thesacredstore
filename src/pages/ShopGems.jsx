import React, { useState } from 'react';
import Container from '../components/ui/Container';
import Section from '../components/ui/Section';
import ProductCard from '../components/ui/ProductCard';
import { products } from '../data/products';
import { Search } from 'lucide-react';

const ShopGems = () => {
  const [searchQuery, setSearchQuery] = useState('');


    const displayedProducts = searchQuery.trim() !== ''
      ? products.filter(p =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : products.filter(p => p.category === 'Gemstones');


  return (
    <Section className="bg-background pt-32 min-h-screen">
      <Container>
        <div className="text-center mb-12">
          <span className="text-[10px] uppercase tracking-[0.3em] text-accent font-bold block mb-4">Precision Cut</span>
          <h1 className="text-5xl md:text-6xl font-display font-medium text-primary mb-8">
            <span className="text-primary">Healing</span> <span className="half-gold">Gemstones</span>
          </h1>
          
          <div className="max-w-md mx-auto relative">
            <input 
              type="text" 
              placeholder="Search all crystals, gems, and jewellery..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#d4b584]/10 border border-accent px-4 py-3 pl-12 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-colors text-primary placeholder-accent/70"
            />
            <Search className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-accent" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {displayedProducts.length > 0 ? (
            displayedProducts.map(product => (
              <ProductCard key={product.id} {...product} />
            ))
          ) : (
            <div className="col-span-full text-center text-muted py-12">
              No products found matching "{searchQuery}"
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
};

export default ShopGems;
