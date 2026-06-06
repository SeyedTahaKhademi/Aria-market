/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { X, Check, Landmark, ShoppingCart, ShieldCheck, Heart, Share2, Star } from 'lucide-react';
import { Product } from '../types';
import { formatPrice } from './ProductCard';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onApplyInstallment: (product: Product) => void;
}

export default function ProductDetailModal({ product, onClose, onAddToCart, onApplyInstallment }: ProductDetailModalProps) {
  if (!product) return null;

  // Render installment stats
  const getInstallmentSummary = () => {
    if (!product.isInstallmentEligible || !product.installmentMonthsMax) return null;
    const downPayment = product.downPaymentPercent ? (product.price * product.downPaymentPercent) / 100 : 0;
    const remaining = product.price - downPayment;
    const interest = 1 + (0.025 * product.installmentMonthsMax);
    const monthly = Math.round((remaining * interest) / product.installmentMonthsMax);
    return {
      monthly,
      months: product.installmentMonthsMax,
      downPayment
    };
  };

  const instData = getInstallmentSummary();

  const handleApplyClick = () => {
    onApplyInstallment(product);
    onClose();
  };

  const handleCartClick = () => {
    onAddToCart(product);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" id="product-detail-modal">
      {/* Overlay backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="relative transform overflow-hidden rounded-3xl bg-white text-right shadow-2xl transition-all w-full max-w-3xl my-8">
          
          {/* Close button */}
          <button 
            id="close-detail-modal-btn"
            onClick={onClose} 
            className="absolute top-4 left-4 p-2.5 rounded-xl bg-neutral-100/80 hover:bg-neutral-200 transition-colors z-10 text-neutral-600 hover:text-black cursor-pointer"
          >
            <X className="size-4" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
            {/* Gallery Column */}
            <div className="space-y-4">
              <div className="aspect-square w-full rounded-2xl overflow-hidden bg-neutral-50 border border-neutral-100">
                <img 
                  src={product.imageUrl} 
                  alt={product.title} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover" 
                />
              </div>

              <div className="flex items-center gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border border-neutral-100 bg-neutral-50/55 hover:bg-neutral-50 text-xs text-neutral-600 transition-colors hover:text-black cursor-pointer">
                  <Heart className="size-4 text-rose-500 fill-rose-500" />
                  <span>افزودن به علاقه‌مندی‌ها</span>
                </button>
                <button className="p-2.5 rounded-xl border border-neutral-100 bg-neutral-50/55 hover:bg-neutral-50 text-neutral-600 transition-colors hover:text-black cursor-pointer" title="اشتراک‌گذاری">
                  <Share2 className="size-4" />
                </button>
              </div>

              {/* Guarantees Box */}
              <div className="bg-neutral-50 rounded-2xl p-4 space-y-2.5 border border-neutral-100/60">
                <div className="flex items-center gap-2 text-xs text-neutral-700">
                  <ShieldCheck className="size-4 text-neutral-900 shrink-0" />
                  <span className="font-semibold">ضمانت اصالت و سلامت آریا مارکت</span>
                </div>
                <p className="text-[10px] text-neutral-400 font-light leading-relaxed">
                  تمامی کالاها در واحد کنترل کیفی آریا مارکت بررسی و با بسته‌بندی پلمپ کارخانه و گارانتی معتبر شرکتی ارسال می‌شوند. ۷ روز مهلت بازگشت کالا برای اطمینان شما فراهم است.
                </p>
              </div>
            </div>

            {/* details specifications Column */}
            <div className="flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Branding and categories flags */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-lg">
                    {product.vendorName}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold font-sans text-neutral-800">{product.rating}</span>
                    <Star className="size-4 text-amber-400 fill-amber-400" />
                    <span className="text-[10px] text-neutral-400">({product.reviewsCount} نظر)</span>
                  </div>
                </div>

                <h3 className="text-lg md:text-xl font-extrabold text-neutral-900 leading-snug">
                  {product.title}
                </h3>
                {product.englishTitle && (
                  <p className="text-xs text-neutral-400 font-mono tracking-tight" style={{ direction: 'ltr', textAlign: 'left' }}>
                    {product.englishTitle}
                  </p>
                )}

                <p className="text-xs text-neutral-500 font-normal leading-relaxed text-neutral-600">
                  {product.description}
                </p>

                {/* specifications Checklist */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide">مشخصات برجسته کالا:</h4>
                  <div className="grid grid-cols-1 gap-2 bg-neutral-50/50 p-3 rounded-2xl border border-neutral-100">
                    {Object.entries(product.specifications).map(([key, val]) => (
                      <div key={key} className="flex justify-between items-center text-xs border-b border-neutral-100/50 pb-1.5 last:border-0 last:pb-0">
                        <span className="text-neutral-400 font-light">{key}</span>
                        <span className="text-neutral-800 font-semibold">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Installment Pricing Calculator block */}
              <div className="bg-amber-50/30 border border-amber-200/40 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <span className="text-xs text-neutral-500">قیمت نهایی نقدی:</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-neutral-950">{formatPrice(product.price)}</span>
                    <span className="text-[10px] text-neutral-400 font-bold">تومان</span>
                  </div>
                </div>

                {instData ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-amber-800 font-bold">
                        <Landmark className="size-4" />
                        <span>شرایط اقساط ویژه ({instData.months} ماهه):</span>
                      </div>
                      <span className="text-xs font-black text-amber-950 bg-amber-100/60 px-2.5 py-1 rounded-lg">
                        {formatPrice(instData.monthly)} <span className="text-[9px] font-bold">تومان/ماه</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] text-neutral-500 pt-1">
                      <div className="bg-white/60 p-1.5 rounded-lg border border-neutral-100">
                        پیش‌پرداخت: <span className="font-bold text-neutral-800">{formatPrice(instData.downPayment)} تومان</span>
                      </div>
                      <div className="bg-white/60 p-1.5 rounded-lg border border-neutral-100 text-left" style={{ direction: 'ltr' }}>
                        Interest: %2.5 / Month
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-neutral-400 text-center py-1">
                    پرداخت قسطی برای این دسته‌بندی کالا مقدور نیست.
                  </div>
                )}
              </div>

              {/* Final Action Bar */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  id="modal-add-to-cart-btn"
                  onClick={handleCartClick}
                  className="flex-1 flex items-center justify-center gap-2 bg-neutral-900 hover:bg-black text-white text-xs font-bold py-3.5 px-4 rounded-xl cursor-pointer transition-all shadow-sm"
                >
                  <ShoppingCart className="size-4" />
                  <span>افزودن به سبد خرید نقدی</span>
                </button>

                {instData && (
                  <button
                    id="modal-apply-installment-btn"
                    onClick={handleApplyClick}
                    className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-3.5 px-4 rounded-xl cursor-pointer transition-all shadow-sm"
                  >
                    <Landmark className="size-4" />
                    <span>درخواست خرید اقساطی فوری</span>
                  </button>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
