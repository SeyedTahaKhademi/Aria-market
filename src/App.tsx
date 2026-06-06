/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Star, ShieldCheck, CreditCard, Sparkles, AlertCircle, ShoppingCart, Landmark, ArrowLeft, Heart, CheckCircle2, X } from 'lucide-react';
import { Product, Vendor, InstallmentPlan, BlogPost, CartItem } from './types';

// Custom component imports
import Header from './components/Header';
import HomeHero from './components/HomeHero';
import ProductCard, { formatPrice } from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import BlogTab from './components/BlogTab';
import InstallmentTab from './components/InstallmentTab';
import VendorTab from './components/VendorTab';
import AiShopperTab from './components/AiShopperTab';

export default function App() {
  
  // Store lists fetched from APIs
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  
  // General App states
  const [activeTab, setActiveTab] = useState('shop'); // shop | installments | ai | vendor | blog
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Cart management
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Modal views
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeBlogPost, setActiveBlogPost] = useState<BlogPost | null>(null);

  // Global alerts/notifications states
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'info'>('success');
  const [successAnimation, setSuccessAnimation] = useState<{ show: boolean, msg: string, code?: string }>({
    show: false,
    msg: ''
  });

  // Load API Data on mount
  useEffect(() => {
    fetchProducts();
    fetchVendors();
    fetchBlog();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (res.ok) setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await fetch('/api/vendors');
      const data = await res.json();
      if (res.ok) setVendors(data);
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
    }
  };

  const fetchBlog = async () => {
    try {
      const res = await fetch('/api/blog');
      const data = await res.json();
      if (res.ok) setBlogPosts(data);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    }
  };

  // Toast notifier trigger
  const triggerToast = (msg: string, type: 'success' | 'info' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage('');
    }, 4500);
  };

  // Cart Management actions
  const handleAddToCart = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });

    triggerToast(`کالای "${product.title}" به سبد خرید نقدی افزون گردید.`, 'success');
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    setCart(prev => prev.map(item => 
      item.product.id === productId ? { ...item, quantity } : item
    ));
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    triggerToast('کالا از سبد حذف گردید.', 'info');
  };

  // Checkout checkout simulations
  const handleCheckout = () => {
    setCart([]);
    setIsCartOpen(false);
    setSuccessAnimation({
      show: true,
      msg: 'سفارش نقدی شما پرداخت شد! فاکتور خرید و شناسه رهگیری مرسوله پستی به شماره همراهتان پیامک گردید.',
      code: 'TRX-' + Math.floor(100000 + Math.random() * 900000)
    });
  };

  // Filter products by search and category
  const getFilteredProducts = () => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (p.englishTitle && p.englishTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  };

  const currentFilteredProducts = getFilteredProducts();

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col font-sans select-none" id="aria-market-app">
      
      {/* Dynamic Floating Toast Alert bar overlay */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            id="global-toast"
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 text-white rounded-2xl px-5 py-3 shadow-2xl flex items-center gap-3 border border-neutral-800 text-xs text-right max-w-sm"
          >
            {toastType === 'success' ? (
              <CheckCircle2 className="size-4.5 text-amber-400 shrink-0" />
            ) : (
              <AlertCircle className="size-4.5 text-blue-400 shrink-0" />
            )}
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Completion Dialog overlay */}
      <AnimatePresence>
        {successAnimation.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full text-center space-y-5"
              id="success-dialog"
            >
              <div className="size-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                <CheckCircle2 className="size-8" />
              </div>

              <div className="space-y-1.5">
                <h3 className="font-extrabold text-neutral-900 text-sm">تراکنش با موفقیت انجام شد!</h3>
                <p className="text-[11px] text-neutral-500 font-light leading-relaxed">{successAnimation.msg}</p>
                {successAnimation.code && (
                  <div className="text-xs bg-neutral-100 font-mono text-neutral-700 py-1 px-3 rounded-lg font-bold inline-block mt-2">
                    {successAnimation.code}
                  </div>
                )}
              </div>

              <button
                onClick={() => setSuccessAnimation({ show: false, msg: '' })}
                className="w-full bg-neutral-950 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
              >
                بسیار عالی، متشکرم
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Primary Navigation Header */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onSearch={setSearchTerm}
      />

      {/* Main Tabs content viewport */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'shop' && (
              <div className="space-y-10" id="shop-view">
                
                {/* Hero Showcase Lookbook Banner & Filters selection */}
                <HomeHero 
                  selectedCategory={selectedCategory} 
                  setSelectedCategory={setSelectedCategory} 
                  onOpenAiAssistant={() => setActiveTab('ai')}
                  onOpenInstallmentsPlan={() => setActiveTab('installments')}
                />

                {/* Primary Catalog Lists Grid layout */}
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <h3 className="text-sm font-black text-neutral-850">
                      برگزیده محصولات کاتالوگ فروش جهانی
                    </h3>
                    <span className="text-[10px] text-neutral-400 font-light">
                      نمایش {currentFilteredProducts.length.toLocaleString('fa-IR')} کالا
                    </span>
                  </div>

                  {currentFilteredProducts.length === 0 ? (
                    <div className="bg-white border border-neutral-100 rounded-3xl p-12 text-center space-y-3">
                      <p className="text-xs text-neutral-450 italic">محصولی منطق مشخصات جستجوی شما یافت نشد.</p>
                      <button 
                        onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                        className="text-[10px] text-neutral-600 underline font-semibold cursor-pointer"
                      >
                        پاک کردن فیلترها و مشاهده کل فروشگاه
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {currentFilteredProducts.map((p) => (
                        <ProductCard 
                          key={p.id} 
                          product={p} 
                          onViewDetails={setSelectedProduct} 
                          onAddToCart={handleAddToCart}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'installments' && (
              <InstallmentTab 
                products={products} 
                onApplySuccess={(code) => {
                  setSuccessAnimation({
                    show: true,
                    msg: 'درخواست وام و پرداخت قسطی شما پس از اعتبارسنجی آنلاین بلافاصله تصدیق شد! مامور مالی ما ظرف ۲۴ ساعت آینده جهت تایید مدارک با شما تعامل می‌کند.',
                    code
                  });
                }}
                selectedProductFromStore={selectedProduct}
              />
            )}

            {activeTab === 'ai' && (
              <AiShopperTab 
                products={products} 
                onViewProductDetails={setSelectedProduct}
                onAddToCart={(p) => handleAddToCart(p)}
                onNavigateToInstallments={(p) => {
                  setSelectedProduct(p);
                  setActiveTab('installments');
                }}
              />
            )}

            {activeTab === 'vendor' && (
              <VendorTab 
                vendors={vendors} 
                products={products} 
                onRegisterSuccess={(newV) => {
                  setVendors(prev => [...prev, newV]);
                  triggerToast(`برند "${newV.brandName}" با موفقیت ثبت‌نام و کدهای تسویه درگاه آن تایید شد.`, 'success');
                }}
                onAddProductSuccess={(newP) => {
                  setProducts(prev => [newP, ...prev]);
                  triggerToast(`کالای "${newP.title}" با موفقیت در کاتالوگ همکاران منتشر شد.`, 'success');
                }}
              />
            )}

            {activeTab === 'blog' && (
              <BlogTab 
                posts={blogPosts} 
                onSelectPost={setActiveBlogPost} 
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Detailed Product Specifications Overlays */}
      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          onAddToCart={(p) => handleAddToCart(p)}
          onApplyInstallment={(p) => {
            setSelectedProduct(p);
            setActiveTab('installments');
          }}
        />
      )}

      {/* Blog Post Content Modal View Overlay */}
      {activeBlogPost && (
        <div className="fixed inset-0 z-50 overflow-y-auto" id="blog-detail-modal">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActiveBlogPost(null)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative transform overflow-hidden rounded-3xl bg-white text-right shadow-2xl transition-all w-full max-w-2xl p-6 md:p-8 my-8">
              <button 
                onClick={() => setActiveBlogPost(null)} 
                className="absolute top-4 left-4 p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-black cursor-pointer"
              >
                <X className="size-4" />
              </button>

              <div className="space-y-6">
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-neutral-50 border border-neutral-100">
                  <img src={activeBlogPost.coverUrl} alt={activeBlogPost.title} className="w-full h-full object-cover" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-[10px] text-neutral-400">
                    <span className="font-bold text-neutral-800">{activeBlogPost.author}</span>
                    <span>•</span>
                    <span>{activeBlogPost.date}</span>
                    <span>•</span>
                    <span>زمان مطالعه: {activeBlogPost.readTime}</span>
                  </div>
                  <h3 className="text-base md:text-lg font-black text-neutral-900leading-snug">{activeBlogPost.title}</h3>
                </div>

                <p className="text-xs text-neutral-600 font-light leading-relaxed whitespace-pre-wrap">
                  {activeBlogPost.content}
                </p>

                <div className="pt-4 border-t border-neutral-100 flex justify-end">
                  <button 
                    onClick={() => setActiveBlogPost(null)}
                    className="bg-neutral-900 text-white font-bold text-xs px-5 py-2 rounded-xl hover:bg-black transition-colors"
                  >
                    بستن مقاله علمی
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer Sliding Sidebar Overlay */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={handleCheckout}
      />

      {/* Modern, Minimalistic and Humble Footer */}
      <footer className="border-t border-neutral-100 bg-white py-10 mt-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3 text-right">
            <h4 className="text-xs font-black text-neutral-900 leading-tight">پاراتجارت آریا مارکت ایران</h4>
            <p className="text-[10px] text-neutral-400 font-light leading-relaxed">
              پلتفرم مرجع تأمین کالای لوکس و تسهیلات اعتباردهی آنلاین خرد. آمیزه‌ای ماندگار از خلاقیت فرانت‌اند مینی‌مال با قدرت تصمیم‌گیری دستیار خرید هوش مصنوعی.
            </p>
          </div>
          
          <div className="space-y-3 text-right">
            <h4 className="text-xs font-black text-neutral-900">سایر سرویس‌های فعال</h4>
            <ul className="text-[10px] text-neutral-400 font-light space-y-1.5 list-disc list-inside">
              <li>اعتبار سنجی اتوماتیک آنلاین با کد ملی</li>
              <li>صندوق ضمانت سرمایه‌گذاری بازرگانان همکار</li>
              <li>همکاری سازمانی با آژانس پست جمهوری اسلامی</li>
            </ul>
          </div>

          <div className="space-y-3 text-right">
            <h4 className="text-xs font-black text-neutral-900">شعبه مرکزی پشتیبانی</h4>
            <p className="text-[10px] text-neutral-400 font-light leading-relaxed">
              تهران، بزرگراه مدرس، نرسیده به میرداماد، برج اداری آریا مارکت، طبقه ۹ مالی و امور مشتریان. <span className="block mt-1">تلفن: ۰۲۱-۸۸۲۲۳۳۴۴</span>
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-neutral-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-[10px] text-neutral-400 font-sans">
          <span>© ۱۴۰۵ تمامی حقوق برای شرکت بازرگانی توسعه آریا مارکت محفوظ است.</span>
          <div className="flex gap-4 mt-2 sm:mt-0 font-light">
            <a href="#" className="hover:text-black">حریم خصوصی</a>
            <span>•</span>
            <a href="#" className="hover:text-black">بیمه مرسولات</a>
            <span>•</span>
            <a href="#" className="hover:text-black">قرارداد همکاران</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
