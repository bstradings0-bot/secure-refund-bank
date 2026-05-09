'use client';

import { motion } from 'framer-motion';
import { FiStar, FiUsers, FiAward, FiHeart } from 'react-icons/fi';

const testimonials = [
  { name: 'James Rodriguez', role: 'Freelance Designer', company: 'StudioJR Creative', avatar: 'JR', rating: 5, text: 'SecureRefund completely changed how I manage international payments. The virtual cards are a game-changer for my business subscriptions. I can generate new cards in seconds.' },
  { name: 'Priya Sharma', role: 'Digital Nomad', company: 'NomadFinance', avatar: 'PS', rating: 5, text: 'I travel full-time and need a bank that works everywhere. The multi-currency support and instant transfers are incredible. No more worrying about exchange rates.' },
  { name: 'David Kim', role: 'Startup Founder', company: 'TechVentures Inc', avatar: 'DK', rating: 5, text: 'The admin panel gives me full control over team expenses. We issued 50 virtual cards in under 5 minutes. Enterprise-grade quality at startup-friendly pricing.' },
  { name: 'Sarah Mitchell', role: 'CFO', company: 'GlobalTrade LLC', avatar: 'SM', rating: 5, text: 'We process over $2M monthly through SecureRefund. The compliance features, audit trails, and reporting tools are essential for our regulated industry.' },
  { name: 'Marcus Chen', role: 'Product Manager', company: 'FinStack', avatar: 'MC', rating: 5, text: 'The API integration was seamless. We embedded banking features into our platform in under a week. Documentation is excellent and support is responsive.' },
  { name: 'Elena Rodriguez', role: 'Small Business Owner', company: 'Elena Boutique', avatar: 'ER', rating: 5, text: 'As a small business owner, the refund tracking and instant notifications give me peace of mind. My customers love the professional virtual cards.' },
  { name: 'Alex Thompson', role: 'Investment Advisor', company: 'WealthPath', avatar: 'AT', rating: 5, text: 'The real-time analytics and multi-currency wallets help me manage client portfolios efficiently. The security features are top-notch.' },
  { name: 'Yuki Tanaka', role: 'E-Commerce Director', company: 'TokyoTrends', avatar: 'YT', rating: 5, text: 'Processing refunds used to be a nightmare. Now it takes seconds. Our customer satisfaction scores have improved by 40% since switching.' },
  { name: 'Michael Okonkwo', role: 'FinTech Consultant', company: 'AfriPay Solutions', avatar: 'MO', rating: 5, text: 'I recommend SecureRefund to all my clients. The combination of security, features, and ease of use is unmatched in the market.' },
];

const logos = [
  'TechVentures', 'GlobalTrade', 'NomadFinance', 'StudioJR', 'FinStack',
  'WealthPath', 'TokyoTrends', 'AfriPay', 'Elena Boutique',
];

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-navy-950 text-white">
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-blue-950 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-2xl mx-auto">
            <span className="text-bank-accent text-sm font-semibold tracking-widest uppercase">Testimonials</span>
            <h1 className="text-4xl sm:text-5xl font-extrabold mt-4 leading-tight">Trusted by Thousands of Customers</h1>
            <p className="text-lg text-gray-400 mt-4">See why businesses and individuals worldwide choose SecureRefund for their banking needs.</p>
          </motion.div>

          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-4 mt-12 max-w-2xl mx-auto">
            {[
              { icon: FiStar, value: '4.9/5', label: 'Average Rating' },
              { icon: FiUsers, value: '2.4M+', label: 'Happy Customers' },
              { icon: FiAward, value: '98%', label: 'Recommend Us' },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-4 text-center">
                  <Icon className="w-5 h-5 text-bank-blue mx-auto mb-2" />
                  <p className="text-2xl font-extrabold text-white">{s.value}</p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trusted Companies */}
      <section className="py-12 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm text-gray-500 uppercase tracking-widest mb-6">Trusted by innovative companies worldwide</p>
          <div className="flex flex-wrap justify-center gap-6">
            {logos.map(logo => (
              <motion.div key={logo} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="glass-card px-6 py-3 text-sm font-semibold text-gray-300 hover:text-white hover:border-bank-blue/30 transition-all">
                {logo}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="glass-card p-6">
                <div className="flex gap-1 mb-3">
                  {[...Array(t.rating)].map((_, j) => <FiStar key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-bank-blue to-purple-500 flex items-center justify-center text-white font-bold text-xs">{t.avatar}</div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}, {t.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card p-10">
            <FiHeart className="w-10 h-10 text-bank-blue mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">Join Our Happy Customers</h2>
            <p className="text-gray-400 mb-6">Experience the SecureRefund difference. Open your free account today.</p>
            <a href="/register" className="btn-primary inline-flex items-center gap-2">Get Started Free</a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
