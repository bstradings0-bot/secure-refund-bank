'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend, FiCheck, FiHeadphones, FiMessageSquare } from 'react-icons/fi';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const contactInfo = [
  { icon: FiMail, title: 'Email Us', value: 'support@securerefund.com', sub: 'We reply within 24 hours', href: 'mailto:support@securerefund.com' },
  { icon: FiPhone, title: 'Call Us', value: '+1 (800) 555-1234', sub: 'Mon-Fri 9am-6pm EST', href: 'tel:+18005551234' },
  { icon: FiMapPin, title: 'Visit Us', value: 'New York, NY 10005', sub: 'United States', href: '#' },
  { icon: FiClock, title: 'Support Hours', value: '24/7 Premium Support', sub: 'For enterprise customers', href: '#' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', phone: '', company: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/contact', form);
      setSubmitted(true);
      toast.success('Message sent successfully!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const subjects = ['General Inquiry', 'Technical Support', 'Billing Question', 'Partnership', 'Press & Media', 'Careers'];

  return (
    <div className="min-h-screen bg-navy-950 text-white">
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-blue-950 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-2xl mx-auto">
            <span className="text-bank-blue text-sm font-semibold tracking-widest uppercase">Contact</span>
            <h1 className="text-4xl sm:text-5xl font-extrabold mt-4 leading-tight">Get In Touch With Us</h1>
            <p className="text-lg text-gray-400 mt-4">Have questions or need help? Our team is ready to assist you.</p>
          </motion.div>

          {/* Contact Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
            {contactInfo.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.a key={item.title} href={item.href} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-5 text-center hover:border-bank-blue/30 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-bank-blue/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5 text-bank-blue" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-xs text-bank-blue font-medium">{item.value}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{item.sub}</p>
                </motion.a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form + Info */}
      <section className="py-16 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-3 gap-10">
          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-2">
            {submitted ? (
              <div className="glass-card p-10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <FiCheck className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Message Sent!</h2>
                <p className="text-gray-400 mb-6">Thank you for reaching out. Our team will get back to you within 24 hours.</p>
                <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '', phone: '', company: '' }); }} className="btn-secondary text-sm">
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="glass-card p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Send Us a Message</h2>
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Full Name *</label>
                    <input name="name" value={form.name} onChange={handleChange} required className="input-field text-white" placeholder="John Smith" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Email Address *</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} required className="input-field text-white" placeholder="john@company.com" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Phone</label>
                    <input name="phone" value={form.phone} onChange={handleChange} className="input-field text-white" placeholder="+1 (555) 000-0000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Company</label>
                    <input name="company" value={form.company} onChange={handleChange} className="input-field text-white" placeholder="Company name" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Subject *</label>
                  <select name="subject" value={form.subject} onChange={handleChange} required className="input-field text-white bg-navy-900">
                    <option value="">Select a topic</option>
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Message *</label>
                  <textarea name="message" value={form.message} onChange={handleChange} required rows={5} className="input-field text-white resize-none" placeholder="Tell us how we can help you..." />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading ? 'Sending...' : <><FiSend className="w-4 h-4" /> Send Message</>}
                </button>
              </form>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-4">
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <FiHeadphones className="w-5 h-5 text-bank-blue" />
                <h3 className="text-lg font-semibold text-white">Premium Support</h3>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">Enterprise customers get dedicated account managers and priority response times.</p>
              <ul className="space-y-2">
                {['Dedicated account manager', 'Priority email & phone', 'Custom SLA agreements', 'Quarterly business reviews'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-300">
                    <FiCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <FiMessageSquare className="w-5 h-5 text-bank-accent" />
                <h3 className="text-lg font-semibold text-white">Quick Answers</h3>
              </div>
              <p className="text-sm text-gray-400 mb-4">Check our FAQ for instant answers to common questions.</p>
              <a href="/faqs" className="text-bank-blue text-sm font-medium hover:text-bank-light transition-colors">Browse FAQs →</a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
