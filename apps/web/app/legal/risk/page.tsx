'use client';

export default function RiskDisclosurePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-300">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-white mb-8">Risk Disclosure</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: May 6, 2026</p>

        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-red-400 mb-2">Important Notice</h2>
          <p className="text-gray-300">
            SecureRefund is a financial technology platform, NOT a licensed bank. Funds held
            in your SecureRefund wallet are not insured by the Federal Deposit Insurance
            Corporation (FDIC) or any other government deposit protection scheme.
          </p>
        </div>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">1. Platform Risks</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-400">
            <li>Currency exchange rates fluctuate and may affect the value of international transfers</li>
            <li>Payment processing may experience delays due to banking networks or provider outages</li>
            <li>Third-party payment providers (Stripe, Plaid, Wise) have their own terms and risks</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">2. Security Risks</h2>
          <p className="text-gray-400">
            While we implement industry-standard security measures, no system is completely immune
            to security breaches. Users are responsible for maintaining the security of their
            login credentials and enabling two-factor authentication.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">3. Regulatory Risks</h2>
          <p className="text-gray-400">
            Financial regulations vary by jurisdiction and may change. Changes in law or regulation
            could affect the availability of our services in certain regions or require modified terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">4. No Investment Advice</h2>
          <p className="text-gray-400">
            SecureRefund does not provide investment, legal, or tax advice. Any decisions
            you make regarding your finances are your own responsibility.
          </p>
        </section>
      </div>
    </div>
  );
}
