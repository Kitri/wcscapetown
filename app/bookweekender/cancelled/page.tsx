'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from "@/components/Header";
import Link from 'next/link';

export default function BookWeekenderCancelled() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');

  useEffect(() => {
    // Log payment cancelled event
    if (sessionId) {
      fetch('/api/weekender/payment-cancelled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      }).catch(console.error);
    }
  }, [sessionId]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cloud-dancer flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-lg text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h1 className="font-spartan font-bold text-2xl text-text-dark mb-2">
            Payment Cancelled
          </h1>
          
          <p className="text-text-dark/70 mb-6">
            Your payment was cancelled. No charges were made.
          </p>

          <p className="text-sm text-text-dark/60 mb-6">
            If you changed your mind or encountered an issue, you can try again.
          </p>

          <Link
            href="/bookweekender"
            className="inline-block w-full bg-yellow-accent text-text-dark px-8 py-4 rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all"
          >
            Back to Registration
          </Link>
        </div>
      </main>
    </>
  );
}
