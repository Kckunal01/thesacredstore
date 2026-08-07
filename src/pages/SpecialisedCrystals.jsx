import React, { useContext } from 'react';
import Container from '../components/ui/Container';
import Section from '../components/ui/Section';
import ProductCard from '../components/ui/ProductCard';
import { ProductsContext } from '../context/ProductsContext';

const SpecialisedCrystals = () => {
  const { products } = useContext(ProductsContext);

  const specialised = products.filter(p => p.category === 'Specialised Crystals');
  const activeItems = specialised.filter(p => (p.stock ?? 0) > 0 && p.active !== false);
  const pastDrops = specialised.filter(p => (p.stock ?? 0) === 0 || p.active === false);

  return (
    <Section className="bg-background pt-32 min-h-screen">
      <Container>
        <div className="text-center mb-12">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#000000] font-bold block mb-4">Curated Combinations</span>
          <h1 className="text-5xl md:text-6xl font-display font-medium text-primary mb-4">Specialised Crystals</h1>
          <p className="text-muted text-sm max-w-lg mx-auto">High-potency crystal combinations engineered for specific life intentions.</p>
        </div>

        {activeItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 mb-24">
            {activeItems.map(product => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}

        {pastDrops.length > 0 && (
          <>
            <div className="text-center mb-12 mt-16 pt-16 border-t border-border/50">
              <span className="text-[10px] uppercase tracking-[0.3em] text-muted font-bold block mb-4">Archive</span>
              <h2 className="text-3xl md:text-4xl font-display font-medium text-primary/60 mb-4">Past Drops</h2>
              <p className="text-muted/70 text-sm max-w-md mx-auto">Limited collections that have sold out. Follow us for restocks.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 opacity-60">
              {pastDrops.map(product => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </>
        )}

        {activeItems.length === 0 && pastDrops.length === 0 && (
          <div className="text-center text-muted py-24">
            New specialised crystal combinations coming soon.
          </div>
        )}
      </Container>
    </Section>
  );
};

export default SpecialisedCrystals;
