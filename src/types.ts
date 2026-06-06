/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  title: string;
  englishTitle?: string;
  category: 'digital' | 'fashion' | 'beauty' | 'home';
  price: number; // in Tomans
  description: string;
  imageUrl: string;
  vendorName: string;
  rating: number;
  reviewsCount: number;
  isInstallmentEligible: boolean;
  installmentMonthsMax?: number;
  downPaymentPercent?: number; // e.g. 20 means 20% downpayment
  specifications: Record<string, string>;
}

export interface Vendor {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  brandName: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  nationalId: string;
  registrationDate: string;
  revenue: number;
}

export interface InstallmentPlan {
  id: string;
  fullName: string;
  phone: string;
  nationalCode: string;
  monthlySalary: number;
  productId: string;
  productTitle: string;
  price: number;
  months: number;
  monthlyPayment: number;
  status: 'pending' | 'documents_needed' | 'approved' | 'active';
  submissionDate: string;
  trackingCode: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  author: string;
  date: string;
  readTime: string; // e.g. "۵ دقیقه"
  category: string;
  coverUrl: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  suggestedProducts?: string[]; // IDs of products recommended in this message
}
