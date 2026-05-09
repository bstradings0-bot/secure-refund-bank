'use client';

export default function KycPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-300">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-white mb-8">KYC Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: May 6, 2026</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">1. Know Your Customer Requirements</h2>
          <p className="text-gray-400">
            To comply with regulatory requirements and prevent fraud, all SecureRefund users
            must complete identity verification before accessing full platform features,
            including deposits, withdrawals, and transfers.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">2. Accepted Documents</h2>
          <ul className="list-disc pl-6 space-y-1 text-gray-400">
            <li>Valid passport (recommended)</li>
            <li>National identity card</li>
            <li>Driver&apos;s license</li>
            <li>Recent utility bill or bank statement (proof of address)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">3. Verification Process</h2>
          <p className="text-gray-400">
            Documents are reviewed by our compliance team within 1-3 business days.
            You will be notified of the outcome via email. If rejected, you may resubmit
            with corrected or additional documentation.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">4. Data Protection</h2>
          <p className="text-gray-400">
            All KYC documents are encrypted at rest and transmitted securely. Documents
            are stored only as long as legally required and are accessible only to authorized
            compliance personnel.
          </p>
        </section>
      </div>
    </div>
  );
}
