import type { Metadata } from 'next';
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
  return <AddOnPaymentPageClient passType="spinning_intensive" />;
}
