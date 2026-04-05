'use client';

import { useState } from 'react';
import Header from '@/components/Header';

type SpotlightMode = 'single' | 'couple';

const PRICES = {
  spin: 200,
  spot: 125,
  spotCouple: 250,
  tshirt: 180,
};

export default function AddonPay() {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');

  const [spinSelected, setSpinSelected] = useState(false);
  const [spotSelected, setSpotSelected] = useState(false);
  const [spotMode, setSpotMode] = useState<SpotlightMode>('single');
  const [tshirtSelected, setTshirtSelected] = useState(false);
  const [tshirtQty, setTshirtQty] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculate running total
  const total =
    (spinSelected ? PRICES.spin : 0) +
    (spotSelected ? (spotMode === 'couple' ? PRICES.spotCouple : PRICES.spot) : 0) +
    (tshirtSelected ? PRICES.tshirt * tshirtQty : 0);

  const hasSelection = spinSelected || spotSelected || tshirtSelected;

  const handleSubmit = async () => {
    if (!name.trim() || !surname.trim()) {
      setError('Please enter your name and surname.');
      return;
    }
    if (!hasSelection) {
      setError('Please select at least one item.');
      return;
    }

    setLoading(true);
    setError('');

    const items: { type: string; couple?: boolean; quantity?: number }[] = [];
    if (spinSelected) items.push({ type: 'spin' });
    if (spotSelected) items.push({ type: 'spot', couple: spotMode === 'couple' });
    if (tshirtSelected) items.push({ type: 'tshirt', quantity: tshirtQty });

    try {
      const response = await fetch('/api/addon-pay/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          surname: surname.trim(),
          items,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong.');
      }

      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cloud-dancer">
        <section className="bg-black text-white py-12">
          <div className="px-[5%] text-center">
            <h1 className="font-spartan font-semibold text-[28px] md:text-[40px] mb-2">
              Weekender Add-On Payments
            </h1>
            <p className="text-lg text-white/80">
              Pay for outstanding add-ons from the weekender
            </p>
          </div>
        </section>

        <section className="px-[5%] py-12">
          <div className="max-w-lg mx-auto">
            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Name & Surname */}
            <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
              <h2 className="font-spartan font-semibold text-xl mb-4">Your Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-text-dark/10 focus:border-yellow-accent focus:outline-none"
                    placeholder="Your first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Surname</label>
                  <input
                    type="text"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-text-dark/10 focus:border-yellow-accent focus:outline-none"
                    placeholder="Your surname"
                  />
                </div>
              </div>
            </div>

            {/* Add-on Selection - Poll Style */}
            <div className="mb-6">
              <h2 className="font-spartan font-semibold text-xl mb-2">Select items to pay for</h2>
              <p className="text-sm text-text-dark/70 mb-4">(You can choose more than one)</p>

              <div className="space-y-4">
                {/* Spinning Intensive */}
                <label
                  className={`
                    block border-[3px] rounded-xl p-6 cursor-pointer transition-all duration-250
                    ${
                      spinSelected
                        ? 'bg-yellow-accent/20 border-yellow-accent text-text-dark'
                        : 'bg-white border-gray-200 hover:border-yellow-accent hover:-translate-y-1 hover:shadow-lg hover:shadow-yellow-accent/20'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={spinSelected}
                    onChange={() => setSpinSelected(!spinSelected)}
                    className="hidden"
                  />
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-lg">Spinning Intensive</span>
                    <span className="font-bold">R{PRICES.spin}</span>
                  </div>
                  <p className="text-sm text-text-dark/60 mt-1">Per person</p>
                </label>

                {/* Spotlight Critique */}
                <div>
                  <label
                    className={`
                      block border-[3px] rounded-xl p-6 cursor-pointer transition-all duration-250
                      ${
                        spotSelected
                          ? 'bg-yellow-accent/20 border-yellow-accent text-text-dark'
                          : 'bg-white border-gray-200 hover:border-yellow-accent hover:-translate-y-1 hover:shadow-lg hover:shadow-yellow-accent/20'
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={spotSelected}
                      onChange={() => setSpotSelected(!spotSelected)}
                      className="hidden"
                    />
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-lg">Spotlight Critique</span>
                      <span className="font-bold">
                        R{spotMode === 'couple' ? PRICES.spotCouple : PRICES.spot}
                      </span>
                    </div>
                    <p className="text-sm text-text-dark/60 mt-1">R{PRICES.spot} per person</p>
                  </label>

                  {/* Couple option - shown when spotlight is selected */}
                  {spotSelected && (
                    <div className="mt-2 ml-4 p-4 bg-white rounded-lg border-2 border-text-dark/10">
                      <p className="text-sm font-medium mb-3">Who are you paying for?</p>
                      <div className="space-y-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="spot-mode"
                            checked={spotMode === 'single'}
                            onChange={() => setSpotMode('single')}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">Just me — R{PRICES.spot}</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="spot-mode"
                            checked={spotMode === 'couple'}
                            onChange={() => setSpotMode('couple')}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">Me + my partner — R{PRICES.spotCouple}</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* T-Shirt */}
                <div>
                  <label
                    className={`
                      block border-[3px] rounded-xl p-6 cursor-pointer transition-all duration-250
                      ${
                        tshirtSelected
                          ? 'bg-yellow-accent/20 border-yellow-accent text-text-dark'
                          : 'bg-white border-gray-200 hover:border-yellow-accent hover:-translate-y-1 hover:shadow-lg hover:shadow-yellow-accent/20'
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={tshirtSelected}
                      onChange={() => setTshirtSelected(!tshirtSelected)}
                      className="hidden"
                    />
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-lg">T-Shirt</span>
                      <span className="font-bold">R{PRICES.tshirt * tshirtQty}</span>
                    </div>
                    <p className="text-sm text-text-dark/60 mt-1">R{PRICES.tshirt} each</p>
                  </label>

                  {/* Quantity selector - shown when tshirt is selected */}
                  {tshirtSelected && (
                    <div className="mt-2 ml-4 p-4 bg-white rounded-lg border-2 border-text-dark/10">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">Quantity:</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setTshirtQty(Math.max(1, tshirtQty - 1))}
                            className="w-8 h-8 rounded-lg bg-cloud-dancer border border-text-dark/10 flex items-center justify-center font-bold text-lg hover:bg-yellow-accent/20 transition-colors"
                          >
                            −
                          </button>
                          <span className="w-8 text-center font-semibold">{tshirtQty}</span>
                          <button
                            type="button"
                            onClick={() => setTshirtQty(tshirtQty + 1)}
                            className="w-8 h-8 rounded-lg bg-cloud-dancer border border-text-dark/10 flex items-center justify-center font-bold text-lg hover:bg-yellow-accent/20 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Total & Pay Button */}
            {hasSelection && (
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-lg">Total</span>
                  <span className="text-2xl font-bold">R{total.toLocaleString()}</span>
                </div>

                {/* Summary */}
                <div className="text-sm text-text-dark/70 mb-4 space-y-1">
                  {spinSelected && (
                    <div className="flex justify-between">
                      <span>Spinning Intensive</span>
                      <span>R{PRICES.spin}</span>
                    </div>
                  )}
                  {spotSelected && (
                    <div className="flex justify-between">
                      <span>
                        Spotlight Critique{spotMode === 'couple' ? ' (couple)' : ''}
                      </span>
                      <span>R{spotMode === 'couple' ? PRICES.spotCouple : PRICES.spot}</span>
                    </div>
                  )}
                  {tshirtSelected && (
                    <div className="flex justify-between">
                      <span>T-Shirt × {tshirtQty}</span>
                      <span>R{(PRICES.tshirt * tshirtQty).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-yellow-accent text-text-dark px-8 py-4 rounded-lg font-semibold text-lg hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Setting up payment...' : 'Go to Payment'}
                </button>
              </div>
            )}

            {/* Contact */}
            <div className="mt-6 text-center">
              <p className="text-sm text-text-dark/60">
                Questions? Email{' '}
                <a
                  href="mailto:weekender@wcscapetown.co.za"
                  className="text-pink-accent hover:text-yellow-accent underline"
                >
                  weekender@wcscapetown.co.za
                </a>
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
