/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Store, UserCheck, Plus, PackageCheck, Coins, ArrowLeft, Loader2, ListPlus } from 'lucide-react';
import { Vendor, Product } from '../types';
import { formatPrice } from './ProductCard';

interface VendorTabProps {
  vendors: Vendor[];
  products: Product[];
  onRegisterSuccess: (newVendor: Vendor) => void;
  onAddProductSuccess: (newProduct: Product) => void;
}

export default function VendorTab({ vendors, products, onRegisterSuccess, onAddProductSuccess }: VendorTabProps) {
  
  // Registration form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [brandName, setBrandName] = useState('');
  const [category, setCategory] = useState('دیجیتال و گجت‌ها');
  const [nationalId, setNationalId] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [regError, setRegError] = useState('');

  // Product submission form state
  const [currentVendor, setCurrentVendor] = useState(vendors[0]?.brandName || '');
  const [pTitle, setPTitle] = useState('');
  const [pEngTitle, setPEngTitle] = useState('');
  const [pCategory, setPCategory] = useState<'digital' | 'fashion' | 'beauty' | 'home'>('digital');
  const [pPrice, setPPrice] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pImgUrl, setPImgUrl] = useState('');
  const [pInstallment, setPInstallment] = useState(false);
  const [pInstallmentMonths, setPInstallmentMonths] = useState('12');
  const [pDownPayment, setPDownPayment] = useState('20');
  
  // Dynamic specifications key-values
  const [specKey1, setSpecKey1] = useState('برند سازنده');
  const [specVal1, setSpecVal1] = useState('');
  const [specKey2, setSpecKey2] = useState('کشور مبدا');
  const [specVal2, setSpecVal2] = useState('');

  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [prodError, setProdError] = useState('');
  const [prodSuccess, setProdSuccess] = useState('');

  // Register vendor
  const handleRegisterVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (!fullName || !email || !phone || !brandName || !nationalId) {
      setRegError('لطفا فیلدهای الزامی پنل ثبت‌نام برخط همکاران را پر نمایید.');
      return;
    }
    setIsRegistering(true);
    try {
      const response = await fetch('/api/vendors/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, phone, brandName, category, nationalId })
      });
      const data = await response.json();
      if (response.ok) {
        onRegisterSuccess(data);
        // Reset state
        setFullName('');
        setEmail('');
        setPhone('');
        setBrandName('');
        setNationalId('');
        // Ensure new vendor is set as active submitter
        setCurrentVendor(data.brandName);
      } else {
        setRegError(data.error || 'خطا در ثبت اطلاعات.');
      }
    } catch {
      setRegError('برقراری ارتباط با پلتفرم آریا با مشکل مواجه گردید.');
    } finally {
      setIsRegistering(false);
    }
  };

  // Add product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProdError('');
    setProdSuccess('');
    
    if (!pTitle || !pPrice || !pDesc) {
      setProdError('عنوان محصول، قیمت نقدی بازار و توضیحات اجمالی را بنویسید.');
      return;
    }

    setIsAddingProduct(true);
    
    const specifications: Record<string, string> = {};
    if (specKey1 && specVal1) specifications[specKey1] = specVal1;
    if (specKey2 && specVal2) specifications[specKey2] = specVal2;

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: pTitle,
          englishTitle: pEngTitle,
          category: pCategory,
          price: Number(pPrice),
          description: pDesc,
          imageUrl: pImgUrl || undefined,
          vendorName: currentVendor || 'فروشگاه آریا مارکت',
          isInstallmentEligible: pInstallment,
          installmentMonthsMax: pInstallment ? Number(pInstallmentMonths) : undefined,
          downPaymentPercent: pInstallment ? Number(pDownPayment) : undefined,
          specifications
        })
      });
      const data = await response.json();
      if (response.ok) {
        onAddProductSuccess(data);
        setProdSuccess(`محصول لوکس جدید "${data.title}" با موفقیت ارسال شد و در فروشگاه اصلی قابل مشاهده است!`);
        // Reset
        setPTitle('');
        setPEngTitle('');
        setPPrice('');
        setPDesc('');
        setPImgUrl('');
        setPInstallment(false);
        setSpecVal1('');
        setSpecVal2('');
      } else {
        setProdError(data.error || 'پذیرش کالا متبرک نگردید.');
      }
    } catch {
      setProdError('خطای ناشناخته شبکه به وقوع پیوسته است.');
    } finally {
      setIsAddingProduct(false);
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto" id="vendor-tab">
      
      {/* Intro row */}
      <div className="text-right space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-neutral-100 px-3 py-1 rounded-full text-[10px] font-bold">
          <Store className="size-3.5 text-neutral-800" />
          <span>پلتفرم بازرگانی و بازارگاه فروشندگان آریا</span>
        </div>
        <h2 className="text-xl md:text-2xl font-black text-neutral-900">سفیران و فروشندگان همکار آریا مارکت</h2>
        <p className="text-xs text-neutral-450 font-light max-w-2xl leading-relaxed">
          سرمایه اصلی ما شبکه معتبر تجار ایرانی ما هستند. برای حضور خلاق و مدیریت کالاهای دیجیتال یا ملزومات خانه، تایید اصالت را دریافت کنید، کالاهای جدید بارگذاری کنید و گزارش درآمدهای جاری خود را پیگیری نمایید.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Vendor registration & list (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active partners list */}
          <div className="bg-white border border-neutral-150/85 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-neutral-850 flex items-center justify-between border-b border-neutral-100 pb-2">
              <span>تولیدکنندگان ممیزی شده آریا</span>
              <span className="text-[10px] font-bold font-sans text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">{vendors.length} برند فعال</span>
            </h3>

            <div className="space-y-3.5 divide-y divide-neutral-100">
              {vendors.map(v => (
                <div key={v.id} className="pt-3 first:pt-0 flex items-center justify-between gap-2">
                  <div className="space-y-1 text-right">
                    <h4 className="text-xs font-bold text-neutral-800">{v.brandName}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-light">
                      <span>دسته: {v.category}</span>
                      <span>•</span>
                      <span>سفیر: {v.fullName}</span>
                    </div>
                  </div>

                  <div className="text-left">
                    <div className="text-[10.5px] font-bold text-neutral-900">{formatPrice(v.revenue)} تومان</div>
                    <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">درآمد تسویه شده</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form registration */}
          <div className="bg-white border border-neutral-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-neutral-100 pb-3 mb-5">
              <UserCheck className="size-4.5 text-neutral-850" />
              <h3 className="text-xs font-extrabold text-neutral-900">ثبت‌نام آنلاین به عنوان فروشنده جدید</h3>
            </div>

            <form onSubmit={handleRegisterVendor} className="space-y-4 text-right">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-neutral-400">نام و نام خانوادگی نماینده</label>
                  <input
                    type="text"
                    required
                    placeholder="نمونه: حمید حسینی"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-neutral-50 text-xs border border-neutral-200 rounded-xl py-2 px-3 text-neutral-700"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-neutral-400">نام غرفه / برند تجاری شما</label>
                  <input
                    type="text"
                    required
                    placeholder="نمونه: پوشاک ققنوس"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full bg-neutral-50 text-xs border border-neutral-200 rounded-xl py-2 px-3 text-neutral-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-neutral-400">شماره تماس ثابت یا همراه</label>
                  <input
                    type="text"
                    required
                    placeholder="به صورت کامل"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-neutral-50 text-xs border border-neutral-200 rounded-xl py-2 px-3 text-neutral-700 text-left"
                    style={{ direction: 'ltr' }}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-neutral-400">آدرس ایمیل کاری</label>
                  <input
                    type="email"
                    required
                    placeholder="business@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-neutral-50 text-xs border border-neutral-200 rounded-xl py-2 px-3 text-neutral-700 text-left"
                    style={{ direction: 'ltr' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-neutral-400">رسته عمده کالاها</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 text-xs rounded-xl py-2.5 px-3 whitespace-nowrap focus:outline-none"
                  >
                    <option>دیجیتال و گجت‌ها</option>
                    <option>مد، کفش و پوشاک</option>
                    <option>آرایشی، بهداشتی پوست</option>
                    <option>لوازم برقی و دکوری خانه</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-neutral-400">شماره ثبت / کد ملی ده‌رقمی</label>
                  <input
                    type="text"
                    required
                    placeholder="شناسه هویتی معتبر"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    className="w-full bg-neutral-50 text-xs border border-neutral-200 rounded-xl py-2 px-3 text-neutral-700 text-left font-mono"
                    style={{ direction: 'ltr' }}
                  />
                </div>
              </div>

              {regError && (
                <div className="text-[11px] text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-lg">
                  {regError}
                </div>
              )}

              <button
                id="submit-vendor-registration-btn"
                type="submit"
                disabled={isRegistering}
                className="w-full bg-neutral-900 hover:bg-black text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                {isRegistering ? <Loader2 className="size-4 animate-spin" /> : <Store className="size-4" />}
                <span>اعلام غرفه دار رسمی و صدور درگاه</span>
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: Manage Product load (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-neutral-100 rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-2 border-b border-neutral-100 pb-4 mb-6">
              <ListPlus className="size-4.5 text-neutral-800" />
              <h3 className="text-xs font-extrabold text-neutral-900">اضافه کردن کالا به کاتالوگ فروشگاه آریا</h3>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-5 text-right">
              
              {/* Selector for posting brand */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400">انتخاب غرفه قراردهنده محصول:</label>
                <select
                  value={currentVendor}
                  onChange={(e) => setCurrentVendor(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 text-xs rounded-xl py-2.5 px-3 focus:outline-none"
                >
                  {vendors.map(v => (
                    <option key={v.id} value={v.brandName}>{v.brandName}</option>
                  ))}
                  <option value="واردکننده همکار مستقل">شعبه همکار مستقل</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400">عنوان فارسی کالا *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: ساعت هوشمند شیائومی بند ۸"
                    value={pTitle}
                    onChange={(e) => setPTitle(e.target.value)}
                    className="w-full bg-neutral-50 text-xs border border-neutral-200 rounded-xl py-2.5 px-3.5 text-neutral-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400">عنوان انگلیسی و مشخصه لاتین (اختیاری)</label>
                  <input
                    type="text"
                    placeholder="Xiaomi Smart Band 8"
                    value={pEngTitle}
                    onChange={(e) => setPEngTitle(e.target.value)}
                    className="w-full bg-neutral-50 text-xs border border-neutral-200 rounded-xl py-2.5 px-3.5 text-neutral-800 text-left font-mono"
                    style={{ direction: 'ltr' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400">دسته‌بندی فروشگاه</label>
                  <select
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value as any)}
                    className="w-full bg-neutral-50 border border-neutral-200 text-xs rounded-xl py-2.5 px-3 focus:outline-none"
                  >
                    <option value="digital">کالای دیجیتال</option>
                    <option value="fashion">مد و پوشاک</option>
                    <option value="beauty">آرایشی و بهداشتی</option>
                    <option value="home">خانه و زندگی</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400">قیمت نقدی کالا به تومان *</label>
                  <input
                    type="number"
                    required
                    placeholder="مثال: ۱,۸۵۰,۰۰۰"
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    className="w-full bg-neutral-50 text-xs border border-neutral-200 rounded-xl py-2.5 px-3.5 text-neutral-800 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400">آدرس اینترنتی تصویر (اختیاری)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={pImgUrl}
                    onChange={(e) => setPImgUrl(e.target.value)}
                    className="w-full bg-neutral-50 text-xs border border-neutral-200 rounded-xl py-2.5 px-3.5 text-neutral-800 text-left font-mono"
                    style={{ direction: 'ltr' }}
                  />
                </div>
              </div>

              {/* Installment configuration options toggle */}
              <div className="bg-amber-50/20 border border-amber-250/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    id="vend-installment-checkbox"
                    type="checkbox"
                    checked={pInstallment}
                    onChange={(e) => setPInstallment(e.target.checked)}
                    className="size-4 hover:border-black accent-amber-500 rounded border-neutral-300 transition-all cursor-pointer"
                  />
                  <label htmlFor="vend-installment-checkbox" className="text-xs font-bold text-amber-900 cursor-pointer">
                    محصول مشمول طرح بازپرداخت اقساطی آریا مارکت (Aria Credit) باشد.
                  </label>
                </div>

                {pInstallment && (
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-neutral-400">سقف بازپرداخت اقساط به ماه:</label>
                      <select
                        value={pInstallmentMonths}
                        onChange={(e) => setPInstallmentMonths(e.target.value)}
                        className="w-full bg-white border border-neutral-200 text-xs rounded-xl py-2 px-2.5 focus:outline-none"
                      >
                        <option value="3">۳ قسط ماهانه</option>
                        <option value="6">۶ قسط ماهانه</option>
                        <option value="9">۹ قسط ماهانه</option>
                        <option value="12">۱۲ قسط ماهانه</option>
                        <option value="18">۱۸ قسط ماهانه</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-neutral-400">حداقل پیش‌پرداخت لازم (درصد):</label>
                      <select
                        value={pDownPayment}
                        onChange={(e) => setPDownPayment(e.target.value)}
                        className="w-full bg-white border border-neutral-200 text-xs rounded-xl py-2 px-2.5 focus:outline-none"
                      >
                        <option value="0">۰٪ - بدون پیش‌پرداخت</option>
                        <option value="10">۱۰٪ قیمت کل کالا</option>
                        <option value="15">۱۵٪ قیمت کل کالا</option>
                        <option value="20">۲۰٪ قیمت کل کالا</option>
                        <option value="30">۳۰٪ قیمت کل کالا</option>
                        <option value="50">۵۰٪ قیمت کل کالا</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Descriptive details specs fields */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-400">توضیحات و نقدهای اجمالی کالا *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="مشخصات ظاهری، فنی، گارانتی و کاربردهای اصلی..."
                  value={pDesc}
                  onChange={(e) => setPDesc(e.target.value)}
                  className="w-full bg-neutral-50 text-xs border border-neutral-200 rounded-xl py-2.5 px-3.5 focus:outline-none focus:border-neutral-900 text-neutral-850"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pb-2 border-b border-neutral-100">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400">فنی ۱ (برند)</label>
                  <input
                    type="text"
                    placeholder="سازنده کالا"
                    value={specVal1}
                    onChange={(e) => setSpecVal1(e.target.value)}
                    className="w-full bg-neutral-50 text-xs border border-neutral-200 rounded-lg py-2 px-2.5 text-neutral-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400">فنی ۲ (کشور سازنده)</label>
                  <input
                    type="text"
                    placeholder="مبدا اصلی"
                    value={specVal2}
                    onChange={(e) => setSpecVal2(e.target.value)}
                    className="w-full bg-neutral-50 text-xs border border-neutral-200 rounded-lg py-2 px-2.5 text-neutral-800"
                  />
                </div>
              </div>

              {prodError && (
                <div className="text-[11px] text-rose-500 bg-rose-50 border border-rose-100 p-2.5 rounded-xl">
                  {prodError}
                </div>
              )}

              {prodSuccess && (
                <div className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl">
                  {prodSuccess}
                </div>
              )}

              <button
                id="submit-catalog-product-btn"
                type="submit"
                disabled={isAddingProduct}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs py-3.5 rounded-xl cursor-pointer transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {isAddingProduct ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>در حال ارزیابی فنی و بارگذاری...</span>
                  </>
                ) : (
                  <>
                    <PackageCheck className="size-4.5" />
                    <span>تایید سلامت کالا و انتشار در آریا مارکت</span>
                  </>
                )}
              </button>

            </form>
          </div>
        </div>

      </div>

    </div>
  );
}
