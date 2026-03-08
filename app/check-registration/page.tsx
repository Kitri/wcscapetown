'use client';

import { FormEvent, Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';

type RegistrationResult = {
  orderId: string;
  name: string;
  surname: string;
  email: string;
  role: string;
  level: number;
  passType: string;
  registrationType: string;
  createdAt: string;
  statusLabel: string;
  statusMessage: string;
  registrationLabel: string;
  eventDate: string;
  venueName: string;
  venueAddress: string;
  venueMapUrl: string;
  details: string[];
  shoeTips: string[];
  shoeOptions: string[];
};

function getVenueEmbedUrl(venueName: string, venueAddress: string, venueMapUrl: string) {
  if (venueMapUrl.includes('/maps/embed')) {
    return venueMapUrl;
  }

  const query = encodeURIComponent(venueAddress || venueName);
  return `https://www.google.com/maps?q=${query}&output=embed`;
}

function CheckRegistrationContent() {
  const searchParams = useSearchParams();
  const source = (searchParams.get('source') || '').toLowerCase();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<RegistrationResult[]>([]);
  const [searched, setSearched] = useState(false);

  const sourceHelp = useMemo(() => {
    if (source === 'weekender') {
      return {
        placeholder: 'e.g. you@email.com or WKN-2026-123456',
        prefixHint: 'Weekender order numbers usually start with WKN.',
      };
    }
    return {
      placeholder: 'e.g. you@email.com or your order number',
      prefixHint: '',
    };
  }, [source]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const value = query.trim();
    if (!value) {
      setError('Please enter your email address or order number.');
      return;
    }

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const response = await fetch('/api/registrations/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: value, source }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to check registration right now.');
      }
      setResults(data.registrations || []);
    } catch (err) {
      setResults([]);
      setError(err instanceof Error ? err.message : 'Unable to check registration right now.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cloud-dancer">
        <section className="bg-black text-white py-12">
          <div className="px-[5%] text-center">
            <h1 className="font-spartan font-semibold text-[28px] md:text-[40px] mb-2">
              Check My Registration
            </h1>
            <p className="text-lg text-white/80">
              Enter your email address or order number
            </p>
          </div>
        </section>

        <section className="px-[5%] py-10">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-text-dark/10">
              <label className="block text-sm font-medium mb-2">Email address or order number</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={sourceHelp.placeholder}
                  className="flex-1 px-4 py-3 rounded-lg border-2 border-text-dark/10 focus:border-yellow-accent focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-yellow-accent text-text-dark px-6 py-3 rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Checking...' : 'Check'}
                </button>
              </div>
              <p className="text-xs text-text-dark/60 mt-3">
                Use the same email address or order number you used when booking.
              </p>
              {sourceHelp.prefixHint && (
                <p className="text-xs text-text-dark/60 mt-1">
                  {sourceHelp.prefixHint}
                </p>
              )}
            </form>

            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {searched && !loading && !error && results.length === 0 && (
              <div className="mt-6 bg-white rounded-xl p-6 border border-text-dark/10">
                <p className="text-text-dark/80">
                  No registrations found for that lookup.
                </p>
                <p className="text-sm text-text-dark/60 mt-2">
                  Something wrong? Email{' '}
                  <a href="mailto:community@wcscapetown.co.za" className="text-pink-accent hover:text-yellow-accent underline">
                    community@wcscapetown.co.za
                  </a>
                  .
                </p>
              </div>
            )}

            <div className="mt-6 space-y-4">
              {results.map((item, index) => (
                <div key={`${item.orderId}-${index}`} className="bg-white rounded-xl p-6 border border-text-dark/10 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <h2 className="font-spartan font-semibold text-xl">{item.registrationLabel}</h2>
                      <p className="text-sm text-text-dark/80 mt-1">
                        Date: {item.eventDate}
                      </p>
                      <p className="text-sm text-text-dark/70 mt-1">
                        {item.name} {item.surname}
                      </p>
                      <p className="text-sm text-text-dark/60 mt-1">Order number: <span className="font-mono">{item.orderId}</span></p>
                    </div>
                    <div className="text-left md:text-right">
                      <span className="inline-block bg-yellow-accent/20 text-text-dark text-xs font-semibold px-3 py-1 rounded-full border border-yellow-accent/40">
                        {item.statusLabel}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-text-dark/80 mt-4">{item.statusMessage}</p>

                  <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                    <div className="rounded-lg border border-text-dark/10 bg-cloud-dancer/50 p-4">
                      <p className="font-semibold text-sm mb-1">Venue</p>
                      <p className="text-sm font-medium">{item.venueName}</p>
                      {item.venueAddress && item.venueAddress !== item.venueName && (
                        <p className="text-sm text-text-dark/70">{item.venueAddress}</p>
                      )}
                      <a
                        href={item.venueMapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 text-sm text-pink-accent hover:text-yellow-accent underline"
                      >
                        Open map
                      </a>
                      <div className="hidden md:block mt-3 overflow-hidden rounded-lg border border-text-dark/10 bg-white">
                        <iframe
                          title={`${item.venueName} map`}
                          src={getVenueEmbedUrl(item.venueName, item.venueAddress, item.venueMapUrl)}
                          className="w-full h-44"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          allowFullScreen
                        />
                      </div>
                    </div>

                    <div className="rounded-lg border border-text-dark/10 bg-cloud-dancer/50 p-4">
                      <p className="font-semibold text-sm mb-2">Helpful details</p>
                      <ul className="space-y-2">
                        {item.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-start gap-2 text-sm text-text-dark/85">
                            <span className="mt-0.5 text-pink-accent">•</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {(item.shoeTips.length > 0 || item.shoeOptions.length > 0) && (
                    <div className="mt-4 rounded-lg border border-text-dark/10 bg-white p-4">
                      <p className="font-semibold text-sm mb-2">Shoe tips</p>
                      <div className="space-y-2 text-sm text-text-dark/85">
                        {item.shoeTips.map((tip, tipIndex) => (
                          <p key={tipIndex}>{tip}</p>
                        ))}
                      </div>
                      {item.shoeOptions.length > 0 && (
                        <ul className="mt-3 space-y-1 text-sm text-text-dark/85">
                          {item.shoeOptions.map((option, optionIndex) => (
                            <li key={optionIndex} className="flex items-start gap-2">
                              <span className="mt-0.5 text-pink-accent">-</span>
                              <span>{option}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  <p className="text-sm text-text-dark/60 mt-4">
                    Something wrong? Email{' '}
                    <a href="mailto:community@wcscapetown.co.za" className="text-pink-accent hover:text-yellow-accent underline">
                      community@wcscapetown.co.za
                    </a>
                    .
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default function CheckRegistrationPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-cloud-dancer" />}>
      <CheckRegistrationContent />
    </Suspense>
  );
}
