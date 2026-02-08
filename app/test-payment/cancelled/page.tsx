import Link from 'next/link';

export default function CancelledPage() {
  return (
    <main className="min-h-screen bg-cloud-dancer flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-8 max-w-md w-full text-center shadow-lg">
        {/* Cancelled Icon */}
        <div className="text-7xl mb-4">⚠️</div>

        {/* Heading */}
        <h1 className="text-3xl font-spartan font-bold text-text-dark mb-3">
          Payment Cancelled
        </h1>

        {/* Message */}
        <p className="text-text-dark/70 mb-6">
          You cancelled the payment. No charges were made.
        </p>

        {/* Action buttons */}
        <div className="space-y-3">
          <Link
            href="/test-payment"
            className="block bg-yellow-accent text-text-dark px-8 py-3 rounded-lg font-medium hover:-translate-y-0.5 hover:shadow-lg transition-all"
          >
            Try Again
          </Link>

          <Link
            href="/"
            className="block text-text-dark/60 hover:text-text-dark transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
