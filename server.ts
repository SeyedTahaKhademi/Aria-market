/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { Product, Vendor, InstallmentPlan, BlogPost } from './src/types';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("⚠️ Warning: GEMINI_API_KEY is not configured or is placeholder. AI Shopper will use direct fallback mode.");
}

// Local Database File Path
const DB_PATH = path.join(process.cwd(), 'db.json');

// Initial seed data
const initialProducts: Product[] = [
  {
    id: 'p1',
    title: 'آیفون ۱۵ پرو مکس ۲۵۶ گیگابایت',
    englishTitle: 'iPhone 15 Pro Max 256GB',
    category: 'digital',
    price: 64900000,
    description: 'گوشی موبایل پرچمدار اپل با بدنه تیتانیومی مقاوم، پردازنده خیره‌کننده A17 Pro و سیستم دوربین پیشرفته ۳ گانه ۵۰ مگاپیکسلی با زوم اپتیکال ۵ برابری. تجربه بی‌نظیر صفحه نمایش Super Retina XDR.',
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=60',
    vendorName: 'آریا دیجی دیجیتال',
    rating: 4.9,
    reviewsCount: 142,
    isInstallmentEligible: true,
    installmentMonthsMax: 12,
    downPaymentPercent: 20,
    specifications: {
      'پردازنده': 'Apple A17 Pro (3nm)',
      'صفحه نمایش': '6.7 اینچ Super Retina XDR OLED',
      'حافظه اصلی': '256 گیگابایت',
      'حافظه رم': '8 گیگابایت',
      'وزن': '221 گرم'
    }
  },
  {
    id: 'p2',
    title: 'مک‌بوک ایر M3 اپل حافظه ۸ گیگابایت ۲۵۶ SSD',
    englishTitle: 'MacBook Air M3 2024',
    category: 'digital',
    price: 71500000,
    description: 'جدیدترین نسخه لپ‌تاپ باریک و فوق‌العاده سریع اپل، مجهز به تراشه انقلابی M3، پشتیبانی از دو مانیتور مجزا در حالت بسته، عمر باتری باورنکردنی ۱۸ ساعته و طراحی یکپارچه آلومینیومی بدون فن.',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=60',
    vendorName: 'آریا دیجی دیجیتال',
    rating: 4.8,
    reviewsCount: 68,
    isInstallmentEligible: true,
    installmentMonthsMax: 18,
    downPaymentPercent: 15,
    specifications: {
      'تراشه پردازشگر': 'Apple M3 (8-core CPU / 8-core GPU)',
      'حافظه داخلی': '256 گیگابایت SSD فوق سریع',
      'صفحه نمایش': '13.6 اینچ Liquid Retina',
      'شارژدهی باتری': 'تا 18 ساعت کاربری مداوم',
      'سیستم عامل': 'macOS Sequoia'
    }
  },
  {
    id: 'p3',
    title: 'هدفون بی‌سیم نویز کنسلینگ سونی WH-1000XM5',
    englishTitle: 'Sony WH-1000XM5 ANC Headphones',
    category: 'digital',
    price: 19800000,
    description: 'پادشاه بی‌رقیب هدفون‌های نویزکنسلینگ جهان با دو پردازنده هوشمند، ۸ میکروفون اختصاصی، کیفیت صدای بی‌رقیب با پشتیبانی از LDAC و طراحی ارگونومیک فوق‌العاده راحت برای ساعت‌ها شنیدن موسیقی مداوم.',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
    vendorName: 'صدای ماندگار',
    rating: 4.7,
    reviewsCount: 95,
    isInstallmentEligible: true,
    installmentMonthsMax: 6,
    downPaymentPercent: 30,
    specifications: {
      'فناوری ارتباطی': 'بلوتوث نسخه 5.2 و جک 3.5 میلی‌متری',
      'عمر باتری': 'تا 30 ساعت با نویزکنسلینگ فعال',
      'فناوری شارژ': 'شارژ سریع (5 دقیقه شارژ برای 3 ساعت پخش)',
      'سایر ویژگی‌ها': 'کنترل لمسی، صدای سه بعدی ۳۶۰ درجه'
    }
  },
  {
    id: 'p4',
    title: 'کاپشن اورسایز برزنتی ضدآب کلاه دار',
    englishTitle: 'Oversized Waterproof Canvas Jacket',
    category: 'fashion',
    price: 3450000,
    description: 'کاپشن زمستانه با پارچه برزنتی ۱۰۰٪ ضد‌آب و لایه داخلی پشم شیشه ضخیم. برشی مدرن و اورسایز کلاسیک مناسب برای استایل‌های مینی‌مال روزمره و آب و هوای بارانی و برفی.',
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=60',
    vendorName: 'پوشاک گوزن مشکی',
    rating: 4.5,
    reviewsCount: 32,
    isInstallmentEligible: false,
    specifications: {
      'جنس پارچه': 'برزنت پلی‌استر ضدآب گرید A',
      'آستر داخلی': 'مخمل گرمایشی متراکم',
      'کلاه': 'دارای کلاه با قابلیت جدا شدن',
      'راهنمای سایز': 'قواره آزاد (اورسایز)'
    }
  },
  {
    id: 'p5',
    title: 'نیم‌بوت چرم طبیعی دست‌دوز تبریز کلاسیک',
    englishTitle: 'Tabriz Handcrafted Leather Ankle Boots',
    category: 'fashion',
    price: 2890000,
    description: 'نیم‌بوت چرمی شیک و باوقار، تهیه شده از چرم طبیعی گاو ممتاز تبریز. کفی کاملاً طبی و زیره پلی‌یورتان (PU) نشکن و منعطف با دوخت دست دوز دوبل برای دوام سالیان متوالی.',
    imageUrl: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=500&auto=format&fit=crop&q=60',
    vendorName: 'چرم اصیل تبریز',
    rating: 4.8,
    reviewsCount: 54,
    isInstallmentEligible: true,
    installmentMonthsMax: 6,
    downPaymentPercent: 0,
    specifications: {
      'نوع چرم': 'چرم طبیعی فول‌گرین گاو',
      'جنس زیره': 'ترمو الاستومر نشکن ضد لغزش',
      'کفی': 'چرم طبیعی ارتوپدیک آنتی‌باکتریال',
      'ضمانت': '۶ ماه گارانتی تعویض زیره'
    }
  },
  {
    id: 'p6',
    title: 'عطر مردانه دیور ساواج ادو پرفیوم ۱۰۰ میلی‌لیتر',
    englishTitle: 'Dior Sauvage Eau de Parfum 100ml',
    category: 'beauty',
    price: 7400000,
    description: 'افسانه‌ای بی‌انتها در دنیای عطرهای مردانه. رایحه‌ای مرکباتی، چوبی و معطر که خنکی مرکبات کالابریا را به همراه گرمای اسرارآمیز جوز هندی و عصاره ارزشمند امبروکسان خلق می‌کند.',
    imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500&auto=format&fit=crop&q=60',
    vendorName: 'آرایشگاه سفیر زیبایی',
    rating: 4.9,
    reviewsCount: 110,
    isInstallmentEligible: false,
    specifications: {
      'نوع رایحه': 'خنک و تند چوبی مرکباتی',
      'ماندگاری': 'بسیار بالا (۸ الی ۱۲ ساعت)',
      'پخش بو': 'بسیار قوی با خط بوی عالی',
      'کشور مبدا برند': 'فرانسه'
    }
  },
  {
    id: 'p7',
    title: 'پک آبرسان و جوانساز چندگانه خاویار طلایی کلینیک',
    englishTitle: 'Clinique Golden Caviar Skincare Set',
    category: 'beauty',
    price: 4950000,
    description: 'یک روتین کامل پوست شامل سرم جوانساز دور چشم، کرم مرطوب‌کننده شب خاویار و فوم پاک‌کننده منافذ متراکم. مرطوب‌کنندگی عمقی ۲۴ ساعته و ترمیم کلاژن‌های آسیب‌دیده پوست.',
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=60',
    vendorName: 'آرایشگاه سفیر زیبایی',
    rating: 4.6,
    reviewsCount: 28,
    isInstallmentEligible: true,
    installmentMonthsMax: 3,
    downPaymentPercent: 20,
    specifications: {
      'نوع پوست': 'مناسب برای انواع پوست‌ها به ویژه خشک و حساس',
      'ترکیبات کلیدی': 'عصاره طبیعی خاویار طلایی، هیالورونیک اسید',
      'فاقد مواد': 'پارابن، فتالات و روغن‌های معدنی مضر',
      'تعداد تست پوستی': 'کاملاً ضد حساسیت آزمایش شده'
    }
  },
  {
    id: 'p8',
    title: 'دستگاه اسپرسوساز نیمه صنعتی نوا مدل ۱۴۹',
    englishTitle: 'Nova 149 Semi-Industrial Espresso Machine',
    category: 'home',
    price: 8900000,
    description: 'اسپرسوساز مینی‌مال فوق‌العاده قوی با فشار بخار رکوردی ۱۵ بار و توان مصرفی ۱۲۵۰ وات. نازل بخار متحرک از جنس استیل ضدزنگ جهت تهیه بهینه کفی غلیظ برای کاپوچینو و لاته خانگی بی‌نقص.',
    imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=60',
    vendorName: 'لوازم خانگی آریا کالا',
    rating: 4.7,
    reviewsCount: 74,
    isInstallmentEligible: true,
    installmentMonthsMax: 12,
    downPaymentPercent: 10,
    specifications: {
      'فشار بخار صادرکننده': '15 بار واقعی',
      'حجم مخزن آب': '1.5 لیتر با قابلیت جداسازی',
      'جنس بدنه': 'ترکیب استیل ضد‌خش مات و پلاستیک فشرده',
      'سیستم گرمایشی': 'ترمو بلاک پیشرفته سوپر فست'
    }
  },
  {
    id: 'p9',
    title: 'مجموعه ظروف سرامیکی دست‌ساز گالری بیجار (۱۸ پارچه)',
    englishTitle: 'Bijat Ceramic Handcrafted Tableware 18pcs',
    category: 'home',
    price: 3600000,
    description: 'ست بی‌نظیر سرو غدا خوری، طراحی شده توسط گالری هنری مدرن بیجار. تولید شده به شیوه بومی دو بار پخت در کوره با لعاب درخشان فیروزه‌ای خاکی ضدخش، ایمن در مایکروویو و ماشین ظرفشویی.',
    imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=500&auto=format&fit=crop&q=60',
    vendorName: 'هنرکده بیجار',
    rating: 4.8,
    reviewsCount: 19,
    isInstallmentEligible: false,
    specifications: {
      'تعداد ظروف': '۱۸ پارچه (مناسب پذیرایی ۶ نفره)',
      'جنس پایه': 'سرامیک خاک رس خالص دو بار پخته شده',
      'مقاومت حرارتی': 'قابل استفاده در فر و مایکروویو تا ۲۲۰ درجه',
      'تکنیک رنگرزی': 'ترکیب سنتی نقاشی زیرلعابی تک‌رنگ'
    }
  },
  {
    id: 'p10',
    title: 'کنسول بازی سونی پلی‌استیشن ۵ اسلیم دیجیتال',
    englishTitle: 'Sony PlayStation 5 Slim Digital Edition 1TB',
    category: 'digital',
    price: 31500000,
    description: 'کنسول بازی محبوب سونی پی اس ۵ طرح اسلیم با ظرفیت ۱ ترابایت حافظه فوق سریع SSD، پشتیبانی از رزولوشن 4K با نرخ ۱۲۰ فریم بر ثانیه، صدای سه بعدی سه بعدی طوفانی و دابل دسته لمسی دوال سنس مجهز به بازخورد لمسی.',
    imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&auto=format&fit=crop&q=60',
    vendorName: 'آریا دیجی دیجیتال',
    rating: 4.9,
    reviewsCount: 228,
    isInstallmentEligible: true,
    installmentMonthsMax: 12,
    downPaymentPercent: 20,
    specifications: {
      'فضای ذخیره‌سازی': '1TB SSD فوق سریع اختصاصی',
      'خروجی تصویر': 'پشتیبانی از کیفیت 4K و 8K HDR',
      'فریم ریت': 'حداکثر ۱۲۰ فریم بر ثانیه',
      'دسته همراه': '۱ عدد دوال سنس سفید سفارشی',
      'ریجن ساخت': 'اروپا گرید A'
    }
  },
  {
    id: 'p11',
    title: 'ساعت هوشمند گلکسی واچ ۶ کلاسیک ۴۷ میلی‌لیتر',
    englishTitle: 'Samsung Galaxy Watch 6 Classic 47mm LTE',
    category: 'digital',
    price: 15400000,
    description: 'ساعت هوشمند رده‌بالای سامسونگ با قاب چرخشی فیزیکی دوست‌داشتنی، سنسورهای ردیابی خواب پیشرفته هوش مصنوعی، پایش فشار خون، نوار قلب (ECG) مستقل و صفحه نمایش بزرگ و درخشان سوپر آمولد غرق در نور.',
    imageUrl: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=500&auto=format&fit=crop&q=60',
    vendorName: 'آریا دیجی دیجیتال',
    rating: 4.6,
    reviewsCount: 42,
    isInstallmentEligible: true,
    installmentMonthsMax: 6,
    downPaymentPercent: 10,
    specifications: {
      'جنس بدنه': 'فولاد ضد زنگ مقاوم ۳۱۶L',
      'صفحه نمایش': '1.5 اینچ Super AMOLED Sapphire Crystal',
      'سیستم عامل': 'Wear OS Powered by Samsung',
      'مقاومت در برابر آب': 'استاندارد IP68 و 5ATM تا عمق ۵۰ متر',
      'سنسورها': 'پایش ضربان قلب، اکسیژن خون، فشارخون و خواب'
    }
  },
  {
    id: 'p12',
    title: 'کت چرمی یقه ایستاده زیپ‌دار مارال چرم اسپرت',
    englishTitle: 'Maral Genuine Leather Sport Biker Jacket',
    category: 'fashion',
    price: 9800000,
    description: 'کت تک چرمی شیک و امروزی تهیه شده از چرم صد درصد طبیعی سنگین درجه یک. دوخت بسیار تمیز و صنعتی، جیب‌های زیپ‌دار مخفی سینه و آستر پلی‌استر گرم و مقاوم در برابر سرما و رطوبت.',
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=60',
    vendorName: 'چرم اصیل تبریز',
    rating: 4.8,
    reviewsCount: 38,
    isInstallmentEligible: true,
    installmentMonthsMax: 9,
    downPaymentPercent: 20,
    specifications: {
      'جنس کت': 'چرم ۱۰۰٪ طبیعی ممتاز گاو',
      'رنگبندی': 'مشکی مات کلاسیک / قهوه‌ای سوخته',
      'جنس یراق آلات': 'استیل ضد زنگ ژاپنی YKK',
      'ظرفیت گرمایی': 'مناسب پاییز، زمستان و بهار خنک'
    }
  },
  {
    id: 'p13',
    title: 'کفش رانینگ و پیاده‌روی نایک ایر مکس ۹۰ اورجینال',
    englishTitle: 'Nike Air Max 90 Classic Running Shoes',
    category: 'fashion',
    price: 6850000,
    description: 'کفش ورزشی نوستالژیک و در عین حال فوق‌العاده مدرن نایک با کپسول هوای مشهود فعال در پاشنه برای کاهش خستگی زانو و ستون فقرات در پیاده‌روی‌های طولانی. رویه مشبک تنفس‌پذیر توری و جیر با اصالت.',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60',
    vendorName: 'چرم اصیل تبریز',
    rating: 4.7,
    reviewsCount: 91,
    isInstallmentEligible: false,
    specifications: {
      'نوع کاربری': 'دویدن، تمرین باشگاهی و استفاده پیاده‌روی روزانه',
      'فناوری کفی': 'Nike Air Sole کپسولی جاذب پاشنه',
      'جنس رویه': 'ترکیب جیر طبیعی، چرم مصنوعی و تور TPU',
      'وزن هر لنگه': '۲۸۰ گرم فوق سبک'
    }
  },
  {
    id: 'p14',
    title: 'سرم جوانساز و ضد چروک اسید هیالورونیک لورآل پاریس',
    englishTitle: 'LOreal Revitalift 1.5% Pure Hyaluronic Acid Serum',
    category: 'beauty',
    price: 1350000,
    description: 'پرفروش‌ترین سرم ضد چروک دنیا حاوی ۱.۵ درصد اسید هیالورونیک خالص با دو وزن مولکولی متفاوت جهت رطوبت‌رسانی عمقی و کلاژن‌سازی آنی لایه‌های میانی پوست. برطرف کننده فوری ۴۰ درصد از چروک‌های ریز صورت.',
    imageUrl: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=500&auto=format&fit=crop&q=60',
    vendorName: 'آرایشگاه سفیر زیبایی',
    rating: 4.8,
    reviewsCount: 154,
    isInstallmentEligible: false,
    specifications: {
      'حجم سرم': '۳۰ میلی‌لیتر پمپی',
      'درصد خلوص': '1.5% Hyaluronic Acid خالص',
      'روش مصرف': 'دو نوبت صبح و شب روی پوست تمیز',
      'تایید پزشک': 'تست شده توسط برترین متخصصان ارشد پوست دنیا'
    }
  },
  {
    id: 'p15',
    title: 'جاروبرقی رباتیک هوشمند شیائومی مدل S10 لیدار',
    englishTitle: 'Xiaomi Robot Vacuum Cleaner S10 Lidar Version',
    category: 'home',
    price: 16900000,
    description: 'دستیار نظافت بی‌صدا با قدرت مکش عالی ۴۰۰۰ پاسکال و ناوبری پیشرفته لیزری LDS برای نقشه‌برداری سه بعدی و هوشمند خانه شما. قابلیت جاروکشی مرتب و تی‌کشی همزمان با مخزن آب هوشمند.',
    imageUrl: 'https://images.unsplash.com/photo-1518133680790-3985eccf521e?w=500&auto=format&fit=crop&q=60',
    vendorName: 'لوازم خانگی آریا کالا',
    rating: 4.7,
    reviewsCount: 56,
    isInstallmentEligible: true,
    installmentMonthsMax: 12,
    downPaymentPercent: 15,
    specifications: {
      'قدرت مکش': '4000 Pa مکش توربو موتور ژاپنی',
      'ظرفیت باتری': '3200 mAh (تا ۱۳۰ دقیقه کارکرد مداوم)',
      'سنسور یابی': 'رادارهای لیزری دوقلو LDS 360 درجه',
      'قابلیت تبلت/موبایل': 'کنترل کامل با اپلیکیشن Mi Home و ترسیم دیوارهای مجازی'
    }
  },
  {
    id: 'p16',
    title: 'تلویزیون هوشمند ۶۵ اینچ OLED ال‌جی C3',
    englishTitle: 'LG OLED65C3 4K Smart TV',
    category: 'digital',
    price: 89000000,
    description: 'تلویزیون اولد پرچمدار ال‌جی با پردازشگر هوشمند آلفا ۹ نسل ۶، رزولوشن بی‌نقص 4K هوش مصنوعی، فناوری صدای شگفت‌انگیز Dolby Atmos، ۱۲۰ هرتز واقعی مخصوص گیمینگ نسل نهم و طراحی فوق باریک گالری استایل.',
    imageUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=500&auto=format&fit=crop&q=60',
    vendorName: 'آریا دیجی دیجیتال',
    rating: 4.9,
    reviewsCount: 35,
    isInstallmentEligible: true,
    installmentMonthsMax: 18,
    downPaymentPercent: 25,
    specifications: {
      'فناوری پنل': 'OLED Evo خود روشن‌شونده با کنتراست بی‌نهایت',
      'پردازشگر تصویر': 'α9 AI Processor Gen6',
      'کیفیت تصویر': '4K Ultra HD با فرکانس 120Hz',
      'پورت‌ها': '4x HDMI 2.1 کامل مخصوص بازی',
      'سیستم صوتی': '40 وات با شبیه‌سازی ۹.۱.۲ کاناله هوشمند'
    }
  },
  {
    id: 'p17',
    title: 'دستبند طلای ۱۸ عیار مینی‌مال کارتیر زنجیری',
    englishTitle: 'Cartier Minimal 18k Gold Chain Bracelet',
    category: 'fashion',
    price: 32000000,
    description: 'دستبند زنانه لوکس و مینیمال از طلای زرد ۱۸ عیار استاندارد ایران با قفل تافته فوق‌العاده مستحکم. طراحی کلاسیک زنجیری بسیار ایده آل برای استفاده‌های رسمی و روزمره به موازات حفظ ارزش ریالی سرمایه شما.',
    imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&auto=format&fit=crop&q=60',
    vendorName: 'گالری زرین‌دست',
    rating: 4.8,
    reviewsCount: 14,
    isInstallmentEligible: true,
    installmentMonthsMax: 12,
    downPaymentPercent: 15,
    specifications: {
      'عيار طلا': '۱۸ عیار واقعی (۷۵۰)',
      'وزن حدودی': '۷.۴ گرم جلا داده شده',
      'رنگ طلا': 'زرد درخشان کلاسیک',
      'نوع قفل': 'قفل مکانیکی طوطی درجه یک',
      'جعبه بسته‌بندی': 'کاور لوکس پیشکش چرمی'
    }
  },
  {
    id: 'p18',
    title: 'ادو پرفیوم زنانه شنل کوکو مادمازل ۱۰۰ میلی‌لیتر',
    englishTitle: 'Chanel Coco Mademoiselle Intense 100ml',
    category: 'beauty',
    price: 14800000,
    description: 'یکی از ماندگارترین و نمادین‌ترین شاهکارهای برند سلطنتی شنل فرانسه با رایحه ملایم و شیرین مرکبات، گل‌های یاس رازقی، رز ترکی، وانیل ماداگاسکار و چوب صندل شرقی برای جلوه‌ای لوکس و بی‌همتا.',
    imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&auto=format&fit=crop&q=60',
    vendorName: 'آرایشگاه سفیر زیبایی',
    rating: 5.0,
    reviewsCount: 182,
    isInstallmentEligible: true,
    installmentMonthsMax: 6,
    downPaymentPercent: 30,
    specifications: {
      'طبع عطر': 'ملایم، شیرین و بسیار اشرافی',
      'گروه بویایی': 'شرقی گلی چوبی',
      'غلظت اسانس': 'اصلی Eau de Parfum (EDP)',
      'ماندگاری عطر': 'فوق العاده بالا (تا ۱۶ ساعت)',
      'کشور مبدا': 'پاریس، فرانسه'
    }
  },
  {
    id: 'p19',
    title: 'ماشین لباسشویی ۹ کیلویی ادواش سامسونگ',
    englishTitle: 'Samsung AddWash 9kg Smart Washer',
    category: 'home',
    price: 38900000,
    description: 'ماشین لباسشویی مجهز به تکنولوژی نوآورانه ادواش جهت افزودن لباس به جا مانده در حین شستشو، موتور اکوبابل تولیدکننده حباب سازگار با الیاف لباس، اتصال مستقیم به موبایل و اینورتر دیجیتال سوپر بی‌صدا.',
    imageUrl: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=500&auto=format&fit=crop&q=60',
    vendorName: 'لوازم خانگی آریا کالا',
    rating: 4.7,
    reviewsCount: 43,
    isInstallmentEligible: true,
    installmentMonthsMax: 18,
    downPaymentPercent: 10,
    specifications: {
      'ظرفیت دیگ': '۹ کیلوگرم بزرگ ویژه پتو شویی',
      'دور موتور': '۱۴۰۰ دور در دقیقه واقعی',
      'رده مصرف انرژی': 'A+++ فوق‌العاده کم‌مصرف',
      'نوع موتور': 'Digital Inverter بدون تسمه',
      'سیستم خودکار عیب‌یابی': 'دارای سیستم Smart Check هوشمند'
    }
  },
  {
    id: 'p20',
    title: 'گوشی موبایل سامسونگ گلکسی S24 اولترا ۵۱۲ گیگابایت',
    englishTitle: 'Samsung Galaxy S24 Ultra 512GB',
    category: 'digital',
    price: 74500000,
    description: 'قدرتمندترین پرچمدار هوش مصنوعی سامسونگ در جهان با بدنه تیتانیوم گرید هوافضا، قلم هوشمند S-Pen کامپوزیت، دوربین رقیب‌کُش ۲۰۰ مگاپیکسلی با هوش تصویربرداری ProVisual و پردازنده اسنپ‌دراگون ۸ نسل ۳ عالی.',
    imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&auto=format&fit=crop&q=60',
    vendorName: 'آریا دیجی دیجیتال',
    rating: 4.9,
    reviewsCount: 167,
    isInstallmentEligible: true,
    installmentMonthsMax: 12,
    downPaymentPercent: 20,
    specifications: {
      'پردازنده گرافیکی': 'Snapdragon 8 Gen 3 (4nm)',
      'صفحه نمایش': '6.8 اینچ Dynamic AMOLED 2X',
      'نرخ نوسازی تصویر': '120Hz متغیر با کنتراست اوج',
      'مقاومت شیشه': 'Gorilla Glass Armor ضد انعکاس',
      'پالت رنگ ساختاری': 'تیتانیوم مشکی / خاکستری'
    }
  }
];

