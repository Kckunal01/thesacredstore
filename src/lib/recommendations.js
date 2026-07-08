/**
 * Smart Product Upsell Engine (Cart Only)
 * Deterministic rule-based recommendation logic computed locally.
 */

// Helper to normalize category from string
function getNormalizedCategory(categoryStr) {
  if (!categoryStr) return 'Crystal';
  const c = categoryStr.toLowerCase().trim();
  if (c.includes('bracelet')) return 'Bracelet';
  if (c.includes('pendant')) return 'Pendant';
  if (c.includes('gemstone') || c.includes('gem')) return 'Gemstone';
  if (c.includes('utility') || c.includes('decor')) {
    if (c.includes('decor')) return 'Decor';
    return 'Utility';
  }
  if (c.includes('crystal')) return 'Crystal';
  // Fallback to title case
  return categoryStr.charAt(0).toUpperCase() + categoryStr.slice(1);
}

// Helper to extract crystal identity from name
function getCrystalIdentity(name) {
  if (!name) return '';
  const n = name.toLowerCase();
  
  if (n.includes('selenite')) return 'Selenite';
  if (n.includes('tourmaline')) return 'Black Tourmaline';
  if (n.includes('rose quartz')) return 'Rose Quartz';
  if (n.includes('clear quartz')) return 'Clear Quartz';
  if (n.includes('amethyst')) return 'Amethyst';
  if (n.includes('citrine')) return 'Citrine';
  if (n.includes('aventurine')) return 'Green Aventurine';
  if (n.includes('tiger eye') || n.includes("tiger's eye")) return 'Tiger Eye';
  if (n.includes('7 chakra') || n.includes('seven chakra')) return '7 Chakra';
  
  // Custom fallback heuristic for other crystal types
  const words = name.split(' ');
  if (words.length > 0) {
    // Return first word if it looks like the mineral name
    return words[0];
  }
  return name;
}

