import Link from 'next/link';

export default function FailedPage() {
  return (
    <main className="min-h-screen bg-cloud-dancer flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-8 max-w-md w-full text-center shadow-lg">
        {/* Failed Icon */}
        <div className="text-7xl mb-4">❌</div>

        {/* Heading */}
        <h1 className="text-3xl font-spartan font-bold text-text-dark mb-3">
          Payment Failed
        </h1>

        {/* Message */}
        <p className="text-text-dark/70 mb-2">
          The payment could not be processed.
        </p>
        <p className="text-sm text-text-dark/60 mb-6">
          This could be due to insufficient funds, an incorrect card number, or a declined transaction.
        </p>

        {/* Action buttons */}
        <div className="space-y-3">
          <Link
            href="/test-payment"
            className="block bg-yellow-accent text-text-dark px-8 py-3 rounded-lg font-medium hover:-translate-y-0.5 hover:shadow-lg transition-all"
          >
            Try Again
          </Link>

          <a
            href="mailto:hello@wcscapetown.co.za"
            className="block text-pink-accent hover:text-pink-accent/80 transition-colors text-sm"
          >
            Need help? Contact us
          </a>
        </div>
      </div>
    </main>
  );
}