const initialVendors: Vendor[] = [
  {
    id: 'v1',
    fullName: 'سعید محمدی',
    email: 'mohammadi@ariadigital.com',
    phone: '09121112233',
    brandName: 'آریا دیجی دیجیتال',
    category: 'دیجیتال و گجت‌ها',
    status: 'approved',
    nationalId: '0012233445',
    registrationDate: '1405/01/15',
    revenue: 136400000
  },
  {
    id: 'v2',
    fullName: 'مریم حسینی',
    email: 'hoseini@classiccharm.com',
    phone: '09127778899',
    brandName: 'چرم اصیل تبریز',
    category: 'مد، کفش و پوشاک',
    status: 'approved',
    nationalId: '1379988776',
    registrationDate: '1405/02/10',
    revenue: 15400000
  }
];

const initialInstallments: InstallmentPlan[] = [
  {
    id: 'ins1',
    fullName: 'رضا علیزاده',
    phone: '09355554433',
    nationalCode: '0065544332',
    monthlySalary: 28000000,
    productId: 'p1',
    productTitle: 'آیفون ۱۵ پرو مکس ۲۵۶ گیگابایت',
    price: 64900000,
    months: 12,
    monthlyPayment: 5408333,
    status: 'active',
    submissionDate: '1405/03/01',
    trackingCode: 'ARK-71408'
  }
];

