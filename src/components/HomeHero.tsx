/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sparkles, Landmark, LayoutGrid, Shirt, Laptop, Sparkle, ShoppingBag } from 'lucide-react';

interface HomeHeroProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  onOpenAiAssistant: () => void;
  onOpenInstallmentsPlan: () => void;
}

export default function HomeHero({ selectedCategory, setSelectedCategory, onOpenAiAssistant, onOpenInstallmentsPlan }: HomeHeroProps) {
  const categories = [
    { id: 'all', label: 'همه محصولات', icon: LayoutGrid, bg: 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800' },
    { id: 'digital', label: 'کالای دیجیتال', icon: Laptop, bg: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-100' },
    { id: 'fashion', label: 'مد و پوشاک', icon: Shirt, bg: 'bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-100' },
    { id: 'beauty', label: 'آرایشی و بهداشتی', icon: Sparkle, bg: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-100' },
    { id: 'home', label: 'خانه و زندگی', icon: ShoppingBag, bg: 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-100' },
  ];

  return (
    <div className="space-y-8">
      {/* Prime Hero Lookbook Baner */}
      <div id="home-hero-banner" className="relative overflow-hidden bg-neutral-900 text-white rounded-3xl p-6 md:p-12 shadow-md">
        {/* Subtle background decoration */}
        <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-amber-500/40 via-red-500/20 to-transparent" />
        
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-neutral-800/80 border border-neutral-700 rounded-full px-3 py-1 text-[10px] md:text-xs">
            <Sparkles className="size-3 text-amber-400" />
            <span className="text-neutral-300">تجربه خرید مجهز به قوی‌ترین هوش مصنوعی نسل سوم</span>
          </div>
          
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-extrabold leading-tight text-neutral-100 font-sans">
            انتخاب کالا متناسب با سلیقه شما، پرداخت قسطی متناسب با جیب شما!
          </h2>
          
          <p className="text-xs md:text-sm text-neutral-400 font-light leading-relaxed max-w-lg">
            آریا مارکت بستری برای خرید هوشمند، لوکس و مینی‌مال است. محصول دلخواه خود را توصیف کنید تا هوش مصنوعی محصولات منطبق را پیشنهاد دهد و در قالب اقساط آسان ۱۲ ماهه بدون معرفی ضامن بخرید.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-4">
            <button
              id="hero-ai-shopper-btn"
              onClick={onOpenAiAssistant}
              className="flex items-center gap-2 bg-white text-black font-semibold text-xs px-5 py-3 rounded-xl hover:bg-neutral-100 hover:shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Sparkles className="size-4 text-amber-500" />
              <span>دستیار خرید هوش مصنوعی</span>
            </button>
            
            <button
              id="hero-installments-btn"
              onClick={onOpenInstallmentsPlan}
              className="flex items-center gap-2 bg-neutral-800 border border-neutral-700 text-neutral-200 font-medium text-xs px-5 py-3 rounded-xl hover:bg-neutral-750 hover:text-white hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Landmark className="size-4" />
              <span>محاسبه‌گر و ثبت‌نام خرید اقساطی</span>
            </button>
          </div>
        </div>

        {/* Small Decorative Badge inside outer container */}
        <div className="absolute left-6 bottom-6 hidden lg:flex flex-col items-end text-right">
          <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest bg-neutral-850 px-2.5 py-1 rounded-md border border-neutral-800">
            Aria Credit
          </div>
          <div className="text-xs font-bold text-amber-400 mt-1">تسهیلات ویژه بدون ضامن</div>
        </div>
      </div>

      {/* Category Selection Filter Line */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-800">دسته‌بندی‌های کالا</h3>
          <span className="text-[10px] text-neutral-400">فیلتر فوری کاتالوگ فروشگاه</span>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`cat-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-medium cursor-pointer whitespace-nowrap transition-all duration-200 ${
                  isSelected
                    ? 'bg-neutral-900 border border-neutral-900 text-white shadow-sm font-semibold'
                    : cat.bg
                }`}
              >
                <Icon className="size-4" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
