/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, ShoppingCart, HelpCircle, Loader2, ArrowLeft, Bot, MessageCircle } from 'lucide-react';
import { ChatMessage, Product } from '../types';
import { formatPrice } from './ProductCard';

interface AiShopperTabProps {
  products: Product[];
  onViewProductDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onNavigateToInstallments: (product: Product) => void;
}

export default function AiShopperTab({ products, onViewProductDetails, onAddToCart, onNavigateToInstallments }: AiShopperTabProps) {
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm_init',
      role: 'model',
      text: 'سلام! من دستیار خرید اختصاصی مجهز به هوش مصنوعی آریا مارکت هستم. شما می‌توانید علایق، استایل مد، سطح بودجه، نیاز به گوشی هوشمند یا ابزار خانگی خاصی را توصیف کنید تا من بهترین کالاهای متناسب با سلایق منحصربه‌فردتان را فوراً توصیه کنم. \nمثلاً بپرسید: "یک هدفون عالی برای ورزش با کیفیت صدای بالا مجهز به نویز کنسلینگ می‌خواهم و بودجه‌ام کمه..."',
      timestamp: '۱۰:۰۰'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Suggested starter queries
  const starterPrompts = [
    'بهترین آیفون یا مک‌بوک مناسب برای کارهای اداری سبک چی داری؟',
    'یک عطر خنک لوکس فرانسوی اورجینال می‌خواهم معرفی کنید.',
    'نیم‌بوت چرمی دست‌ساز با کلاس می‌خواهم، شرایط اقساطی هم داره؟',
    'یک هدیه شکیل برای همسرم با بودجه حدودی ۴ میلیون تومان چی بخرم؟'
  ];

  // Post message to backend `/api/ai-shopper`
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: 'm_' + Math.random().toString(36).substring(2, 9),
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai-shopper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend
        })
      });

      const data = await response.json();
      
      const botMsg: ChatMessage = {
        id: 'm_' + Math.random().toString(36).substring(2, 9),
        role: 'model',
        text: data.message || 'متاسفانه خطایی رخ داد.',
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        suggestedProducts: data.suggestedProductIds || []
      };

      setMessages(prev => [...prev, botMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: 'm_err',
        role: 'model',
        text: 'ارتباط با سرور هوش مصنوعی برقرار نشد. لطفا ارتباط اینترنت را بررسی کنید و یا مجددا پیام بفرستید.',
        timestamp: 'خطا'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Find products matching indices
  const getProductCards = (ids?: string[]) => {
    if (!ids || ids.length === 0) return [];
    return products.filter(p => ids.includes(p.id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" id="ai-shopper-tab">
      
      {/* Intro visual header */}
      <div className="text-right space-y-1.5 bg-neutral-900 text-white p-6 rounded-3xl relative overflow-hidden shadow-sm">
        <div className="absolute left-6 top-6 size-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
          <Sparkles className="size-6 text-amber-400" />
        </div>

        <h2 className="text-base md:text-lg font-black text-white flex items-center gap-1.5">
          <Bot className="size-5 text-amber-400" />
          <span>هوش مصنوعی آریا مارکت (Aria AI Shopper)</span>
        </h2>
        
        <p className="text-[11px] text-neutral-400 font-light leading-relaxed max-w-lg">
          سلیقه‌ی منحصربه‌فرد، بودجه، استایل زندگی یا کاربردی که از کالا انتظار دارید را به زبان خودمانی و ساده بنویسید. هوش مصنوعی آریا کل کاتالوگ فروشگاه را زیر و رو کرده و با دلیل و استدلال، بهترین گزینه‌ها را برای شما آماده می‌کند.
        </p>
      </div>

      {/* Main Messaging Container Block */}
      <div className="bg-white border border-neutral-100 rounded-3xl h-[480px] flex flex-col justify-between overflow-hidden shadow-sm">
        
        {/* Messages list scroll viewport */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4">
          {messages.map((msg) => {
            const isModel = msg.role === 'model';
            const suggestedItems = getProductCards(msg.suggestedProducts);
            return (
              <div 
                key={msg.id} 
                className={`flex gap-3 max-w-[85%] ${isModel ? 'mr-0' : 'ml-0 mr-auto flex-row-reverse'}`}
                style={{ direction: 'rtl' }}
              >
                {/* Avatar Icon */}
                <div className={`size-8 rounded-full flex items-center justify-center shrink-0 ${
                  isModel ? 'bg-amber-100 border border-amber-200 text-amber-700' : 'bg-neutral-800 text-white'
                }`}>
                  {isModel ? <Bot className="size-4" /> : <span className="text-[10px] font-sans font-bold">U</span>}
                </div>

                <div className="space-y-3">
                  {/* Text bubble */}
                  <div className={`p-4 rounded-2xl text-xs leading-relaxed text-right font-light italic ${
                    isModel 
                      ? 'bg-neutral-50 text-neutral-800' 
                      : 'bg-neutral-900 text-white rounded-tr-none'
                  }`}>
                    {msg.text}
                    <span className="block text-[9px] text-neutral-400 mt-1.5 text-left font-mono">
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Natively embedded products matched cards lists */}
                  {isModel && suggestedItems.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {suggestedItems.map((prod) => (
                        <div 
                          key={prod.id} 
                          className="bg-white border border-neutral-150 rounded-2xl p-3.5 flex flex-col justify-between hover:shadow-md transition-shadow relative"
                        >
                          {/* product metadata */}
                          <div className="space-y-2">
                            <div className="aspect-square w-full rounded-xl bg-neutral-100 overflow-hidden">
                              <img 
                                src={prod.imageUrl} 
                                alt={prod.title} 
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover" 
                              />
                            </div>
                            
                            <h4 className="text-[11px] font-bold text-neutral-900 leading-snug line-clamp-2 h-8">
                              {prod.title}
                            </h4>

                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-neutral-400 font-light">{prod.vendorName}</span>
                              <span className="font-extrabold text-neutral-850">{formatPrice(prod.price)} تومان</span>
                            </div>
                          </div>

                          {/* Quick Actions overlay */}
                          <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-neutral-100">
                            <button
                              onClick={() => {
                                onAddToCart(prod);
                                // Soft notification
                                alert(`کالای "${prod.title}" به سبد خرید نقدی افزون گردید.`);
                              }}
                              className="bg-neutral-900 text-white hover:bg-black rounded-lg py-1.5 text-[9px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <ShoppingCart className="size-3" />
                              <span>افزودن</span>
                            </button>

                            <button
                              onClick={() => onViewProductDetails(prod)}
                              className="border border-neutral-200 text-neutral-600 hover:text-black hover:border-black rounded-lg py-1.5 text-[9px] font-medium text-center cursor-pointer"
                            >
                              مشخصات فنی
                            </button>
                          </div>

                          {/* Installment Badge if eligible */}
                          {prod.isInstallmentEligible && (
                            <span className="absolute top-4 left-4 bg-amber-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-md">
                              قسطی
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3 max-w-[80%]" style={{ direction: 'rtl' }}>
              <div className="size-8 rounded-full bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center">
                <Bot className="size-4" />
              </div>
              <div className="bg-neutral-50 px-4 py-3 rounded-2xl flex items-center gap-2 text-xs text-neutral-500">
                <Loader2 className="size-3.5 text-amber-600 animate-spin" />
                <span>هوش مصنوعی در حال بررسی کاتالوگ و نگارش پاسخ...</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input Bar Form */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50/50">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="سلیقه و استایل لباس پوشیدن، مشخصات لپ‌تاپ یا بودجه خود را بنویسید..."
              className="flex-1 bg-white text-xs border border-neutral-200 rounded-xl py-3 px-4 focus:outline-none focus:border-neutral-900 text-neutral-800 text-right shadow-inner"
            />
            <button
              id="send-ai-chat-btn"
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="bg-neutral-900 hover:bg-black disabled:opacity-40 text-white size-11 rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer"
              title="ارسال پیام"
            >
              <Send className="size-4 shrink-0 -scale-x-100 rotate-180" />
            </button>
          </form>
        </div>

      </div>

      {/* Suggested helper items */}
      <div className="space-y-2">
        <h3 className="text-[10px] font-bold text-neutral-400 flex items-center gap-1 pb-1">
          <HelpCircle className="size-3.5" />
          <span>موضوعات پیشنهادی برای مشورت با هوش مصنوعی آریا:</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {starterPrompts.map((p, idx) => (
            <button
              key={idx}
              id={`starter-prompt-btn-${idx}`}
              onClick={() => handleSendMessage(p)}
              className="bg-white border border-neutral-150 text-[10px] text-neutral-600 hover:text-black hover:border-black rounded-lg py-1.5 px-3 transition-colors cursor-pointer text-right max-w-full"
            >
              • {p}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
