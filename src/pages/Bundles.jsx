import React, { useContext, useMemo } from 'react';
import { ProductsContext } from '../context/ProductsContext';
import { getDynamicBundles } from '../data/bundles';
import BundleCard from '../components/ui/BundleCard';
import BundleBuilder from '../components/ui/BundleBuilder';
import Container from '../components/ui/Container';
import Section from '../components/ui/Section';

const Bundles = () => {
  const { products } = useContext(ProductsContext);

  const dynamicBundles = useMemo(() => {
    return getDynamicBundles(products).filter(b => b.active !== false);
  }, [products]);

  return (
    <div className="w-full bg-background min-h-screen py-12">
      <Container>
        {/* Header styling matching standard collections */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] text-accent tracking-[0.2em] uppercase font-bold block mb-2">
            Thoughtfully Crafted
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-medium text-primary">
            Curated Bundles
          </h1>
        </div>

        {/* Curated Bundles grid - Horizontal cards, small enough for 2 in a row on desktop */}
        <Section className="py-0 mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dynamicBundles.map(bundle => (
              <BundleCard key={bundle.id} bundle={bundle} />
            ))}
          </div>
        </Section>

        {/* Custom Bundle Builder */}
        <Section className="py-0">
          <div id="build-your-own-bundle" className="border-t border-border pt-16">
            <h2 className="text-2xl md:text-3xl font-display font-medium text-primary mb-3 text-center lg:text-left">
              Build Your Own Bundle
            </h2>
            <p className="text-sm text-muted font-light mb-6 max-w-3xl leading-relaxed text-center lg:text-left">
              Create a custom set matching your personal intention. Pick individual items, choose quantity multiples per item, and unlock progressive savings thresholds directly based on your bundle's subtotal value.
            </p>
            
            {/* Value milestone discount rate specifies */}
            <div className="bg-surface border border-border p-5 rounded mb-8 text-xs text-muted max-w-3xl space-y-2 mx-auto lg:mx-0">
              <p className="font-semibold text-primary mb-1 text-sm uppercase tracking-wider text-accent">Bundle Discount Milestone Targets:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div className="border-r border-border/60 last:border-0 pr-2">Subtotal &lt; ₹4999<br/><span className="text-sm font-bold text-primary">0% Off</span></div>
                <div className="border-r border-border/60 last:border-0 pr-2">Subtotal ₹4999+<br/><span className="text-sm font-bold text-accent">5% Off</span></div>
                <div className="border-r border-border/60 last:border-0 pr-2">Subtotal ₹7999+<br/><span className="text-sm font-bold text-accent">10% Off</span></div>
                <div>Subtotal ₹11999+<br/><span className="text-sm font-bold text-accent">15% Off</span></div>
              </div>
            </div>

            <BundleBuilder />
          </div>
        </Section>
      </Container>
    </div>
  );
};

export default Bundles;