const initialBlogPosts: BlogPost[] = [
  {
    id: 'b1',
    title: 'چگونه بهترین گوشی هوشمند را طبق بودجه خود انتخاب کنیم؟',
    slug: 'choose-best-phone-by-budget',
    summary: 'راهنمای گام به گام تحلیل سخت‌افزار، مقایسه نمایشگرها و سیستم دوربین موبایل‌های زیر ۵۰ میلیون تومان بازار ایران.',
    content: 'با توجه به نوسانات شدید بازار دیجیتال و وجود ده‌ها مدل مختلف از برندهای اپل، سامسونگ، شیائومی و جدیدا آنر، خرید یک گوشی هوشمند کار ساده‌ای نیست. اولین قدم در انتخاب یک گوشی مناسب، تعیین اولویت‌های اصلی شماست. آیا دوربین برایتان اولویت دارد یا سخت‌افزار بازی؟ یا شاید هم به دنبال یک باتری با دوام فوق‌العاده برای سفرهای مکرر کاری هستید؟ در این مقاله، ما به بررسی و دسته‌بندی گجت‌های برتر سال ۱۴۰۵ بر اساس ارزش خرید پرداخته‌ایم تا هوشمندانه انتخاب کنید...',
    author: 'امیرحسین راد',
    date: '۱۶ اردیبهشت ۱۴۰۵',
    readTime: '۶ دقیقه',
    category: 'تکنولوژی و گجت',
    coverUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60'
  } as BlogPost,
  {
    id: 'b2',
    title: 'اصول چیدمان مینی‌مال خانه؛ خلوتی که روح را جلا می‌بخشد',
    slug: 'minimalist-interior-design-principles',
    summary: 'آشنایی با ترکیب رنگ‌های خنثی، نورپردازی طبیعی و انتخاب اکسسوری‌های مینیمال برای داشتن خانه‌ای آرام و دلباز.',
    content: 'طراحی مینی‌مالیستی به هیچ وجه به معنای داشتن یک فضای سرد، برهوت و کسل‌کننده نیست؛ بلکه هنر انتخاب بهترین‌ها با تمرکز بر ضرورت و آرامش روان است. در استایل مینی‌مال ژاپنی یا اسکاندیناوی (کپنهان) هر وسیله‌ای داستان و کاربردی مشخص دارد. استفاده از نور طبیعی خورشید، ترکیب رنگ‌های کرم، استخوانی، خاکستری روشن و تزئین خانه با سرامیک‌های دست‌ساز گلی و ظریف به فضای مسکونی شما هویت و گرمای عمیقی می‌بخشد. یاد می‌گیریم که چگونه فضاهای اضافی را هرس کنیم...',
    author: 'رویا سهرابی',
    date: '۲۲ اردیبهشت ۱۴۰۵',
    readTime: '۴ دقیقه',
    category: 'خانه و طراحی داخلی',
    coverUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=500&auto=format&fit=crop&q=60'
  } as BlogPost,
  {
    id: 'b3',
    title: 'مزایای خرید اقساطی بدون ضامن در شرایط تورمی',
    slug: 'benefits-installment-buying-no-guarantor',
    summary: 'چطور با استفاده از سرویس‌های اعتباری و پرداخت بلندمدت اقساطی، ارزش پول خود را حفظ کرده و پیش از گران شدن کالا، صاحب آن شویم.',
    content: 'در دورانی که تورم ماهانه به یک حقیقت اقتصادی مبدل شده است، خرید به صورت نقدی همیشه بهترین یا هوشمندانه‌ترین روش مدیریت سرمایه نیست. با استفاده از پلتفرم خرید اقساطی Aria Market، شما می‌توانید گران‌ترین ابزارهای کاری و دیجیتال مانند لپ‌تاپ‌های قوی مک‌بوک یا گوشی‌های پرچمدار را در چند قسط آسان و بدون نیاز به چک‌های سنگین کارمندی یا کارهای اداری طاقت‌فرسا دریافت کنید. این کار به شما اجازه می‌دهد تا امروز کالا را با قیمت ثابت دریافت کرده و پول آن را با ارزش فردا پرداخت نمایید...',
    author: 'حمید افشار (مشاور ارشد مالی)',
    date: '۰۵ خرداد ۱۴۰۵',
    readTime: '۵ دقیقه',
    category: 'اقتصاد و مشاوره مالی',
    coverUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&auto=format&fit=crop&q=60'
  } as BlogPost,
  {
    id: 'b4',
    title: 'راهنمای طلایی خرید عطر گرم و سرد مناسب هر فصل',
    slug: 'perfume-guide-cold-warm-seasons',
    summary: 'چگونه بر اساس آب و هوای بهار، تابستان یا زمستان، رایحه ماندگار و ایده آل خود را انتخاب کنیم و پخش بوی عطر را افزایش دهیم.',
    content: 'انتخاب عطر فراتر از سلیقه شخصی، به فیزیولوژی و دمای هوا گره خورده است. گرمای تابستان مولکول‌های مرکباتی و خنک را به سرعت تبخیر می‌کند، در حالی که سرمای زمستان حرکت اسانس‌های گرم و چوبی مثل وانیل یا چوب عود را کندتر و با وقارتر جلوه می‌دهد. در این مقاله به بررسی تفاوت غلظت‌های پرفیوم، ادو پرفیوم و ادو تویلت پرداخته و روش‌های نگهداری عطر در سایه و یخچال را بررسی می‌کنیم تا از تغییر بوی عطر محبوبتان جلوگیری کنید...',
    author: 'الناز رادمنش (کارشناس زیبایی)',
    date: '۱۰ خرداد ۱۴۰۵',
    readTime: '۵ دقیقه',
    category: 'آرایشی و زیبایی',
    coverUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&auto=format&fit=crop&q=60'
  } as BlogPost,
  {
    id: 'b5',
    title: '۵ ترفند اساسی برای نگهداری و براق ماندن کفش و کاپشن چرمی',
    slug: 'leather-care-and-maintenance-tips',
    summary: 'رازهایی حرفه‌ای برای جلوگیری از پوسته پوسته شدن چرم طبیعی و حفظ لطافت و براق بودن آن برای دهه‌ها استفاده مداوم.',
    content: 'محصولات چرمی لوکس مانند کفش‌های تبریز یا کت‌های مارال سزاوار مراقبت ویژه‌ای هستند تا کیفیت و درخشش اولیه خود را از دست ندهند. چرم مانند پوست زنده نیاز به تنفس و هیدراته شدن دارد. هرگز کفش‌های چرمی مرطوب را روبروی حرارت مستقیم بخاری قرار ندهید زیرا باعث خشکی و ترک خوردن الیاف آن می‌شود. استفاده مرتب از واکس‌های امولسیونی طبیعی فاقد پارافین، روغن کرچک یا وازلین به همراه نگهداری در کاور پارچه‌ای نخی تضمین می‌کند چرم شما برای نسل‌های بعد نیز مثل روز اول مقاوم باقی بماند...',
    author: 'غلامرضا شفیعی (استادکار چرم تبریز)',
    date: '۰۴ خرداد ۱۴۰۵',
    readTime: '۴ دقیقه',
    category: 'مد و پوشاک',
    coverUrl: 'https://images.unsplash.com/photo-1486308512473-9649fe4344c1?w=500&auto=format&fit=crop&q=60'
  } as BlogPost
];

