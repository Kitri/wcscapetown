'use client';

import { Suspense } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';

function CancelledContent() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-cloud-dancer flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-lg text-center">
          <div className="w-16 h-16 bg-yellow-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h1 className="font-spartan font-bold text-2xl text-text-dark mb-2">
            Payment Cancelled
          </h1>

          <p className="text-text-dark/70 mb-4">
            Your payment was cancelled. No charges were made.
          </p>

          <p className="text-sm text-text-dark/60 mb-8">
            Changed your mind or ran into an issue? You can try again — your spot isn&apos;t reserved until payment is complete.
          </p>

          <Link
            href="/swingstrong"
            className="inline-block w-full bg-purple-accent text-white px-8 py-4 rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all"
          >
            Back to Registration
          </Link>
        </div>
      </main>
    </>
  );
}

export default function SwingStrongCancelled() {
  return (
    <Suspense fallback={
      <>
        <Header />
        <main className="min-h-screen bg-cloud-dancer flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-purple-accent border-t-transparent rounded-full" />
        </main>
      </>
    }>
      <CancelledContent />
    </Suspense>
  );
}
