import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
// ProductsContext import removed; using direct Supabase fetch for admin
import Button from '../components/ui/Button';
import Container from '../components/ui/Container';
import Section from '../components/ui/Section';
import { Search, Plus, Filter, Edit, Package, DollarSign, ShoppingCart, LogOut, Check, X, ArrowUp, ArrowDown, Percent, Image, Trash2 } from 'lucide-react';

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
const products = adminProducts;
const productsLoading = adminProductsLoading;
const refreshProducts = async () => { await loadAllProducts(); };

  // Navigation state: 'dashboard' | 'products' | 'orders'
  const [activeTab, setActiveTab] = useState('dashboard');

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Bulk actions states
  const [bulkAction, setBulkAction] = useState('');
  const [bulkVal, setBulkVal] = useState('');

  // Selected Order Detail State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingOrderStatus, setUpdatingOrderStatus] = useState(false);

  // New/Edit product form states
  const [prodForm, setProdForm] = useState({
    name: '', slug: '', category: 'Crystals', description: '',
    price: '', original_price: '', stamp: 'none', featured: false,
    stock: 10, active: true, philosophy: '', details: '',
    usage: '', chakra: '', effect: '', origin: '',
    image_url: '', gallery_images: []
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  // 1. Auto logout after 30 minutes of inactivity
  useEffect(() => {
    if (!session || !isAdmin) return;

    let timeoutId;
    const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes

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

    // Events to monitor for activity
    const events = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    
    // Start initial timer
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [session, isAdmin]);

  // Check user authentication and profiles.is_admin
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
        // Unauthorized
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
        // Not an admin: unauthorized
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

  useEffect(() => {
    if (session && isAdmin) {
      fetchOrders();
      loadAllProducts();
    }
  }, [session, isAdmin]);

  // Load all products (admin view)
const loadAllProducts = async () => {
  setAdminProductsLoading(true);
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    setAdminProducts((data || []).map(item => ({ ...item, db_id: item.id })));
  } catch (err) {
    console.error('Failed to load products:', err);
  } finally {
    setAdminProductsLoading(false);
  }
};

// Handle inline stock updates
  const handleInlineStockUpdate = async (prodId, newStock) => {
    try {
      const stockVal = parseInt(newStock) || 0;
      const { error } = await supabase
        .from('products')
        .update({ stock: stockVal })
        .eq('id', prodId);

      if (error) throw error;
      refreshProducts();
    } catch (err) {
      alert('Failed to update stock: ' + err.message);
    }
  };

  // Handle inline active toggles
// Handle inline active toggles
const handleInlineActiveToggle = async (prodId, currentActive) => {

  const product = products.find(p => p.db_id === prodId);

  const payload = { active: !currentActive };

  try {
    const { error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', prodId);

    if (error) throw error;
    refreshProducts();

  } catch (err) {
    alert('Failed to update active state: ' + err.message);

  }

};

  // Toast notification state
  const [toast, setToast] = useState({ message: '', type: '' });

  useEffect(() => {
    if (!toast.message) return;
    const timer = setTimeout(() => setToast({ message: '', type: '' }), 4000);
    return () => clearTimeout(timer);
  }, [toast.message]);

  // Bulk operation processing
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
      const selectedProds = products.filter(p => selectedProductIds.includes(p.id));
      const dbIds = selectedProds.map(p => p.db_id).filter(Boolean);

      if (dbIds.length === 0) {
        setToast({ message: 'Could not find Supabase db_ids for selected products.', type: 'error' });
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
          .eq('id', p.db_id)
          .then(({ error }) => {
            if (error) throw error;
          });
      });

      await Promise.all(updatePromises);

      setToast({ message: 'Bulk action executed successfully.', type: 'success' });
      setSelectedProductIds([]);
      refreshProducts();
    } catch (err) {
      setToast({ message: 'Error executing bulk action: ' + err.message, type: 'error' });
    }
  };

  // Image Upload handler (Vite / client upload to storage)
  const handleImageUpload = async (e, fieldType) => {
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

      if (fieldType === 'cover') {
        setProdForm(prev => ({ ...prev, image_url: publicUrl }));
      } else {
        setProdForm(prev => ({ ...prev, gallery_images: [...(prev.gallery_images || []), publicUrl] }));
      }
    } catch (err) {
      alert('Image upload failed: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // Save Product (Create or Edit)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: prodForm.name,
        slug: prodForm.slug || prodForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
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
        image_url: prodForm.image_url || null,
        gallery_images: prodForm.gallery_images || []
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.db_id);
        if (error) throw error;
        alert('Product updated successfully.');
      } else {
        const { error } = await supabase
          .from('products')
          .insert(payload);
        if (error) throw error;
        alert('Product created successfully.');
      }

      setIsProductModalOpen(false);
      setEditingProduct(null);
      refreshProducts();
    } catch (err) {
      alert('Failed to save product: ' + err.message);
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
      original_price: prod.originalPrice || '',
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
      image_url: prod.image_url || (prod.images && prod.images[0]) || '',
      gallery_images: prod.gallery_images || prod.images || []
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
      image_url: '', gallery_images: []
    });
    setIsProductModalOpen(true);
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

  // Toggle selections
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

   // Filtered products list
 const filteredProducts = products.filter(p => {
   const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     p.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
     p.category.toLowerCase().includes(searchTerm.toLowerCase());
   const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
   return matchesSearch && matchesCategory;
 }); 


  // Loading indicator for Auth check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FEFBF1] flex items-center justify-center">
        <div className="text-center font-display text-accent tracking-widest text-lg animate-pulse">
          Checking authentication...
        </div>
      </div>
    );
  }

  // Not authenticated login screen
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

  // Dashboard calculations
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  const lowStockProds = products.filter(p => p.stock <= 2).length;

  return (
    <Section className="bg-[#FEFBF1] min-h-screen pt-24 pb-12 relative">
      {/* Toast Notification Container */}
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
            <span className="text-[10px] uppercase tracking-[0.3em] text-accent font-bold block mb-1">Ritualist HQ</span>
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
          {['dashboard', 'products', 'orders'].map(tab => (
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
                  <span className="text-3xl font-display font-semibold text-primary">{pendingOrders}</span>
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
              {products.filter(p => p.stock <= 2).length === 0 ? (
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
                      {products.filter(p => p.stock <= 2).map(p => (
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
            {/* Search and Filter Bar */}
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
                  <option value="All">All Categories</option>
                  <option value="Crystals">Crystals</option>
                  <option value="Gemstones">Gemstones</option>
                  <option value="Jewellery">Jewellery</option>
                  <option value="Bracelets">Bracelets</option>
                  <option value="Pendants">Pendants</option>
                  <option value="Utility & Decor">Utility & Decor</option>
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
                    <th className="p-4 uppercase tracking-wider font-bold">Stamp</th>
                    <th className="p-4 uppercase tracking-wider font-bold text-center">Stock</th>
                    <th className="p-4 uppercase tracking-wider font-bold text-center">Active</th>
                    <th className="p-4 uppercase tracking-wider font-bold text-center">Featured</th>
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
                        {p.images && p.images[0] ? (
                          <img src={p.images[0]} alt={p.name} className="w-10 h-12 object-contain bg-[#FEFBF1] border border-border" />
                        ) : (
                          <div className="w-10 h-12 bg-[#FEFBF1] border border-border flex items-center justify-center text-[10px] text-muted">No Img</div>
                        )}
                      </td>
                      <td className="p-4 font-semibold text-primary">{p.name}</td>
                      <td className="p-4 text-muted">{p.category}</td>
                      <td className="p-4 font-semibold">₹{p.price}</td>
                      <td className="p-4 text-muted/75">{p.originalPrice ? `₹${p.originalPrice}` : '-'}</td>
                      <td className="p-4">
                        {p.stamp && p.stamp !== 'none' ? (
                          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-sm font-semibold uppercase tracking-wider text-[9px]">{p.stamp}</span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <input
                          type="number"
                          value={p.stock}
                          onChange={(e) => handleInlineStockUpdate(p.db_id, e.target.value)}
                          className="w-16 border border-border bg-[#FEFBF1]/20 px-2 py-1 text-center focus:outline-none focus:border-accent text-xs font-semibold"
                        />
                      </td>
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
                          onClick={async () => {
                            const newFeaturedVal = !p.featured;
                            const payload = { featured: newFeaturedVal };


                            // 2. Perform Supabase update
                            const updateResponse = await supabase
                              .from('products')
                              .update(payload)
                              .eq('id', p.db_id)
                              .select('*');

                            // 3. Immediate SELECT after update
                            const dbResult = await supabase
                              .from('products')
                              .select('id,featured')
                              .eq('id', p.db_id)
                              .single();


                            // 4. Refresh context and log after refresh
                            refreshProducts();
                            setTimeout(() => {
                              const contextProd = products.find(prod => prod.db_id === p.db_id);

                            }, 500);
                          }}
                          className={`inline-flex p-1.5 rounded-full transition-all ${
                            p.featured ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-400'
                          }`}
                        >
                          {p.featured ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
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
                      <td colSpan="11" className="p-12 text-center text-muted font-light font-body">No products matched current query.</td>
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
            {/* Orders Table */}
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

      {/* -------------------- MODAL: PRODUCT EDIT/ADD -------------------- */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FEFBF1] border border-border max-w-4xl w-full p-8 relative rounded-sm shadow-xl my-8">
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
                    onChange={(e) => setProdForm({...prodForm, name: e.target.value})}
                    className="w-full bg-white border border-border p-3 focus:outline-none focus:border-accent text-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted font-bold mb-2">Slug</label>
                  <input
                    type="text"
                    placeholder="Auto-generated if empty"
                    value={prodForm.slug}
                    onChange={(e) => setProdForm({...prodForm, slug: e.target.value})}
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
                    <option value="Crystals">Crystals</option>
                    <option value="Gemstones">Gemstones</option>
                    <option value="Jewellery">Jewellery</option>
                    <option value="Bracelets">Bracelets</option>
                    <option value="Pendants">Pendants</option>
                    <option value="Utility & Decor">Utility & Decor</option>
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
                  <label className="block text-[10px] uppercase tracking-wider text-muted font-bold mb-2">Stamp</label>
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
                  <label className="block text-[10px] uppercase tracking-wider text-muted font-bold mb-2">Chakra Alignment</label>
                  <input
                    type="text"
                    value={prodForm.chakra}
                    onChange={(e) => setProdForm({...prodForm, chakra: e.target.value})}
                    className="w-full bg-white border border-border p-3 focus:outline-none focus:border-accent text-primary"
                  />
                </div>
                <div>
                  <div className="flex gap-6 mt-6">
                    <label className="flex items-center gap-2 font-bold uppercase tracking-wider text-muted text-[10px] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prodForm.featured}
                        onChange={(e) => setProdForm({...prodForm, featured: e.target.checked})}
                        className="accent-accent"
                      />
                      Featured
                    </label>
                    <label className="flex items-center gap-2 font-bold uppercase tracking-wider text-muted text-[10px] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prodForm.active}
                        onChange={(e) => setProdForm({...prodForm, active: e.target.checked})}
                        className="accent-accent"
                      />
                      Active / Available
                    </label>
                  </div>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted font-bold mb-2">Ritual Usage</label>
                  <textarea
                    value={prodForm.usage}
                    onChange={(e) => setProdForm({...prodForm, usage: e.target.value})}
                    rows="2"
                    className="w-full bg-white border border-border p-3 focus:outline-none focus:border-accent text-primary resize-none"
                  />
                </div>
              </div>

              {/* Cover and Gallery Images Upload */}
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
              {/* Customer summary */}
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

              {/* Status actions */}
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

              {/* Products items */}
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
