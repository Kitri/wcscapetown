'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';

const ACCENT = '#1C8AD1';

function SuccessContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('ref');

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cloud-dancer flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-lg text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgba(28,138,209,0.15)' }}>
            <svg className="w-8 h-8" style={{ color: ACCENT }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="font-spartan font-bold text-2xl text-text-dark mb-2">
            You&apos;re booked! 🎉
          </h1>

          <p className="text-text-dark/70 mb-6">
            Payment confirmed for the <strong>Kristen Wallace Intensive</strong> on 16 December 2026. R250 paid.
          </p>

          <div className="bg-cloud-dancer rounded-lg p-4 mb-6">
            <p className="text-sm text-text-dark/60 mb-1">Order reference</p>
            <p className="font-mono text-sm font-semibold">{reference || 'N/A'}</p>
          </div>

          <div className="text-left rounded-lg p-4 mb-6" style={{ backgroundColor: 'rgba(28,138,209,0.1)' }}>
            <p className="font-semibold mb-2">What to bring</p>
            <ul className="text-sm text-text-dark/80 space-y-1">
              <li>• Dance shoes</li>
              <li>• Comfortable clothes you can move in</li>
              <li>• Water</li>
            </ul>
          </div>

          <div className="text-left bg-yellow-accent/10 rounded-lg p-4 mb-6">
            <p className="font-semibold mb-2">Event details</p>
            <ul className="text-sm text-text-dark/80 space-y-1">
              <li>📅 Wednesday, 16 December 2026</li>
              <li>🕐 15:00 – 17:00</li>
              <li>📍 Pinelands North Primary School, Cape Town</li>
            </ul>
          </div>

          <p className="text-sm text-text-dark/70 mb-6">
            Questions? Email{' '}
            <a href="mailto:hello@wcscapetown.co.za" className="hover:underline" style={{ color: ACCENT }}>
              hello@wcscapetown.co.za
            </a>
          </p>

          <Link
            href="/kristen-intensive"
            className="inline-block w-full text-white px-8 py-4 rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all"
            style={{ backgroundColor: ACCENT }}
          >
            Back to the intensive page
          </Link>
        </div>
      </main>
    </>
  );
}

export default function KristenIntensiveSuccess() {
  return (
    <Suspense fallback={
      <>
        <Header />
        <main className="min-h-screen bg-cloud-dancer flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-t-transparent rounded-full" style={{ borderColor: ACCENT, borderTopColor: 'transparent' }} />
        </main>
      </>
    }>
      <SuccessContent />
    </Suspense>
  );
}
