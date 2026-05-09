'use client';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-300">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: May 6, 2026</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
          <p className="mb-2">SecureRefund collects the following types of information to provide our financial services platform:</p>
          <ul className="list-disc pl-6 space-y-1 text-gray-400">
            <li>Personal identification information (name, email, phone, date of birth)</li>
            <li>Government-issued identification documents for KYC verification</li>
            <li>Address and residency information</li>
            <li>Financial information (linked bank accounts, transaction history)</li>
            <li>Technical data (IP address, browser type, device information)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-1 text-gray-400">
            <li>To verify your identity and comply with KYC/AML regulations</li>
            <li>To process transactions and maintain your wallet</li>
            <li>To communicate about your account and transactions</li>
            <li>To detect and prevent fraud, money laundering, and unauthorized activity</li>
            <li>To improve our services and customer experience</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">3. Data Storage and Security</h2>
          <p className="text-gray-400">
            We employ AES-256 encryption for sensitive data at rest, TLS 1.3 for data in transit,
            and adhere to industry-standard security practices. Your data is stored on secure servers
            with strict access controls. We retain your data only as long as necessary for legal and
            business purposes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">4. Data Sharing</h2>
          <p className="text-gray-400">
            We share your information only with trusted third-party service providers necessary
            to provide our services, including payment processors (Stripe, Plaid, Wise),
            identity verification services, and as required by applicable law or regulation.
            We do not sell your personal data.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">5. Your Rights</h2>
          <p className="text-gray-400 mb-2">Depending on your jurisdiction, you may have the right to:</p>
          <ul className="list-disc pl-6 space-y-1 text-gray-400">
            <li>Access your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to or restrict processing</li>
            <li>Data portability</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">6. Contact Us</h2>
          <p className="text-gray-400">
            For privacy-related inquiries, contact our Data Protection Officer at
            privacy@securerefund.com.
          </p>
        </section>
      </div>
    </div>
  );
}
