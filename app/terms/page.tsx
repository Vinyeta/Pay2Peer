import Link from "next/link"

export default function TermsOfServicePage() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: March 10, 2026</p>

          <div className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-700">
                By accessing and using the Pay2Peer application, you accept and agree to be bound by and comply with
                these Terms of Service and our Privacy Policy. If you do not agree to abide by these terms, please do
                not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use License</h2>
              <p className="text-gray-700 mb-4">
                Permission is granted to temporarily download one copy of the materials (information or software) on
                Pay2Peer for personal, non-commercial transitory viewing only. This is the grant of a license, not a
                transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to decompile or reverse engineer the software</li>
                <li>Remove any copyright or other proprietary notations</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Account Responsibility</h2>
              <p className="text-gray-700">
                You are responsible for maintaining the confidentiality of your account login credentials and for
                all activities that occur under your account. You agree to notify us immediately if you suspect
                unauthorized access to your account. We are not liable for any loss or damage resulting from
                unauthorized use of your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Transaction Terms</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>Accuracy:</strong> You agree that all information provided for transactions is accurate and
                  current.
                </p>

                <p>
                  <strong>Funds Availability:</strong> You agree not to initiate transaction requests you do not have
                  funds to cover or that would exceed your available balance.
                </p>

                <p>
                  <strong>Irrevocable:</strong> Once a transaction is initiated and recorded on the blockchain, it
                  cannot be reversed. You assume all responsibility for the accuracy of recipient information.
                </p>

                <p>
                  <strong>No Refunds:</strong> Pay2Peer does not provide refunds for transactions made in error. In
                  case of dispute, you must contact the recipient directly.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Blockchain and Immutability</h2>
              <p className="text-gray-700 mb-4">
                Pay2Peer uses a private blockchain with Proof of Authority (PoA) consensus for transaction integrity.
                This means:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>All transactions are permanently recorded and cryptographically signed</li>
                <li>Transactions cannot be modified or deleted once recorded</li>
                <li>The blockchain is immutable and provides non-repudiation</li>
                <li>Only authorized validators can append new blocks</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Payment Processing</h2>
              <p className="text-gray-700">
                Payments are processed through Stripe. By using our payment service, you agree to Stripe's terms and
                conditions. Pay2Peer does not handle credit card data directly — all payments are processed securely by
                Stripe.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Disclaimer of Warranties</h2>
              <p className="text-gray-700">
                The materials on Pay2Peer are provided on an 'as is' basis. Pay2Peer makes no warranties, expressed
                or implied, and hereby disclaims and negates all other warranties including, without limitation,
                implied warranties or conditions of merchantability, fitness for a particular purpose, or
                non-infringement of intellectual property.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-700">
                In no event shall Pay2Peer, Inc., or any of its suppliers, be liable for any damages (including,
                without limitation, damages for loss of data or profit, or due to business interruption) arising out
                of the use or inability to use the materials on Pay2Peer.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Accuracy of Materials</h2>
              <p className="text-gray-700">
                We do not warrant that the materials on Pay2Peer are accurate, complete, or current. We may make
                changes to the materials contained on this Site at any time without notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Restrictions on Use</h2>
              <p className="text-gray-700 mb-4">You may not:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Engage in illegal activities or send illicit funds</li>
                <li>Use the service for money laundering or sanctions evasion</li>
                <li>Facilitate fraud or impersonation</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Interfere with or disrupt the normal operation of the service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Termination</h2>
              <p className="text-gray-700">
                We may terminate or suspend your account and access to the Service immediately, without prior notice
                or liability, for any reason whatsoever, including if you breach these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Modifications to Terms</h2>
              <p className="text-gray-700">
                Pay2Peer may revise these terms at any time without notice. By using this Site, you are agreeing to be
                bound by the then current version of these terms and conditions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Information</h2>
              <p className="text-gray-700">
                If you have any questions about these Terms of Service, please contact us at:
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
