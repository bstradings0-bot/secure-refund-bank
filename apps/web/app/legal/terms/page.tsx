'use client';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-300">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: May 6, 2026</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">1. Platform Description</h2>
          <p className="text-gray-400">
            SecureRefund is a financial services platform providing digital wallet services,
            payment processing, and international money transfers. SecureRefund is NOT a licensed bank
            and does not offer banking services. Funds held in your wallet are not insured by
            any government deposit insurance scheme.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">2. User Obligations</h2>
          <p className="text-gray-400">By using SecureRefund, you agree to:</p>
          <ul className="list-disc pl-6 space-y-1 text-gray-400 mt-2">
            <li>Provide accurate and complete registration information</li>
            <li>Complete KYC verification as required</li>
            <li>Not use the platform for illegal activities, including money laundering</li>
            <li>Maintain the confidentiality of your account credentials</li>
            <li>Comply with all applicable laws and regulations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">3. Fees</h2>
          <p className="text-gray-400">
            Transaction fees, withdrawal fees, and currency conversion fees may apply.
            All fees are disclosed before you confirm any transaction. We reserve the right
            to modify fees with 30 days notice.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">4. Limitation of Liability</h2>
          <p className="text-gray-400">
            SecureRefund is provided on an as-is basis. We are not liable for losses arising from
            market fluctuations, third-party provider failures, force majeure events, or unauthorized
            access resulting from your failure to secure your credentials.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">5. Termination</h2>
          <p className="text-gray-400">
            We reserve the right to suspend or terminate accounts that violate these terms,
            engage in suspicious activity, or fail KYC verification. You may close your account
            at any time by contacting support.
          </p>
        </section>
      </div>
    </div>
  );
}