// Main recommendation engine function
export function getCartRecommendations(cartItems, allProducts) {
  if (!allProducts || allProducts.length === 0) {
    return [];
  }

  // 1. Identify cart contents & normalized identities
  const cartProductIds = new Set(cartItems.map(item => item.id));
  const cartCrystalIdentities = new Set(
    cartItems.map(item => getCrystalIdentity(item.name))
  );
  
  const cartCategories = new Set(
    cartItems.map(item => getNormalizedCategory(item.category))
  );

  const hasSeleniteInCart = Array.from(cartCrystalIdentities).some(id => id === 'Selenite');

  // Normalize every product in our pool
  const normalizedProducts = allProducts.map(p => {
    return {
      ...p,
      normalizedCategory: getNormalizedCategory(p.category),
      crystalIdentity: getCrystalIdentity(p.name)
    };
  });

  // Identify if any bundle is in the cart
  const hasBundleInCart = cartItems.some(item => item.isBundle || item.isCustomBundle || item.category === 'Bundles');

  // 2. Strict Filter: eligible recommendations
  const eligiblePool = normalizedProducts.filter(p => {
    // - Not already in cart (matching id)
    if (cartProductIds.has(p.id)) return false;
    // - Active
    if (p.active === false) return false;
    // - Visible
    if (p.visible === false) return false;
    // - Stock > 0
    if (p.stock <= 0) return false;
    // - Different crystal identity (must not match any crystal identity currently in the cart)
    if (cartCrystalIdentities.has(p.crystalIdentity)) return false;
    
    // IF bundle is in cart, ONLY upsell jewellery or selenite products
    if (hasBundleInCart) {
      const isJewellery = p.normalizedCategory === 'Jewellery' || p.category === 'Jewellery' || p.category === 'Bracelets' || p.category === 'Pendants';
      const isSelenite = p.crystalIdentity === 'Selenite';
      if (!isJewellery && !isSelenite) {
        return false;
      }
    }

    return true;
  });

  // If pool is too small, return empty or fallback early
  if (eligiblePool.length < 2) {
    return eligiblePool; // Or fallback random collection
  }

  // Helper to determine compatibilities
  // Black Tourmaline & Rose Quartz are compatible with everything
  // Amethyst is compatible with Clear Quartz and Citrine
  // Green Aventurine is compatible with Rose Quartz and Tiger Eye (15% probability)
  function isCompatible(crystalA, crystalB) {
    if (crystalA === 'Black Tourmaline' || crystalB === 'Black Tourmaline') return true;
    if (crystalA === 'Rose Quartz' || crystalB === 'Rose Quartz') return true;
    
    if (crystalA === 'Amethyst') {
      return crystalB === 'Clear Quartz' || crystalB === 'Citrine';
    }
    if (crystalB === 'Amethyst') {
      return crystalA === 'Clear Quartz' || crystalA === 'Citrine';
    }

    if (crystalA === 'Green Aventurine') {
      if (crystalB === 'Rose Quartz' || crystalB === 'Tiger Eye') {
        return Math.random() < 0.15;
      }
    }
    if (crystalB === 'Green Aventurine') {
      if (crystalA === 'Rose Quartz' || crystalA === 'Tiger Eye') {
        return Math.random() < 0.15;
      }
    }

    return false;
  }

  // 3. Recommendation 1: "Completes Your Ritual" (High Relevance Rules)
  // Let's find first cart item category to base high relevance rules on
  const primaryCartCategory = cartItems.length > 0 
    ? getNormalizedCategory(cartItems[0].category) 
    : 'Crystal';

  let rec1Candidates = [];

  if (!hasSeleniteInCart) {
    // High relevance rules targeting Selenite
    if (['Bracelet', 'Crystal', 'Gemstone'].includes(primaryCartCategory)) {
      rec1Candidates = eligiblePool.filter(p => p.crystalIdentity === 'Selenite' && p.normalizedCategory === 'Utility');
    } else if (primaryCartCategory === 'Pendant') {
      rec1Candidates = eligiblePool.filter(p => p.crystalIdentity === 'Selenite' && p.normalizedCategory === 'Utility' && p.name.toLowerCase().includes('bowl'));
      if (rec1Candidates.length === 0) {
        rec1Candidates = eligiblePool.filter(p => p.crystalIdentity === 'Selenite' && p.normalizedCategory === 'Utility');
      }
    } else if (['Utility', 'Decor'].includes(primaryCartCategory)) {
      // Recommend a compatible crystal
      const cartCrystalName = cartItems[0] ? getCrystalIdentity(cartItems[0].name) : '';
      rec1Candidates = eligiblePool.filter(p => p.normalizedCategory === 'Crystal' && isCompatible(p.crystalIdentity, cartCrystalName));
    }
  } else {
    // Selenite exists in cart. Never recommend another Selenite.
    // Try to find a compatible crystal matching cart products
    const cartCrystals = Array.from(cartCrystalIdentities);
    rec1Candidates = eligiblePool.filter(p => {
      if (p.crystalIdentity === 'Selenite') return false;
      return cartCrystals.some(cc => isCompatible(p.crystalIdentity, cc));
    });
  }

  let rec1 = null;
  if (rec1Candidates.length > 0) {
    rec1 = rec1Candidates[0]; // Take first best match
  } else {
    // Heuristic compatibility search or first eligible
    const cartCrystals = Array.from(cartCrystalIdentities);
    const compatibleWithCart = eligiblePool.filter(p => {
      if (p.crystalIdentity === 'Selenite' && hasSeleniteInCart) return false;
      return cartCrystals.some(cc => isCompatible(p.crystalIdentity, cc));
    });
    if (compatibleWithCart.length > 0) {
      rec1 = compatibleWithCart[0];
    } else {
      rec1 = eligiblePool[0];
    }
  }

  // 4. Recommendation 2: "Discover Something Different" (Must come from a DIFFERENT category)
  const remainingPool = eligiblePool.filter(p => p.id !== rec1.id && p.crystalIdentity !== rec1.crystalIdentity);
  const differentCategoryPool = remainingPool.filter(p => p.normalizedCategory !== rec1.normalizedCategory);

  let rec2 = null;
  if (differentCategoryPool.length > 0) {
    // Sort or choose based on compatibility/relevance if possible
    const cartCrystals = Array.from(cartCrystalIdentities);
    const compatibleMatches = differentCategoryPool.filter(p => {
      if (p.crystalIdentity === 'Selenite' && hasSeleniteInCart) return false;
      return cartCrystals.some(cc => isCompatible(p.crystalIdentity, cc));
    });
    if (compatibleMatches.length > 0) {
      rec2 = compatibleMatches[0];
    } else {
      rec2 = differentCategoryPool[0];
    }
  } else if (remainingPool.length > 0) {
    // Fallback if no different category is left: take from remaining pool
    rec2 = remainingPool[0];
  }

  if (rec1 && rec2) {
    return [rec1, rec2];
  }

  // Final Fallback: Return two random eligible products
  const shuffled = [...eligiblePool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 2).map(p => ({ ...p, isFallback: true }));
}
