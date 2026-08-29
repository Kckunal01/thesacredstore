import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import Section from '../components/ui/Section';
import Button from '../components/ui/Button';
import ProductCard from '../components/ui/ProductCard';
import { useContext } from 'react';
import { ProductsContext } from '../context/ProductsContext';
import { getDynamicBundles } from '../data/bundles';
import BundleCard from '../components/ui/BundleCard';
import HeroCarousel from '../components/ui/HeroCarousel';
import ReelsSection from '../components/ui/ReelsSection';

import HomeCarousel from '../components/common/HomeCarousel';

import { getPageSEO } from '../seo/seoHelpers';
import { SITE_URL } from '../config';
import Seo from '../components/Seo';

const homeSEO = getPageSEO({
  title: 'The Sacred Store – Premium Crystals & Spiritual Accessories',
  description: 'Explore high‑quality crystals, gemstones, and curated spiritual tools designed to elevate your practice and space.',
  slug: '/',
});

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'The Sacred Store',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  sameAs: [
    'https://www.facebook.com/thesacredstore',
    'https://www.instagram.com/thesacredstore',
  ],
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

const combinedJsonLd = { ...organizationJsonLd, ...websiteJsonLd };

const Home = () => {
  const { products } = useContext(ProductsContext);

  const bestSellersBase = products.filter(p => p && p.id && p.name && p.category?.toLowerCase() !== 'bundles' && !p.isBundle && !p.isCustomBundle && p.active !== false && p.visible !== false);
  const featured = bestSellersBase.filter(p => p.featured === true);
  const bestSellers = featured.length >= 4 ? featured.slice(0, 4) : [...featured, ...bestSellersBase.filter(p => !p.featured).slice(0, 4 - featured.length)];
  const dynamicBundles = getDynamicBundles(products);
  const homeBundles = React.useMemo(() => {
    return [...dynamicBundles]
      .filter(b => b.active !== false)
      .sort((a, b) => {
        if (a.slug === 'everyday-balance-bundle') return -1;
        if (b.slug === 'everyday-balance-bundle') return 1;
        return 0;
      })
      .slice(0, 2);
  }, [dynamicBundles]);

  const testimonials = [
    { quote: "They didn't just tell me my root chakra was blocked. They explained why I felt so ungrounded at work, and the black tourmaline actually shifted things.", author: "Priya K." },
    { quote: "Zero pseudo-spirituality. Just a calm, clear reading of where my energy was stuck. The simplest 30 minutes that brought so much clarity.", author: "Rahul S." },
    { quote: "I was skeptical, but the practitioner picked up on my solar plexus exhaustion immediately. I ordered the citrine and followed their simple practice.", author: "Ananya T." },
    { quote: "The packaging, the quality of the stones, the philosophy. Everything about Ritualist screams intentionality.", author: "Kunal M." },
    { quote: "My space feels completely different after placing the amethyst clusters as recommended. A brilliant service.", author: "Neha V." }
  ];

  return ( <> <Seo {...homeSEO} jsonLd={combinedJsonLd} />

      {/* 1. Hero Carousel */}
      <HeroCarousel />

      {/* Existing Homepage Hero restored exactly as it was in Git */}
      <section className="flex flex-col md:flex-row border-b border-border bg-background min-h-[60vh] overflow-hidden mb-0">
        <div className="w-full md:w-7/12 flex flex-col justify-center py-12 px-6 md:px-12 lg:px-20">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-2">
            THE <span className="font-allura" style={{ color: '#D4AF37' }}>SACRED</span> STORE
          </h1>
          <h2 className="text-2xl md:text-3xl lg:text-4xl leading-[1.1] font-display font-medium text-primary mt-8 mb-2">
            <span className="text-primary block">Make Space</span> <span className="half-gold">for Meaning.</span>
          </h2>
          <p className="text-base md:text-lg text-muted font-light mb-4 max-w-xl">
            Reiki‑healing crystals, gems, and simple life‑changing rituals.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button to="/shop-crystals" variant="gold" className="text-sm px-5 py-2 w-full sm:w-auto text-center">Shop Collection</Button>
            <Button to="/book-a-call" variant="ghost" className="text-sm px-5 py-2 w-full sm:w-auto text-center">Book Consultation</Button>
          </div>
        </div>
        <div className="w-full md:w-5/12 min-h-[40vh] md:min-h-0 flex items-stretch bg-surface p-0 group overflow-hidden">
          <img src="/assets/images/HeroImage.png" alt="The Sacred Store Healing Crystals" loading="lazy" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
        </div>
      </section>

      {/* 2. Rolling Text Marquee - Seamless infinite loop */}
      <div className="py-3 overflow-hidden flex whitespace-nowrap" style={{ backgroundColor: '#ffbd59' }}>
        <div className="animate-marquee inline-flex flex-shrink-0" aria-hidden="true">
          {[...Array(8)].map((_, i) => (
            <span key={i} className="text-sm font-semibold tracking-widest text-primary mx-8 uppercase flex-shrink-0 font-allura">
              FREE DELIVERY <span className="text-primary mx-4">·</span> COD AVAILABLE <span className="text-primary mx-4">·</span> ASSURED GUARANTEE <span className="text-primary mx-4">·</span>
            </span>
          ))}
        </div>
        <div className="animate-marquee inline-flex flex-shrink-0" aria-hidden="true">
          {[...Array(8)].map((_, i) => (
            <span key={i} className="text-sm font-semibold tracking-widest text-primary mx-8 uppercase flex-shrink-0 font-allura">
              FREE DELIVERY <span className="text-primary mx-4">·</span> COD AVAILABLE <span className="text-primary mx-4">·</span> ASSURED GUARANTEE <span className="text-primary mx-4">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* 3. Best Sellers: Featured Collection */}
      <Section id="best-sellers" className="border-b border-border py-16">
        <Container>
          <div className="text-center mb-10">
            <h3 className="text-3xl md:text-4xl font-display font-medium text-primary">
              <span className="text-primary">Featured</span> <span className="half-gold">Collection</span>
            </h3>
            <p className="text-xs text-muted font-light mt-2">
              Handpicked reiki-charged raw crystals and intentional jewelry.
            </p>
          </div>
          <HomeCarousel
            items={bestSellers}
            trackClassName="slides-4"
            renderItem={(product) => (
              <ProductCard key={product.id} {...product} />
            )}
          />
          <div className="flex justify-center mt-8">
            <Button to="/shop-crystals" variant="gold" className="text-[10px] px-6 py-3">View Complete Collection</Button>
          </div>
        </Container>
      </Section>

      {/* 5. Consultation Section */}
      <section className="flex flex-col md:flex-row border-b border-border bg-background py-2">
        <div className="w-full md:w-1/2 p-4 md:p-8 lg:p-10 flex flex-col justify-center">
          <h3 className="text-4xl md:text-5xl font-display font-medium text-primary mb-6">
            <span className="text-primary">Book your</span> <span className="half-gold">call</span>
          </h3>
          <p className="text-base text-muted font-light mb-4 leading-relaxed max-w-md">
            Unsure which mineral aligns with your current focus? Book a private 1-on-1 reading to map your space and energy accurately.
          </p>
          <div>
            <Button to="/book-a-call" variant="primary" className="text-[10px] px-6 py-3">Book Your Session</Button>
          </div>
        </div>
        <div className="w-full md:w-1/2 flex-1 flex items-stretch bg-surface border-l border-border p-0 group overflow-hidden">
          <img src="/assets/images/Bookyourcall.JPG.jpeg" alt="Book Private Consultation" loading="lazy" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
        </div>
      </section>

      {/* Curated Bundles section directly ABOVE Testimonials */}
      <Section className="border-b border-border bg-background py-16">
        <Container>
          <div className="text-center mb-10">
            <h3 className="text-3xl md:text-4xl font-display font-medium text-primary">
              <span className="text-primary">Curated</span> <span className="half-gold">Bundles</span>
            </h3>
            <p className="text-xs text-muted font-light mt-2">
              Thoughtfully paired crystals designed to complement each other.
            </p>
          </div>

          <HomeCarousel
            items={homeBundles}
            trackClassName="slides-2"
            renderItem={(bundle) => (
              <BundleCard key={bundle.id} bundle={bundle} />
            )}
          />

          <div className="flex justify-center">
            <Button to="/bundles" variant="dark" className="text-xs font-semibold">View All Bundles</Button>
          </div>
        </Container>
      </Section>

      {/* Reels Section */}
      <ReelsSection />

      {/* 6. Testimonials — uses shared HomeCarousel, no nav buttons */}
      <Section className="bg-surface border-b border-border py-16">
        <Container>
          <div className="text-center mb-10">
            <h3 className="text-3xl md:text-4xl font-display font-medium text-primary tracking-wider">
              <span className="text-primary">Loved By the</span> <span className="half-gold">Community</span>
            </h3>
            <p className="text-xs text-muted font-light mt-2">
              Real stories and transformative shifts from our sacred circle.
            </p>
          </div>

          <HomeCarousel
            items={testimonials}
            hideNav
            trackClassName="slides-3"
            renderItem={(test) => (
              <div className="bg-background border border-border p-6 h-full flex flex-col justify-between rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <div>
                  <div className="flex text-accent mb-4 text-xs">
                    ★★★★★
                  </div>
                  <p className="text-sm font-light font-body leading-relaxed mb-6 text-primary">
                    "{test.quote}"
                  </p>
                </div>
                <span className="text-[10px] uppercase tracking-[0.1em] text-muted font-bold block">
                  — {test.author}
                </span>
              </div>
            )}
          />
        </Container>
      </Section>

      {/* 7. Blog Section: Learn More */}
      <Section className="border-b border-border py-16 bg-background">
        <Container>
          <div className="text-center mb-10">
            <h3 className="text-3xl md:text-4xl font-display font-medium text-primary">
              <span className="text-primary">Learn</span> <span className="half-gold">More</span>
            </h3>
            <p className="text-xs text-muted font-light mt-2">
              Explore deep dives, grounding rituals, and sacred space arrangement guides.
            </p>
          </div>

          <HomeCarousel
            items={[
              {
                id: 1,
                tag: 'Deep Dive',
                title: 'Which Crystal for Anxiety — The Honest Guide',
                desc: 'We break down the minerals that actually ground your nervous system, free of pseudo-science.',
                link: '/blogs?id=1'
              },
              {
                id: 3,
                tag: 'Practices',
                title: 'The 7-Day Root Reset: Grounding Guide',
                desc: 'A simple, actionable guide to building stability from the ground up using Red Jasper.',
                link: '/blogs?id=3'
              },
              {
                id: 4,
                tag: 'Lifestyle',
                title: 'Creating Your Sacred Space',
                desc: 'How to arrange your crystals for maximum energetic flow and aesthetic balance in any room.',
                link: '/blogs?id=4'
              }
            ]}
            trackClassName="slides-3"
            renderItem={(blog) => (
              <Link to={blog.link} className="group cursor-pointer block border border-border bg-surface p-6 rounded-lg shadow-md hover:-translate-y-1 hover:shadow-lg transition-all duration-300 h-full flex flex-col justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-[0.2em] text-accent font-bold">{blog.tag}</span>
                  <h4 className="text-xl font-display text-primary mt-2 mb-3 group-hover:text-accent transition-colors">{blog.title}</h4>
                </div>
                <p className="text-xs text-muted font-light leading-relaxed">{blog.desc}</p>
              </Link>
            )}
          />

          <div className="flex justify-center">
            <Button to="/blogs" variant="gold" className="text-[10px] px-6 py-3">Discover more</Button>
          </div>
        </Container>
      </Section>

    </>
  );
};

export default Home;