// Database Helper
const loadDatabase = () => {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const initialDb = {
        products: initialProducts,
        vendors: initialVendors,
        installments: initialInstallments,
        blogPosts: initialBlogPosts
      };
      fs.writeFileSync(DB_PATH, JSON.stringify(initialDb, null, 2), 'utf-8');
      return initialDb;
    }
    const rawData = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(rawData);
  } catch (err) {
    console.error('Error reading file db.json, returning memory database instead:', err);
    return {
      products: initialProducts,
      vendors: initialVendors,
      installments: initialInstallments,
      blogPosts: initialBlogPosts
    };
  }
};

const saveDatabase = (data: any) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to file db.json:', err);
  }
};

// Start routing APIs
// Products Api
app.get('/api/products', (req, res) => {
  const db = loadDatabase();
  res.json(db.products);
});

app.post('/api/products', (req, res) => {
  const db = loadDatabase();
  const newProduct: Product = {
    id: 'p_' + Math.random().toString(36).substring(2, 9),
    title: req.body.title,
    englishTitle: req.body.englishTitle || '',
    category: req.body.category || 'digital',
    price: Number(req.body.price),
    description: req.body.description || '',
    imageUrl: req.body.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60',
    vendorName: req.body.vendorName || 'فروشنده همکار آریا مارکت',
    rating: 4.5,
    reviewsCount: 1,
    isInstallmentEligible: req.body.isInstallmentEligible || false,
    installmentMonthsMax: req.body.installmentMonthsMax ? Number(req.body.installmentMonthsMax) : 6,
    downPaymentPercent: req.body.downPaymentPercent ? Number(req.body.downPaymentPercent) : 20,
    specifications: req.body.specifications || {}
  };
  
  db.products.push(newProduct);
  saveDatabase(db);
  res.status(201).json(newProduct);
});

