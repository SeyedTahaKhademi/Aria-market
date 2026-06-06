/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShoppingBag, Sparkles, Store, Newspaper, Landmark, User, Heart, Search } from 'lucide-react';
import { motion } from 'motion/react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  onSearch: (term: string) => void;
}

export default function Header({ activeTab, setActiveTab, cartCount, onOpenCart, onSearch }: HeaderProps) {
  const navItems = [
    { id: 'shop', label: 'خانه و محصولات', icon: ShoppingBag },
    { id: 'installments', label: 'خرید قسطی', icon: Landmark },
    { id: 'ai', label: 'دستیار هوشمند AI', icon: Sparkles, highlight: true },
    { id: 'vendor', label: 'پنل فروشندگان', icon: Store },
    { id: 'blog', label: 'بلاگ مارکت', icon: Newspaper },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-neutral-100 px-4 py-3 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Logo and Mobile controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('shop')}>
            <div className="size-10 bg-black flex items-center justify-center rounded-xl text-white shadow-sm">
              <span className="font-sans font-bold text-lg tracking-wide">A</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-neutral-900 font-sans">
                آریا مارکت <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full font-sans mr-1">V2</span>
              </h1>
              <p className="text-[10px] text-neutral-400 font-sans tracking-tight">Aria Market</p>
            </div>
          </div>

          {/* Quick Controls in Small Screens */}
          <div className="flex items-center gap-2 md:hidden">
            <button 
              id="mobile-cart-btn"
              onClick={onOpenCart} 
              className="relative p-2 text-neutral-600 hover:text-black rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <ShoppingBag className="size-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-neutral-900 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Dynamic Search bar inside header */}
        <div className="relative flex-1 max-w-md mx-auto w-full md:mx-4">
          <input
            type="text"
            placeholder="جستجوی هوشمند کالاها، برندها یا دسته‌بندی..."
            onChange={(e) => onSearch(e.target.value)}
            className="w-full bg-neutral-50 text-xs border border-neutral-200 rounded-xl py-2 px-4 pl-10 pr-4 text-right focus:outline-none focus:border-neutral-900 focus:bg-white transition-all text-neutral-800"
          />
          <Search className="absolute left-3 top-2.5 size-4 text-neutral-400 pointer-events-none" />
        </div>

        {/* Central Desk Desktop Navigation */}
        <nav className="flex items-center justify-center gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive 
                    ? 'text-neutral-900 font-semibold' 
                    : item.highlight 
                      ? 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 border border-amber-200/50 bg-amber-50/20'
                      : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabGlow"
                    className="absolute inset-0 bg-neutral-100/70 -z-10 rounded-xl"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon className={`size-4 ${item.highlight ? 'text-amber-500' : ''}`} />
                <span>{item.label}</span>
                {item.highlight && (
                  <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Desktop Utilities */}
        <div className="hidden md:flex items-center gap-4">
          <button 
            id="desktop-cart-btn"
            onClick={onOpenCart} 
            className="relative p-2.5 text-neutral-600 hover:text-black rounded-xl hover:bg-neutral-50 transition-all border border-neutral-100"
          >
            <ShoppingBag className="size-5" />
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                key={cartCount}
                className="absolute -top-1.5 -right-1.5 bg-neutral-950 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-sans font-bold"
              >
                {cartCount}
              </motion.span>
            )}
          </button>

          <div className="h-6 w-px bg-neutral-200" />
          
          <div className="flex items-center gap-2 text-neutral-600 hover:text-black transition-colors cursor-pointer">
            <div className="size-8 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-center">
              <User className="size-4" />
            </div>
            <span className="text-[11px] font-medium hidden lg:inline">حساب کاربر</span>
          </div>
        </div>

      </div>
    </header>
  );
}
