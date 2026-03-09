import Header from '@/components/Header';
import Link from 'next/link';

export default function WeekenderAddOnsSuccessPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-cloud-dancer flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-lg text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="font-spartan font-bold text-2xl text-text-dark mb-2">
            Add-on request submitted 🎉
          </h1>
          <p className="text-text-dark/70 mb-6">
            We&apos;ve received your booking preferences and will be in touch.
          </p>

          <div className="space-y-3">
            <Link
              href="/weekender/add-ons"
              className="block w-full bg-yellow-accent text-text-dark px-6 py-3 rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-md transition-all"
            >
              Book another add-on
            </Link>
            <Link
              href="/weekender"
              className="block w-full bg-text-dark/5 text-text-dark px-6 py-3 rounded-lg font-semibold border border-text-dark/10 hover:bg-text-dark/10 transition-colors"
            >
              Return to weekender page
            </Link>
            <Link
              href="/check-registration?source=weekender"
              className="block w-full bg-text-dark/5 text-text-dark px-6 py-3 rounded-lg font-semibold border border-text-dark/10 hover:bg-text-dark/10 transition-colors"
            >
              Check my registration
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
