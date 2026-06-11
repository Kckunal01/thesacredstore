import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { motion } from 'framer-motion';

const Header = () => {
  const { getCartCount } = useContext(CartContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

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
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        {/* Hover underline for non-active */}
        {!active && (
          <span className="absolute bottom-0 left-0 w-full h-[1px] bg-accent transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out" />
        )}
      </Link>
    );
  };

  const isShopActive = location.pathname.startsWith('/shop');

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-surface/95 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center space-x-2 font-display text-2xl tracking-[0.15em] uppercase font-medium text-accent hover:text-accent transition-colors">
            <img src="/assets/images/Logo-Nav.png" alt="Ritualist Logo" className="w-8 h-8 object-contain" />
            <span>RITUALIST</span>
          </Link>
          
          {/* Center: Navigation - Sequence: Home, Shop, Book Now, Blogs, About Us */}
          <nav className="hidden md:flex items-center space-x-10 font-medium text-[11px] tracking-[0.15em] uppercase">
            <NavLink to="/">Home</NavLink>
            <div className="relative group py-2 cursor-pointer flex flex-col items-center">
              <span className={`text-primary flex items-center transition-colors duration-300 ${isShopActive ? 'text-accent' : 'group-hover:text-accent'}`}>
                Shop 
              </span>
              {isShopActive && (
                <motion.div 
                  layoutId="nav-underline" 
                  className="absolute bottom-0 w-full h-[1px] bg-accent" 
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              {!isShopActive && (
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-accent transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out" />
              )}
              {/* Dropdown */}
              <div className="absolute top-[100%] left-0 mt-2 w-52 bg-surface border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-lg translate-y-2 group-hover:translate-y-0">
                <Link to="/shop-crystals" className="block px-6 py-3 text-primary hover:bg-background hover:text-accent transition-colors">Crystals</Link>
                <Link to="/shop-gems" className="block px-6 py-3 text-primary hover:bg-background hover:text-accent transition-colors">Gemstones</Link>
                <Link to="/shop-jewellery" className="block px-6 py-3 text-primary hover:bg-background hover:text-accent transition-colors">Jewellery</Link>
                <Link to="/shop-utility" className="block px-6 py-3 text-primary hover:bg-background hover:text-accent transition-colors">Utility & Decor</Link>
              </div>
            </div>
            <NavLink to="/book-a-call">Book Now</NavLink>
            <NavLink to="/blogs">Blogs</NavLink>
            <NavLink to="/about">About Us</NavLink>
          </nav>

          {/* Right: Cart */}
          <div className="flex items-center space-x-6">
            <Link to="/checkout" className="relative text-primary hover:text-accent transition-colors group">
              <ShoppingBag className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" strokeWidth={1.5} />
              {getCartCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-background text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {getCartCount()}
                </span>
              )}
            </Link>
            <button className="md:hidden text-primary hover:text-accent transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="w-6 h-6" strokeWidth={1.5} /> : <Menu className="w-6 h-6" strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-surface border-b border-border py-6 px-6 flex flex-col space-y-6 text-[11px] tracking-[0.15em] uppercase font-medium transition-all duration-300 transform origin-top ${isMobileMenuOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 pointer-events-none'}`}>
        <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-primary hover:text-accent">Home</Link>
        <Link to="/shop-crystals" onClick={() => setIsMobileMenuOpen(false)} className="text-primary hover:text-accent pl-4 border-l border-border">Crystals</Link>
        <Link to="/shop-gems" onClick={() => setIsMobileMenuOpen(false)} className="text-primary hover:text-accent pl-4 border-l border-border">Gemstones</Link>
        <Link to="/shop-jewellery" onClick={() => setIsMobileMenuOpen(false)} className="text-primary hover:text-accent pl-4 border-l border-border">Jewellery</Link>
        <Link to="/shop-utility" onClick={() => setIsMobileMenuOpen(false)} className="text-primary hover:text-accent pl-4 border-l border-border">Utility & Decor</Link>
        <Link to="/book-a-call" onClick={() => setIsMobileMenuOpen(false)} className="text-primary hover:text-accent">Book Now</Link>
        <Link to="/blogs" onClick={() => setIsMobileMenuOpen(false)} className="text-primary hover:text-accent">Blogs</Link>
        <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-primary hover:text-accent">About Us</Link>
      </div>
    </header>
  );
};

export default Header;
