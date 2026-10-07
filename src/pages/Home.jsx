import React, { useContext, useMemo, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import ProductCard from '../components/ui/ProductCard';
import { ProductsContext } from '../context/ProductsContext';
import { getDynamicBundles } from '../data/bundles';
import HeroCarousel from '../components/ui/HeroCarousel';
import { getPageSEO } from '../seo/seoHelpers';
import { SITE_URL } from '../config';
import Seo from '../components/Seo';
import { Play, Pause, ArrowRight, ShieldCheck, Truck, Sparkles, Gift } from 'lucide-react';

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

const reelsData = [
  {
    id: 1,
    title: 'Founder Story',
    badge: 'FOUNDER STORY',
    video: '/assets/videos/video1.mp4',
    poster: '/assets/images/Carousel/Desktop/carousel 1.png',
  },
  {
    id: 2,
    title: 'Recommendations',
    badge: 'RECOMMENDATIONS',
    video: '/assets/videos/video2.mp4',
    poster: '/assets/images/Carousel/Desktop/carousel 2.png',
  },
  {
    id: 3,
    title: '3 Step Guide',
    badge: '3 STEP GUIDE',
    video: '/assets/videos/video3.mp4',
    poster: '/assets/images/Carousel/Mobile/Carosuel 1.png',
  },
  {
    id: 4,
    title: 'FAQ',
    badge: 'FAQ',
    video: '/assets/videos/video4.mp4',
    poster: '/assets/images/Carousel/Mobile/Carosuel 2.png',
  },
];

const ReelCard = ({ reel, isPlaying, onTogglePlay }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  return (
    <div
      onClick={() => onTogglePlay(reel.id)}
      className="group relative bg-[#EDE7DD] border border-[#E0D8CB] overflow-hidden rounded-2xl flex flex-col hover:border-[#B89968] transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer flex-shrink-0 w-[170px] sm:w-[210px] snap-start"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden flex items-center justify-center bg-[#E5DEC3]">
        {/* Category Pill Tag */}
        <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 bg-[#E5B563] text-black px-2 py-0.5 rounded shadow-sm z-20">
          <span className="text-[8px] sm:text-[9px] font-sans font-bold tracking-wider uppercase">
            {reel.badge}
          </span>
        </div>

        <video
          ref={videoRef}
          src={`${reel.video}#t=0.1`}
          poster={reel.poster}
          preload="metadata"
          playsInline
          muted
          loop
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Play/Pause Button */}
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/20 group-hover:bg-black/10 transition-colors">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 text-[#B89968] flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
            {isPlaying ? (
              <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-[#B89968]" />
            ) : (
              <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5 fill-[#B89968]" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const { products } = useContext(ProductsContext);
  const [activeReelId, setActiveReelId] = useState(null);

  // 1. Featured Collection (Real Supabase Products)
  const bestSellersBase = useMemo(() => {
    return products.filter(
      p => p && p.id && p.name && p.category?.toLowerCase() !== 'bundles' && !p.isBundle && !p.isCustomBundle && p.active !== false && p.visible !== false
    );
  }, [products]);

  const featured = useMemo(() => {
    return bestSellersBase.filter(p => p.featured === true);
  }, [bestSellersBase]);

  const featuredCollection = useMemo(() => {
    if (featured.length >= 8) return featured.slice(0, 8);
    const nonFeatured = bestSellersBase.filter(p => !p.featured);
    return [...featured, ...nonFeatured].slice(0, 8);
  }, [featured, bestSellersBase]);

  // 2. Curated Bundles
  const dynamicBundles = useMemo(() => getDynamicBundles(products), [products]);
  const homeBundles = useMemo(() => {
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
    {
      quote: "They didn't just tell me my root chakra was blocked. The black tourmaline actually shifted things.",
      author: "PRIYA K.",
    },
    {
      quote: "Zero pseudo-spirituality. Just a calm, clear reading of where my energy was stuck.",
      author: "RAHUL S.",
    },
    {
      quote: "I was skeptical, but the practitioner picked up on my solar plexus immediately.",
      author: "ANANYA T.",
    },
  ];

  const handleTogglePlay = (id) => {
    setActiveReelId(prev => (prev === id ? null : id));
  };

  return (
    <>
      <Seo {...homeSEO} jsonLd={combinedJsonLd} />

      <div className="bg-[#FAF7F2] text-[#2B241C] min-h-screen pb-16 space-y-8 sm:space-y-12 overflow-x-hidden">

        {/* ──────────────────────────────────────────────────────────
            SECTION 2: HERO / TOP ROLLING BANNER
            Full-width rounded mobile banner, indicators, no desktop split
        ────────────────────────────────────────────────────────── */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-2">
          <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-[#E6DFD5]">
            <HeroCarousel />
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────────
            SECTION 3: FOUR QUICK-ACTION CARDS
            Gift Shop, New Arrivals, Curated Bundles, Festive Offers
            (NO Buy Again, NO Shop by Category below)
        ────────────────────────────────────────────────────────── */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Card 1: Gift Shop */}
            <Link
              to="/gift-shop"
              className="group bg-[#FFF9F2] border border-[#E8DFD3] rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:shadow-md hover:border-[#B89968] transition-all"
            >
              <div>
                <div className="w-12 h-12 mb-3 rounded-2xl bg-[#F7EFE3] flex items-center justify-center text-2xl shadow-inner">
                  🎁
                </div>
                <h3 className="font-display text-base sm:text-lg font-medium text-[#2B241C] group-hover:text-[#B89968] transition-colors">
                  Gift Shop
                </h3>
                <p className="text-[11px] text-[#7A6B5D] mt-1 leading-tight font-sans">
                  Meaningful gifts for every occasion
                </p>
              </div>
              <div className="mt-4 flex justify-end">
                <span className="w-7 h-7 rounded-full border border-[#B89968]/30 flex items-center justify-center text-xs text-[#B89968] group-hover:bg-[#B89968] group-hover:text-white transition-colors">
                  →
                </span>
              </div>
            </Link>

            {/* Card 2: New Arrivals */}
            <Link
              to="/new-arrivals"
              className="group bg-[#FFF9F2] border border-[#E8DFD3] rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:shadow-md hover:border-[#B89968] transition-all"
            >
              <div>
                <div className="w-12 h-12 mb-3 rounded-2xl bg-[#F7EFE3] flex items-center justify-center text-2xl shadow-inner">
                  🔮
                </div>
                <h3 className="font-display text-base sm:text-lg font-medium text-[#2B241C] group-hover:text-[#B89968] transition-colors">
                  New Arrivals
                </h3>
                <p className="text-[11px] text-[#7A6B5D] mt-1 leading-tight font-sans">
                  Discover our latest additions
                </p>
              </div>
              <div className="mt-4 flex justify-end">
                <span className="w-7 h-7 rounded-full border border-[#B89968]/30 flex items-center justify-center text-xs text-[#B89968] group-hover:bg-[#B89968] group-hover:text-white transition-colors">
                  →
                </span>
              </div>
            </Link>

            {/* Card 3: Curated Bundles */}
            <Link
              to="/bundles"
              className="group bg-[#FFF9F2] border border-[#E8DFD3] rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:shadow-md hover:border-[#B89968] transition-all"
            >
              <div>
                <div className="w-12 h-12 mb-3 rounded-2xl bg-[#F7EFE3] flex items-center justify-center text-2xl shadow-inner">
                  📿
                </div>
                <h3 className="font-display text-base sm:text-lg font-medium text-[#2B241C] group-hover:text-[#B89968] transition-colors">
                  Curated Bundles
                </h3>
                <p className="text-[11px] text-[#7A6B5D] mt-1 leading-tight font-sans">
                  Thoughtfully paired for deeper balance
                </p>
              </div>
              <div className="mt-4 flex justify-end">
                <span className="w-7 h-7 rounded-full border border-[#B89968]/30 flex items-center justify-center text-xs text-[#B89968] group-hover:bg-[#B89968] group-hover:text-white transition-colors">
                  →
                </span>
              </div>
            </Link>

            {/* Card 4: Festive Offers */}
            <Link
              to="/festive-offers"
              className="group bg-[#FFF9F2] border border-[#E8DFD3] rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:shadow-md hover:border-[#B89968] transition-all"
            >
              <div>
                <div className="w-12 h-12 mb-3 rounded-2xl bg-[#F7EFE3] flex items-center justify-center text-2xl shadow-inner">
                  🛍️
                </div>
                <h3 className="font-display text-base sm:text-lg font-medium text-[#2B241C] group-hover:text-[#B89968] transition-colors">
                  Festive Offers
                </h3>
                <p className="text-[11px] text-[#7A6B5D] mt-1 leading-tight font-sans">
                  Special prices for a more meaningful celebration
                </p>
              </div>
              <div className="mt-4 flex justify-end">
                <span className="w-7 h-7 rounded-full border border-[#B89968]/30 flex items-center justify-center text-xs text-[#B89968] group-hover:bg-[#B89968] group-hover:text-white transition-colors">
                  →
                </span>
              </div>
            </Link>
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────────
            SECTION 4: FESTIVE OFFERS BANNER
            Large horizontal rounded banner, UP TO 30% OFF
        ────────────────────────────────────────────────────────── */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r from-[#F4E3CB] via-[#EBD4B5] to-[#D5BA93] border border-[#E0C9A6] p-6 sm:p-10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="max-w-lg z-10">
              <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-[#8B6B3E] uppercase block mb-1">
                FESTIVE SPECIAL
              </span>
              <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold text-[#3D2C1E] mb-2 leading-tight">
                UP TO 30% OFF
              </h2>
              <p className="text-xs sm:text-sm text-[#5C4A36] mb-5 font-sans leading-relaxed">
                On our festive collection &amp; featured picks. Energetically blessed for harmony and abundance.
              </p>
              <Link
                to="/festive-offers"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#B89968] hover:bg-[#8F744C] text-white text-xs sm:text-sm font-semibold rounded-full shadow-md transition-all uppercase tracking-wider"
              >
                SHOP FESTIVE OFFERS →
              </Link>
            </div>

            {/* Decorative Image Container */}
            <div className="relative w-full sm:w-72 h-44 sm:h-52 rounded-2xl overflow-hidden border border-[#D5BA93]/60 shadow-inner flex-shrink-0 bg-[#E8D4B5]">
              <img
                src="/assets/images/Carousel/slide1.jpg"
                alt="Festive Sacred Collection"
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => { e.target.onerror = null; e.target.src = '/assets/images/HeroImage.png'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end p-3">
                <span className="text-white text-[11px] font-sans font-medium">Sacred Festive Picks</span>
              </div>
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────────
            SECTION 5: FEATURED COLLECTION
            Real Supabase products, mobile horizontal scroll
        ────────────────────────────────────────────────────────── */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-medium text-primary tracking-wide">
                <span>Featured </span>
                <span className="font-display italic text-[#B89968]">Collection</span>
              </h2>
              <p className="text-xs sm:text-sm text-muted font-light mt-1">
                Handpicked reiki-charged raw crystals and intentional jewelry.
              </p>
            </div>
            <Link
              to="/shop"
              className="text-xs font-semibold text-[#B89968] hover:underline flex items-center gap-1 uppercase tracking-wider"
            >
              View All →
            </Link>
          </div>

          {/* Mobile Horizontal Carousel / Desktop 4-col Grid */}
          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {featuredCollection.map((p, idx) => (
              <div key={p.id || idx} className="w-[190px] sm:w-auto flex-shrink-0 snap-start bg-white rounded-2xl p-2.5 sm:p-3 border border-[#E6DFD5] shadow-sm flex flex-col justify-between">
                <ProductCard {...p} eager={idx < 2} />
              </div>
            ))}
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────────
            SECTION 6: ROLLING TEXT / SERVICE STRIP
            Placed ABOVE "Curated Bundles", continuous marquee
        ────────────────────────────────────────────────────────── */}
        <section className="w-full bg-[#B89968] text-white py-3 overflow-hidden shadow-sm">
          <div className="whitespace-nowrap flex animate-marquee">
            <div className="flex items-center gap-8 text-xs font-medium tracking-widest uppercase flex-shrink-0">
              <span className="flex items-center gap-1.5"><Truck className="w-4 h-4" /> Free Delivery</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> COD Available</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><Gift className="w-4 h-4" /> Assured Guarantee</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4" /> Handpicked &amp; Energised</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><Truck className="w-4 h-4" /> Free Delivery</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> COD Available</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><Gift className="w-4 h-4" /> Assured Guarantee</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4" /> Handpicked &amp; Energised</span>
              <span>•</span>
            </div>
            <div className="flex items-center gap-8 text-xs font-medium tracking-widest uppercase flex-shrink-0 pl-8">
              <span className="flex items-center gap-1.5"><Truck className="w-4 h-4" /> Free Delivery</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> COD Available</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><Gift className="w-4 h-4" /> Assured Guarantee</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4" /> Handpicked &amp; Energised</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><Truck className="w-4 h-4" /> Free Delivery</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> COD Available</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><Gift className="w-4 h-4" /> Assured Guarantee</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4" /> Handpicked &amp; Energised</span>
              <span>•</span>
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────────
            SECTION 7: CURATED BUNDLES
            Matches reference: square image + badge + info + arrow
        ────────────────────────────────────────────────────────── */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-medium text-primary tracking-wide">
                <span>Curated </span>
                <span className="font-display italic text-[#B89968]">Bundles</span>
              </h2>
              <p className="text-xs sm:text-sm text-muted font-light mt-1">
                Thoughtfully paired crystals designed to complement each other.
              </p>
            </div>
            <Link
              to="/bundles"
              className="text-xs font-semibold text-[#B89968] hover:underline flex items-center gap-1 uppercase tracking-wider"
            >
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {homeBundles.length > 0 ? (
              homeBundles.map(bundle => (
                <div
                  key={bundle.id}
                  className="bg-[#FFF9F2] border border-[#E8DFD3] rounded-2xl p-4 sm:p-5 flex gap-4 items-center shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex-shrink-0 rounded-xl overflow-hidden bg-[#FAF0E6] border border-[#E6DFD5]">
                    {bundle.bundle_discount_percent > 0 && (
                      <span className="absolute top-2 left-2 bg-[#B89968] text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm z-10">
                        SAVE {bundle.bundle_discount_percent}%
                      </span>
                    )}
                    <img
                      src={bundle.imageUrl || '/assets/images/Carousel/slide2.jpg'}
                      alt={bundle.name}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex-grow flex flex-col justify-between h-full">
                    <div>
                      <h3 className="font-display text-base sm:text-xl font-medium text-primary leading-snug">
                        {bundle.name}
                      </h3>
                      <div className="flex items-baseline gap-2 mt-1 mb-2">
                        {bundle.originalPrice && bundle.originalPrice > bundle.price && (
                          <span className="text-xs text-[#7A6B5D] line-through font-light">
                            ₹{bundle.originalPrice}
                          </span>
                        )}
                        <span className="text-sm sm:text-base font-bold text-primary">
                          ₹{bundle.price}
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-[#6B5E50] leading-relaxed line-clamp-2">
                        {bundle.description || 'A thoughtful trio for creating calm, clarity, and mindful daily rituals.'}
                      </p>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Link
                        to={`/bundles/${bundle.slug}`}
                        className="w-8 h-8 rounded-full bg-[#B89968] hover:bg-[#8F744C] text-white flex items-center justify-center text-sm shadow transition-colors"
                        aria-label={`View ${bundle.name}`}
                      >
                        →
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-muted">
                Loading curated bundles...
              </div>
            )}
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────────
            SECTION 8: “NOT SURE WHAT TO GET?” BOOK A CONSULTATION
            Large rounded mobile banner with warm background & CTA
        ────────────────────────────────────────────────────────── */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r from-[#EFE5D8] via-[#E8DCCB] to-[#DBCBB5] border border-[#DDD0BC] p-6 sm:p-10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="max-w-lg z-10">
              <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-[#8B6B3E] uppercase block mb-1">
                NOT SURE WHAT TO GET?
              </span>
              <h2 className="font-display text-2xl sm:text-4xl font-medium text-primary mb-2 leading-tight">
                <span>Book a </span>
                <span className="font-display italic text-[#B89968]">Consultation</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#6B5E50] mb-5 font-sans leading-relaxed">
                Get personalized crystal recommendations for your energy, space or goals from our certified practitioners.
              </p>
              <Link
                to="/book-a-call"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#B89968] hover:bg-[#8F744C] text-white text-xs sm:text-sm font-semibold rounded-full shadow-md transition-all uppercase tracking-wider"
              >
                BOOK NOW →
              </Link>
            </div>

            {/* Consultation Banner Image */}
            <div className="relative w-full sm:w-80 h-44 sm:h-52 rounded-2xl overflow-hidden border border-[#D5BA93]/50 shadow-inner flex-shrink-0 bg-[#E8DCCB]">
              <img
                src="/assets/images/Bookyourcall.JPG.jpeg"
                alt="Book Consultation Reading"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end p-3">
                <span className="text-white text-[11px] font-sans font-medium">1-on-1 Energy Mapping</span>
              </div>
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────────
            SECTION 9: WATCH US MORE
            Horizontal mobile carousel with video cards & play buttons
        ────────────────────────────────────────────────────────── */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-medium text-primary tracking-wide">
                <span>Watch Us </span>
                <span className="font-display italic text-[#B89968]">More</span>
              </h2>
              <p className="text-xs sm:text-sm text-muted font-light mt-1">
                Step into our space and discover the energy behind our curation.
              </p>
            </div>
            <Link
              to="/aboutus"
              className="text-xs font-semibold text-[#B89968] hover:underline flex items-center gap-1 uppercase tracking-wider"
            >
              View All →
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {reelsData.map(reel => (
              <ReelCard
                key={reel.id}
                reel={reel}
                isPlaying={activeReelId === reel.id}
                onTogglePlay={handleTogglePlay}
              />
            ))}
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────────
            SECTION 10: LOVED BY THE COMMUNITY
            5-star testimonials horizontal cards
        ────────────────────────────────────────────────────────── */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-4 sm:mb-6">
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-medium text-primary tracking-wide">
              <span>Loved By the </span>
              <span className="font-display italic text-[#B89968]">Community</span>
            </h2>
            <span className="text-xs font-semibold text-[#B89968] uppercase tracking-wider">
              ★★★★★ Verified
            </span>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {testimonials.map((test, idx) => (
              <div
                key={idx}
                className="w-[270px] sm:w-[320px] flex-shrink-0 snap-start bg-[#FFF9F2] border border-[#E8DFD3] rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="text-[#D4AF37] text-sm mb-3">★★★★★</div>
                  <p className="text-xs sm:text-sm text-[#4A3E31] leading-relaxed font-sans italic">
                    "{test.quote}"
                  </p>
                </div>
                <span className="text-[10px] font-bold text-[#B89968] uppercase tracking-[0.15em] mt-5 block">
                  — {test.author}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────────
            SECTION 11: LEARN MORE
            Deep dives, grounding rituals & guides
        ────────────────────────────────────────────────────────── */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-medium text-primary tracking-wide">
                <span>Learn </span>
                <span className="font-display italic text-[#B89968]">More</span>
              </h2>
              <p className="text-xs sm:text-sm text-muted font-light mt-1">
                Explore deep dives, grounding rituals, and sacred space arrangement guides.
              </p>
            </div>
            <Link
              to="/blogs"
              className="text-xs font-semibold text-[#B89968] hover:underline flex items-center gap-1 uppercase tracking-wider"
            >
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/blogs?id=1"
              className="group bg-[#FFF9F2] border border-[#E8DFD3] rounded-2xl p-5 sm:p-6 hover:shadow-md hover:border-[#B89968] transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-[9px] font-bold text-[#B89968] uppercase tracking-[0.2em] block mb-2">
                  DEEP DIVE
                </span>
                <h3 className="font-display text-lg sm:text-xl font-medium text-primary group-hover:text-[#B89968] transition-colors mb-2 leading-snug">
                  Which Crystal for Anxiety — The Honest Guide
                </h3>
                <p className="text-xs text-[#6B5E50] leading-relaxed font-sans">
                  We break down the minerals that actually ground your nervous system, free of pseudo-science.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-bold text-[#B89968] gap-1">
                Read Guide <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              to="/blogs?id=3"
              className="group bg-[#FFF9F2] border border-[#E8DFD3] rounded-2xl p-5 sm:p-6 hover:shadow-md hover:border-[#B89968] transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-[9px] font-bold text-[#B89968] uppercase tracking-[0.2em] block mb-2">
                  PRACTICES
                </span>
                <h3 className="font-display text-lg sm:text-xl font-medium text-primary group-hover:text-[#B89968] transition-colors mb-2 leading-snug">
                  The 7-Day Root Reset: Grounding Guide
                </h3>
                <p className="text-xs text-[#6B5E50] leading-relaxed font-sans">
                  A simple, actionable guide to building stability from the ground up using Red Jasper.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-bold text-[#B89968] gap-1">
                Read Guide <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              to="/blogs?id=4"
              className="group bg-[#FFF9F2] border border-[#E8DFD3] rounded-2xl p-5 sm:p-6 hover:shadow-md hover:border-[#B89968] transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-[9px] font-bold text-[#B89968] uppercase tracking-[0.2em] block mb-2">
                  LIFESTYLE
                </span>
                <h3 className="font-display text-lg sm:text-xl font-medium text-primary group-hover:text-[#B89968] transition-colors mb-2 leading-snug">
                  Creating Your Sacred Space
                </h3>
                <p className="text-xs text-[#6B5E50] leading-relaxed font-sans">
                  How to arrange your crystals for maximum energetic flow and aesthetic balance in any room.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-bold text-[#B89968] gap-1">
                Read Guide <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </section>

      </div>
    </>
  );
}
