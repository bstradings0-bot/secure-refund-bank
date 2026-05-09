'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import api from '@/lib/api';
import { FiCalendar, FiArrowRight, FiTrendingUp, FiShield, FiZap, FiGlobe, FiTag } from 'react-icons/fi';

const categoryIcons: Record<string, React.ComponentType<any>> = {
  PRODUCT: FiZap,
  SECURITY: FiShield,
  COMPANY: FiGlobe,
  GENERAL: FiTrendingUp,
};

const priorityBadges: Record<string, string> = {
  HIGH: 'badge badge-danger',
  NORMAL: 'badge badge-pending',
  LOW: 'badge badge-success',
};

export default function NewsPage() {
  const { data: articles, isLoading } = useQuery({
    queryKey: ['public-news'],
    queryFn: async () => {
      const { data } = await api.get('/api/news');
      return data.data;
    },
  });

  return (
    <div className="min-h-screen bg-navy-950 text-white">
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-blue-950 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-2xl mx-auto">
            <span className="text-bank-blue text-sm font-semibold tracking-widest uppercase">News & Updates</span>
            <h1 className="text-4xl sm:text-5xl font-extrabold mt-4 leading-tight">Latest from SecureRefund</h1>
            <p className="text-lg text-gray-400 mt-4">Product updates, security advisories, company news, and fintech insights.</p>
          </motion.div>
        </div>
      </section>

      {/* Articles */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="glass-card p-6 animate-pulse">
                  <div className="h-4 bg-white/10 rounded w-1/4 mb-3" />
                  <div className="h-6 bg-white/10 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-white/10 rounded w-full mb-2" />
                  <div className="h-4 bg-white/10 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : articles && articles.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article: any, i: number) => {
                const CatIcon = categoryIcons[article.category] || FiTag;
                const date = new Date(article.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                return (
                  <motion.div key={article.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="glass-card p-6 hover:border-bank-blue/30 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-bank-blue/10 flex items-center justify-center">
                          <CatIcon className="w-4 h-4 text-bank-blue" />
                        </div>
                        <span className="text-xs text-gray-500 font-medium uppercase">{article.category}</span>
                      </div>
                      {article.priority !== 'NORMAL' && (
                        <span className={priorityBadges[article.priority] || 'badge badge-pending'}>{article.priority}</span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-bank-blue transition-colors">{article.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed mb-4 line-clamp-3">{article.summary || article.content?.substring(0, 150) + '...'}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1"><FiCalendar className="w-3 h-3" /> {date}</span>
                      <span className="text-bank-blue font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Read more <FiArrowRight className="w-3 h-3" /></span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-bank-blue/10 flex items-center justify-center mx-auto mb-4">
                <FiGlobe className="w-8 h-8 text-bank-blue" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No News Yet</h3>
              <p className="text-gray-400">Stay tuned for the latest updates and announcements from SecureRefund.</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card p-10">
            <h2 className="text-2xl font-bold text-white mb-3">Stay Informed</h2>
            <p className="text-gray-400 mb-6">Get the latest product updates, security alerts, and fintech insights delivered to your inbox.</p>
            <div className="flex gap-3 max-w-md mx-auto">
              <input type="email" placeholder="your@email.com" className="input-field text-white flex-1" />
              <button className="btn-primary text-sm whitespace-nowrap">Subscribe</button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
