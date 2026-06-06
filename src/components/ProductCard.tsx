/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Star, ShoppingCart, ArrowLeft, Heart, Landmark } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  key?: string;
  product: Product;
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product, e?: React.MouseEvent) => void;
}

export function formatPrice(price: number): string {
  return price.toLocaleString('fa-IR');
}

export default function ProductCard({ product, onViewDetails, onAddToCart }: ProductCardProps) {
  // Let us calculate a simple approximate monthly installment for eligible products
  const getInstallmentEstimate = () => {
    if (!product.isInstallmentEligible || !product.installmentMonthsMax) return null;
    const downPayment = product.downPaymentPercent ? (product.price * product.downPaymentPercent) / 100 : 0;
    const remaining = product.price - downPayment;
    // Add simple interest of 2.5% per month as a standard model
    const interest = 1 + (0.025 * product.installmentMonthsMax);
    const monthly = Math.round((remaining * interest) / product.installmentMonthsMax);
    return {
      monthlyPrice: monthly,
      months: product.installmentMonthsMax,
      downPayment
    };
  };

  const instInfo = getInstallmentEstimate();

  return (
    <div 
      id={`product-card-${product.id}`}
      onClick={() => onViewDetails(product)}
      className="group bg-white border border-neutral-100 rounded-3xl p-4 flex flex-col justify-between h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
    >
      <div className="space-y-3 relative">
        {/* Product Image Panel */}
        <div className="aspect-square w-full rounded-2xl bg-neutral-50 overflow-hidden relative">
          <img
            src={product.imageUrl}
            alt={product.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          <button 
            onClick={(e) => e.stopPropagation()} 
            className="absolute top-3 right-3 p-2 bg-white/70 hover:bg-white backdrop-blur-md text-neutral-600 hover:text-rose-500 rounded-xl transition-all"
          >
            <Heart className="size-4" />
          </button>

          {/* Quick Category Tag */}
          <span className="absolute bottom-3 right-3 bg-black/70 text-white text-[9px] font-sans font-semibold px-2.5 py-1 backdrop-blur-md rounded-lg">
            {product.category === 'digital' && 'کالای دیجیتال'}
            {product.category === 'fashion' && 'مد و پوشاک'}
            {product.category === 'beauty' && 'آرایشی بهداشتی'}
            {product.category === 'home' && 'خانه و زندگی'}
          </span>

          {/* Installment Plan Tag overlay if eligible */}
          {product.isInstallmentEligible && (
            <span className="absolute top-3 left-3 bg-amber-500 text-white text-[9px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
              <Landmark className="size-3" />
              <span>فروش قسطی</span>
            </span>
          )}
        </div>

        {/* Rating and Vendor */}
        <div className="flex items-center justify-between text-[11px] text-neutral-400">
          <span className="font-light">{product.vendorName}</span>
          <div className="flex items-center gap-1">
            <span className="text-neutral-700 font-bold">{product.rating.toLocaleString('fa-IR')}</span>
            <Star className="size-3 text-amber-400 fill-amber-400" />
            <span className="text-[10px] text-neutral-400">({product.reviewsCount.toLocaleString('fa-IR')})</span>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-xs font-bold leading-relaxed text-neutral-800 line-clamp-2 h-9">
          {product.title}
        </h4>
      </div>

      {/* Pricing and Action Strip */}
      <div className="pt-4 border-t border-neutral-50 mt-4 space-y-3">
        
        {/* Pricing Layout */}
        <div className="flex flex-col justify-end text-left">
          <span className="text-[10px] text-neutral-400 font-light text-right">قیمت نقدی بازار:</span>
          <div className="flex items-baseline justify-end gap-1">
            <span className="text-base font-extrabold text-neutral-900">{formatPrice(product.price)}</span>
            <span className="text-[10px] text-neutral-500 font-medium">تومان</span>
          </div>
        </div>

        {/* Monthly Installment Pricing info if eligible */}
        {instInfo && (
          <div className="bg-amber-50/40 border border-amber-100/50 rounded-xl p-2.5 text-right space-y-1">
            <div className="flex justify-between items-center text-[10px] text-amber-800">
              <span className="font-semibold">{instInfo.months} قسط ماهانه:</span>
              <span className="font-bold">{formatPrice(instInfo.monthlyPrice)} تومان</span>
            </div>
            {instInfo.downPayment > 0 ? (
              <div className="text-[9px] text-neutral-400 font-light">
                پیش‌پرداخت: {formatPrice(instInfo.downPayment)} تومان
              </div>
            ) : (
              <div className="text-[9px] text-emerald-600 font-medium">
                باصِفر٪ پیش‌پرداخت (سررسید ۳۰ روزه)
              </div>
            )}
          </div>
        )}

        {/* Interactive Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            id={`add-to-cart-btn-${product.id}`}
            onClick={(e) => onAddToCart(product, e)}
            className="flex-1 flex items-center justify-center gap-2 bg-neutral-900 text-white rounded-xl py-2.5 text-xs font-semibold hover:bg-black select-none pointer-events-auto transition-colors"
          >
            <ShoppingCart className="size-3.5" />
            <span>افزودن به سبد</span>
          </button>
          
          <button
            id={`view-details-btn-${product.id}`}
            className="p-2.5 border border-neutral-200 text-neutral-600 hover:text-black hover:border-black rounded-xl transition-all"
            title="مشاهده مشخصات و ثبت‌نام اقساط"
          >
            <ArrowLeft className="size-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
