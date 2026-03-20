import type { Metadata } from 'next';
import { Suspense } from 'react';
import AddOnPaymentPageClient from '../_components/AddOnPaymentPageClient';

export const metadata: Metadata = {
  title: 'Spinning Intensive Payment | WCS Cape Town',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function SpinningIntensivePaymentPage() {
  return (
    <Suspense fallback={null}>
      <AddOnPaymentPageClient passType="spinning_intensive" />
    </Suspense>
  );
}
