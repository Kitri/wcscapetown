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
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-lg text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgba(0,180,154,0.15)' }}>
            <svg className="w-8 h-8" style={{ color: '#00B49A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="font-spartan font-bold text-2xl text-text-dark mb-2">
            You&apos;re registered! 🎉
          </h1>

          <p className="text-text-dark/70 mb-6">
            Payment confirmed for <strong>Swing Strong</strong> — 6 September 2026. R350 paid.
          </p>

          <div className="bg-cloud-dancer rounded-lg p-4 mb-6">
            <p className="text-sm text-text-dark/60 mb-1">Order reference</p>
            <p className="font-mono text-sm font-semibold">{reference || 'N/A'}</p>
          </div>

          <div className="text-left rounded-lg p-4 mb-6" style={{ backgroundColor: 'rgba(0,180,154,0.1)' }}>
            <p className="font-semibold mb-2">What to bring on the day</p>
            <ul className="text-sm text-text-dark/80 space-y-1">
              <li>• Comfortable, movement-friendly clothing</li>
              <li>• A yoga mat</li>
              <li>• Socks or bare feet for the mobility section</li>
              <li>• Dance shoes for the second half</li>
            </ul>
          </div>

          <div className="text-left bg-yellow-accent/10 rounded-lg p-4 mb-6">
            <p className="font-semibold mb-2">Event details</p>
            <ul className="text-sm text-text-dark/80 space-y-1">
              <li>📅 Sunday, 6 September 2026</li>
              <li>🕐 11:30 – 15:30</li>
              <li>📍 Pinelands North Primary School Hall, Cape Town</li>
            </ul>
          </div>

          <p className="text-sm text-text-dark/70 mb-6">
            Questions? Email{' '}
            <a href="mailto:hello@wcscapetown.co.za" className="hover:underline" style={{ color: '#00B49A' }}>
              hello@wcscapetown.co.za
            </a>
          </p>

          <Link
            href="/swingstrong"
            className="inline-block w-full text-white px-8 py-4 rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all"
            style={{ backgroundColor: '#00B49A' }}
          >
            Back to Swing Strong
          </Link>
        </div>
      </main>
    </>
  );
}

export default function SwingStrongSuccess() {
  return (
    <Suspense fallback={
      <>
        <Header />
        <main className="min-h-screen bg-cloud-dancer flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-t-transparent rounded-full" style={{ borderColor: '#00B49A', borderTopColor: 'transparent' }} />
        </main>
      </>
    }>
      <SuccessContent />
    </Suspense>
  );
}
