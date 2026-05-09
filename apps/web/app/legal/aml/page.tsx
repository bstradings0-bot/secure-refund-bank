'use client';

export default function AmlPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-300">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-white mb-8">Anti-Money Laundering (AML) Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: May 6, 2026</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">1. Policy Statement</h2>
          <p className="text-gray-400">
            SecureRefund is committed to preventing money laundering, terrorist financing, and
            other financial crimes. We maintain a comprehensive AML program in compliance with
            applicable laws and regulations.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">2. Customer Due Diligence (CDD)</h2>
          <p className="text-gray-400">We verify the identity of all users through:</p>
          <ul className="list-disc pl-6 space-y-1 text-gray-400 mt-2">
            <li>Government-issued photo identification</li>
            <li>Proof of residential address</li>
            <li>Date of birth verification</li>
            <li>Risk assessment based on country, transaction patterns, and profile</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">3. Transaction Monitoring</h2>
          <p className="text-gray-400">
            All transactions are monitored for suspicious patterns. Transactions exceeding
            USD $10,000 are automatically flagged for enhanced review. We employ automated
            and manual review processes to detect unusual activity.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">4. Suspicious Activity Reporting</h2>
          <p className="text-gray-400">
            We file Suspicious Activity Reports (SARs) with relevant authorities when
            transactions or account activities raise reasonable suspicion of money laundering,
            fraud, or terrorist financing.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">5. Record Keeping</h2>
          <p className="text-gray-400">
            We maintain records of all transactions, KYC documents, and compliance checks
            for a minimum of 5 years as required by applicable regulations.
          </p>
        </section>
      </div>
    </div>
  );
}
