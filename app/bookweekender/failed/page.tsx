import Header from "@/components/Header";
import Link from 'next/link';

export default function BookWeekenderFailed() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-cloud-dancer flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-lg text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <h1 className="font-spartan font-bold text-2xl text-text-dark mb-2">
            Payment Failed
          </h1>
          
          <p className="text-text-dark/70 mb-6">
            Unfortunately, your payment could not be processed.
          </p>

          <div className="text-left bg-red-50 rounded-lg p-4 mb-6 text-sm">
            <p className="font-semibold mb-2">Common reasons:</p>
            <ul className="text-text-dark/70 space-y-1">
              <li>• Insufficient funds</li>
              <li>• Card declined by bank</li>
              <li>• Incorrect card details</li>
              <li>• Network timeout</li>
            </ul>
          </div>

          <p className="text-sm text-text-dark/60 mb-6">
            Please try again with a different card or contact your bank if the issue persists.
          </p>

          <Link
            href="/bookweekender"
            className="inline-block w-full bg-yellow-accent text-text-dark px-8 py-4 rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all mb-4"
          >
            Try Again
          </Link>

          <p className="text-xs text-text-dark/50">
            Need help? Email weekender@wcscapetown.co.za
          </p>
        </div>
      </main>
    </>
  );
}
