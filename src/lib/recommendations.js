/**
 * Smart Product Recommendations Engine
 * On Product Page and Cart, recommends exactly:
 * - 1 Specialised Crystal
 * - 1 Charging Product
 * - 1 Complementary Crystal
 * - 1 Bracelet
 */

export function getSmartRecommendations({ currentProduct, cartItems = [], allProducts }) {
  if (!allProducts || allProducts.length === 0) return [];

  const cartIds = new Set(cartItems.map(item => item.id?.toString()));
  const currentId = currentProduct?.id?.toString();

  const excludeIds = new Set([...cartIds]);
  if (currentId) excludeIds.add(currentId);

  // Pool of active, visible, in-stock products excluding current & cart items
  const pool = allProducts.filter(p => 
    p.active !== false &&
    p.visible !== false &&
    (p.stock ?? 0) > 0 &&
    !excludeIds.has(p.id?.toString())
  );

  // Helper to extract crystal type from name
  function getCrystalType(name) {
    if (!name) return '';
    const lower = name.toLowerCase();
    const crystals = [
      'selenite', 'amethyst', 'citrine', 'rose quartz', 'clear quartz',
      'green aventurine', 'tiger eye', 'black tourmaline', 'pyrite',
      'obsidian', 'labradorite', 'carnelian', 'malachite', 'howlite',
      'hematite', 'sodalite', 'fluorite', 'lapis lazuli', 'smoky quartz',
      'turquoise'
    ];
    for (const c of crystals) {
      if (lower.includes(c)) return c;
    }
    return '';
  }

  // Get target crystal types from current product and cart items
  const sourceCrystals = new Set();
  if (currentProduct) {
    const cc = getCrystalType(currentProduct.name);
    if (cc) sourceCrystals.add(cc);
  }
  cartItems.forEach(item => {
    const cc = getCrystalType(item.name);
    if (cc) sourceCrystals.add(cc);
  });

  // Compatibility logic
  function areCompatible(cA, cB) {
    if (!cA || !cB) return false;
    if (cA === cB) return false;
    if (cA === 'black tourmaline' || cB === 'black tourmaline') return true;
    if (cA === 'rose quartz' || cB === 'rose quartz') return true;
    if (cA === 'amethyst') return cB === 'citrine' || cB === 'clear quartz';
    if (cB === 'amethyst') return cA === 'citrine' || cA === 'clear quartz';
    if (cA === 'green aventurine') return cB === 'rose quartz' || cB === 'tiger eye';
    if (cB === 'green aventurine') return cA === 'rose quartz' || cA === 'tiger eye';
    if (cA === 'tiger eye') return cB === 'pyrite' || cB === 'citrine';
    if (cB === 'tiger eye') return cA === 'pyrite' || cA === 'citrine';
    return false;
  }

  const recommended = [];
  const recommendedIds = new Set();

  const addRec = (prod) => {
    if (!prod) return false;
    const pid = prod.id?.toString();
    if (recommendedIds.has(pid)) return false;
    recommended.push(prod);
    recommendedIds.add(pid);
    return true;
  };

  if (currentProduct && currentProduct.category === 'Specialised Crystals') {
    // Return only other Specialized Crystals
    return allProducts.filter(p => 
      p.category === 'Specialised Crystals' && 
      p.id?.toString() !== currentId && 
      p.active !== false &&
      p.visible !== false &&
      (p.stock ?? 0) > 0
    ).slice(0, 4);
  }

  if (currentProduct && currentProduct.collection === "Rakhi'26") {
    return allProducts.filter(p => 
      (p.collection === "Rakhi'26" || p.name.toLowerCase().includes('selenite plate') || p.name.toLowerCase().includes('selenite bowl')) &&
      p.id?.toString() !== currentId &&
      p.active !== false &&
      p.visible !== false
    ).slice(0, 4);
  }

  // Slot 1: Exactly 1 Specialised Crystal (Category = 'Specialised Crystals')
  const specialisedPool = pool.filter(p => p.category === 'Specialised Crystals');
  const specSelection = specialisedPool[0] || allProducts.find(p => p.category === 'Specialised Crystals');
  if (specSelection) addRec(specSelection);

  // Slot 2: Exactly 1 Charging Product (Name/Category contains charging, bowl, plate, lamp)
  const chargingPool = pool.filter(p => 
    !recommendedIds.has(p.id?.toString()) &&
    (p.name.toLowerCase().includes('charging') || 
      p.name.toLowerCase().includes('bowl') || 
      p.name.toLowerCase().includes('plate') || 
      p.name.toLowerCase().includes('lamp'))
  );
  const chargingSelection = chargingPool[0] || allProducts.find(p => 
    p.name.toLowerCase().includes('charging') || 
    p.name.toLowerCase().includes('bowl') || 
    p.name.toLowerCase().includes('plate')
  );
  if (chargingSelection) addRec(chargingSelection);

  // Slot 3: Exactly 1 Complementary Crystal (Category = 'Crystals', compatible with current/cart)
  const crystalsPool = pool.filter(p => p.category === 'Crystals' && !recommendedIds.has(p.id?.toString()));
  let compSelection = null;
  if (sourceCrystals.size > 0) {
    compSelection = crystalsPool.find(p => {
      const pCryst = getCrystalType(p.name);
      return Array.from(sourceCrystals).some(sc => areCompatible(pCryst, sc));
    });
  }
  if (!compSelection) {
    compSelection = crystalsPool[0];
  }
  const crystalSelection = compSelection || allProducts.find(p => p.category === 'Crystals');
  if (crystalSelection) addRec(crystalSelection);

  // Slot 4: Exactly 1 Bracelet (Category = 'Bracelets')
  const braceletsPool = pool.filter(p => p.category === 'Bracelets' && !recommendedIds.has(p.id?.toString()));
  const braceletSelection = braceletsPool[0] || allProducts.find(p => p.category === 'Bracelets');
  if (braceletSelection) addRec(braceletSelection);

  // Backfill if we don't have 4 slots filled
  if (recommended.length < 4) {
    for (const p of pool) {
      if (recommended.length >= 4) break;
      addRec(p);
    }
  }

  return recommended.slice(0, 4);
}

// Exactly 3 recommendations. Never recommend products already in cart, no duplicates, prefer same collection.
export function getCartRecommendations(cartItems, allProducts) {
  if (!allProducts || allProducts.length === 0) return [];

  const cartIds = new Set(cartItems.map(item => item.id?.toString()));
  const cartCategories = new Set(cartItems.map(item => item.category).filter(Boolean));

  const pool = allProducts.filter(p => 
    p.active !== false &&
    p.visible !== false &&
    (p.stock ?? 0) > 0 &&
    !cartIds.has(p.id?.toString())
  );

  const recommended = [];
  const recommendedIds = new Set();

  const addRec = (prod) => {
    if (!prod) return false;
    const pid = prod.id?.toString();
    if (recommendedIds.has(pid)) return false;
    recommended.push(prod);
    recommendedIds.add(pid);
    return true;
  };

  for (const p of pool) {
    if (cartCategories.has(p.category)) {
      addRec(p);
      if (recommended.length >= 3) break;
    }
  }

  if (recommended.length < 3) {
    for (const p of pool) {
      addRec(p);
      if (recommended.length >= 3) break;
    }
  }

  return recommended.slice(0, 3);
}
