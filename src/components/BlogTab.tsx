/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BookOpen, Calendar, Clock, User, ArrowLeft } from 'lucide-react';
import { BlogPost } from '../types';

interface BlogTabProps {
  posts: BlogPost[];
  onSelectPost: (post: BlogPost) => void;
}

export default function BlogTab({ posts, onSelectPost }: BlogTabProps) {
  return (
    <div className="space-y-8 max-w-7xl mx-auto" id="blog-tab">
      
      {/* Blog Introduction Header */}
      <div className="text-right space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-neutral-100 px-3 py-1 rounded-full text-[10px] text-neutral-600 font-bold">
          <BookOpen className="size-3.5" />
          <span>مجلّه خبری و دانستنی‌های آریا مارکت</span>
        </div>
        <h2 className="text-xl md:text-2xl font-black text-neutral-900">بلاگ مارکت؛ راهنمای انتخاب و اقتصاد خانواده</h2>
        <p className="text-xs text-neutral-400 font-light max-w-2xl leading-relaxed">
          جدیدترین تحلیل‌های تخصصی بازار تکنولوژی، نکات طلایی چیدمان مدرن منزل و ترفندهای کاربردی مدیریت هوشمند سرمایه را از زبان مجرب‌ترین کارشناسان ما بجویید.
        </p>
      </div>

      {/* Grid of Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <article 
            id={`blog-post-card-${post.id}`}
            key={post.id}
            onClick={() => onSelectPost(post)}
            className="group bg-white rounded-3xl overflow-hidden border border-neutral-100 flex flex-col justify-between h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
          >
            <div className="space-y-4">
              {/* Cover Photo */}
              <div className="aspect-video w-full bg-neutral-50 overflow-hidden relative">
                <img 
                  src={post.coverUrl} 
                  alt={post.title} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <span className="absolute bottom-3 right-3 bg-neutral-900/80 backdrop-blur-md text-white text-[9px] font-semibold px-2.5 py-1 rounded-lg">
                  {post.category}
                </span>
              </div>

              {/* metadata line */}
              <div className="px-5 flex items-center justify-between gap-2 text-[10px] text-neutral-400">
                <div className="flex items-center gap-1">
                  <User className="size-3" />
                  <span className="font-medium text-neutral-500">{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    <Calendar className="size-3" />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Clock className="size-3" />
                    <span>{post.readTime} مطالعه</span>
                  </div>
                </div>
              </div>

              {/* Title & summary */}
              <div className="px-5 space-y-2">
                <h3 className="text-xs font-extrabold text-neutral-900 leading-snug group-hover:text-amber-600 transition-colors line-clamp-2 h-10">
                  {post.title}
                </h3>
                <p className="text-[11px] text-neutral-500 font-light leading-relaxed line-clamp-3">
                  {post.summary}
                </p>
              </div>
            </div>

            {/* Read More button footer */}
            <div className="p-5 border-t border-neutral-50 mt-4 flex items-center justify-between">
              <span className="text-[10px] font-bold text-neutral-800 flex items-center gap-1 group-hover:gap-2 transition-all">
                <span>ادامه مطلب علمی و آموزشی</span>
                <ArrowLeft className="size-3 text-amber-500" />
              </span>
              <span className="text-[8px] font-mono text-neutral-350 tracking-wider">Aria Editorial</span>
            </div>
          </article>
        ))}
      </div>

    </div>
  );
}
