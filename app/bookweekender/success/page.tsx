'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from "@/components/Header";
import Link from 'next/link';

export default function BookWeekenderSuccess() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('ref');
  const sessionId = searchParams.get('session');

  useEffect(() => {
    // Log payment complete event
    if (sessionId) {
      fetch('/api/weekender/payment-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, reference })
      }).catch(console.error);
    }
  }, [sessionId, reference]);

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
            You&apos;re In! 🎉
          </h1>
          
          <p className="text-text-dark/70 mb-6">
            Your registration for the WCS Cape Town Weekender is confirmed.
          </p>

          <div className="bg-cloud-dancer rounded-lg p-4 mb-6">
            <p className="text-sm text-text-dark/60 mb-1">Reference</p>
            <p className="font-mono text-sm font-semibold">{reference || 'N/A'}</p>
          </div>

          <div className="text-left bg-yellow-accent/10 rounded-lg p-4 mb-6">
            <p className="font-semibold mb-2">What&apos;s next?</p>
            <ul className="text-sm text-text-dark/80 space-y-1">
              <li>• You&apos;ll receive a confirmation email shortly</li>
              <li>• Save the date: March 20–22, 2026</li>
              <li>• Check the website for any schedule and venue updates </li>
            </ul>
          </div>

          <Link
            href="/weekender"
            className="inline-block w-full bg-yellow-accent text-text-dark px-8 py-4 rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all"
          >
            Back to Weekender Info
          </Link>
        </div>
      </main>
    </>
  );
}
