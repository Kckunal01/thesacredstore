import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CANONICAL_TAXONOMY } from '../data/taxonomy';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [isMobileShopOpen, setIsMobileShopOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { getCartCount } = useContext(CartContext);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setIsShopDropdownOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;
  const isShopActive = location.pathname.startsWith('/shop');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const NavLink = ({ to, children }) => {
    const active = isActive(to);
    return (
      <Link to={to} className="relative group py-2 flex flex-col items-center">
        <span className={`text-primary transition-colors duration-300 ${active ? 'text-accent' : 'group-hover:text-accent'}`}>
          {children}
        </span>
        {active && (
          <motion.div
            layoutId="nav-underline"
            className="absolute bottom-0 w-full h-[1px] bg-accent"
            initial={false}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
        {!active && (
          <span className="absolute bottom-0 left-0 w-full h-[1px] bg-accent transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out" />
        )}
      </Link>
    );
  };

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-background/95 backdrop-blur-md shadow-sm py-2' : 'bg-background/90 backdrop-blur-sm py-3.5'}`}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* MOBILE HEADER (Matches Reference Image Exactly) */}
        <div className="flex md:hidden items-center justify-between h-12">
          {/* 1. Hamburger / Menu (Left) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-10 h-10 flex items-center justify-center text-primary hover:text-accent transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6 stroke-[1.5]" /> : <Menu className="w-6 h-6 stroke-[1.5]" />}
          </button>

          {/* 2. Sacred Store Logo (Centered) */}
          <Link to="/" className="flex items-center justify-center">
            <picture>
              <source srcSet="/assets/images/Logo-Nav.webp" type="image/webp" />
              <img src="/assets/images/Logo-Nav.png" alt="The Sacred Store" className="h-10 w-auto object-contain" />
            </picture>
          </Link>

          {/* 3. Search & Cart (Right) */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="w-10 h-10 flex items-center justify-center text-primary hover:text-accent transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5 stroke-[1.5]" />
            </button>
            <Link
              to="/checkout"
              className="relative w-10 h-10 flex items-center justify-center text-primary hover:text-accent transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
              {getCartCount() > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-primary text-[#FFBD59] text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
                  {getCartCount()}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* DESKTOP HEADER (Clean Adaptive Layout) */}
        <div className="hidden md:flex items-center justify-between h-14">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center">
            <picture>
              <source srcSet="/assets/images/Logo-Nav.webp" type="image/webp" />
              <img src="/assets/images/Logo-Nav.png" alt="The Sacred Store" className="h-12 w-auto object-contain" />
            </picture>
          </Link>

          {/* Center: Navigation — Home, Shop, Bundles, Book Now, About Us */}
          <nav className="flex items-center space-x-8 font-medium text-[11px] tracking-[0.15em] uppercase">
            <NavLink to="/">Home</NavLink>

            {/* Shop Dropdown with Canonical Hierarchy */}
            <div
              className="relative group py-2 flex flex-col items-center"
              onMouseEnter={() => setIsShopDropdownOpen(true)}
              onMouseLeave={() => setIsShopDropdownOpen(false)}
            >
              <Link
                to="/shop"
                className={`text-primary flex items-center gap-1 transition-colors duration-300 ${isShopActive ? 'text-accent' : 'group-hover:text-accent'}`}
              >
                Shop <ChevronDown className="w-3 h-3 transition-transform group-hover:rotate-180" />
              </Link>
              {isShopActive && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute bottom-0 w-full h-[1px] bg-accent"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}

              {/* Mega Dropdown */}
              <div
                className={`absolute top-[100%] -left-12 mt-2 w-[580px] bg-background border border-border shadow-xl rounded-xl p-6 grid grid-cols-3 gap-6 transition-all duration-300 z-50 ${
                  isShopDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'
                }`}
              >
                {/* Column 1: Accessories & Tumbles */}
                <div className="space-y-4">
                  <div>
                    <Link
                      to="/shop/accessories"
                      className="font-bold text-accent hover:underline block mb-2 text-xs"
                    >
                      Accessories
                    </Link>
                    <ul className="space-y-1.5 text-[10px] text-muted normal-case tracking-normal">
                      <li><Link to="/shop/accessories?sub=Bracelets" className="hover:text-primary transition-colors">Bracelets</Link></li>
                      <li><Link to="/shop/accessories?sub=Pendants" className="hover:text-primary transition-colors">Pendants</Link></li>
                      <li><Link to="/shop/accessories?sub=Malas" className="hover:text-primary transition-colors">Malas</Link></li>
                      <li><Link to="/shop/accessories?sub=Jube+Coin" className="hover:text-primary transition-colors">Jube Coin</Link></li>
                    </ul>
                  </div>
                  <div>
                    <Link
                      to="/shop/tumbles"
                      className="font-bold text-accent hover:underline block text-xs"
                    >
                      Tumbles
                    </Link>
                  </div>
                </div>

                {/* Column 2: Household & Variety Crystals */}
                <div className="space-y-4">
                  <div>
                    <Link
                      to="/shop/household"
                      className="font-bold text-accent hover:underline block mb-2 text-xs"
                    >
                      Household
                    </Link>
                    <ul className="space-y-1.5 text-[10px] text-muted normal-case tracking-normal">
                      <li><Link to="/shop/household?sub=Trees" className="hover:text-primary transition-colors">Trees</Link></li>
                      <li><Link to="/shop/household?sub=Pyramids" className="hover:text-primary transition-colors">Pyramids</Link></li>
                      <li><Link to="/shop/household?sub=Lamps" className="hover:text-primary transition-colors">Lamps</Link></li>
                    </ul>
                  </div>
                  <div>
                    <Link
                      to="/shop/variety-crystals"
                      className="font-bold text-accent hover:underline block mb-2 text-xs"
                    >
                      Variety Crystals
                    </Link>
                    <ul className="space-y-1.5 text-[10px] text-muted normal-case tracking-normal">
                      <li><Link to="/shop/variety-crystals?sub=Clusters" className="hover:text-primary transition-colors">Clusters</Link></li>
                      <li><Link to="/shop/variety-crystals?sub=Spheres" className="hover:text-primary transition-colors">Spheres</Link></li>
                      <li><Link to="/shop/variety-crystals?sub=Points" className="hover:text-primary transition-colors">Points</Link></li>
                    </ul>
                  </div>
                </div>

                {/* Column 3: Cleaning / Charging & Featured Collections */}
                <div className="space-y-4">
                  <div>
                    <Link
                      to="/shop/cleaning-charging"
                      className="font-bold text-accent hover:underline block mb-2 text-xs"
                    >
                      Cleaning / Charging
                    </Link>
                  </div>
                  <div className="pt-2 border-t border-border/60">
                    <Link
                      to="/bundles"
                      className="font-bold text-primary hover:text-accent block text-xs flex items-center gap-1 mb-1"
                    >
                      ✨ Curated Bundles
                    </Link>
                    <Link
                      to="/festive-offers"
                      className="font-bold text-accent hover:underline block text-xs"
                    >
                      🎁 Festive Offers (30% Off)
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <NavLink to="/bundles">Bundles</NavLink>
            <NavLink to="/book-a-call">Book Now</NavLink>
            <NavLink to="/aboutus">About Us</NavLink>
          </nav>

          {/* Right: Search, WhatsApp & Cart */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-primary hover:text-accent transition-colors w-9 h-9 flex items-center justify-center cursor-pointer"
              aria-label="Search products"
            >
              <Search className="w-5 h-5 stroke-[1.5]" />
            </button>
            <a
              href="https://wa.me/9554930456"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-accent transition-colors w-9 h-9 flex items-center justify-center cursor-pointer"
              aria-label="Contact WhatsApp"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </a>
            <Link
              to="/checkout"
              className="relative text-primary hover:text-accent transition-colors w-9 h-9 flex items-center justify-center cursor-pointer"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
              {getCartCount() > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-[#FFBD59] text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
                  {getCartCount()}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* SEARCH BAR OVERLAY */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-border pt-3 pb-2"
            >
              <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto relative">
                <input
                  type="text"
                  placeholder="Search crystals, bracelets, bundles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface border border-accent/40 rounded-full px-4 py-2 pl-10 pr-10 text-xs focus:outline-none focus:ring-1 focus:ring-accent text-primary placeholder-muted/60"
                  autoFocus
                />
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-accent" />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-primary"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* MOBILE DRAWER NAVIGATION */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden fixed top-full left-0 w-full bg-background border-b border-border shadow-2xl py-6 px-6 max-h-[calc(100vh-64px)] overflow-y-auto"
          >
            <nav className="flex flex-col space-y-4 font-display text-base tracking-wider uppercase text-primary">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="pb-2 hover:text-accent transition-colors"
              >
                Home
              </Link>

              {/* Shop Page Headings in Drawer */}
              <div className="pb-2">
                <Link
                  to="/shop"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:text-accent transition-colors font-medium block mb-2"
                >
                  Shop
                </Link>
                <div className="pl-3 space-y-2 font-display text-sm tracking-wider uppercase text-muted border-l border-accent/40">
                  <Link
                    to="/shop/accessories"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block hover:text-primary transition-colors"
                  >
                    Accessories
                  </Link>
                  <Link
                    to="/shop/tumbles"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block hover:text-primary transition-colors"
                  >
                    Tumbles
                  </Link>
                  <Link
                    to="/shop/household"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block hover:text-primary transition-colors"
                  >
                    Household
                  </Link>
                  <Link
                    to="/shop/variety-crystals"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block hover:text-primary transition-colors"
                  >
                    Variety Crystals
                  </Link>
                  <Link
                    to="/shop/cleaning-charging"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block hover:text-primary transition-colors"
                  >
                    Cleaning / Charging
                  </Link>
                </div>
              </div>

              <Link
                to="/bundles"
                onClick={() => setIsMobileMenuOpen(false)}
                className="pb-2 hover:text-accent transition-colors"
              >
                Bundles
              </Link>
              <Link
                to="/book-a-call"
                onClick={() => setIsMobileMenuOpen(false)}
                className="pb-2 hover:text-accent transition-colors"
              >
                Book Now
              </Link>
              <Link
                to="/aboutus"
                onClick={() => setIsMobileMenuOpen(false)}
                className="pb-2 hover:text-accent transition-colors"
              >
                About Us
              </Link>
            </nav>

            {/* Bottom Layer Links */}
            <div className="mt-8 pt-8 flex justify-center gap-4 px-4 pb-4">
              <Link to="/gift-shop" onClick={() => setIsMobileMenuOpen(false)} className="text-[10px] uppercase font-bold tracking-wider text-[#B89968] hover:text-primary">
                Gift Shop
              </Link>
              <Link to="/festive-offers" onClick={() => setIsMobileMenuOpen(false)} className="text-[10px] uppercase font-bold tracking-wider text-[#B89968] hover:text-primary">
                Festive Offers
              </Link>
              <Link to="/new-arrivals" onClick={() => setIsMobileMenuOpen(false)} className="text-[10px] uppercase font-bold tracking-wider text-[#B89968] hover:text-primary">
                New Arrivals
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
