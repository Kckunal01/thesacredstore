import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ProductsProvider } from './context/ProductsContext';
import Header from './components/Header';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import AskSacred from './components/AskSacred';
import ScrollToTop from './components/ScrollToTop';

// Pages
// ... (Pages imports)
import Home from './pages/Home';
import About from './pages/About';
import Blogs from './pages/Blogs';
import BookCall from './pages/BookCall';
import Checkout from './pages/Checkout';
import Product from './pages/Product';
import ShopCrystals from './pages/ShopCrystals';
import ShopJewellery from './pages/ShopJewellery';
import ShopBracelets from './pages/ShopBracelets';
import ShopPendants from './pages/ShopPendants';
import ShopUtility from './pages/ShopUtility';
import Shop from './pages/Shop';
import TrackOrder from './pages/TrackOrder';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RefundPolicy from './pages/RefundPolicy';
import TermsConditions from './pages/TermsConditions';
import Admin from './pages/Admin';
import Bundles from './pages/Bundles';
import BundleDetail from './pages/BundleDetail';
import SpecialisedCrystals from './pages/SpecialisedCrystals';

import WelcomePopup from './components/ui/WelcomePopup';

function App() {
  return (
    <ProductsProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <WelcomePopup />
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow pt-20">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/shop/accessories" element={<Shop initialCategory="Accessories" pageTitle="Accessories" description="Intentional bracelets, pendants, sacred malas, and ritual jube coins." />} />
              <Route path="/shop/tumbles" element={<Shop initialCategory="Tumbles" pageTitle="Tumbles" description="Pocket-sized, polished gemstone tumbles for daily energetic alignment." />} />
              <Route path="/shop/household" element={<Shop initialCategory="Household" pageTitle="Household" description="Handcrafted crystal trees, pyramids, and ambient lamps to anchor harmony in your home." />} />
              <Route path="/shop/variety-crystals" element={<Shop initialCategory="Variety Crystals" pageTitle="Variety Crystals" description="Raw crystal clusters, sacred spheres, and energy generator points." />} />
              <Route path="/shop/cleaning-charging" element={<Shop initialCategory="Cleaning / Charging" pageTitle="Cleaning / Charging" description="Selenite charging plates, cleansing bowls, and sound healing tools." />} />
              <Route path="/gift-shop" element={<Shop initialFilter="gift-shop" pageTitle="Gift Shop" />} />
              <Route path="/new-arrivals" element={<Shop initialFilter="new-arrivals" pageTitle="New Arrivals" />} />
              <Route path="/festive-offers" element={<Shop initialFilter="festive-offers" pageTitle="Festive Offers" />} />
              <Route path="/consultation" element={<BookCall />} />
              <Route path="/aboutus" element={<About />} />
              <Route path="/about" element={<About />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/book-a-call" element={<BookCall />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/product/:id" element={<Product />} />
              <Route path="/shop-crystals" element={<Shop initialCategory="Variety Crystals" pageTitle="Variety Crystals" />} />
              <Route path="/shop-jewellery" element={<Shop initialCategory="Accessories" pageTitle="Accessories" />} />
              <Route path="/shop-bracelets" element={<Shop initialCategory="Accessories" pageTitle="Accessories" />} />
              <Route path="/shop-pendants" element={<Shop initialCategory="Accessories" pageTitle="Accessories" />} />
              <Route path="/shop-utility" element={<Shop initialCategory="Household" pageTitle="Household" />} />
              <Route path="/specialised-crystals" element={<SpecialisedCrystals />} />
              <Route path="/track-order" element={<TrackOrder />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/terms-conditions" element={<TermsConditions />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/*" element={<Admin />} />
              <Route path="/bundles" element={<Bundles />} />
              <Route path="/bundles/:slug" element={<BundleDetail />} />
            </Routes>
          </main>
          <AskSacred />
          <FloatingWhatsApp />
          <Footer />
        </div>
      </Router>
    </CartProvider>
  </ProductsProvider>
  );
}

export default App;
