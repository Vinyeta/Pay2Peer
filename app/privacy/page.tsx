import Link from "next/link"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            Pay2Peer
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: March 10, 2026</p>

          <div className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700">
                Pay2Peer ("we", "us", "our", or "Company") operates the Pay2Peer application. This page informs
                you of our policies regarding the collection, use, and disclosure of personal data when you use
                our Service and the choices you have associated with that data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information Collection and Use</h2>
              <p className="text-gray-700 mb-4">We collect several different types of information for various purposes:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>
                  <strong>Personal Information:</strong> Name, email address, password (hashed), avatar.
                </li>
                <li>
                  <strong>Transaction Data:</strong> Details about money sent/received between users.
                </li>
                <li>
                  <strong>Wallet Information:</strong> Balance and transaction history.
                </li>
                <li>
                  <strong>Device Information:</strong> IP address (for security and consent tracking).
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Legal Basis for Processing</h2>
              <p className="text-gray-700 mb-4">We process your personal data based on:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Your explicit consent (collected at signup)</li>
                <li>Performance of a contract (providing P2P payment services)</li>
                <li>Compliance with legal obligations (LOPD/GDPR)</li>
                <li>Legitimate interests (security, fraud prevention)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
              <p className="text-gray-700 mb-4">We implement robust security measures:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Passwords are hashed with bcrypt (never stored in plain text)</li>
                <li>JWT tokens with 15-minute expiration + refresh token rotation</li>
                <li>HTTPS/TLS for all data in transit</li>
                <li>Logs are sanitized to prevent credential exposure</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Privacy Rights (LOPD/GDPR)</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>Right of Access (Article 15):</strong> You can request a copy of all your personal data.
                  Use <code className="bg-gray-100 px-2 py-1 rounded">GET /api/users/me/export</code> to download
                  your data as JSON.
                </p>

                <p>
                  <strong>Right to be Forgotten (Article 17):</strong> You can request deletion of your account and
                  associated data. Use <code className="bg-gray-100 px-2 py-1 rounded">DELETE /api/users/me</code>.
                  Transactions will be anonymized to preserve blockchain integrity.
                </p>

                <p>
                  <strong>Right to Rectification (Article 16):</strong> You can update your profile information via
                  your account settings.
                </p>

                <p>
                  <strong>Right to Data Portability (Article 20):</strong> Your data is provided in structured,
                  machine-readable format (JSON) for easy transfer to other services.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Consent Management</h2>
              <p className="text-gray-700">
                Your consent to this Privacy Policy is recorded at signup with timestamp, IP address, and browser
                information for audit purposes. This ensures we can prove compliance with LOPD/GDPR Article 7.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention</h2>
              <p className="text-gray-700">
                We retain your personal data only for as long as necessary to provide the Service. After account
                deletion, data is anonymized but transaction records are preserved for blockchain integrity and
                regulatory compliance. Logs are retained for 90 days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Links to Other Sites</h2>
              <p className="text-gray-700">
                This Service may contain links to other sites that are not operated by us. If you click on a
                third-party link, you will be directed to that third party's site. We strongly advise you to
                review the Privacy Policy of every site you visit.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to This Privacy Policy</h2>
              <p className="text-gray-700">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting
                the new Privacy Policy on this page and updating the "Last updated" date at the top.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="text-gray-700 font-medium mt-2">support@pay2peer.dev</p>
            </section>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/signup"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors"
          >
            Back to Signup
          </Link>
        </div>
      </main>
    </div>
  )
}
