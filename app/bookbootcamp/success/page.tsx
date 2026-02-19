'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import Header from "@/components/Header";
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('ref') || '';
  const sessionId = searchParams.get('session');

  useEffect(() => {
    // Mark registration as complete
    if (sessionId && reference) {
      fetch('/api/weekender/payment-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, reference })
      }).catch(console.error);
    }
  }, [sessionId, reference]);

  return (
    <div className="bg-white rounded-xl p-8 shadow-sm text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="font-spartan font-semibold text-2xl mb-2">Payment Successful!</h2>
      <p className="text-text-dark/70 mb-4">
        Thank you for registering for the bootcamp. You&apos;ll receive a confirmation email shortly.
      </p>
      {reference && (
        <p className="text-sm text-text-dark/60 mb-6">
          Reference: <span className="font-mono font-semibold">{reference}</span>
        </p>
      )}
      <div className="space-y-3">
        <Link
          href="/whats-on#bootcamps"
          className="block w-full bg-yellow-accent text-text-dark px-6 py-3 rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all"
        >
          View Bootcamp Details
        </Link>
        <Link
          href="/"
          className="block w-full text-text-dark/70 hover:text-text-dark underline text-sm"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}

export default function BootcampSuccess() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-cloud-dancer">
        <section className="bg-black text-white py-12">
          <div className="px-[5%] text-center">
            <h1 className="font-spartan font-semibold text-[28px] md:text-[40px] mb-2">
              Booking Confirmed
            </h1>
            <p className="text-lg text-white/80">See you at the bootcamp!</p>
          </div>
        </section>

        <section className="px-[5%] py-12">
          <div className="max-w-md mx-auto">
            <Suspense fallback={<div className="bg-white rounded-xl p-8 shadow-sm text-center">Loading...</div>}>
              <SuccessContent />
            </Suspense>
          </div>
        </section>
      </main>
    </>
  );
}
