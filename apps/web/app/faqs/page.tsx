'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiChevronDown, FiHelpCircle, FiShield, FiCreditCard, FiDollarSign, FiRefreshCw, FiGlobe, FiUsers } from 'react-icons/fi';

const categories = [
  {
    name: 'Account & Security',
    icon: FiShield,
    faqs: [
      { q: 'How do I create an account?', a: 'Click "Open Account" on our homepage, fill in your details, verify your email, and you\'re ready to start banking in under 2 minutes.' },
      { q: 'Is my data secure?', a: 'Yes. We use AES-256 encryption, JWT authentication, bcrypt password hashing, CSRF protection, and 2FA. Our platform follows banking-grade security standards.' },
      { q: 'How do I enable Two-Factor Authentication (2FA)?', a: 'Go to Settings → Security, click "Enable 2FA", and follow the instructions. We support authenticator apps and email-based OTP.' },
      { q: 'What happens if I forget my password?', a: 'Click "Forgot Password" on the login page. You\'ll receive a reset link via email. The link expires after 1 hour for security.' },
    ],
  },
  {
    name: 'Virtual Cards',
    icon: FiCreditCard,
    faqs: [
      { q: 'How do virtual cards work?', a: 'Virtual cards are digital payment cards you can generate instantly. Each card has a unique number, CVV, and expiry date for online purchases and subscriptions.' },
      { q: 'How many virtual cards can I create?', a: 'Starter: 1 card. Professional: 10 cards. Enterprise: Unlimited cards. You can freeze, unfreeze, and set spending limits for each card.' },
      { q: 'Can I use virtual cards for international purchases?', a: 'Yes! Virtual cards work globally wherever Visa or Mastercard is accepted. Multi-currency support is available on Professional and Enterprise plans.' },
      { q: 'Are virtual cards real financial instruments?', a: 'This platform is a demo fintech system. Virtual cards simulate real card functionality for demonstration purposes only.' },
    ],
  },
  {
    name: 'Transfers & Payments',
    icon: FiDollarSign,
    faqs: [
      { q: 'What transfer types are supported?', a: 'We support SWIFT, ACH, SEPA, Wire transfers, crypto transfers, and mobile payments. Transfer speed depends on the method chosen.' },
      { q: 'How long do transfers take?', a: 'Internal transfers are instant. ACH: 1-3 business days. SWIFT: 1-5 business days. Wire: same business day. Crypto: varies by network.' },
      { q: 'What are the transfer fees?', a: 'Internal transfers are free. ACH: $1.50. SWIFT: $25. Wire: $15. Crypto: 0.5%. Check our pricing page for the latest fee schedule.' },
      { q: 'What currencies do you support?', a: 'USD, EUR, GBP, JPY, CAD, AUD, CHF, and 30+ more. Visit our Currencies page for real-time exchange rates.' },
    ],
  },
  {
    name: 'Refunds & Disputes',
    icon: FiRefreshCw,
    faqs: [
      { q: 'How do I request a refund?', a: 'Log in, go to Refunds, select the transaction, provide a reason, and submit. Most refunds are processed within 24-48 hours.' },
      { q: 'How can I track my refund status?', a: 'Visit the Refunds page in your dashboard. You\'ll see real-time status updates: Pending → Processing → Approved → Completed.' },
      { q: 'What if a merchant refuses my refund?', a: 'You can escalate to a dispute. Our resolution team will investigate and mediate. Provide evidence (receipts, emails) for faster resolution.' },
    ],
  },
  {
    name: 'Enterprise & Admin',
    icon: FiUsers,
    faqs: [
      { q: 'Do you offer enterprise solutions?', a: 'Yes! Our Enterprise plan includes admin controls, API access, custom limits, dedicated support, team management, and compliance tools.' },
      { q: 'Can I integrate SecureRefund with my existing systems?', a: 'Enterprise customers get API access for custom integrations. Our REST API supports user management, transfers, card issuance, and reporting.' },
      { q: 'What compliance features are available?', a: 'KYC/AML checks, transaction monitoring, audit logs, risk scoring, SAR filing, and automated compliance reporting for regulated industries.' },
    ],
  },
  {
    name: 'General',
    icon: FiHelpCircle,
    faqs: [
      { q: 'Is SecureRefund a real bank?', a: 'SecureRefund is a demo fintech banking platform showcasing enterprise-grade features. It does not provide real banking services unless integrated with licensed infrastructure.' },
      { q: 'How much does it cost?', a: 'Starter: Free. Professional: $9.99/month. Enterprise: $29.99/month. All plans include core banking features. See our Pricing page for details.' },
      { q: 'Can I upgrade or downgrade my plan?', a: 'Yes! You can change plans at any time from your account settings. Upgrades take effect immediately; downgrades take effect at the next billing cycle.' },
    ],
  },
];

