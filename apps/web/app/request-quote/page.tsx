'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSend, FiCheck, FiBuilding, FiUsers, FiClock, FiDollarSign, FiBriefcase } from 'react-icons/fi';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function RequestQuotePage() {
  const [form, setForm] = useState({
    companyName: '', contactName: '', email: '', phone: '',
    industry: '', requirements: '', budget: '', timeline: '', employeeCount: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/quote', form);
      setSubmitted(true);
      toast.success('Quote request submitted successfully!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const industries = ['FinTech', 'E-Commerce', 'SaaS', 'Healthcare', 'Real Estate', 'Manufacturing', 'Retail', 'Education', 'Other'];
  const budgets = ['Under $500/month', '$500 - $2,000/month', '$2,000 - $5,000/month', '$5,000 - $10,000/month', '$10,000+/month', 'Not sure yet'];
  const timelines = ['Immediately', 'Within 1 month', '1-3 months', '3-6 months', '6+ months', 'Just exploring'];

  return (
    <div className="min-h-screen bg-navy-950 text-white">
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-blue-950 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-2xl mx-auto">
            <span className="text-bank-accent text-sm font-semibold tracking-widest uppercase">Enterprise</span>
            <h1 className="text-4xl sm:text-5xl font-extrabold mt-4 leading-tight">Request a Custom Quote</h1>
            <p className="text-lg text-gray-400 mt-4">Get a tailored banking solution for your organization. Tell us about your needs and we'll prepare a custom proposal.</p>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: FiBuilding, title: 'Dedicated Account Manager', desc: 'Personal point of contact for your organization' },
              { icon: FiUsers, title: 'Volume Discounts', desc: 'Save more as your transaction volume grows' },
              { icon: FiClock, title: 'Priority Processing', desc: 'Expedited transfers and support resolution' },
              { icon: FiBriefcase, title: 'Custom Integration', desc: 'Tailored API access and white-label options' },
            ].map((b, i) => {
              const Icon = b.icon;
              return (
                <motion.div key={b.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-card p-5 text-center">
                  <div className="w-10 h-10 rounded-xl bg-bank-blue/10 flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-5 h-5 text-bank-blue" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">{b.title}</h3>
                  <p className="text-xs text-gray-400">{b.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-12 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto px-6">
          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <FiCheck className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Quote Request Received!</h2>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">Thank you for your interest. Our enterprise team will review your requirements and send a custom proposal within 1-2 business days.</p>
              <button onClick={() => { setSubmitted(false); setForm({ companyName: '', contactName: '', email: '', phone: '', industry: '', requirements: '', budget: '', timeline: '', employeeCount: '' }); }} className="btn-secondary text-sm">
                Submit Another Request
              </button>
            </motion.div>
          ) : (
            <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Tell Us About Your Needs</h2>

              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Company Name *</label>
                  <input name="companyName" value={form.companyName} onChange={handleChange} required className="input-field text-white" placeholder="Acme Corp" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Contact Name *</label>
                  <input name="contactName" value={form.contactName} onChange={handleChange} required className="input-field text-white" placeholder="Jane Smith" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Email Address *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required className="input-field text-white" placeholder="jane@acmecorp.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Phone Number</label>
                  <input name="phone" value={form.phone} onChange={handleChange} className="input-field text-white" placeholder="+1 (555) 000-0000" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Industry *</label>
                  <select name="industry" value={form.industry} onChange={handleChange} required className="input-field text-white bg-navy-900">
                    <option value="">Select industry</option>
                    {industries.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Company Size</label>
                  <input name="employeeCount" value={form.employeeCount} onChange={handleChange} className="input-field text-white" placeholder="e.g. 50-200 employees" />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Requirements *</label>
                <textarea name="requirements" value={form.requirements} onChange={handleChange} required rows={4} className="input-field text-white resize-none" placeholder="Describe your banking needs: transfer volumes, card quantities, integration requirements, compliance needs, etc." />
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Monthly Budget</label>
                  <select name="budget" value={form.budget} onChange={handleChange} className="input-field text-white bg-navy-900">
                    <option value="">Select budget range</option>
                    {budgets.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Implementation Timeline</label>
                  <select name="timeline" value={form.timeline} onChange={handleChange} className="input-field text-white bg-navy-900">
                    <option value="">Select timeline</option>
                    {timelines.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? 'Submitting...' : <><FiSend className="w-4 h-4" /> Submit Quote Request</>}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">We'll never share your information. Our team typically responds within 1-2 business days.</p>
            </motion.form>
          )}
        </div>
      </section>
    </div>
  );
}
