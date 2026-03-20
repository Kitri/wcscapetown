import type { Metadata } from 'next';
import { Suspense } from 'react';
import AddOnPaymentPageClient from '../_components/AddOnPaymentPageClient';

export const metadata: Metadata = {
  title: 'Spotlight Critique Payment | WCS Cape Town',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function SpotlightCritiquePaymentPage() {
  return (
    <Suspense fallback={null}>
      <AddOnPaymentPageClient passType="spotlight_critique" />
    </Suspense>
  );
}
