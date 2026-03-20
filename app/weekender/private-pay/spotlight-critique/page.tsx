import type { Metadata } from 'next';
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
  return <AddOnPaymentPageClient passType="spotlight_critique" />;
}
