import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { fetchProducts } from '../lib/productsService';
import Button from '../components/ui/Button';
import Container from '../components/ui/Container';
import Section from '../components/ui/Section';
import { Trash2, Edit, Plus, Image as ImageIcon, Search, ChevronDown, Check, X, ArrowUpCircle, ArrowDownCircle, AlertCircle, ShoppingBag, Truck, CheckCircle2, RotateCcw, Clock, MoreVertical, SearchIcon, Tag, LayoutDashboard, Package, ShoppingCart, Menu, Sparkles, Home, LogOut, Filter } from 'lucide-react';
import { getTaxonomyFlatList } from '../data/taxonomy';

const Admin = () => {
  // Auth states
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // App data states
  const [adminProducts, setAdminProducts] = useState([]);
  const [adminProductsLoading, setAdminProductsLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Navigation state: 'dashboard' | 'products' | 'bundles' | 'orders'
  const [activeTab, setActiveTab] = useState('dashboard');

  // UI search/filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  
  // Modals visibility states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);
  
  // Editing target state
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingBundle, setEditingBundle] = useState(null);

  // Bulk actions states
  const [bulkAction, setBulkAction] = useState('');
  const [bulkVal, setBulkVal] = useState('');

  // Selected Order Detail State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingOrderStatus, setUpdatingOrderStatus] = useState(false);

  // Product form state (NO bundle fields here)
  const [prodForm, setProdForm] = useState({
    name: '', slug: '', category: 'Crystals', description: '',
    price: '', original_price: '', stamp: 'none', featured: false,
    stock: 10, active: true, philosophy: '', details: '',
    usage: '', chakra: '', effect: '', origin: '',
    intention: '', dimensions: '', cleansing_charging: '', certificationNumber: '',
    image_url: '', gallery_images: []
  });

  // Bundle form state
  const [bundleForm, setBundleForm] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    gallery_images: [],
    bundle_discount_percent: 0,
    bundle_products: [], // array of product UUIDs
    bundle_product_descriptions: {}, // Map of { [productId]: specificDescription }
    active: true,
    featured: false
  });

  const [bundleSearchQuery, setBundleSearchQuery] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });

  // Auto-generate and validate slug for product or bundle
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Toast notification timer
  useEffect(() => {
    if (!toast.message) return;
    const timer = setTimeout(() => setToast({ message: '', type: '' }), 4000);
    return () => clearTimeout(timer);
  }, [toast.message]);

  // Auto logout after 30 minutes of inactivity
  useEffect(() => {
    if (!session || !isAdmin) return;

    let timeoutId;
    const INACTIVITY_LIMIT = 30 * 60 * 1000;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        setAuthLoading(true);
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        setAuthError('Your session has expired. Please sign in again.');
        setAuthLoading(false);
      }, INACTIVITY_LIMIT);
    };

    const events = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [session, isAdmin]);

  // Auth setup and change subscription
  useEffect(() => {
    const initSession = async () => {
      const { data: { session: activeSession } } = await supabase.auth.getSession();
      if (activeSession?.user) {
        await checkAdminStatus(activeSession.user.id, activeSession);
      } else {
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        setAuthLoading(false);
      }
    };
    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      switch (event) {
        case 'SIGNED_IN':
        case 'TOKEN_REFRESHED':
        case 'INITIAL_SESSION':
          if (newSession?.user) {
            await checkAdminStatus(newSession.user.id, newSession);
          } else {
            setSession(null);
            setUser(null);
            setIsAdmin(false);
            setAuthLoading(false);
          }
          break;
        case 'SIGNED_OUT':
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          setAuthLoading(false);
          break;
        default:
          break;
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId, activeSession) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching admin status:', error);
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        setAuthError('Unauthorized.');
      } else if (data?.is_admin) {
        setSession(activeSession);
        setUser(activeSession.user);
        setIsAdmin(true);
      } else {
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        setAuthError('Unauthorized.');
      }
    } catch (err) {
      console.error('Admin status check exception:', err);
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setIsAdmin(false);
      setAuthError('Unauthorized.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthError(error.message);
      }
    } catch (err) {
      setAuthError('An unexpected login error occurred.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    setAuthLoading(true);
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setIsAdmin(false);
    setAuthLoading(false);
  };

  // Fetch orders
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, customers(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch products
  const loadAllProducts = async () => {
    setAdminProductsLoading(true);
    try {
      const data = await fetchProducts(true);
      setAdminProducts(data || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setAdminProductsLoading(false);
    }
  };

  useEffect(() => {
    if (session && isAdmin) {
      fetchOrders();
      loadAllProducts();
    }
  }, [session, isAdmin]);

  const refreshProducts = async () => {
    await loadAllProducts();
  };

  // Helper to handle inline active toggle for products
  const handleInlineActiveToggle = async (prodId, currentActive) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ active: !currentActive })
        .eq('id', prodId);

      if (error) throw error;
      refreshProducts();
    } catch (err) {
      alert('Failed to update active state: ' + err.message);
    }
  };

  // Helper to handle inline active toggle for bundles
  const handleInlineBundleActiveToggle = async (bundleId, currentActive) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ active: !currentActive })
        .eq('id', bundleId);

      if (error) throw error;
      refreshProducts();
    } catch (err) {
      alert('Failed to update bundle active state: ' + err.message);
    }
  };

  // Bulk actions for products
  const handleBulkAction = async () => {
    if (selectedProductIds.length === 0) {
      setToast({ message: 'Please select at least one product.', type: 'error' });
      return;
    }
    if (!bulkAction) {
      setToast({ message: 'Please select an action to apply.', type: 'error' });
      return;
    }

    try {
      const selectedProds = adminProducts.filter(p => selectedProductIds.includes(p.id));
      const dbIds = selectedProds.map(p => p.db_id).filter(Boolean);

      if (dbIds.length === 0) {
        setToast({ message: 'Could not find database IDs for selection.', type: 'error' });
        return;
      }

      setToast({ message: 'Applying bulk updates...', type: 'info' });

      const updatePromises = selectedProds.map(p => {
        let updates = {};
        if (bulkAction === 'increase_price') {
          const pct = parseFloat(bulkVal) || 0;
          updates.price = Math.round(p.price * (1 + pct / 100));
        } else if (bulkAction === 'decrease_price') {
          const pct = parseFloat(bulkVal) || 0;
          updates.price = Math.max(0, Math.round(p.price * (1 - pct / 100)));
        } else if (bulkAction === 'fixed_discount') {
          const disc = parseFloat(bulkVal) || 0;
          updates.original_price = p.originalPrice || p.price;
          updates.price = Math.max(0, p.price - disc);
        } else if (bulkAction === 'stamp_fresh') {
          updates.stamp = 'Fresh';
        } else if (bulkAction === 'stamp_sale') {
          updates.stamp = 'Sale';
        } else if (bulkAction === 'stamp_none') {
          updates.stamp = 'none';
        } else if (bulkAction === 'activate') {
          updates.active = true;
        } else if (bulkAction === 'deactivate') {
          updates.active = false;
        } else if (bulkAction === 'feature') {
          updates.featured = true;
        } else if (bulkAction === 'unfeature') {
          updates.featured = false;
        }

        return supabase
          .from('products')
          .update(updates)
          .eq('id', p.db_id);
      });

      await Promise.all(updatePromises);
      setToast({ message: 'Bulk action executed successfully.', type: 'success' });
      setSelectedProductIds([]);
      refreshProducts();
    } catch (err) {
      setToast({ message: 'Error executing bulk action: ' + err.message, type: 'error' });
    }
  };

  // Image Upload handler (to Supabase storage)
  const handleImageUpload = async (e, fieldType, target = 'product') => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      if (target === 'product') {
        if (fieldType === 'cover') {
          setProdForm(prev => ({ ...prev, image_url: publicUrl }));
        } else {
          setProdForm(prev => ({ ...prev, gallery_images: [...(prev.gallery_images || []), publicUrl] }));
        }
      } else {
        if (fieldType === 'cover') {
          setBundleForm(prev => ({ ...prev, image_url: publicUrl }));
        } else {
          setBundleForm(prev => ({ ...prev, gallery_images: [...(prev.gallery_images || []), publicUrl] }));
        }
      }
    } catch (err) {
      alert('Image upload failed: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // Save Product
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const slugVal = prodForm.slug.trim() || generateSlug(prodForm.name);
      if (!slugVal) {
        alert('Slug cannot be empty.');
        return;
      }

      const payload = {
        name: prodForm.name.trim(),
        slug: slugVal,
        category: prodForm.category,
        description: prodForm.description,
        price: parseFloat(prodForm.price) || 0,
        original_price: prodForm.original_price ? parseFloat(prodForm.original_price) : null,
        stamp: prodForm.stamp,
        featured: prodForm.featured,
        stock: parseInt(prodForm.stock) || 0,
        active: prodForm.active,
        philosophy: prodForm.philosophy,
        details: prodForm.details,
        usage: prodForm.usage,
        chakra: prodForm.chakra,
        effect: prodForm.effect,
        origin: prodForm.origin,
        intentions: prodForm.intention,
        dimensions: prodForm.dimensions,
        cleansing_charging: prodForm.cleansing_charging,
        certification: prodForm.certificationNumber ? 'Certified' : null,
        certification_number: prodForm.certificationNumber,
        image_url: prodForm.image_url || null,
        gallery_images: prodForm.gallery_images || [],
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.db_id);
        if (error) throw error;
        setToast({ message: 'Product updated successfully.', type: 'success' });
      } else {
        const { error } = await supabase
          .from('products')
          .insert(payload);
        if (error) throw error;
        setToast({ message: 'Product created successfully.', type: 'success' });
      }

      setIsProductModalOpen(false);
      setEditingProduct(null);
      refreshProducts();
    } catch (err) {
      alert('Failed to save product: ' + err.message);
    }
  };

  // Bundle pricing logic (calculated dynamically)
  const bundlePrices = useMemo(() => {
    const selectedProds = adminProducts.filter(p => bundleForm.bundle_products.includes(p.id));
    const originalTotal = selectedProds.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0);
    const discountFactor = (100 - (parseFloat(bundleForm.bundle_discount_percent) || 0)) / 100;
    const finalTotal = Math.round(originalTotal * discountFactor);
    return { originalTotal, finalTotal };
  }, [bundleForm.bundle_products, bundleForm.bundle_discount_percent, adminProducts]);

  // Save Bundle
  const handleSaveBundle = async (e) => {
    e.preventDefault();
    try {
      const slugVal = bundleForm.slug.trim() || generateSlug(bundleForm.name);
      
      // Validations
      if (!bundleForm.name.trim()) {
        alert('Bundle name is required.');
        return;
      }
      if (!slugVal) {
        alert('Slug cannot be empty.');
        return;
      }
      if (!bundleForm.image_url) {
        alert('Cover image is required.');
        return;
      }
      if (bundleForm.bundle_products.length < 2) {
        alert('A bundle must contain at least 2 products.');
        return;
      }
      const disc = parseFloat(bundleForm.bundle_discount_percent);
      if (isNaN(disc) || disc < 0 || disc > 100) {
        alert('Discount % must be between 0 and 100.');
        return;
      }

      // Check duplicates in slug
      const slugExists = adminProducts.some(p => p.slug === slugVal && p.id !== (editingBundle?.db_id || editingBundle?.id));
      if (slugExists) {
        alert('A product or bundle with this slug already exists.');
        return;
      }

      const payload = {
        name: bundleForm.name.trim(),
        slug: slugVal,
        category: 'Bundles',
        description: bundleForm.description,
        price: bundlePrices.finalTotal,
        original_price: bundlePrices.originalTotal,
        image_url: bundleForm.image_url,
        gallery_images: bundleForm.gallery_images,
        bundle_discount_percent: disc,
        bundle_products: bundleForm.bundle_products,
        bundle_product_descriptions: bundleForm.bundle_product_descriptions,
        active: bundleForm.active,
        featured: bundleForm.featured,
        // No crystal specs
        stock: 10,
        philosophy: editingBundle?.philosophy || '',
        details: editingBundle?.details || '',
        usage: editingBundle?.usage || '',
        chakra: editingBundle?.chakra || '',
        effect: editingBundle?.effect || '',
        origin: editingBundle?.origin || '',
        intentions: editingBundle?.intentions || '',
        dimensions: editingBundle?.dimensions || '',
        cleansing_charging: editingBundle?.cleansing_charging || ''
      };

      if (editingBundle) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingBundle.db_id);
        if (error) throw error;
        setToast({ message: 'Bundle updated successfully.', type: 'success' });
      } else {
        const { error } = await supabase
          .from('products')
          .insert(payload);
        if (error) throw error;
        setToast({ message: 'Bundle created successfully.', type: 'success' });
      }

      setIsBundleModalOpen(false);
      setEditingBundle(null);
      refreshProducts();
    } catch (err) {
      alert('Failed to save bundle: ' + err.message);
    }
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setProdForm({
      name: prod.name || '',
      slug: prod.slug || '',
      category: prod.category || 'Crystals',
      description: prod.description || '',
      price: prod.price || '',
      original_price: prod.originalPrice || prod.original_price || '',
      stamp: prod.stamp || 'none',
      featured: !!prod.featured,
      stock: prod.stock !== undefined ? prod.stock : 10,
      active: prod.active !== undefined ? prod.active : true,
      philosophy: prod.philosophy || '',
      details: prod.details || '',
      usage: prod.usage || '',
      chakra: prod.chakra || '',
      effect: prod.effect || '',
      origin: prod.origin || '',
      intention: prod.intentions || '',
      dimensions: prod.dimensions || '',
      cleansing_charging: prod.cleansing_charging || '',
      certificationNumber: prod.certification_number || '',
      image_url: prod.image_url || '',
      gallery_images: prod.gallery_images || [],
    });
    setIsProductModalOpen(true);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setProdForm({
      name: '', slug: '', category: 'Crystals', description: '',
      price: '', original_price: '', stamp: 'none', featured: false,
      stock: 10, active: true, philosophy: '', details: '',
      usage: '', chakra: '', effect: '', origin: '',
      intention: '', dimensions: '', cleansing_charging: '', certificationNumber: '',
      image_url: '', gallery_images: [],
    });
    setIsProductModalOpen(true);
  };

  const openAddBundleModal = () => {
    setEditingBundle(null);
    setBundleForm({
      name: '',
      slug: '',
      description: '',
      image_url: '',
      gallery_images: [],
      bundle_discount_percent: 0,
      bundle_products: [],
      bundle_product_descriptions: {},
      active: true,
      featured: false
    });
    setIsBundleModalOpen(true);
  };

  const openEditBundleModal = (bndl) => {
    setEditingBundle(bndl);
    setBundleForm({
      name: bndl.name || '',
      slug: bndl.slug || '',
      description: bndl.description || '',
      image_url: bndl.image_url || '',
      gallery_images: bndl.gallery_images || [],
      bundle_discount_percent: bndl.bundle_discount_percent || 0,
      bundle_products: bndl.bundle_products || [],
      bundle_product_descriptions: bndl.bundle_product_descriptions || {},
      active: bndl.active !== false,
      featured: !!bndl.featured
    });
    setIsBundleModalOpen(true);
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrderStatus(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setUpdatingOrderStatus(false);
    }
  };

  // Update order shipping tracking ID
  const handleUpdateOrderTracking = async (orderId, trackingId) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ tracking_id: trackingId })
        .eq('id', orderId);

      if (error) throw error;
      alert('Tracking ID updated.');
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, tracking_id: trackingId }));
      }
    } catch (err) {
      alert('Failed to update tracking: ' + err.message);
    }
  };

  // Toggles for bulk select
  const toggleProductSelect = (id) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllProducts = (filtered) => {
    if (selectedProductIds.length === filtered.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filtered.map(p => p.id));
    }
  };

  const uniqueCategories = useMemo(() => {
    return ['All', ...getTaxonomyFlatList()];
  }, []);

  // Filtered actual products (category !== 'Bundles')
  const filteredProducts = useMemo(() => {
    return adminProducts.filter(p => {
      if (p.category === 'Bundles') return false;
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [adminProducts, searchTerm, categoryFilter]);

  // Filtered bundles list
  const filteredBundles = useMemo(() => {
    return adminProducts.filter(p => {
      if (p.category !== 'Bundles') return false;
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [adminProducts, searchTerm]);

  // Get available products list for bundle selection
  const poolProductsForBundle = useMemo(() => {
    return adminProducts.filter(p => p.category !== 'Bundles');
  }, [adminProducts]);

  // Filtered list of products inside the bundle picker modal
  const bundlePickerFilteredProducts = useMemo(() => {
    return poolProductsForBundle.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(bundleSearchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(bundleSearchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [poolProductsForBundle, bundleSearchQuery]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FEFBF1] flex items-center justify-center">
        <div className="text-center font-display text-accent tracking-widest text-lg animate-pulse">
          Checking authentication...
        </div>
      </div>
    );
  }

  if (!session || !isAdmin) {
    return (
      <Section className="min-h-screen bg-[#FEFBF1] pt-32 flex items-center justify-center">
        <Container className="max-w-md bg-white border border-border p-8 rounded-sm shadow-sm">
          <div className="text-center mb-8">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#000000] font-bold block mb-2">Internal Portal</span>
            <h1 className="text-3xl font-display font-medium text-primary">Founder Operations</h1>
          </div>
          {session && !isAdmin ? (
            <div className="space-y-6 text-center">
              <p className="text-red-500 text-sm font-light font-body">
                Access Denied. Your account is not configured with administrator permissions.
              </p>
              <button
                onClick={handleLogout}
                className="w-full bg-[#000000] hover:bg-[#FFBD59] text-white hover:text-black py-3 text-xs uppercase tracking-[0.2em] font-bold transition-colors font-body"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              {authError && (
                <div className="p-3 bg-red-50 text-red-500 text-xs font-light font-body border border-red-200">
                  {authError}
                </div>
              )}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-muted font-bold mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FEFBF1]/40 border border-border p-4 text-sm focus:outline-none focus:border-accent text-primary transition-colors font-body"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-muted font-bold mb-2">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#FEFBF1]/40 border border-border p-4 text-sm focus:outline-none focus:border-accent text-primary transition-colors font-body"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#000000] hover:bg-[#FFBD59] text-white hover:text-black py-4 text-xs uppercase tracking-[0.2em] font-bold transition-colors font-body"
              >
                Sign In
              </button>
            </form>
          )}
        </Container>
      </Section>
    );
  }

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  const lowStockProds = adminProducts.filter(p => p.category !== 'Bundles' && p.stock <= 2).length;

  return (
    <Section className="bg-[#FEFBF1] min-h-screen pt-24 pb-12 relative">
      {toast.message && (
        <div className={`fixed top-24 right-6 z-50 px-6 py-3 border text-xs font-semibold uppercase tracking-wider shadow-lg transition-all duration-300 ${
          toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-700' :
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
          'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          {toast.message}
        </div>
      )}
      <Container>
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-border pb-6 mb-8 gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-accent font-bold block mb-1">The Sacred Store HQ</span>
            <h1 className="text-4xl font-display font-medium text-primary">Sacred Operations</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted font-light font-body">{user.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-surface hover:bg-border border border-border text-primary px-4 py-2 text-[10px] uppercase tracking-wider font-bold transition-all"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-border mb-8 gap-6">
          {['dashboard', 'products', 'bundles', 'orders'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-xs uppercase tracking-[0.2em] font-bold transition-all duration-200 relative ${
                activeTab === tab ? 'text-primary' : 'text-muted hover:text-primary'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-accent"></div>
              )}
            </button>
          ))}
        </div>

        {/* -------------------- TAB: DASHBOARD -------------------- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-border p-6 flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-muted font-bold block mb-1">Total Orders</span>
                  <span className="text-3xl font-display font-semibold text-primary">{totalOrders}</span>
                </div>
                <ShoppingCart className="w-8 h-8 text-accent/40" />
              </div>
              <div className="bg-white border border-border p-6 flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-muted font-bold block mb-1">Pending Shipment</span>
                  <span className="text-3xl font-display font-semibold text-accent">{pendingOrders}</span>
                </div>
                <Package className="w-8 h-8 text-accent/40" />
              </div>
              <div className="bg-white border border-border p-6 flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-muted font-bold block mb-1">Low Inventory Items</span>
                  <span className="text-3xl font-display font-semibold text-red-500">{lowStockProds}</span>
                </div>
                <Filter className="w-8 h-8 text-red-400/40" />
              </div>
            </div>

            {/* Low Stock Quick List */}
            <div className="bg-white border border-border p-6 rounded-sm">
              <h3 className="text-lg font-display text-primary font-medium mb-4">Immediate Restock Recommendations</h3>
              {adminProducts.filter(p => p.category !== 'Bundles' && p.stock <= 2).length === 0 ? (
                <p className="text-sm font-light text-muted font-body">All crystal channels are fully stocked.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-body">
                    <thead>
                      <tr className="border-b border-border text-muted">
                        <th className="pb-3 uppercase tracking-wider font-bold">Product</th>
                        <th className="pb-3 uppercase tracking-wider font-bold">Category</th>
                        <th className="pb-3 uppercase tracking-wider font-bold">Current Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminProducts.filter(p => p.category !== 'Bundles' && p.stock <= 2).map(p => (
                        <tr key={p.id} className="border-b border-border/40 last:border-0">
                          <td className="py-3 font-semibold text-primary">{p.name}</td>
                          <td className="py-3 text-muted">{p.category}</td>
                          <td className="py-3 text-red-500 font-bold">{p.stock} units</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* -------------------- TAB: PRODUCTS -------------------- */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-grow max-w-xl">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Search name, slug or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-border px-4 py-2.5 pl-10 text-xs focus:outline-none focus:border-accent text-primary placeholder-muted/60"
                  />
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-white border border-border px-4 py-2.5 text-xs focus:outline-none focus:border-accent text-primary"
                >
                  {uniqueCategories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'All' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 bg-[#000000] hover:bg-[#FFBD59] text-white hover:text-black px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-bold transition-all font-body"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>

            {/* Bulk Action Bar */}
            <div className="bg-white border border-border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase tracking-wider text-muted font-bold">Bulk Action:</span>
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="bg-[#FEFBF1] border border-border px-3 py-1.5 text-xs focus:outline-none text-primary"
                >
                  <option value="">Choose action...</option>
                  <option value="increase_price">Increase Price by %</option>
                  <option value="decrease_price">Decrease Price by %</option>
                  <option value="fixed_discount">Apply Flat Discount (INR)</option>
                  <option value="stamp_fresh">Set Stamp: Fresh</option>
                  <option value="stamp_sale">Set Stamp: Sale</option>
                  <option value="stamp_none">Remove Stamp</option>
                  <option value="activate">Activate</option>
                  <option value="deactivate">Deactivate</option>
                  <option value="feature">Feature</option>
                  <option value="unfeature">Unfeature</option>
                </select>
                {['increase_price', 'decrease_price', 'fixed_discount'].includes(bulkAction) && (
                  <input
                    type="number"
                    placeholder="Value"
                    value={bulkVal}
                    onChange={(e) => setBulkVal(e.target.value)}
                    className="w-20 bg-[#FEFBF1] border border-border px-3 py-1.5 text-xs focus:outline-none text-primary"
                  />
                )}
                <button
                  onClick={handleBulkAction}
                  className="bg-primary hover:bg-[#FFBD59] text-white hover:text-black px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold transition-all"
                >
                  Apply
                </button>
              </div>
              <span className="text-[10px] text-muted font-semibold">
                {selectedProductIds.length} of {filteredProducts.length} selected
              </span>
            </div>

            {/* Products Table */}
            <div className="bg-white border border-border overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-body">
                <thead>
                  <tr className="border-b border-border bg-[#FEFBF1]/40 text-muted">
                    <th className="p-4 w-8">
                      <input
                        type="checkbox"
                        checked={selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0}
                        onChange={() => toggleSelectAllProducts(filteredProducts)}
                        className="accent-accent"
                      />
                    </th>
                    <th className="p-4 uppercase tracking-wider font-bold">Image</th>
                    <th className="p-4 uppercase tracking-wider font-bold">Name</th>
                    <th className="p-4 uppercase tracking-wider font-bold">Category</th>
                    <th className="p-4 uppercase tracking-wider font-bold">Price</th>
                    <th className="p-4 uppercase tracking-wider font-bold">Original</th>
                    <th className="p-4 uppercase tracking-wider font-bold text-center">Active</th>
                    <th className="p-4 uppercase tracking-wider font-bold text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(p => (
                    <tr key={p.id} className="border-b border-border/40 hover:bg-[#FEFBF1]/20">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedProductIds.includes(p.id)}
                          onChange={() => toggleProductSelect(p.id)}
                          className="accent-accent"
                        />
                      </td>
                      <td className="p-4">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="w-10 h-12 object-contain bg-[#FEFBF1] border border-border" />
                        ) : (
                          <div className="w-10 h-12 bg-[#FEFBF1] border border-border flex items-center justify-center text-[10px] text-muted">No Img</div>
                        )}
                      </td>
                      <td className="p-4 font-semibold text-primary">{p.name}</td>
                      <td className="p-4 text-muted">{p.category}</td>
                      <td className="p-4 font-semibold">₹{p.price}</td>
                      <td className="p-4 text-muted/75">{p.original_price ? `₹${p.original_price}` : '-'}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleInlineActiveToggle(p.db_id, p.active)}
                          className={`inline-flex p-1.5 rounded-full transition-all ${
                            p.active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                          }`}
                        >
                          {p.active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1 hover:text-accent text-primary transition-all inline-block"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan="8" className="p-12 text-center text-muted font-light font-body">No products matched current query.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* -------------------- TAB: BUNDLES -------------------- */}
        {activeTab === 'bundles' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-grow max-w-xl">
                <input
                  type="text"
                  placeholder="Search bundle name or slug..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-border px-4 py-2.5 pl-10 text-xs focus:outline-none focus:border-accent text-primary placeholder-muted/60"
                />
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
              </div>
              <button
                onClick={openAddBundleModal}
                className="flex items-center gap-2 bg-[#000000] hover:bg-[#FFBD59] text-white hover:text-black px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-bold transition-all font-body"
              >
                <Plus className="w-4 h-4" /> Add Bundle
              </button>
            </div>

            {/* Bundles Table */}
            <div className="bg-white border border-border overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-body">
                <thead>
                  <tr className="border-b border-border bg-[#FEFBF1]/40 text-muted">
                    <th className="p-4 uppercase tracking-wider font-bold">Image</th>
                    <th className="p-4 uppercase tracking-wider font-bold">Name</th>
                    <th className="p-4 uppercase tracking-wider font-bold">Included Products Count</th>
                    <th className="p-4 uppercase tracking-wider font-bold">Calculated Price</th>
                    <th className="p-4 uppercase tracking-wider font-bold">Original Price</th>
                    <th className="p-4 uppercase tracking-wider font-bold">Discount %</th>
                    <th className="p-4 uppercase tracking-wider font-bold text-center">Active</th>
                    <th className="p-4 uppercase tracking-wider font-bold text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBundles.map(b => (
                    <tr key={b.id} className="border-b border-border/40 hover:bg-[#FEFBF1]/20">
                      <td className="p-4">
                        {b.image_url ? (
                          <img src={b.image_url} alt={b.name} className="w-10 h-12 object-contain bg-[#FEFBF1] border border-border" />
                        ) : (
                          <div className="w-10 h-12 bg-[#FEFBF1] border border-border flex items-center justify-center text-[10px] text-muted">No Img</div>
                        )}
                      </td>
                      <td className="p-4 font-semibold text-primary">{b.name}</td>
                      <td className="p-4 text-muted">{(b.bundle_products || []).length} products</td>
                      <td className="p-4 font-semibold">₹{b.price}</td>
                      <td className="p-4 text-muted/75">₹{b.original_price || b.price}</td>
                      <td className="p-4 font-bold text-accent">{b.bundle_discount_percent || 0}%</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleInlineBundleActiveToggle(b.db_id, b.active)}
                          className={`inline-flex p-1.5 rounded-full transition-all ${
                            b.active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                          }`}
                        >
                          {b.active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => openEditBundleModal(b)}
                          className="p-1 hover:text-accent text-primary transition-all inline-block"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredBundles.length === 0 && (
                    <tr>
                      <td colSpan="8" className="p-12 text-center text-muted font-light font-body">No bundles found in database.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* -------------------- TAB: ORDERS -------------------- */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-white border border-border overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-body">
                <thead>
                  <tr className="border-b border-border bg-[#FEFBF1]/40 text-muted">
                    <th className="p-4 uppercase tracking-wider font-bold">Order ID</th>
                    <th className="p-4 uppercase tracking-wider font-bold">Date</th>
                    <th className="p-4 uppercase tracking-wider font-bold">Customer</th>
                    <th className="p-4 uppercase tracking-wider font-bold">Amount</th>
                    <th className="p-4 uppercase tracking-wider font-bold">Status</th>
                    <th className="p-4 uppercase tracking-wider font-bold">Tracking ID</th>
                    <th className="p-4 uppercase tracking-wider font-bold text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} className="border-b border-border/40 hover:bg-[#FEFBF1]/20">
                      <td className="p-4 font-bold text-primary">{o.order_id}</td>
                      <td className="p-4 text-muted">{new Date(o.created_at).toLocaleDateString()}</td>
                      <td className="p-4">
                        <div className="font-semibold text-primary">{o.customers?.full_name}</div>
                        <div className="text-[10px] text-muted">{o.customers?.phone}</div>
                      </td>
                      <td className="p-4 font-semibold text-primary">₹{o.amount.toLocaleString('en-IN')}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-[9px] uppercase tracking-wider font-bold rounded-sm ${
                          o.status === 'Delivered' ? 'bg-green-50 text-green-700 border border-green-200' :
                          o.status === 'Cancelled' ? 'bg-red-50 text-red-600 border border-red-200' :
                          o.status === 'Shipped' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {o.status || 'Pending'}
                        </span>
                      </td>
                      <td className="p-4 text-muted font-mono">{o.tracking_id || '-'}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan="7" className="p-12 text-center text-muted font-light font-body">No orders found in database.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Container>

      {/* -------------------- MODAL: PRODUCT EDIT/ADD (CLEANED) -------------------- */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FEFBF1] border border-border w-full max-w-4xl max-h-screen overflow-y-auto p-4 md:p-8 rounded-sm shadow-xl my-4 relative">
            <button
              onClick={() => setIsProductModalOpen(false)}
              className="absolute top-4 right-4 text-muted hover:text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-display text-2xl text-primary mb-6 uppercase tracking-wider">
              {editingProduct ? 'Edit Crystal Tool' : 'Add New Crystal Tool'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-6 text-xs font-body">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted font-bold mb-2">Name</label>
                  <input
                    required
                    type="text"
                    value={prodForm.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setProdForm(prev => ({
                        ...prev,
                        name: newName,
                        slug: prev.slug === generateSlug(prev.name) ? generateSlug(newName) : prev.slug
                      }));
                    }}
                    className="w-full bg-white border border-border p-3 focus:outline-none focus:border-accent text-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted font-bold mb-2">Slug</label>
                  <input
                    type="text"
                    placeholder="Auto-generated if empty"
                    value={prodForm.slug}
                    onChange={(e) => setProdForm({...prodForm, slug: generateSlug(e.target.value)})}
                    className="w-full bg-white border border-border p-3 focus:outline-none focus:border-accent text-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted font-bold mb-2">Category</label>
                  <select
                    value={prodForm.category}
                    onChange={(e) => setProdForm({...prodForm, category: e.target.value})}
                    className="w-full bg-white border border-border p-3 focus:outline-none focus:border-accent text-primary"
                  >
                    <option value="Bracelets">Bracelets</option>
                    <option value="Crystals">Crystals</option>
                    <option value="Specialised Crystals">Specialised Crystals</option>
                    <option value="Utility & Decor">Utility & Decor</option>
                    <option value="Pendants">Pendants</option>
                    <option value="Bundles">Bundles</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted font-bold mb-2">Price (INR)</label>
                  <input
                    required
                    type="number"
                    value={prodForm.price}
                    onChange={(e) => setProdForm({...prodForm, price: e.target.value})}
                    className="w-full bg-white border border-border p-3 focus:outline-none focus:border-accent text-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted font-bold mb-2">Original Price (INR)</label>
                  <input
                    type="number"
                    value={prodForm.original_price}
                    onChange={(e) => setProdForm({...prodForm, original_price: e.target.value})}
                    className="w-full bg-white border border-border p-3 focus:outline-none focus:border-accent text-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted font-bold mb-2">Chakra Alignment / Crystal Composition</label>
                  <input
                    type="text"
                    value={prodForm.chakra}
                    onChange={(e) => setProdForm({...prodForm, chakra: e.target.value})}
                    className="w-full bg-white border border-border p-3 focus:outline-none focus:border-accent text-primary"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted font-bold mb-2">Stamp (Ribbon)</label>
                  <select
                    value={prodForm.stamp}
                    onChange={(e) => setProdForm({...prodForm, stamp: e.target.value})}
                    className="w-full bg-white border border-border p-3 focus:outline-none focus:border-accent text-primary"
                  >
                    <option value="none">None</option>
                    <option value="Fresh">Fresh</option>
                    <option value="Sale">Sale</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted font-bold mb-2">Stock Inventory</label>
                  <input
                    required
                    type="number"
                    value={prodForm.stock}
                    onChange={(e) => setProdForm({...prodForm, stock: e.target.value})}
                    className="w-full bg-white border border-border p-3 focus:outline-none focus:border-accent text-primary"
                  />
                </div>
                <div>
                  <div className="flex gap-6 mt-6">
                    <label className="flex items-center gap-2 font-bold uppercase tracking-wider text-muted text-[10px] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prodForm.active}
                        onChange={(e) => setProdForm({ ...prodForm, active: e.target.checked })}
                        className="accent-accent"
                      />
                      Active / Available
                    </label>
                    <label className="flex items-center gap-2 font-bold uppercase tracking-wider text-muted text-[10px] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prodForm.featured}
                        onChange={(e) => setProdForm({ ...prodForm, featured: e.target.checked })}
                        className="accent-accent"
                      />
                      Featured
                    </label>
                  </div>
                </div>
              </div>

              {/* Specs & Info */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-surface p-4 border border-border/40">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted font-bold mb-2">Intention</label>
                  <input
                    type="text"
                    value={prodForm.intention}
                    onChange={(e) => setProdForm({ ...prodForm, intention: e.target.value })}
                    className="w-full bg-white border border-border p-3 focus:outline-none focus:border-accent text-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted font-bold mb-2">Dimensions (cm)</label>
                  <input
                    type="text"
                    value={prodForm.dimensions}
                    onChange={(e) => setProdForm({ ...prodForm, dimensions: e.target.value })}
                    placeholder="e.g., 10×12×5"
                    className="w-full bg-white border border-border p-3 focus:outline-none focus:border-accent text-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted font-bold mb-2">Origin</label>
                  <input
                    type="text"
                    value={prodForm.origin}
                    onChange={(e) => setProdForm({ ...prodForm, origin: e.target.value })}
                    className="w-full bg-white border border-border p-3 focus:outline-none focus:border-accent text-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted font-bold mb-2">Certification Number</label>
                  <input
                    type="text"
                    value={prodForm.certificationNumber}
                    onChange={(e) => setProdForm({ ...prodForm, certificationNumber: e.target.value })}
                    placeholder="10‑digit number"
                    maxLength={10}
                    className="w-full bg-white border border-border p-3 focus:outline-none focus:border-accent text-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-muted font-bold mb-2">Description</label>
                <textarea
                  value={prodForm.description}
                  onChange={(e) => setProdForm({...prodForm, description: e.target.value})}
                  rows="3"
                  className="w-full bg-white border border-border p-3 focus:outline-none focus:border-accent text-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase tracking-wider text-muted font-bold mb-2">Cleansing & Charging</label>
                  <textarea
                    rows="2"
                    value={prodForm.cleansing_charging}
                    onChange={(e) => setProdForm({ ...prodForm, cleansing_charging: e.target.value })}
                    placeholder="e.g., Moonlight or Selenite Plate"
                    className="w-full bg-white border border-border p-3 focus:outline-none focus:border-accent text-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted font-bold mb-2">Philosophy</label>
                  <textarea
                    value={prodForm.philosophy}
                    onChange={(e) => setProdForm({...prodForm, philosophy: e.target.value})}
                    rows="2"
                    className="w-full bg-white border border-border p-3 focus:outline-none focus:border-accent text-primary resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted font-bold mb-2">Integrity Details</label>
                  <textarea
                    value={prodForm.details}
                    onChange={(e) => setProdForm({...prodForm, details: e.target.value})}
                    rows="2"
                    className="w-full bg-white border border-border p-3 focus:outline-none focus:border-accent text-primary resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#FEFBF1]/50 border border-border/40 p-4">
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-muted font-bold mb-2">Cover Image</span>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'cover')}
                      disabled={uploadingImage}
                      className="text-xs text-muted"
                    />
                    {prodForm.image_url && (
                      <img src={prodForm.image_url} alt="Cover Preview" className="w-16 h-16 object-contain border border-border bg-white" />
                    )}
                  </div>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-muted font-bold mb-2">Gallery Images</span>
                  <div className="flex flex-col gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'gallery')}
                      disabled={uploadingImage}
                      className="text-xs text-muted"
                    />
                    <div className="flex gap-2 overflow-x-auto py-1">
                      {prodForm.gallery_images?.map((url, idx) => (
                        <div key={idx} className="relative group">
                          <img src={url} alt="Gallery Preview" className="w-14 h-14 object-contain border border-border bg-white" />
                          <button
                            type="button"
                            onClick={() => setProdForm({...prodForm, gallery_images: prodForm.gallery_images.filter(x => x !== url)})}
                            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="bg-white border border-border px-6 py-2.5 uppercase tracking-widest font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="bg-[#000000] hover:bg-[#FFBD59] text-white hover:text-black px-8 py-2.5 uppercase tracking-[0.2em] font-bold transition-all"
                >
                  Save Tool
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- MODAL: BUNDLE EDIT/ADD (NEW) -------------------- */}
      {isBundleModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FEFBF1] border border-border w-full max-w-5xl max-h-screen overflow-y-auto p-4 md:p-8 rounded-sm shadow-xl my-4 relative">
            <button
              onClick={() => setIsBundleModalOpen(false)}
              className="absolute top-4 right-4 text-muted hover:text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-display text-2xl text-primary mb-6 uppercase tracking-wider">
              {editingBundle ? 'Edit Curated Bundle' : 'Add New Curated Bundle'}
            </h3>

            <form onSubmit={handleSaveBundle} className="space-y-6 text-xs font-body">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted font-bold mb-2">Bundle Name</label>
                  <input
                    required
                    type="text"
                    value={bundleForm.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setBundleForm(prev => ({
                        ...prev,
                        name: newName,
                        slug: prev.slug === generateSlug(prev.name) ? generateSlug(newName) : prev.slug
                      }));
                    }}
                    className="w-full bg-white border border-border p-3 focus:outline-none focus:border-accent text-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted font-bold mb-2">Slug</label>
                  <input
                    type="text"
                    placeholder="Auto-generated if empty"
                    value={bundleForm.slug}
                    onChange={(e) => setBundleForm({...bundleForm, slug: generateSlug(e.target.value)})}
                    className="w-full bg-white border border-border p-3 focus:outline-none focus:border-accent text-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted font-bold mb-2">Bundle Discount %</label>
                  <input
                    required
                    type="number"
                    min="0"
                    max="100"
                    value={bundleForm.bundle_discount_percent}
                    onChange={(e) => setBundleForm({...bundleForm, bundle_discount_percent: Math.min(100, Math.max(0, parseInt(e.target.value) || 0))})}
                    className="w-full bg-white border border-border p-3 focus:outline-none focus:border-accent text-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-muted font-bold mb-2">Description</label>
                <textarea
                  required
                  value={bundleForm.description}
                  onChange={(e) => setBundleForm({...bundleForm, description: e.target.value})}
                  rows="3"
                  className="w-full bg-white border border-border p-3 focus:outline-none focus:border-accent text-primary resize-none"
                />
              </div>

              {/* Pricing breakdown summary */}
              <div className="bg-[#FEFBF1]/80 border border-accent/20 p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-muted font-bold mb-1">Products Subtotal</span>
                  <span className="text-base font-bold text-primary">₹{bundlePrices.originalTotal}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-muted font-bold mb-1">Discount % applied</span>
                  <span className="text-base font-bold text-accent">{bundleForm.bundle_discount_percent}%</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-muted font-bold mb-1">Calculated Final Price</span>
                  <span className="text-base font-bold text-emerald-600">₹{bundlePrices.finalTotal}</span>
                </div>
                <div className="flex gap-4 items-center">
                  <label className="flex items-center gap-2 font-bold uppercase tracking-wider text-muted text-[10px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bundleForm.active}
                      onChange={(e) => setBundleForm({ ...bundleForm, active: e.target.checked })}
                      className="accent-accent"
                    />
                    Active
                  </label>
                  <label className="flex items-center gap-2 font-bold uppercase tracking-wider text-muted text-[10px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bundleForm.featured}
                      onChange={(e) => setBundleForm({ ...bundleForm, featured: e.target.checked })}
                      className="accent-accent"
                    />
                    Featured
                  </label>
                </div>
              </div>

              {/* INCLUDED PRODUCTS SELECTION INTERFACE */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left picker box */}
                <div className="lg:col-span-7 bg-white border border-border p-4 flex flex-col h-[350px]">
                  <span className="block text-[10px] uppercase tracking-wider text-muted font-bold mb-2">Available Products Picker</span>
                  <input
                    type="text"
                    placeholder="Search name or category..."
                    value={bundleSearchQuery}
                    onChange={(e) => setBundleSearchQuery(e.target.value)}
                    className="w-full bg-[#FEFBF1]/40 border border-border p-2 text-xs focus:outline-none mb-3"
                  />
                  <div className="flex-grow overflow-y-auto space-y-2 pr-2">
                    {bundlePickerFilteredProducts.map(p => {
                      const isSelected = bundleForm.bundle_products.includes(p.id);
                      const isOutOfStock = (p.stock ?? 0) <= 0;
                      const isInactive = !p.active;

                      return (
                        <div 
                          key={p.id} 
                          className={`flex items-center justify-between p-2 border rounded-sm text-xs ${
                            isSelected ? 'bg-accent/5 border-accent' : 'bg-white border-border/60'
                          } ${isInactive ? 'opacity-50' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            {p.image_url ? (
                              <img src={p.image_url} alt={p.name} className="w-8 h-8 object-cover border border-border" />
                            ) : (
                              <div className="w-8 h-8 bg-background flex items-center justify-center text-[8px] text-muted">No Img</div>
                            )}
                            <div>
                              <div className="font-semibold text-primary flex items-center gap-1.5">
                                {p.name} 
                                {isOutOfStock && <span className="text-[8px] uppercase tracking-widest bg-red-100 text-red-700 px-1 font-bold">Out of Stock</span>}
                                {isInactive && <span className="text-[8px] uppercase tracking-widest bg-gray-200 text-gray-700 px-1 font-bold">Inactive (Disabled)</span>}
                              </div>
                              <div className="text-[10px] text-muted">{p.category} · ₹{p.price}</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={isInactive}
                            onClick={() => {
                              const alreadySelected = bundleForm.bundle_products.includes(p.id);
                              let updated = [];
                              if (alreadySelected) {
                                updated = bundleForm.bundle_products.filter(id => id !== p.id);
                              } else {
                                updated = [...bundleForm.bundle_products, p.id];
                              }
                              setBundleForm(prev => ({ ...prev, bundle_products: updated }));
                            }}
                            className={`px-3 py-1 text-[9px] uppercase tracking-wider font-bold rounded-sm border ${
                              isInactive ? 'border-gray-200 text-gray-400 cursor-not-allowed' :
                              isSelected ? 'border-accent bg-accent text-white hover:bg-accent/90' :
                              'border-border hover:border-accent text-primary'
                            }`}
                          >
                            {isSelected ? 'Remove' : 'Select'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right re-ordering & description mapping box */}
                <div className="lg:col-span-5 bg-white border border-border p-4 flex flex-col h-[350px]">
                  <span className="block text-[10px] uppercase tracking-wider text-muted font-bold mb-2">
                    Curation List (Order & specific descriptions)
                  </span>
                  
                  <div className="flex-grow overflow-y-auto space-y-3 pr-2">
                    {bundleForm.bundle_products.map((productId, index) => {
                      const prod = adminProducts.find(p => p.id === productId);
                      if (!prod) return null;

                      return (
                        <div key={productId} className="p-3 border border-border/80 bg-[#FEFBF1]/20 flex flex-col gap-2 rounded-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-muted font-bold">{index + 1}.</span>
                              <span className="font-semibold text-primary">{prod.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={() => {
                                  const updated = [...bundleForm.bundle_products];
                                  const temp = updated[index - 1];
                                  updated[index - 1] = updated[index];
                                  updated[index] = temp;
                                  setBundleForm(prev => ({ ...prev, bundle_products: updated }));
                                }}
                                className="p-1 hover:text-accent disabled:opacity-30 text-primary"
                              >
                                <ArrowUpCircle className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                disabled={index === bundleForm.bundle_products.length - 1}
                                onClick={() => {
                                  const updated = [...bundleForm.bundle_products];
                                  const temp = updated[index + 1];
                                  updated[index + 1] = updated[index];
                                  updated[index] = temp;
                                  setBundleForm(prev => ({ ...prev, bundle_products: updated }));
                                }}
                                className="p-1 hover:text-accent disabled:opacity-30 text-primary"
                              >
                                <ArrowDownCircle className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = bundleForm.bundle_products.filter(id => id !== productId);
                                  setBundleForm(prev => ({ ...prev, bundle_products: updated }));
                                }}
                                className="p-1 text-rose-500 hover:text-rose-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div>
                            <input
                              type="text"
                              placeholder="Bundle-specific description (optional)"
                              value={bundleForm.bundle_product_descriptions[productId] || ''}
                              onChange={(e) => {
                                const newDesc = e.target.value;
                                setBundleForm(prev => ({
                                  ...prev,
                                  bundle_product_descriptions: {
                                    ...prev.bundle_product_descriptions,
                                    [productId]: newDesc
                                  }
                                }));
                              }}
                              className="w-full bg-white border border-border/80 p-2 text-[10px] focus:outline-none"
                            />
                          </div>
                        </div>
                      );
                    })}
                    {bundleForm.bundle_products.length === 0 && (
                      <div className="py-12 text-center text-muted font-light">No items curated yet. Select items from the left list.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Cover & Gallery upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#FEFBF1]/50 border border-border/40 p-4">
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-muted font-bold mb-2">Bundle Cover Image</span>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'cover', 'bundle')}
                      disabled={uploadingImage}
                      className="text-xs text-muted"
                    />
                    {bundleForm.image_url && (
                      <img src={bundleForm.image_url} alt="Cover Preview" className="w-16 h-16 object-contain border border-border bg-white" />
                    )}
                  </div>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-muted font-bold mb-2">Gallery Images</span>
                  <div className="flex flex-col gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'gallery', 'bundle')}
                      disabled={uploadingImage}
                      className="text-xs text-muted"
                    />
                    <div className="flex gap-2 overflow-x-auto py-1">
                      {bundleForm.gallery_images?.map((url, idx) => (
                        <div key={idx} className="relative group">
                          <img src={url} alt="Gallery Preview" className="w-14 h-14 object-contain border border-border bg-white" />
                          <button
                            type="button"
                            onClick={() => setBundleForm({...bundleForm, gallery_images: bundleForm.gallery_images.filter(x => x !== url)})}
                            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsBundleModalOpen(false)}
                  className="bg-white border border-border px-6 py-2.5 uppercase tracking-widest font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="bg-[#000000] hover:bg-[#FFBD59] text-white hover:text-black px-8 py-2.5 uppercase tracking-[0.2em] font-bold transition-all"
                >
                  Save Bundle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- MODAL: ORDER DETAILS -------------------- */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FEFBF1] border border-border max-w-2xl w-full p-8 relative rounded-sm shadow-xl my-8 text-xs font-body">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-muted hover:text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-display text-2xl text-primary mb-6 uppercase tracking-wider">
              Order Detail – {selectedOrder.order_id}
            </h3>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 border-b border-border pb-4">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted font-bold block mb-1">Customer Details</span>
                  <div className="font-semibold text-primary">{selectedOrder.customers?.full_name}</div>
                  <div className="text-muted">{selectedOrder.customers?.email}</div>
                  <div className="text-muted">{selectedOrder.customers?.phone}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted font-bold block mb-1">Order Logistics</span>
                  <div className="text-muted">Date: {new Date(selectedOrder.created_at).toLocaleString()}</div>
                  <div className="text-muted">Gateway: {selectedOrder.payment_method}</div>
                  <div className="font-bold text-accent">Total: ₹{selectedOrder.amount.toLocaleString('en-IN')}</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted font-bold block mb-2">Order Status</span>
                  <select
                    value={selectedOrder.status || 'Pending'}
                    disabled={updatingOrderStatus}
                    onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}
                    className="bg-white border border-border p-2 focus:outline-none text-primary font-semibold"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted font-bold block mb-2">Logistics Tracking Code</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter carrier & ID (e.g. Bluedart 12345)"
                      defaultValue={selectedOrder.tracking_id || ''}
                      onBlur={(e) => handleUpdateOrderTracking(selectedOrder.id, e.target.value)}
                      className="bg-white border border-border p-2 focus:outline-none text-primary"
                    />
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted font-bold block mb-3">Line Items</span>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                  {selectedOrder.products?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white p-3 border border-border/40">
                      <div>
                        <span className="font-semibold text-primary">{item.name}</span>
                        <span className="text-[10px] uppercase tracking-widest text-accent font-bold ml-3">x{item.quantity}</span>
                      </div>
                      <span className="font-semibold text-primary">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="bg-black hover:bg-accent text-white hover:text-black px-6 py-2 uppercase tracking-widest font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
};

export default Admin;
