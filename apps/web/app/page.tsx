'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import {
  FiShield, FiCreditCard, FiSend, FiActivity, FiBell, FiLock,
  FiGlobe, FiBarChart2, FiUsers, FiDollarSign, FiTrendingUp,
  FiChevronRight, FiStar, FiCheck, FiArrowRight, FiMenu, FiX,
  FiSmartphone, FiRefreshCw, FiHeadphones, FiZap, FiGrid,
  FiClock, FiFileText, FiPhone, FiMail, FiChevronDown, FiInfo,
  FiBookOpen, FiMessageSquare, FiPieChart
} from 'react-icons/fi';
import { FaTwitter, FaLinkedinIn, FaFacebookF, FaInstagram } from 'react-icons/fa';

/* ------------------------------------------------------------------ */
/*  NAVBAR                                                             */
/* ------------------------------------------------------------------ */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const links = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'News', href: '/news' },
    { label: 'Calculator', href: '/calculator' },
    { label: 'Testimonials', href: '/testimonials' },
    { label: 'FAQs', href: '/faqs' },
    { label: 'Contact', href: '/contact' },
  ];

  const serviceLinks = [
    { label: 'Virtual Cards', href: '/cards', icon: FiCreditCard },
    { label: 'Instant Transfers', href: '/transfers', icon: FiSend },
    { label: 'Dashboard', href: '/dashboard', icon: FiBarChart2 },
    { label: 'Refund Tracking', href: '/refunds', icon: FiRefreshCw },
    { label: 'Multi-Currency', href: '/currencies', icon: FiGlobe },
    { label: 'Security Center', href: '/security', icon: FiLock },
    { label: 'Request Quote', href: '/request-quote', icon: FiPieChart },
  ];

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'glass !bg-navy-950/80 shadow-2xl shadow-black/20' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-bank-blue to-bank-accent flex items-center justify-center shadow-lg shadow-bank-blue/25 group-hover:scale-105 transition-transform">
            <FiShield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            Secure<span className="text-bank-blue">Refund</span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-6">
          {links.map((l) => (
            <Link key={l.label} href={l.href} className="text-sm text-gray-300 hover:text-white transition-colors font-medium">
              {l.label}
            </Link>
          ))}

          {/* Services Dropdown */}
          <div className="relative" onMouseEnter={() => setServicesOpen(true)} onMouseLeave={() => setServicesOpen(false)}>
            <button className="flex items-center gap-1 text-sm text-gray-300 hover:text-white transition-colors font-medium">
              Services <FiChevronDown className={`w-3 h-3 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {servicesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-2 w-56 glass border-white/10 shadow-2xl shadow-black/30 rounded-xl overflow-hidden z-50"
                >
                  {serviceLinks.map((s) => {
                    const SIcon = s.icon;
                    return (
                      <Link key={s.label} href={s.href} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                        <SIcon className="w-4 h-4 text-bank-blue" />
                        {s.label}
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-4 py-2">
            Log in
          </Link>
          <Link href="/register" className="btn-primary text-sm !py-2.5 !px-6 !rounded-xl">
            Open Account
          </Link>
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-white p-2">
          {mobileOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="lg:hidden glass border-t border-white/5">
            <div className="px-6 py-4 space-y-3">
              {links.map((l) => (
                <Link key={l.label} href={l.href} onClick={() => setMobileOpen(false)} className="block text-sm text-gray-300 hover:text-white py-2">{l.label}</Link>
              ))}
              <div className="border-t border-white/5 pt-3">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 px-1">Services</p>
                {serviceLinks.map((s) => {
                  const SIcon = s.icon;
                  return (
                    <Link key={s.label} href={s.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-sm text-gray-300 hover:text-white py-2">
                      <SIcon className="w-4 h-4 text-bank-blue" /> {s.label}
                    </Link>
                  );
                })}
              </div>
              <div className="flex gap-3 pt-3 border-t border-white/5">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1 text-center text-sm">Log in</Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="btn-primary flex-1 text-center text-sm">Sign Up</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  SECTION WRAPPER                                                    */
/* ------------------------------------------------------------------ */
function Section({ id, children, className = '' }: { id?: string; children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <section id={id} ref={ref} className={`py-24 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="max-w-7xl mx-auto px-6"
      >
        {children}
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  HERO SECTION                                                       */
/* ------------------------------------------------------------------ */
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Background */}
      <div className="absolute inset-0 bg-grid pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-blue-950 pointer-events-none" />
      <div className="absolute top-1/4 -right-64 w-[600px] h-[600px] bg-bank-blue/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-bank-accent/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        {/* Text */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bank-blue/10 border border-bank-blue/20 text-bank-blue text-sm font-medium mb-6">
            <FiZap className="w-4 h-4" /> Trusted by 2M+ users worldwide
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
            Modern Digital Banking Made{' '}
            <span className="text-gradient">Secure</span>
          </h1>
          <p className="text-lg text-gray-400 mt-6 max-w-lg leading-relaxed">
            Manage transfers, virtual cards, refunds, and online banking in one powerful platform. Built with enterprise-grade security and real-time intelligence.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <Link href="/register" className="btn-primary text-base !px-8 !py-3.5 flex items-center gap-2">
              Open Account <FiArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login" className="btn-secondary text-base !px-8 !py-3.5">
              Log in
            </Link>
            <a href="#features" className="btn-secondary text-base !px-8 !py-3.5 !border-transparent !bg-transparent hover:!bg-white/5 flex items-center gap-2">
              Explore Features <FiChevronRight className="w-4 h-4" />
            </a>
          </div>
          <div className="flex items-center gap-6 mt-8 text-sm text-gray-500">
            <div className="flex items-center gap-2"><FiCheck className="text-bank-accent" /> No hidden fees</div>
            <div className="flex items-center gap-2"><FiCheck className="text-bank-accent" /> Free virtual cards</div>
            <div className="flex items-center gap-2"><FiCheck className="text-bank-accent" /> Instant transfers</div>
          </div>
        </motion.div>

        {/* Visual */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative"
        >
          {/* Floating cards */}
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-8 -left-4 z-10"
          >
            <div className="w-72 h-44 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 p-5 text-white shadow-2xl shadow-blue-500/30 rotate-[-6deg]">
              <p className="text-xs opacity-80">Virtual Card</p>
              <p className="text-lg font-bold mt-1">VISA</p>
              <p className="font-mono text-lg tracking-wider mt-6">•••• 4892</p>
              <div className="flex justify-between mt-3 text-xs opacity-80"><span>Sarah Johnson</span><span>12/28</span></div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute -bottom-4 -right-2 z-20"
          >
            <div className="w-72 h-44 rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-amber-600 p-5 text-white shadow-2xl shadow-amber-500/20 rotate-[3deg]">
              <p className="text-xs opacity-80">Premium</p>
              <p className="text-lg font-bold mt-1">BLACK</p>
              <p className="font-mono text-lg tracking-wider mt-6">•••• 7823</p>
              <div className="flex justify-between mt-3 text-xs opacity-80"><span>Michael Chen</span><span>06/27</span></div>
            </div>
          </motion.div>

          {/* Dashboard mockup */}
          <div className="glass-card p-4 rounded-2xl shadow-2xl">
            <div className="bg-navy-950/80 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-gray-400 font-medium">DASHBOARD</span>
                <span className="badge badge-success text-[10px]">LIVE</span>
              </div>
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">TOTAL BALANCE</p>
                <p className="text-3xl font-bold text-white">$24,580<span className="text-lg text-gray-400">.00</span></p>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-emerald-400 text-xs"><FiTrendingUp className="w-3 h-3" /> Income</div>
                  <p className="text-sm font-semibold text-white mt-1">$8,240</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-red-400 text-xs"><FiTrendingUp className="w-3 h-3 rotate-180" /> Spending</div>
                  <p className="text-sm font-semibold text-white mt-1">$3,120</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs"><span className="text-gray-500">Emma W. - Transfer</span><span className="text-emerald-400">+$450</span></div>
                <div className="flex items-center justify-between text-xs"><span className="text-gray-500">Netflix - Card</span><span className="text-red-400">-$14.99</span></div>
                <div className="flex items-center justify-between text-xs"><span className="text-gray-500">Refund - Amazon</span><span className="text-emerald-400">+$89.00</span></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  FEATURES                                                           */
/* ------------------------------------------------------------------ */
const features = [
  { icon: FiCreditCard, title: 'Virtual Cards', desc: 'Generate Visa, Mastercard, or Premium Black cards instantly. Freeze, unfreeze, and manage limits.', color: 'from-violet-500 to-purple-500', href: '/cards' },
  { icon: FiSend, title: 'Instant Transfers', desc: 'Send money globally via SWIFT, ACH, crypto, or mobile. Real-time tracking and notifications.', color: 'from-blue-500 to-cyan-500', href: '/transfers' },
  { icon: FiBarChart2, title: 'Smart Dashboard', desc: 'Premium analytics with spending insights, charts, and financial health monitoring.', color: 'from-emerald-500 to-teal-500', href: '/dashboard' },
  { icon: FiRefreshCw, title: 'Refund Tracking', desc: 'Submit, track, and manage refund requests with real-time status updates.', color: 'from-orange-500 to-yellow-500', href: '/refunds' },
  { icon: FiBell, title: 'Real-Time Alerts', desc: 'Instant push notifications for transactions, security events, and account activity.', color: 'from-pink-500 to-rose-500', href: '/notifications' },
  { icon: FiLock, title: 'Bank-Grade Security', desc: 'JWT authentication, bcrypt encryption, CSRF protection, and 2FA verification.', color: 'from-indigo-500 to-blue-500', href: '/security' },
  { icon: FiShield, title: 'Admin Controls', desc: 'Comprehensive admin panel for user management, crediting, debiting, and monitoring.', color: 'from-red-500 to-orange-500', href: '/admin/login' },
  { icon: FiGlobe, title: 'Multi-Currency', desc: 'Support for USD, EUR, GBP, crypto, and more with real-time exchange rates.', color: 'from-cyan-500 to-blue-500', href: '/currencies' },
];

function Features() {
  const router = useRouter();

  const handleCardClick = (href: string) => {
    router.push(href);
  };

  return (
    <Section id="features">
      <div className="text-center mb-16">
        <span className="text-bank-blue text-sm font-semibold tracking-widest uppercase">Features</span>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3">Everything You Need to Bank Smarter</h2>
        <p className="text-gray-400 mt-4 max-w-2xl mx-auto">From virtual cards to real-time analytics, SecureRefund delivers enterprise-grade banking tools for the modern world.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              onClick={() => handleCardClick(f.href)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(f.href); } }}
              role="link"
              tabIndex={0}
              className="glass-card p-6 group cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-bank-blue transition-colors">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  PRICING                                                            */
/* ------------------------------------------------------------------ */
const pricingPlans = [
  {
    name: 'Starter',
    price: 'Free',
    period: 'forever',
    desc: 'Perfect for getting started with digital banking.',
    features: ['1 Virtual Card', 'Basic Dashboard', 'Internal Transfers', 'Email Support', 'USD Currency'],
    cta: 'Get Started',
    featured: false,
    color: 'from-blue-500/20 to-cyan-500/10',
    borderColor: 'border-white/5',
  },
  {
    name: 'Professional',
    price: '$9.99',
    period: '/month',
    desc: 'For professionals who need more power and flexibility.',
    features: ['10 Virtual Cards', 'Advanced Analytics', 'All Transfer Types', 'Priority Support', 'Multi-Currency', 'Refund Management', 'Card Controls'],
    cta: 'Start Free Trial',
    featured: true,
    color: 'from-bank-blue/30 to-cyan-500/20',
    borderColor: 'border-bank-blue/40',
  },
  {
    name: 'Enterprise',
    price: '$29.99',
    period: '/month',
    desc: 'For teams and businesses with advanced banking needs.',
    features: ['Unlimited Virtual Cards', 'Admin Panel Access', 'API Integration', 'Dedicated Support', 'All Currencies', 'Custom Limits', 'Audit Logs', 'Team Management'],
    cta: 'Contact Sales',
    featured: false,
    color: 'from-purple-500/20 to-pink-500/10',
    borderColor: 'border-white/5',
  },
];

function Pricing() {
  return (
    <Section id="pricing">
      <div className="text-center mb-16">
        <span className="text-bank-accent text-sm font-semibold tracking-widest uppercase">Pricing</span>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3">Simple, Transparent Pricing</h2>
        <p className="text-gray-400 mt-4 max-w-2xl mx-auto">Choose the plan that fits your needs. No hidden fees, no surprises. Upgrade or downgrade at any time.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {pricingPlans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12, duration: 0.5 }}
            className={`relative glass-card p-8 flex flex-col ${plan.featured ? 'ring-2 ring-bank-blue/50 scale-[1.03] z-10' : ''}`}
          >
            {plan.featured && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-bank-blue text-white text-xs font-bold tracking-wider">
                MOST POPULAR
              </div>
            )}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                <span className="text-sm text-gray-400">{plan.period}</span>
              </div>
              <p className="text-sm text-gray-400 mt-2">{plan.desc}</p>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-300">
                  <FiCheck className="w-4 h-4 text-bank-accent flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href={plan.featured ? '/register' : '#contact'}
              className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${
                plan.featured
                  ? 'bg-gradient-to-r from-bank-blue to-cyan-500 text-white shadow-lg shadow-bank-blue/30 hover:shadow-xl hover:shadow-bank-blue/40'
                  : 'glass border-white/10 text-white hover:border-bank-blue/30'
              }`}
            >
              {plan.cta}
            </a>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  ANALYTICS / STATS                                                  */
/* ------------------------------------------------------------------ */
function Analytics() {
  const stats = [
    { icon: FiUsers, value: '2,400,000+', label: 'Active Users', color: 'text-blue-400' },
    { icon: FiDollarSign, value: '$48.2B', label: 'Transfer Volume', color: 'text-emerald-400' },
    { icon: FiActivity, value: '99.99%', label: 'Uptime SLA', color: 'text-purple-400' },
    { icon: FiCreditCard, value: '8.5M+', label: 'Virtual Cards Issued', color: 'text-orange-400' },
  ];

  return (
    <section className="py-24 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="glass-card p-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white">Trusted at Scale</h2>
            <p className="text-gray-400 mt-3">Powering millions of transactions across the globe</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <Icon className={`w-8 h-8 mx-auto mb-4 ${s.color}`} />
                  <p className="text-3xl sm:text-4xl font-extrabold text-white mb-1">{s.value}</p>
                  <p className="text-sm text-gray-500">{s.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  HOW IT WORKS                                                       */
/* ------------------------------------------------------------------ */
const steps = [
  { step: '01', icon: FiUsers, title: 'Create Account', desc: 'Sign up in under 2 minutes with email verification. No paperwork, no hidden fees.' },
  { step: '02', icon: FiGrid, title: 'Manage Banking', desc: 'Access your dashboard, generate virtual cards, and monitor your finances in real time.' },
  { step: '03', icon: FiSend, title: 'Send & Track', desc: 'Transfer funds globally, submit refund requests, and track everything from one place.' },
];

function HowItWorks() {
  return (
    <Section id="how-it-works">
      <div className="text-center mb-16">
        <span className="text-bank-accent text-sm font-semibold tracking-widest uppercase">How It Works</span>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3">Get Started in 3 Simple Steps</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative"
            >
              <div className="glass-card p-8 text-center">
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-6xl font-black text-bank-blue/10">{s.step}</span>
                <div className="w-14 h-14 rounded-2xl bg-bank-blue/10 flex items-center justify-center mx-auto mb-5 relative z-10">
                  <Icon className="w-7 h-7 text-bank-blue" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{s.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
              {i < 2 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-bank-blue/50 to-transparent" />
              )}
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  VIRTUAL CARD SHOWCASE                                              */
/* ------------------------------------------------------------------ */
const showcaseCards = [
  { type: 'VISA', gradient: 'from-blue-600 via-blue-500 to-cyan-400', shadow: 'shadow-blue-500/30', balance: '$12,500', name: 'Sarah Johnson', expiry: '12/28', last4: '4892' },
  { type: 'MASTERCARD', gradient: 'from-red-600 via-orange-500 to-yellow-400', shadow: 'shadow-orange-500/30', balance: '$8,750', name: 'Michael Chen', expiry: '06/27', last4: '3156' },
  { type: 'PREMIUM', gradient: 'from-gray-900 via-gray-800 to-amber-500', shadow: 'shadow-amber-500/20', balance: '$24,500', name: 'Emma Williams', expiry: '03/29', last4: '7823' },
];

function CardShowcase() {
  return (
    <Section id="cards">
      <div className="text-center mb-16">
        <span className="text-bank-blue text-sm font-semibold tracking-widest uppercase">Virtual Cards</span>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3">Premium Cards for Every Need</h2>
        <p className="text-gray-400 mt-4 max-w-2xl mx-auto">Generate virtual Visa, Mastercard, or Premium Black Cards with instant activation and full control.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {showcaseCards.map((card, i) => (
          <motion.div
            key={card.type}
            initial={{ opacity: 0, y: 40, rotateY: 15 }}
            whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, duration: 0.6 }}
            whileHover={{ scale: 1.04, rotateY: -5 }}
            className="perspective-1000"
          >
            <div className={`relative h-56 rounded-2xl bg-gradient-to-br ${card.gradient} p-6 text-white ${card.shadow} shadow-2xl cursor-pointer overflow-hidden`}>
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyMCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDgiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')] opacity-30" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs opacity-80 font-medium">{card.type === 'PREMIUM' ? 'PLATINUM' : card.type}</p>
                    <p className="text-xl font-extrabold mt-1 tracking-wide">{card.type === 'PREMIUM' ? 'BLACK' : card.type}</p>
                  </div>
                  <div className="w-10 h-8 rounded bg-white/20 backdrop-blur flex items-center justify-center">
                    <span className="text-[8px] font-bold tracking-widest">CHIP</span>
                  </div>
                </div>
                <div className="mt-auto">
                  <p className="font-mono text-lg tracking-[0.2em] mb-4">•••• •••• •••• {card.last4}</p>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[9px] opacity-60 uppercase tracking-wider">Card Holder</p>
                      <p className="text-sm font-semibold uppercase tracking-wide">{card.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] opacity-60 uppercase tracking-wider">Expires</p>
                      <p className="text-sm font-semibold">{card.expiry}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-3">For demonstration purposes only. Not real financial cards.</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  TESTIMONIALS                                                       */
/* ------------------------------------------------------------------ */
const testimonials = [
  { name: 'James Rodriguez', role: 'Freelance Designer', avatar: 'JR', rating: 5, text: 'SecureRefund completely changed how I manage international payments. The virtual cards are a game-changer for my business subscriptions.' },
  { name: 'Priya Sharma', role: 'Digital Nomad', avatar: 'PS', rating: 5, text: 'I travel full-time and need a bank that works everywhere. The multi-currency support and instant transfers are incredible.' },
  { name: 'David Kim', role: 'Startup Founder', avatar: 'DK', rating: 5, text: 'The admin panel gives me full control over team expenses. We issued 50 virtual cards in under 5 minutes. Enterprise-grade quality.' },
];

function Testimonials() {
  return (
    <Section id="testimonials">
      <div className="text-center mb-16">
        <span className="text-bank-accent text-sm font-semibold tracking-widest uppercase">Testimonials</span>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3">Loved by Thousands</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-8"
          >
            <div className="flex gap-1 mb-4">
              {[...Array(t.rating)].map((_, j) => <FiStar key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-bank-blue to-purple-500 flex items-center justify-center text-white font-bold text-xs">{t.avatar}</div>
              <div>
                <p className="text-sm font-semibold text-white">{t.name}</p>
                <p className="text-xs text-gray-500">{t.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  SECURITY SECTION                                                   */
/* ------------------------------------------------------------------ */
const securityItems = [
  { icon: FiShield, title: 'Bank-Grade Encryption', desc: 'AES-256 encryption for all data at rest and TLS 1.3 for data in transit.' },
  { icon: FiLock, title: 'Secure Authentication', desc: 'JWT tokens with bcrypt hashing, 2FA, and biometric verification support.' },
  { icon: FiActivity, title: 'Fraud Monitoring', desc: 'AI-powered real-time fraud detection with instant alerts and automated blocking.' },
  { icon: FiBell, title: 'Real-Time Protection', desc: '24/7 monitoring, rate limiting, CSRF protection, and automated threat response.' },
];

function Security() {
  return (
    <Section id="security">
      <div className="text-center mb-16">
        <span className="text-emerald-400 text-sm font-semibold tracking-widest uppercase">Security</span>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3">Your Security Is Our Priority</h2>
        <p className="text-gray-400 mt-4 max-w-2xl mx-auto">Enterprise-grade security infrastructure protecting every transaction, every account, every second.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {securityItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  REFUND CENTER                                                      */
/* ------------------------------------------------------------------ */
const refundFeatures = [
  { icon: FiRefreshCw, title: 'Easy Refund Requests', desc: 'Submit refund requests with just a few clicks. Track every step of the process in real time.' },
  { icon: FiActivity, title: 'Real-Time Tracking', desc: 'Monitor your refund status with live updates. Know exactly where your money is at all times.' },
  { icon: FiBell, title: 'Instant Notifications', desc: 'Get notified the moment your refund is approved, processed, or requires additional action.' },
  { icon: FiShield, title: 'Dispute Resolution', desc: 'Automated dispute handling with our intelligent resolution engine. Fair, fast, and transparent.' },
  { icon: FiClock, title: 'Fast Processing', desc: 'Most refunds processed within 24-48 hours. Priority processing available for Premium card holders.' },
  { icon: FiFileText, title: 'Detailed Reports', desc: 'Download comprehensive refund reports with transaction details, timelines, and resolution notes.' },
];

function RefundCenter() {
  return (
    <Section id="refund-center">
      <div className="text-center mb-16">
        <span className="text-orange-400 text-sm font-semibold tracking-widest uppercase">Refund Center</span>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3">Hassle-Free Refund Management</h2>
        <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
          Our intelligent refund system makes it easy to request, track, and resolve refunds. Built for transparency and speed.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-center">
        <div className="grid sm:grid-cols-2 gap-5">
          {refundFeatures.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card p-5"
              >
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-orange-400" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="glass-card p-6 space-y-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Active Refund Requests</h3>
            <span className="badge badge-success text-[10px]">Live Demo</span>
          </div>

          {[
            { id: 'REF-2024-7842', merchant: 'Amazon.com', amount: '$89.99', status: 'Approved', statusColor: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
            { id: 'REF-2024-7831', merchant: 'Netflix', amount: '$15.99', status: 'Processing', statusColor: 'text-blue-400', bgColor: 'bg-blue-500/10' },
            { id: 'REF-2024-7815', merchant: 'Spotify', amount: '$9.99', status: 'Pending', statusColor: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
            { id: 'REF-2024-7798', merchant: 'Uber Eats', amount: '$34.50', status: 'Resolved', statusColor: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
          ].map((refund, i) => (
            <motion.div
              key={refund.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg ${refund.bgColor} flex items-center justify-center`}>
                  <FiRefreshCw className={`w-5 h-5 ${refund.statusColor}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{refund.merchant}</p>
                  <p className="text-xs text-gray-500">{refund.id}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white">{refund.amount}</p>
                <p className={`text-xs font-medium ${refund.statusColor}`}>{refund.status}</p>
              </div>
            </motion.div>
          ))}

          <div className="pt-4 border-t border-white/5">
            <Link
              href="/login"
              className="block text-center py-3 rounded-xl bg-gradient-to-r from-orange-500/20 to-yellow-500/10 border border-orange-500/20 text-orange-300 font-semibold text-sm hover:bg-orange-500/30 transition-all"
            >
              Submit a Refund Request →
            </Link>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  MOBILE APP                                                         */
/* ------------------------------------------------------------------ */
function MobileApp() {
  return (
    <section className="py-24 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-purple-400 text-sm font-semibold tracking-widest uppercase">Mobile Banking</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3">Bank Anywhere, Anytime</h2>
          <p className="text-gray-400 mt-4 leading-relaxed max-w-lg">
            Full-featured mobile banking experience with real-time notifications, biometric login, and all the power of the web platform in your pocket.
          </p>
          <div className="space-y-3 mt-6">
            {['Push notifications for every transaction', 'Biometric fingerprint & face login', 'Mobile check deposit', 'Card freeze/unfreeze on the go', 'Live chat support 24/7'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-gray-300">
                <FiCheck className="text-bank-accent flex-shrink-0" /> {item}
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-8">
            <Link href="/register" className="px-5 py-3 rounded-xl bg-white text-navy-900 text-sm font-semibold flex items-center gap-2 cursor-pointer hover:bg-gray-200 transition-colors">
              <FiSmartphone /> Get Started
            </Link>
            <Link href="/login" className="px-5 py-3 rounded-xl glass text-white text-sm font-semibold flex items-center gap-2 cursor-pointer hover:border-bank-blue/30 transition-colors">
              <FiSmartphone /> Sign In
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex justify-center"
        >
          <div className="relative">
            <div className="w-64 h-[500px] rounded-[3rem] border-4 border-gray-700 bg-navy-900 overflow-hidden shadow-2xl">
              <div className="h-8 bg-navy-950 flex items-center justify-center">
                <div className="w-20 h-1 rounded-full bg-gray-700" />
              </div>
              <div className="p-5 space-y-3">
                <p className="text-xs text-gray-500 font-medium">SECUREREFUND</p>
                <p className="text-2xl font-bold text-white">$24,580</p>
                <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-bank-blue/20 flex items-center justify-center"><FiSend className="w-4 h-4 text-bank-blue" /></div>
                  <div>
                    <p className="text-xs text-white font-medium">Transfer Sent</p>
                    <p className="text-[10px] text-gray-500">$450.00 to Emma W.</p>
                  </div>
                  <span className="ml-auto badge badge-success text-[10px]">Done</span>
                </div>
                <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center"><FiCreditCard className="w-4 h-4 text-purple-400" /></div>
                  <div>
                    <p className="text-xs text-white font-medium">Card Generated</p>
                    <p className="text-[10px] text-gray-500">VISA •••• 4892</p>
                  </div>
                  <span className="ml-auto badge badge-pending text-[10px]">Active</span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-bank-blue to-bank-accent flex items-center justify-center shadow-xl animate-float">
              <FiZap className="w-8 h-8 text-white" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  FAQ                                                                */
/* ------------------------------------------------------------------ */
const faqs = [
  { q: 'Is SecureRefund a real bank?', a: 'SecureRefund is a demo fintech banking platform showcasing enterprise-grade banking features. It does not provide real banking services unless integrated with licensed financial infrastructure.' },
  { q: 'Are the virtual cards real?', a: 'No. All virtual cards are for demonstration purposes only. They simulate real card functionality but cannot be used for actual payments.' },
  { q: 'Is my data secure?', a: 'Yes. The platform uses JWT authentication, bcrypt password hashing, CSRF protection, rate limiting, and follows banking-grade security best practices.' },
  { q: 'Can I make real transfers?', a: 'Transfers on the platform are simulated for demonstration. Real financial transactions require integration with licensed payment processors and banking partners.' },
  { q: 'What currencies are supported?', a: 'The demo platform supports USD by default, with the architecture ready for multi-currency support including EUR, GBP, and cryptocurrency integrations.' },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <Section id="faq">
      <div className="text-center mb-16">
        <span className="text-bank-blue text-sm font-semibold tracking-widest uppercase">FAQ</span>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3">Frequently Asked Questions</h2>
      </div>
      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.map((faq, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="glass-card overflow-hidden"
          >
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full p-5 flex items-center justify-between text-left">
              <span className="text-white font-medium text-sm sm:text-base pr-4">{faq.q}</span>
              <motion.div animate={{ rotate: open === i ? 45 : 0 }} className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                <FiChevronRight className="w-4 h-4 text-gray-400" />
              </motion.div>
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="px-5 pb-5">
                  <p className="text-sm text-gray-400 leading-relaxed">{faq.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  CONTACT                                                            */
/* ------------------------------------------------------------------ */
function Contact() {
  return (
    <Section id="contact">
      <div className="text-center mb-16">
        <span className="text-bank-blue text-sm font-semibold tracking-widest uppercase">Contact</span>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3">Get In Touch</h2>
        <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
          Have questions? Our team is here to help. Reach out and we'll get back to you within 24 hours.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <a href="mailto:support@securerefund.com" className="glass-card p-8 text-center hover:border-bank-blue/30 transition-all group">
          <div className="w-14 h-14 rounded-2xl bg-bank-blue/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <FiMail className="w-7 h-7 text-bank-blue" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Email Us</h3>
          <p className="text-sm text-gray-400">support@securerefund.com</p>
          <p className="text-xs text-gray-500 mt-1">We reply within 24 hours</p>
        </a>
        <a href="tel:+18005551234" className="glass-card p-8 text-center hover:border-bank-blue/30 transition-all group">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <FiPhone className="w-7 h-7 text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Call Us</h3>
          <p className="text-sm text-gray-400">+1 (800) 555-1234</p>
          <p className="text-xs text-gray-500 mt-1">Mon-Fri 9am-6pm EST</p>
        </a>
        <div className="glass-card p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
            <FiHeadphones className="w-7 h-7 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Live Chat</h3>
          <p className="text-sm text-gray-400">Available for registered users</p>
          <Link href="/register" className="inline-block mt-3 text-sm text-bank-blue hover:text-bank-light transition-colors font-medium">
            Create Account →
          </Link>
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  FOOTER                                                             */
/* ------------------------------------------------------------------ */
function Footer() {
  const footerLinks: Record<string, { label: string; href: string }[]> = {
    Products: [
      { label: 'Virtual Cards', href: '/cards' },
      { label: 'Transfers', href: '/transfers' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Transactions', href: '/transactions' },
      { label: 'Cost Calculator', href: '/calculator' },
    ],
    Company: [
      { label: 'About Us', href: '/about' },
      { label: 'News', href: '/news' },
      { label: 'Testimonials', href: '/testimonials' },
      { label: 'FAQs', href: '/faqs' },
      { label: 'Admin Panel', href: '/admin/login' },
    ],
    Legal: [
      { label: 'Privacy Policy', href: '/legal/privacy' },
      { label: 'Terms of Service', href: '/legal/terms' },
      { label: 'AML Policy', href: '/legal/aml' },
      { label: 'KYC Policy', href: '/legal/kyc' },
      { label: 'Risk Disclosure', href: '/legal/risk' },
    ],
    Support: [
      { label: 'Help Center', href: '/faqs' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Request Quote', href: '/request-quote' },
      { label: 'Register', href: '/register' },
      { label: 'Login', href: '/login' },
    ],
  };

  return (
    <footer className="border-t border-white/5 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-bank-blue to-bank-accent flex items-center justify-center">
                <FiShield className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">SecureRefund</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">Modern digital banking platform for the connected world.</p>
            <div className="flex gap-3">
              {[FaTwitter, FaLinkedinIn, FaFacebookF, FaInstagram].map((Icon, i) => (
                <Link key={i} href="/" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-bank-blue/20 transition-all">
                  <Icon className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map((l) => (
                  <li key={l.label}><Link href={l.href} className="text-sm text-gray-500 hover:text-white transition-colors">{l.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            This platform is a demo fintech banking system and does not provide real banking services unless integrated with licensed financial infrastructure.
          </p>
          <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} SecureRefund Bank. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN PAGE                                                          */
/* ------------------------------------------------------------------ */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-navy-950 text-white">
      <Navbar />
      <Hero />
      <Features />
      <Pricing />
      <Analytics />
      <HowItWorks />
      <CardShowcase />
      <Testimonials />
      <Security />
      <RefundCenter />
      <MobileApp />
      <FAQ />
      <Contact />
      <Footer />
    </div>
  );
}
