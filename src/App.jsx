import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Blogs from './pages/Blogs';
import BookCall from './pages/BookCall';
import Checkout from './pages/Checkout';
import Product from './pages/Product';
import ShopCrystals from './pages/ShopCrystals';
import ShopGems from './pages/ShopGems';
import ShopJewellery from './pages/ShopJewellery';
import ShopBracelets from './pages/ShopBracelets';
import ShopPendants from './pages/ShopPendants';
import ShopUtility from './pages/ShopUtility';
import TrackOrder from './pages/TrackOrder';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RefundPolicy from './pages/RefundPolicy';
import TermsConditions from './pages/TermsConditions';
function App() {
  return (
    <CartProvider>
      <Router>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow pt-20">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/aboutus" element={<About />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/book-a-call" element={<BookCall />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/product/:id" element={<Product />} />
              <Route path="/shop-crystals" element={<ShopCrystals />} />
              <Route path="/shop-gems" element={<ShopGems />} />
              <Route path="/shop-gemstones" element={<ShopGems />} />
              <Route path="/shop-jewellery" element={<ShopJewellery />} />
              <Route path="/shop-bracelets" element={<ShopBracelets />} />
              <Route path="/shop-pendants" element={<ShopPendants />} />
              <Route path="/shop-utility" element={<ShopUtility />} />
              <Route path="/track-order" element={<TrackOrder />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/terms-conditions" element={<TermsConditions />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
