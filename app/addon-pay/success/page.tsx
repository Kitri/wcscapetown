'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('ref');

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
            Payment Complete!
          </h1>

          <p className="text-text-dark/70 mb-6">
            Thank you for paying for your weekender add-ons.
          </p>

          {reference && (
            <div className="bg-cloud-dancer rounded-lg p-4 mb-6">
              <p className="text-sm text-text-dark/60 mb-1">Reference</p>
              <p className="font-mono text-sm font-semibold">{reference}</p>
            </div>
          )}

          <p className="text-sm text-text-dark/70 mb-6">
            Questions? Email{' '}
            <a href="mailto:weekender@wcscapetown.co.za" className="text-pink-accent hover:text-yellow-accent underline">
              weekender@wcscapetown.co.za
            </a>
          </p>

          <Link
            href="/weekender"
            className="inline-block w-full bg-yellow-accent text-text-dark px-8 py-4 rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all"
          >
            Back to Weekender
          </Link>
        </div>
      </main>
    </>
  );
}

export default function AddonPaySuccess() {
  return (
    <Suspense fallback={
      <>
        <Header />
        <main className="min-h-screen bg-cloud-dancer flex items-center justify-center p-4">
          <div className="animate-spin h-8 w-8 border-4 border-yellow-accent border-t-transparent rounded-full"></div>
        </main>
      </>
    }>
      <SuccessContent />
    </Suspense>
  );
}
