import Header from "@/components/Header";
import Link from 'next/link';

export default function BootcampCancelled() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-cloud-dancer">
        <section className="bg-black text-white py-12">
          <div className="px-[5%] text-center">
            <h1 className="font-spartan font-semibold text-[28px] md:text-[40px] mb-2">
              Payment Cancelled
            </h1>
          </div>
        </section>

        <section className="px-[5%] py-12">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-sm text-center">
              <div className="w-16 h-16 bg-yellow-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="font-spartan font-semibold text-2xl mb-2">Payment Cancelled</h2>
              <p className="text-text-dark/70 mb-6">
                Your payment was cancelled. No charges were made. You can try again if you&apos;d like to complete your registration.
              </p>
              <div className="space-y-3">
                <Link
                  href="/bookbootcamp"
                  className="block w-full bg-yellow-accent text-text-dark px-6 py-3 rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all"
                >
                  Try Again
                </Link>
                <Link
                  href="/"
                  className="block w-full text-text-dark/70 hover:text-text-dark underline text-sm"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
