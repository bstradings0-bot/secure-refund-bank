'use client';

import { useState, useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface KycSubmission {
  userId: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    country: string;
    kycStatus: string;
    riskScore: number;
  };
  documents: Array<{
    id: string;
    documentType: string;
    fileName: string;
    fileUrl: string;
    status: string;
    submittedAt: string;
  }>;
  submittedAt: string;
}

export default function AdminKycPage() {
  const [submissions, setSubmissions] = useState<KycSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/admin/kyc/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setSubmissions(data.data);
      else setError(data.message);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (userId: string) => {
    try {
      setActionLoading(userId);
      const res = await fetch(`${API_BASE}/api/admin/kyc/${userId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ notes }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmissions((prev: KycSubmission[]) => prev.filter((s: KycSubmission) => s.userId !== userId));
        setSelectedUser(null);
        setNotes('');
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: string) => {
    if (!rejectReason.trim()) {
      setError('Rejection reason is required');
      return;
    }
    try {
      setActionLoading(userId);
      const res = await fetch(`${API_BASE}/api/admin/kyc/${userId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmissions((prev: KycSubmission[]) => prev.filter((s: KycSubmission) => s.userId !== userId));
        setSelectedUser(null);
        setRejectReason('');
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const selected = submissions.find((s: KycSubmission) => s.userId === selectedUser);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">KYC Review</h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4">
          {error}
          <button onClick={() => setError('')} className="float-right">&times;</button>
        </div>
      )}

      {loading ? (
        <div className="text-gray-400">Loading KYC submissions...</div>
      ) : submissions.length === 0 ? (
        <div className="text-gray-400 bg-gray-800/50 rounded-xl p-8 text-center">
          <p className="text-lg font-medium">No pending KYC reviews</p>
          <p className="text-sm mt-1">All submissions have been processed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            {submissions.map((sub) => (
              <div
                key={sub.userId}
                onClick={() => setSelectedUser(sub.userId)}
                className={`p-4 rounded-xl cursor-pointer border transition-all ${
                  selectedUser === sub.userId
                    ? 'bg-blue-500/10 border-blue-500/30'
                    : 'bg-gray-800/50 border-gray-700/30 hover:border-gray-600/50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-white">
                      {sub.user.firstName} {sub.user.lastName}
                    </p>
                    <p className="text-sm text-gray-400">{sub.user.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">{sub.user.country}</span>
                    <p className="text-sm text-gray-400 mt-1">
                      {sub.documents.length} document{sub.documents.length > 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(sub.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selected && (
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/30">
              <h2 className="text-lg font-semibold mb-4 text-white">
                {selected.user.firstName} {selected.user.lastName}
              </h2>

              <div className="space-y-3 mb-6">
                <div className="text-sm">
                  <span className="text-gray-400">Email:</span>{' '}
                  <span className="text-white">{selected.user.email}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-400">Country:</span>{' '}
                  <span className="text-white">{selected.user.country}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-400">Risk Score:</span>{' '}
                  <span className={`font-semibold ${selected.user.riskScore > 40 ? 'text-red-400' : 'text-green-400'}`}>
                    {selected.user.riskScore}
                  </span>
                </div>
              </div>

              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Documents ({selected.documents.length})
              </h3>
              <div className="space-y-2 mb-6">
                {selected.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg"
                  >
                    <div>
                      <p className="text-sm text-white font-medium">{doc.documentType}</p>
                      <p className="text-xs text-gray-400">{doc.fileName}</p>
                    </div>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 text-sm hover:underline"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-1">Review Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes for approval..."
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:border-blue-500/50 focus:outline-none"
                  rows={2}
                />
              </div>

              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => handleApprove(selected.userId)}
                  disabled={actionLoading === selected.userId}
                  className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                >
                  {actionLoading === selected.userId ? 'Processing...' : 'Approve'}
                </button>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Rejection Reason</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Required for rejection..."
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:border-red-500/50 focus:outline-none mb-2"
                  rows={2}
                />
                <button
                  onClick={() => handleReject(selected.userId)}
                  disabled={actionLoading === selected.userId || !rejectReason.trim()}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                >
                  {actionLoading === selected.userId ? 'Processing...' : 'Reject'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