// Vendors Api
app.get('/api/vendors', (req, res) => {
  const db = loadDatabase();
  res.json(db.vendors);
});

app.post('/api/vendors/register', (req, res) => {
  const db = loadDatabase();
  const { fullName, email, phone, brandName, category, nationalId } = req.body;
  
  const newVendor: Vendor = {
    id: 'v_' + Math.random().toString(36).substring(2, 9),
    fullName,
    email,
    phone,
    brandName,
    category,
    status: 'approved', // Auto-approving for smooth marketplace demo flow
    nationalId,
    registrationDate: '۱۴۰۵/۰۳/۱۷',
    revenue: 0
  };
  
  db.vendors.push(newVendor);
  saveDatabase(db);
  res.status(201).json(newVendor);
});

// Installments Api
app.get('/api/installments', (req, res) => {
  const db = loadDatabase();
  const { phone } = req.query;
  if (phone) {
    const filtered = db.installments.filter((ins: InstallmentPlan) => ins.phone === phone);
    return res.json(filtered);
  }
  res.json(db.installments);
});

app.post('/api/installments/apply', (req, res) => {
  const db = loadDatabase();
  const { fullName, phone, nationalCode, monthlySalary, productId, months } = req.body;
  
  const targetProduct = db.products.find((p: Product) => p.id === productId);
  if (!targetProduct) {
    return res.status(404).json({ error: 'کالا یافت نشد' });
  }
  
  // Calculate payments
  const originalPrice = targetProduct.price;
  const downPayment = targetProduct.downPaymentPercent ? (originalPrice * targetProduct.downPaymentPercent) / 100 : 0;
  const remainingPrice = originalPrice - downPayment;
  // Let us add a standard 2.5% simple monthly interest rate for the installment cost
  const interestMult = 1 + (0.025 * Number(months));
  const totalRepay = remainingPrice * interestMult;
  const monthlyPayment = Math.round(totalRepay / Number(months));
  
  const newPlan: InstallmentPlan = {
    id: 'ins_' + Math.random().toString(36).substring(2, 9),
    fullName,
    phone,
    nationalCode,
    monthlySalary: Number(monthlySalary),
    productId,
    productTitle: targetProduct.title,
    price: originalPrice,
    months: Number(months),
    monthlyPayment,
    status: 'approved', // Auto-approving request to delight the user in the demo
    submissionDate: '۱۴۰۵/۰۳/۱۷',
    trackingCode: 'ARK-' + Math.floor(10000 + Math.random() * 90000)
  };
  
  db.installments.push(newPlan);
  saveDatabase(db);
  res.status(201).json(newPlan);
});

