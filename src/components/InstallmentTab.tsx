/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Landmark, Sparkles, PhoneCall, FileText, CheckCircle2, Search, ArrowLeft, Loader2, Info } from 'lucide-react';
import { Product, InstallmentPlan } from '../types';
import { formatPrice } from './ProductCard';

interface InstallmentTabProps {
  products: Product[];
  onApplySuccess: (trackingCode: string) => void;
  selectedProductFromStore?: Product | null;
}

export default function InstallmentTab({ products, onApplySuccess, selectedProductFromStore }: InstallmentTabProps) {
  const eligibleProducts = products.filter(p => p.isInstallmentEligible);
  
  // States
  const [selectedProductId, setSelectedProductId] = useState(eligibleProducts[0]?.id || '');
  const [months, setMonths] = useState(12);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [nationalCode, setNationalCode] = useState('');
  const [monthlySalary, setMonthlySalary] = useState('');
  
  // Status lookup state
  const [searchPhone, setSearchPhone] = useState('');
  const [searchedPlans, setSearchedPlans] = useState<InstallmentPlan[]>([]);
  const [isSearchingPlan, setIsSearchingPlan] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [searchFeedback, setSearchFeedback] = useState('');

  // Sync if opened directly from detail modal
  useEffect(() => {
    if (selectedProductFromStore && selectedProductFromStore.isInstallmentEligible) {
      setSelectedProductId(selectedProductFromStore.id);
    }
  }, [selectedProductFromStore]);

  // Selected product logic
  const activeProduct = products.find(p => p.id === selectedProductId);

  // Installment computations
  const getCalculation = () => {
    if (!activeProduct) return null;
    const basePrice = activeProduct.price;
    const downPaymentPercent = activeProduct.downPaymentPercent || 0;
    const downPayment = (basePrice * downPaymentPercent) / 100;
    const loanAmount = basePrice - downPayment;
    
    // Add real world Simple Interest of 2.5% per month (standard loan parameters)
    const monthlyInterestRate = 0.025;
    const totalInterestMultiplier = 1 + (monthlyInterestRate * months);
    const totalRepayAmount = loanAmount * totalInterestMultiplier;
    const monthlyPayment = Math.round(totalRepayAmount / months);
    const totalCostOfPurchase = downPayment + totalRepayAmount;

    return {
      basePrice,
      downPayment,
      downPaymentPercent,
      loanAmount,
      monthlyPayment,
      totalCostOfPurchase,
      interestAmount: totalCostOfPurchase - basePrice
    };
  };

  const calc = getCalculation();

  // Handle application submission
  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    if (!fullName || !phone || !nationalCode || !monthlySalary || !selectedProductId) {
      setFormError('لطفا تمامی فیلدهای الزامی فرم را به دقت پر کنید.');
      return;
    }

    if (phone.length < 11 || !phone.startsWith('09')) {
      setFormError('شماره موبایل وارد شده نامعتبر است. فرمت صحیح: 09123456789');
      return;
    }

    if (nationalCode.length !== 10) {
      setFormError('کد ملی باید دقیقاً ۱۰ رقم باشد.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/installments/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          phone,
          nationalCode,
          monthlySalary: Number(monthlySalary),
          productId: selectedProductId,
          months
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        onApplySuccess(data.trackingCode);
        // Clear state
        setFullName('');
        setPhone('');
        setNationalCode('');
        setMonthlySalary('');
      } else {
        setFormError(data.error || 'خطا در ثبت درخواست اقساط. مجددا تلاش فرمايید.');
      }
    } catch (err) {
      setFormError('مشکل در ارتباط با سرور.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status tracker lookup
  const handleLookupPlans = async () => {
    if (!searchPhone) {
      setSearchFeedback('لطفا شماره تماس کاربر را برای پیگیری وارد کنید.');
      return;
    }
    setIsSearchingPlan(true);
    setSearchFeedback('');
    try {
      const res = await fetch(`/api/installments?phone=${searchPhone}`);
      const data = await res.json();
      if (res.ok) {
        setSearchedPlans(data);
        if (data.length === 0) {
          setSearchFeedback('هیچ پرونده خریدی برای این شماره موبایل یافت نشد.');
        }
      } else {
        setSearchFeedback('خطایی در جستجوی وضعیت خرید رخ داد.');
      }
    } catch {
      setSearchFeedback('ارتباط با سرور برقرار نشد.');
    } finally {
      setIsSearchingPlan(false);
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto" id="installments-tab">
      
      {/* Informational Intro */}
      <div className="text-right space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-100 rounded-full px-3 py-1 text-[10px] font-bold">
          <Landmark className="size-3.5" />
          <span>تسهیلات خرید اقساطی آریا مارکت (Aria Credit)</span>
        </div>
        <h2 className="text-xl md:text-2xl font-black text-neutral-900">بدون نیاز به ضامن، صاحب بهترین کالاها شوید</h2>
        <p className="text-xs text-neutral-500 font-light max-w-3xl leading-relaxed">
          ما در آریا مارکت تلاش می‌کنیم گران‌ترین کالاها را برای شما مقرون به صرفه‌تر کنیم. شما می‌توانید کل سبد دیجیتال یا ملزومات خانه خود را با پرداخت بخشی از قیمت به عنوان پیش‌پرداخت و باقی در اقساط ۳ تا ۱۸ ماهه هم‌اکنون با سود اندک سفارش دهید.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Interactive Calculator (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-neutral-150 rounded-3xl p-5 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <span className="text-xs font-bold text-neutral-800">محاسبه‌گر هوشمند اقساط</span>
              <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-md">جدول بازپرداخت</span>
            </div>

            {/* Choose Product */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-400">کالای انتخابی خود را مشخص کنید:</label>
              <select
                id="installment-product-select"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 text-xs rounded-xl py-2.5 px-3 focus:outline-none focus:border-neutral-900 text-neutral-800 font-medium"
              >
                {eligibleProducts.map(p => (
                  <option key={p.id} value={p.id}>{p.title} - ({formatPrice(p.price)} تومان)</option>
                ))}
              </select>
            </div>

            {/* Choose TenureMonths */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-400 flex justify-between">
                <span>تعداد ماه‌های اقساط:</span>
                <span className="text-neutral-900 font-extrabold">{months} ماهه</span>
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[3, 6, 9, 12, 18].map(m => (
                  <button
                    key={m}
                    id={`tenure-btn-${m}`}
                    type="button"
                    onClick={() => setMonths(m)}
                    className={`py-1.5 text-[10px] font-bold rounded-lg border transition-all ${
                      months === m 
                        ? 'bg-neutral-900 border-neutral-900 text-white' 
                        : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Micro details metrics */}
            {calc && activeProduct && (
              <div className="space-y-3.5 bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400 font-light">قیمت نقدی کالا:</span>
                  <span className="font-semibold text-neutral-800">{formatPrice(calc.basePrice)} تومان</span>
                </div>
                
                <div className="flex justify-between items-center text-xs text-amber-900">
                  <span className="font-medium">پیش‌پرداخت ({calc.downPaymentPercent}%):</span>
                  <span className="font-bold">{formatPrice(calc.downPayment)} تومان</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400 font-light">مبلغ تسهیلات مانده:</span>
                  <span className="font-semibold text-neutral-800">{formatPrice(calc.loanAmount)} تومان</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400 font-light">کارمزد تسهیلات ({months} ماه):</span>
                  <span className="font-semibold text-neutral-500">+{formatPrice(calc.interestAmount)} تومان</span>
                </div>

                <div className="h-px bg-neutral-200/50" />

                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-neutral-800">مبلغ قسط ماهانه:</span>
                  <span className="text-sm font-black text-amber-600 bg-amber-100/50 px-2.5 py-1 rounded-lg">
                    {formatPrice(calc.monthlyPayment)} تومان/ماه
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Secure Tip */}
          <div className="flex gap-2 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl p-3 text-[10px] text-indigo-900/80 leading-relaxed mt-4">
            <Info className="size-4 text-indigo-500 shrink-0" />
            <p>
              کلیه تسهیلات پرداختی آریا مارکت با تاییدیه بانک مرکزی تامین و به خریداران ارائه می‌شود. نیازی به چک تضامنی یا معرفی ضامن نیست.
            </p>
          </div>
        </div>

        {/* Right Application Form (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-neutral-100 rounded-3xl p-6 md:p-8 shadow-sm">
            
            <div className="flex items-center gap-2 border-b border-neutral-105 pb-4 mb-6">
              <FileText className="size-5 text-neutral-800" />
              <h3 className="text-sm font-extrabold text-neutral-900">فرم آنلاین درخواست تسهیلات Aria Credit</h3>
            </div>

            <form onSubmit={handleSubmitApplication} className="grid grid-cols-1 md:grid-cols-2 gap-5 text-right">
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-neutral-400">نام و نام خانوادگی خریدار (منطبق با کارت ملی)</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: رضا علیزاده"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-neutral-50 text-xs border border-neutral-200 rounded-xl py-2.5 px-3.5 focus:outline-none focus:border-neutral-900 text-neutral-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-neutral-400">شماره موبایل فعال (به نام خریدار)</label>
                <input
                  type="tel"
                  required
                  placeholder="به صورت ۰۹۱۲۳۴۵۶۷۸۹"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-neutral-50 text-xs border border-neutral-200 rounded-xl py-2.5 px-3.5 focus:outline-none focus:border-neutral-900 text-neutral-800 text-left font-mono"
                  style={{ direction: 'ltr' }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-neutral-400">کد ملی ده رقمی</label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  placeholder="مثال: ۰۰۶۵۵۴۴۳۳۲"
                  value={nationalCode}
                  onChange={(e) => setNationalCode(e.target.value)}
                  className="w-full bg-neutral-50 text-xs border border-neutral-200 rounded-xl py-2.5 px-3.5 focus:outline-none focus:border-neutral-900 text-neutral-800 text-left font-mono"
                  style={{ direction: 'ltr' }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-neutral-400">متوسط درآمد ماهانه خریدار (تومان)</label>
                <input
                  type="number"
                  required
                  placeholder="مثال: ۲۵,۰۰۰,۰۰۰"
                  value={monthlySalary}
                  onChange={(e) => setMonthlySalary(e.target.value)}
                  className="w-full bg-neutral-50 text-xs border border-neutral-200 rounded-xl py-2.5 px-3.5 focus:outline-none focus:border-neutral-950 text-neutral-800"
                />
              </div>

              {formError && (
                <div className="md:col-span-2 text-xs text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-xl">
                  {formError}
                </div>
              )}

              <div className="md:col-span-2 flex justify-end pt-3">
                <button
                  id="submit-installment-app-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-amber-500 hover:bg-amber-600 active:scale-95 disabled:opacity-50 text-white font-bold text-xs px-8 py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>در حال بررسی اعتبار و اهلیت آنلاین...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-4" />
                      <span>ثبت نهایی درخواست و تایید طرح اقساط</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>

          {/* Status Tracker lookup panel */}
          <div className="bg-white border border-neutral-100 rounded-3xl p-6 shadow-sm space-y-4">
            
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-neutral-800">پیگیری وضعیت درخواست‌های اقساط خریداران</h4>
              <p className="text-[10px] text-neutral-400">شماره ثبت تماستان را بنویسید تا آخرین پرونده‌های فعال را نمایش دهیم:</p>
            </div>

            <div className="flex gap-2.5">
              <input
                type="tel"
                placeholder="شماره موبایل را بنویسید..."
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                className="flex-1 bg-neutral-50 text-xs border border-neutral-200 rounded-xl py-2.5 px-3.5 focus:outline-none focus:border-neutral-900 text-neutral-800 text-left font-mono"
                style={{ direction: 'ltr' }}
              />
              <button
                id="search-installments-btn"
                onClick={handleLookupPlans}
                disabled={isSearchingPlan}
                className="bg-neutral-900 text-white text-xs font-semibold px-5 py-2.5 rounded-xl hover:bg-black transition-all flex items-center gap-1 cursor-pointer"
              >
                {isSearchingPlan ? <Loader2 className="size-3.5 animate-spin" /> : <Search className="size-3.5" />}
                <span>پیگیری</span>
              </button>
            </div>

            {searchFeedback && (
              <p className="text-[11px] text-neutral-500 italic mt-2">{searchFeedback}</p>
            )}

            {searchedPlans.length > 0 && (
              <div className="pt-2 space-y-3">
                {searchedPlans.map(plan => (
                  <div key={plan.id} className="bg-neutral-50 border border-neutral-150/60 rounded-2xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-900">{plan.productTitle}</span>
                        <span className="text-[9px] bg-indigo-50 text-indigo-700 font-mono px-2 py-0.5 rounded-md">{plan.trackingCode}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-neutral-400">
                        <div>خریدار: <span className="font-semibold text-neutral-700">{plan.fullName}</span></div>
                        <div>کارمزد ماهیانه: <span className="font-semibold text-neutral-700">{formatPrice(plan.monthlyPayment)} تومان ({plan.months} قسط)</span></div>
                        <div>قیمت نقدی کالا: <span className="font-semibold text-neutral-700">{formatPrice(plan.price)} تومان</span></div>
                        <div>تاریخ ثبت‌نام: <span className="font-semibold text-neutral-700">{plan.submissionDate}</span></div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      <span className="text-[9px] text-neutral-400 font-light">وضعیت پرونده مالی:</span>
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg px-2.5 py-1">
                        تایید شده و فعال
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
