'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import {
  FiShield, FiAlertTriangle, FiUsers, FiActivity,
  FiFileText, FiDownload, FiBarChart2, FiGlobe
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function AdminCompliancePage() {
  const [sarLoading, setSarLoading] = useState(false);

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['compliance-dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/compliance/dashboard');
      return data.data;
    },
  });

  const generateSarReport = async () => {
    try {
      setSarLoading(true);
      const { data } = await api.get('/api/admin/compliance/sar-report');
      const report = data.data;
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sar-report-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('SAR report downloaded');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate report');
    } finally {
      setSarLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Compliance Center</h1>
          <p className="text-gray-400 mt-1">Loading compliance data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="glass-card h-32 animate-pulse" />)}
        </div>
      </div>
    );
  }

  const stats = [
    {
      icon: FiUsers,
      label: 'Users Requiring Review',
      value: dashboard?.usersRequiringReview ?? 0,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
    },
    {
      icon: FiAlertTriangle,
      label: 'High Risk Flags',
      value: dashboard?.highRiskFlags ?? 0,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
    {
      icon: FiShield,
      label: 'Pending KYC',
      value: dashboard?.pendingKyc ?? 0,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      icon: FiActivity,
      label: 'Suspicious Activities',
      value: dashboard?.suspiciousActivities ?? 0,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
    },
    {
      icon: FiGlobe,
      label: 'AML Alerts',
      value: dashboard?.amlAlerts ?? 0,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      icon: FiFileText,
      label: 'Compliance Score',
      value: dashboard?.complianceScore ? `${dashboard.complianceScore}%` : 'N/A',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Compliance Center</h1>
          <p className="text-gray-400 mt-1">Monitor regulatory compliance and risk metrics</p>
        </div>
        <button
          onClick={generateSarReport}
          disabled={sarLoading}
          className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-50"
        >
          <FiDownload className="w-4 h-4" />
          {sarLoading ? 'Generating...' : 'Export SAR Report'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Flags Section */}
      {dashboard?.recentFlags && dashboard.recentFlags.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiAlertTriangle className="w-5 h-5 text-red-400" />
            Recent Flags
          </h2>
          <div className="space-y-2">
            {dashboard.recentFlags.map((flag: any, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5"
              >
                <div>
                  <p className="text-sm text-white font-medium">{flag.reason || flag.type}</p>
                  {flag.user && (
                    <p className="text-xs text-gray-500">
                      {flag.user.firstName} {flag.user.lastName} ({flag.user.email})
                    </p>
                  )}
                </div>
                <span className={`badge text-[10px] ${
                  flag.severity === 'HIGH' ? 'badge-danger' :
                  flag.severity === 'MEDIUM' ? 'badge-pending' : 'bg-blue-500/10 text-blue-400'
                }`}>
                  {flag.severity || 'LOW'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Assessment Section */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FiBarChart2 className="w-5 h-5 text-bank-blue" />
          Risk Overview
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Low Risk Users', value: dashboard?.lowRiskUsers ?? 0, color: 'text-emerald-400' },
            { label: 'Medium Risk', value: dashboard?.mediumRiskUsers ?? 0, color: 'text-yellow-400' },
            { label: 'High Risk', value: dashboard?.highRiskUsers ?? 0, color: 'text-orange-400' },
            { label: 'Critical Risk', value: dashboard?.criticalRiskUsers ?? 0, color: 'text-red-400' },
          ].map((item) => (
            <div key={item.label} className="text-center p-4 rounded-xl bg-white/[0.03]">
              <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-xs text-gray-500 mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {!dashboard && (
        <div className="glass-card p-12 text-center">
          <FiShield className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Compliance Dashboard Unavailable</h3>
          <p className="text-gray-500 text-sm">Unable to load compliance data. Please ensure the backend services are running.</p>
        </div>
      )}
    </div>
  );
}