export default function FAQsPage() {
  const [search, setSearch] = useState('');
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredCategories = search
    ? categories.map(cat => ({
        ...cat,
        faqs: cat.faqs.filter(f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())),
      })).filter(cat => cat.faqs.length > 0)
    : categories;

  return (
    <div className="min-h-screen bg-navy-950 text-white">
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-blue-950 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-2xl mx-auto">
            <span className="text-bank-blue text-sm font-semibold tracking-widest uppercase">FAQ</span>
            <h1 className="text-4xl sm:text-5xl font-extrabold mt-4 leading-tight">Frequently Asked Questions</h1>
            <p className="text-lg text-gray-400 mt-4">Find answers to common questions about our platform.</p>
          </motion.div>

          {/* Search */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-xl mx-auto mt-8">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search questions..."
                className="input-field text-white pl-12 py-4 text-lg"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-400 text-lg">No results found. Try a different search term.</p>
            </div>
          ) : (
            filteredCategories.map((category, ci) => {
              const CatIcon = category.icon;
              return (
                <motion.div key={category.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: ci * 0.08 }} className="mb-8">
                  <button
                    onClick={() => setActiveCategory(activeCategory === category.name ? null : category.name)}
                    className="w-full flex items-center gap-3 glass-card p-4 mb-3 hover:border-bank-blue/30 transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-bank-blue/10 flex items-center justify-center">
                      <CatIcon className="w-5 h-5 text-bank-blue" />
                    </div>
                    <h2 className="text-lg font-semibold text-white flex-1 text-left">{category.name}</h2>
                    <span className="text-xs text-gray-500">{category.faqs.length} questions</span>
                    <motion.div animate={{ rotate: activeCategory === category.name ? 180 : 0 }}>
                      <FiChevronDown className="w-5 h-5 text-gray-400" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {activeCategory === category.name && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2 pl-4">
                        {category.faqs.map((faq) => (
                          <motion.div key={faq.q} className="glass-card overflow-hidden">
                            <button
                              onClick={() => setOpenFaq(openFaq === `${category.name}-${faq.q}` ? null : `${category.name}-${faq.q}`)}
                              className="w-full p-4 flex items-center justify-between text-left"
                            >
                              <span className="text-sm font-medium text-white pr-4">{faq.q}</span>
                              <motion.div animate={{ rotate: openFaq === `${category.name}-${faq.q}` ? 45 : 0 }} className="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                                <FiChevronDown className="w-3 h-3 text-gray-400" />
                              </motion.div>
                            </button>
                            <AnimatePresence>
                              {openFaq === `${category.name}-${faq.q}` && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="px-4 pb-4">
                                  <p className="text-sm text-gray-400 leading-relaxed">{faq.a}</p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      </section>

      {/* Still have questions */}
      <section className="py-16 bg-white/[0.02]">
        <div className="max-w-xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card p-8">
            <FiHelpCircle className="w-10 h-10 text-bank-blue mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Still Have Questions?</h2>
            <p className="text-gray-400 text-sm mb-6">Can't find what you're looking for? Contact our support team.</p>
            <a href="/contact" className="btn-primary inline-flex items-center gap-2 text-sm">Contact Support</a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
