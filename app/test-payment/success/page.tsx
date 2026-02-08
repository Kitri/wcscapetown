import { kv } from '@vercel/kv';
import Link from 'next/link';

interface PaymentData {
  reference: string;
  name: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  paidAt?: string;
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const params = await searchParams;
  const reference = params.ref;

  // Fetch payment details from KV
  let paymentData: PaymentData | null = null;
  if (reference) {
    try {
      paymentData = await kv.get<PaymentData>(`payment:${reference}`);
    } catch (error) {
      console.error('Error fetching payment data:', error);
    }
  }

  return (
    <main className="min-h-screen bg-cloud-dancer flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-8 max-w-md w-full text-center shadow-lg">
        {/* Success Icon */}
        <div className="text-7xl mb-4">✅</div>

        {/* Heading */}
        <h1 className="text-3xl font-spartan font-bold text-text-dark mb-3">
          Payment Successful!
        </h1>

        {/* Details */}
        {paymentData ? (
          <div className="space-y-2 mb-6">
            <p className="text-lg text-text-dark">
              Thank you, <span className="font-semibold">{paymentData.name}</span>!
            </p>
            <p className="text-text-dark/70">
              Amount: R{(paymentData.amount / 100).toFixed(2)}
            </p>
            <p className="text-sm text-text-dark/60">
              Reference: {reference}
            </p>
            <p className="text-sm text-text-dark/60">
              Status: {paymentData.status === 'paid' ? 'Confirmed ✓' : 'Processing...'}
            </p>
          </div>
        ) : (
          <div className="mb-6">
            <p className="text-text-dark/70">
              Reference: {reference || 'Unknown'}
            </p>
            <p className="text-sm text-text-dark/60 mt-2">
              Payment received. Details will be confirmed shortly.
            </p>
          </div>
        )}

        {/* Info box */}
        <div className="bg-yellow-accent/10 rounded-lg p-4 mb-6">
          <p className="text-sm text-text-dark/70">
            This was a test payment. Check your server logs or Vercel KV to see the stored payment data.
          </p>
        </div>

        {/* Back button */}
        <Link
          href="/test-payment"
          className="inline-block bg-yellow-accent text-text-dark px-8 py-3 rounded-lg font-medium hover:-translate-y-0.5 hover:shadow-lg transition-all"
        >
          Test Another Payment
        </Link>
      </div>
    </main>
  );
}