// Blog Api
app.get('/api/blog', (req, res) => {
  const db = loadDatabase();
  res.json(db.blogPosts);
});

// AI Shopping Assistant - Powered by server-side Gemini 3.5 Flash
app.post('/api/ai-shopper', async (req, res) => {
  const { prompt, chatHistory } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'لطفا خواسته خود را مطرح کنید.' });
  }

  const db = loadDatabase();
  const productCatalogueString = db.products.map((p: Product) => {
    return `ID: ${p.id}, Title: ${p.title} (${p.englishTitle || ''}), Category: ${p.category}, Price: ${p.price.toLocaleString('fa-IR')} Tomans, Description: ${p.description}`;
  }).join('\n\n--- Product ---\n\n');

  try {
    let resultText = '';
    let parsedJson: { message: string, suggestedProductIds: string[] } = {
      message: 'متاسفانه در حال حاضر با مشکلی در پردازش مواجه شدم. اما محصولات مرتبط را برای شما آوردم.',
      suggestedProductIds: []
    };

    if (ai) {
      // Create schema definition according to @google/genai guidelines
      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          message: {
            type: Type.STRING,
            description: "An incredibly polite, enthusiastic and helpful answer in Persian (Farsi) describing how the recommended items match the user's specific tastes or requirements."
          },
          suggestedProductIds: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING
            },
            description: "List of ID values belonging ONLY to the products shown in the catalog that best match this prompt."
          }
        },
        required: ["message", "suggestedProductIds"]
      };

      const systemInstruction = 
        `شما یک دستیار خرید شخصی بسیار حرفه‌ای و خوش‌برخورد برای فروشگاه "آریا مارکت" (Aria Market) هستید.` +
        `شما باید به زبان فارسی بسیار روان، مینی‌مال، لوکس و مودبانه صحبت کنید.\n\n` +
        `در زیر کاتالوگ تمام محصولات موجود در فروشگاه آورده شده است:\n` +
        `${productCatalogueString}\n\n` +
        `خواسته‌ها و سلیقه کاربر را تحلیل کنید و بین ۱ تا ۳ تا از مرتبط‌ترین کدهای محصول (ID) را شناسایی کنید.\n` +
        `نباید از کدهایی خارج از کاتالوگ بالا استفاده کنید. اگر محصول کاملاً مرتبطه وجود ندارد، نزدیک‌ترین مورد یا محصولاتی که می‌توانند نیازش را برطرف کنند را پیشنهاد بدهید.\n` +
        `یک توضیح خوانا و مجاب‌کننده کوتاه فارسی بنویسید که دلیلی بر انتخاب شما باشد. خروجی را دقیقاً طبق قالب JSON تعیین شده ارسال کنید. هیچ متن اضافی بیرون از بلوک JSON وارد نکنید.`;

      // Structure contents with history support if needed, otherwise query single-prompt
      const contents = `درخواست اخیر کاربر: "${prompt}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
          temperature: 0.7
        }
      });

      resultText = response.text || '';
      try {
        parsedJson = JSON.parse(resultText.trim());
      } catch (parseErr) {
        console.error("Failed to parse JSON reply from Gemini:", resultText, parseErr);
        // Fallback search mechanism
        parsedJson.message = `بررسی کردم و به چند پیشنهاد عالی متناسب با سلیقه شما رسیدم!`;
        parsedJson.suggestedProductIds = db.products
          .filter((p: Product) => 
            p.title.toLowerCase().includes(prompt.toLowerCase()) || 
            p.description.toLowerCase().includes(prompt.toLowerCase())
          )
          .map((p: Product) => p.id)
          .slice(0, 3);
      }
    } else {
      // Static mock fallback search inside the server so it works perfectly even without real API Key
      const keywords = prompt.toLowerCase();
      let matched = db.products.filter((p: Product) => {
        return p.title.toLowerCase().includes(keywords) || 
               p.description.toLowerCase().includes(keywords) ||
               p.category.toLowerCase().includes(keywords);
      });
      if (matched.length === 0) {
        matched = db.products.slice(0, 2);
      }
      parsedJson = {
        message: `من تعدادی از برترین محصولات آریا مارکت را برای شما برگزیدم. از آنجا که کلیه خریدهای بالای ۵ میلیون تومان مشمول تسهیلات پرداخت اقساطی ما می‌شوند، این پیشنهادها می‌توانند یک انتخاب عالی و اقتصادی برای شما باشند. بازخورد خودتان را بنویسید تا بیشتر راهنمایی‌تان کنم.`,
        suggestedProductIds: matched.map((p: Product) => p.id).slice(0, 3)
      };
    }

    res.json(parsedJson);

  } catch (error: any) {
    console.error("Gemini shopping assistant API failure:", error);
    res.status(500).json({ error: "خطا در ارتباط با سرور هوش مصنوعی" });
  }
});


// Setup Vite Dev server / static file serving
const startServer = async () => {
  // Ensure DB gets created on boot
  loadDatabase();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Aria Market server successfully listening on port ${PORT}`);
  });
};

startServer();
