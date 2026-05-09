'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiShield, FiTarget, FiUsers, FiAward, FiGlobe, FiTrendingUp, FiArrowRight, FiCheck } from 'react-icons/fi';

const stats = [
  { icon: FiUsers, value: '2.4M+', label: 'Active Customers' },
  { icon: FiGlobe, value: '80+', label: 'Countries Served' },
  { icon: FiTrendingUp, value: '$48.2B', label: 'Transfer Volume' },
  { icon: FiAward, value: '99.99%', label: 'Platform Uptime' },
];

const values = [
  { icon: FiShield, title: 'Security First', desc: 'Enterprise-grade encryption and multi-layer authentication protect every transaction and account.' },
  { icon: FiTarget, title: 'Innovation Driven', desc: 'We continuously push boundaries with AI-powered fraud detection and real-time analytics.' },
  { icon: FiUsers, title: 'Customer Centric', desc: 'Every feature is designed with our customers in mind. Your financial success is our mission.' },
  { icon: FiGlobe, title: 'Global Reach', desc: 'Supporting 30+ currencies with instant transfers across borders, anytime, anywhere.' },
];

const milestones = [
  { year: '2020', title: 'Founded', desc: 'SecureRefund Bank was established with a vision to democratize digital banking.' },
  { year: '2021', title: 'First 100K Users', desc: 'Rapid adoption across North America and Europe with our innovative virtual card system.' },
  { year: '2022', title: 'Series B Funding', desc: 'Raised $120M to expand our platform with multi-currency support and enterprise features.' },
  { year: '2023', title: 'Global Expansion', desc: 'Launched in 80+ countries with full regulatory compliance and localized services.' },
  { year: '2024', title: 'AI Integration', desc: 'Introduced AI-powered fraud detection, smart analytics, and automated compliance.' },
  { year: '2025', title: 'Enterprise Suite', desc: 'Launched comprehensive admin controls, API access, and white-label banking solutions.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-navy-950 text-white">
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-blue-950 pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-bank-blue/5 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-3xl mx-auto">
            <span className="text-bank-blue text-sm font-semibold tracking-widest uppercase">About Us</span>
            <h1 className="text-4xl sm:text-5xl font-extrabold mt-4 leading-tight">Redefining Digital Banking for the Modern World</h1>
            <p className="text-lg text-gray-400 mt-6 leading-relaxed">
              SecureRefund Bank is a next-generation fintech platform delivering enterprise-grade banking tools, virtual cards, instant transfers, and comprehensive financial management to millions of users worldwide.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-card p-6 text-center">
                  <Icon className="w-8 h-8 text-bank-blue mx-auto mb-3" />
                  <p className="text-3xl font-extrabold text-white">{s.value}</p>
                  <p className="text-sm text-gray-400 mt-1">{s.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="text-bank-accent text-sm font-semibold tracking-widest uppercase">Our Values</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3">What Drives Us Every Day</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-card p-6">
                  <div className="w-12 h-12 rounded-xl bg-bank-blue/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-bank-blue" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{v.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{v.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="text-bank-blue text-sm font-semibold tracking-widest uppercase">Our Journey</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3">From Startup to Industry Leader</h2>
          </motion.div>
          <div className="max-w-3xl mx-auto">
            {milestones.map((m, i) => (
              <motion.div key={m.year} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="flex gap-6 pb-10 last:pb-0">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-bank-blue/10 border border-bank-blue/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-bank-blue font-bold text-sm">{m.year}</span>
                  </div>
                  {i < milestones.length - 1 && <div className="w-0.5 flex-1 bg-bank-blue/20 mt-2" />}
                </div>
                <div className="glass-card p-5 flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{m.title}</h3>
                  <p className="text-sm text-gray-400">{m.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card p-12 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Experience Modern Banking?</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">Join millions of customers who trust SecureRefund for their digital banking needs. Open your account in under 2 minutes.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register" className="btn-primary text-base !px-8 !py-3.5 flex items-center gap-2">
                Open Account <FiArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/contact" className="btn-secondary text-base !px-8 !py-3.5">Contact Sales</Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
