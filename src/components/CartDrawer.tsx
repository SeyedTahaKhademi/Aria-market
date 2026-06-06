/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { X, ShoppingBag, Trash2, Plus, Minus, Landmark, ShieldAlert, ArrowLeft } from 'lucide-react';
import { CartItem } from '../types';
import { formatPrice } from './ProductCard';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

export default function CartDrawer({ isOpen, onClose, cart, onUpdateQuantity, onRemoveItem, onCheckout }: CartDrawerProps) {
  if (!isOpen) return null;

  const totalOriginal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  // Installment eligible checking
  const containsEligibleProducts = cart.some(item => item.product.isInstallmentEligible);
  
  // Calculate average potential monthly installment if checked out on credit
  const getPotentialInstallmentEstimate = () => {
    const eligibleAmount = cart
      .filter(item => item.product.isInstallmentEligible)
      .reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    
    if (eligibleAmount === 0) return 0;
    // Assume average 12 months with 20% down payment
    const downPayment = eligibleAmount * 0.2;
    const remaining = eligibleAmount - downPayment;
    const monthly = Math.round((remaining * 1.3) / 12); // adding simplistic interest
    return {
      monthly,
      downPayment
    };
  };

  const installmentEst = getPotentialInstallmentEstimate();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="cart-drawer">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full pr-10">
        <div className="pointer-events-auto w-screen max-w-md transform bg-white shadow-2xl transition-all flex flex-col justify-between h-full">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-8 bg-neutral-900 text-white rounded-lg flex items-center justify-center">
                <ShoppingBag className="size-4" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900">سبد خرید شما</h3>
              <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full font-bold">
                {cart.length.toLocaleString('fa-IR')} کالا
              </span>
            </div>
            
            <button 
              id="close-cart-btn"
              onClick={onClose} 
              className="p-2 text-neutral-450 hover:text-black rounded-lg hover:bg-neutral-50"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Cart Content list block */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                <div className="size-16 bg-neutral-50 border border-neutral-100 rounded-full flex items-center justify-center text-neutral-300">
                  <ShoppingBag className="size-8" />
                </div>
                <h4 className="text-xs font-bold text-neutral-700">سبد خرید شما خالی است</h4>
                <p className="text-[10px] text-neutral-400 max-w-xs leading-relaxed">
                  می‌توانید به صفحات مختلف فروشگاه بازگردید و محصولات و کالاهای لوکس دیجیتال، آرایشی یا مد را اضافه کنید.
                </p>
                <button 
                  onClick={onClose}
                  className="bg-neutral-900 hover:bg-black text-white text-[11px] font-semibold px-4 py-2.5 rounded-xl transition-all"
                >
                  بازگشت و انتخاب کالا
                </button>
              </div>
            ) : (
              <div className="space-y-4 division-y division-neutral-100">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex gap-4 p-3 bg-neutral-50/60 rounded-2xl border border-neutral-100/60 relative">
                    <div className="size-16 rounded-xl bg-neutral-100 overflow-hidden shrink-0">
                      <img 
                        src={item.product.imageUrl} 
                        alt={item.product.title} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover" 
                      />
                    </div>

                    <div className="flex-1 space-y-1 text-right">
                      <h5 className="text-[11px] font-bold text-neutral-900 line-clamp-1">
                        {item.product.title}
                      </h5>
                      <span className="text-[10px] text-neutral-400 block font-light">
                        فروشنده: {item.product.vendorName}
                      </span>
                      
                      <div className="flex items-center justify-between pt-1">
                        <div className="text-xs font-bold text-neutral-950">
                          {formatPrice(item.product.price * item.quantity)} <span className="text-[9px] text-neutral-400">تومان</span>
                        </div>

                        {/* Counter Controls */}
                        <div className="flex items-center gap-2 bg-white border border-neutral-100 rounded-lg p-1">
                          <button
                            id={`qty-plus-${item.product.id}`}
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="size-5 rounded-md hover:bg-neutral-100 flex items-center justify-center text-neutral-600 hover:text-black cursor-pointer"
                          >
                            <Plus className="size-3" />
                          </button>
                          
                          <span className="text-xs font-bold font-sans text-neutral-800 px-1">
                            {item.quantity}
                          </span>
                          
                          <button
                            id={`qty-minus-${item.product.id}`}
                            onClick={() => {
                              if (item.quantity > 1) {
                                onUpdateQuantity(item.product.id, item.quantity - 1);
                              } else {
                                onRemoveItem(item.product.id);
                              }
                            }}
                            className="size-5 rounded-md hover:bg-neutral-100 flex items-center justify-center text-neutral-600 hover:text-black cursor-pointer"
                          >
                            <Minus className="size-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Quick Delete Trash action */}
                    <button
                      id={`delete-cart-item-${item.product.id}`}
                      onClick={() => onRemoveItem(item.product.id)}
                      className="absolute top-2 left-2 p-1 text-neutral-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                      title="حذف از سبد"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pricing Calculator summary box */}
          {cart.length > 0 && (
            <div className="px-6 py-5 border-t border-neutral-100 bg-neutral-50/80 space-y-4">
              
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-neutral-500">
                  <span>جمع کل ناخالص کالاها:</span>
                  <span className="font-bold text-neutral-800">{formatPrice(totalOriginal)} تومان</span>
                </div>
                <div className="flex justify-between items-center text-xs text-neutral-500">
                  <span>مالیات بر ارزش افزوده و بسته بندی:</span>
                  <span className="text-neutral-400">رایگان (ویژه سال نو)</span>
                </div>
                
                <div className="h-px bg-neutral-200/50 my-2" />

                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-neutral-800">مجموع قابل پرداخت نقدی:</span>
                  <span className="font-black text-neutral-950 text-base">{formatPrice(totalOriginal)} تومان</span>
                </div>
              </div>

              {/* Installment Estimate Suggestion box if there are eligible items */}
              {containsEligibleProducts && installmentEst && (
                <div className="bg-amber-100/50 border border-amber-200/50 rounded-2xl p-3 text-right space-y-1.5 shadow-sm">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <Landmark className="size-4 text-amber-600" />
                    <span>امکان خرید اقساطی برای این کالا(ها) فراهم است!</span>
                  </div>
                  <p className="text-[9px] text-amber-800 font-light leading-relaxed">
                    می‌توانید این کالا را در قالب طرح پرداخت اقساطی ما تهیه کنید. 
                    برآورد تقریبی قسط: <span className="font-extrabold">{formatPrice(installmentEst.monthly)} تومان</span> در ماه با پیش‌پرداخت {formatPrice(installmentEst.downPayment)} تومان.
                  </p>
                </div>
              )}

              {/* Action trigger checkout */}
              <div className="space-y-2.5 pt-1">
                <button
                  id="checkout-all-btn"
                  onClick={onCheckout}
                  className="w-full bg-neutral-900 hover:bg-black text-white rounded-xl py-3 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>ثبت سفارش و پرداخت نهایی</span>
                  <ArrowLeft className="size-4" />
                </button>
                <p className="text-[9px] text-neutral-450 text-center">
                  با ثبت سفارش، با قوانین و مقررات پلتفرم یکپارچه آریا مارکت موافقت می‌کنید.
                </p>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
