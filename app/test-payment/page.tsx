'use client';

import { useState } from 'react';

export default function TestPaymentPage() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    // Validate name
    if (!name || name.trim().length < 2) {
      setError('Please enter your name (at least 2 characters)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Call API to create payment
      const response = await fetch('/api/create-test-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create payment');
      }

      const { checkoutUrl } = await response.json();

      // Redirect to Yoco checkout
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-cloud-dancer flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-lg">
        {/* Header */}
        <h1 className="font-spartan font-bold text-3xl text-text-dark text-center mb-2">
          WCS Cape Town
        </h1>
        <p className="text-center text-text-dark/70 mb-8">
          Payment Test
        </p>

        {/* Divider */}
        <div className="h-1 bg-yellow-accent rounded-full mb-8" />

        {/* Description */}
        <p className="text-text-dark/80 mb-6 text-center">
          Test the Yoco payment integration
        </p>

        {/* Form */}
        <div className="space-y-6">
          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-dark mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 rounded-lg border-2 border-text-dark/10 focus:border-yellow-accent focus:outline-none transition-colors bg-cloud-dancer"
              disabled={loading}
            />
          </div>

          {/* Amount Display */}
          <div className="text-center">
            <p className="text-lg text-text-dark/70">Amount:</p>
            <p className="text-3xl font-spartan font-bold text-text-dark">R20.00</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Pay Button */}
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-yellow-accent text-text-dark px-8 py-4 rounded-lg font-semibold text-lg hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Pay R20.00'
            )}
          </button>
        </div>

        {/* Test Card Info */}
        <div className="mt-8 p-4 bg-cloud-dancer rounded-lg">
          <p className="text-sm text-text-dark/70 text-center mb-2">
            This is a test payment. Use the test card:
          </p>
          <p className="text-center font-mono text-lg text-text-dark font-semibold">
            4242 4242 4242 4242
          </p>
          <p className="text-xs text-text-dark/60 text-center mt-2">
            Any future expiry date • Any 3-digit CVV
          </p>
        </div>
      </div>
    </main>
  );
}
