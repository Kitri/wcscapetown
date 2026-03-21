'use client';

import { useState } from 'react';
import Header from '@/components/Header';

type LookupResponse = {
  found: boolean;
  message: string;
  member: {
    memberId: number;
    name: string;
    surname: string;
    email: string;
  };
  registration: {
    registrationId: number;
    passType: 'weekend' | 'day' | 'party';
    passTypeLabel: string;
    role: string;
    level: number;
    registrationType: string;
    paymentStatus: string;
    registrationStatus: string;
    weekendDay: string | null;
    partyAddOn: boolean;
    spinningAddOn: boolean;
    spotlightAddOn: boolean;
    canCheckIn: boolean;
  };
  checkIn: {
    exists: boolean;
    id: number | null;
    checkedIn: boolean;
    colour: string | null;
    updatedAt: string | null;
  };
};

type ActionResponse = {
  success: boolean;
  message?: string;
  error?: string;
};
type LookupMode = 'email' | 'name';
const WEEKENDER_COLOUR_OPTIONS: Array<{ title: string; description: string }> = [
  {
    title: 'Blue (Flow)',
    description: 'Smooth, clean movements with a flowy, chill vibe.',
  },
  {
    title: 'Yellow (Joy)',
    description: 'Fun, energetic and playful with a sense of humour.',
  },
  {
    title: 'Red (Bold)',
    description: 'Power movements with strong leverage and connection.',
  },
  {
    title: 'Green (Blend Yellow and Blue)',
    description: 'Graceful elegance meets joyful playfulness.',
  },
  {
    title: 'Purple (Blend Red and Blue)',
    description: 'Controlled power with refined, deliberate technique.',
  },
  {
    title: 'Orange (Blend Red and Yellow)',
    description: 'Explosive energy with powerful, charismatic presence.',
  },
];

function normalizeRole(role: string): string {
  const raw = String(role ?? '').trim().toUpperCase();
  if (raw === 'L' || raw === 'LEAD') return 'Lead';
  if (raw === 'F' || raw === 'FOLLOW') return 'Follow';
  return role || 'Unknown';
}

export default function WeekenderSelfCheckInClient() {
  const [lookupMode, setLookupMode] = useState<LookupMode>('email');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [lookup, setLookup] = useState<LookupResponse | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  function switchLookupMode(mode: LookupMode) {
    setLookupMode(mode);
    setLookup(null);
    setError('');
    setInfo('');
  }

  async function loadRegistration() {
    setError('');
    setInfo('');
    setLookup(null);

    const trimmedEmail = email.trim();
    const trimmedName = name.trim();
    const trimmedSurname = surname.trim();

    if (lookupMode === 'email' && !trimmedEmail) {
      setError('Please enter your email address first.');
      return;
    }
    if (lookupMode === 'name' && (!trimmedName || !trimmedSurname)) {
      setError('Please enter both name and surname first.');
      return;
    }

    const payload = lookupMode === 'name'
      ? { lookupMode: 'name' as const, name: trimmedName, surname: trimmedSurname }
      : { lookupMode: 'email' as const, email: trimmedEmail };

    setLookupLoading(true);
    try {
      const response = await fetch('/api/weekender/check-in/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as LookupResponse & { error?: string };
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load registration details.');
      }

      setLookup(data);
      setInfo(data.message || '');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load registration details.');
    } finally {
      setLookupLoading(false);
    }
  }

  async function checkIn() {
    setError('');
    setInfo('');

    if (!lookup) {
      setError('Please load your registration details first.');
      return;
    }

    if (lookup.checkIn.checkedIn) {
      setInfo('You are already checked in.');
      return;
    }


    setCheckInLoading(true);
    try {
      const payload: {
        registrationId: number;
        email?: string;
        name?: string;
        surname?: string;
      } = {
        registrationId: lookup.registration.registrationId,
      };

      if (lookupMode === 'name') {
        payload.name = lookup.member.name || name.trim();
        payload.surname = lookup.member.surname || surname.trim();
      } else {
        payload.email = lookup.member.email || email.trim();
      }
      const response = await fetch('/api/weekender/check-in/self-check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as ActionResponse;
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to check in.');
      }

      setInfo(data.message || 'Checked in successfully.');
      setLookup((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          registration: {
            ...prev.registration,
            canCheckIn: false,
          },
          checkIn: {
            ...prev.checkIn,
            exists: true,
            checkedIn: true,
            updatedAt: new Date().toISOString(),
          },
        };
      });
    } catch (checkInError) {
      setError(checkInError instanceof Error ? checkInError.message : 'Failed to check in.');
    } finally {
      setCheckInLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cloud-dancer">
        <section className="bg-black text-white py-12">
          <div className="px-[5%] text-center">
            <h1 className="font-spartan font-semibold text-[28px] md:text-[40px] mb-2">
              Weekender Check-in
            </h1>
            <p className="text-lg text-white/80 max-w-3xl mx-auto">
              Use your email address by default. If two people share one email, switch to
              <span className="font-semibold"> use name and surname</span>.
            </p>
          </div>
        </section>

        <section className="px-[5%] py-12">
          <div className="max-w-3xl mx-auto bg-white rounded-xl p-6 md:p-8 shadow-sm border border-text-dark/10">
            <div>
              <p className="block text-sm font-medium text-text-dark mb-2">Lookup option</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => switchLookupMode('email')}
                  className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
                    lookupMode === 'email'
                      ? 'bg-text-dark text-white border-text-dark'
                      : 'bg-white text-text-dark border-text-dark/20 hover:border-text-dark/40'
                  }`}
                >
                  Email (default)
                </button>
                <button
                  type="button"
                  onClick={() => switchLookupMode('name')}
                  className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
                    lookupMode === 'name'
                      ? 'bg-text-dark text-white border-text-dark'
                      : 'bg-white text-text-dark border-text-dark/20 hover:border-text-dark/40'
                  }`}
                >
                  Use name and surname
                </button>
              </div>
            </div>

            {lookupMode === 'email' ? (
              <div className="mt-4">
                <label className="block text-sm font-medium text-text-dark mb-1">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-text-dark/10 focus:border-yellow-accent focus:outline-none"
                />
              </div>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-text-dark/10 focus:border-yellow-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Surname</label>
                  <input
                    type="text"
                    value={surname}
                    onChange={(event) => setSurname(event.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-text-dark/10 focus:border-yellow-accent focus:outline-none"
                  />
                </div>
              </div>
            )}

            <p className="mt-2 text-xs text-text-dark/70">
              Email lookup is the default. Use name and surname if more than one person registered with the same email.
            </p>
            <div className="mt-5 rounded-lg border border-text-dark/10 bg-cloud-dancer/40 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-semibold text-text-dark">Find my colour</p>
                <a
                  href="https://dancer-spectrum-visualizer.replit.app/colour-wheel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-md border border-text-dark/20 bg-white px-3 py-2 text-sm font-medium text-text-dark hover:border-text-dark/40"
                >
                  Open colour wheel
                </a>
              </div>
              <ul className="mt-3 space-y-1.5 text-sm text-text-dark/85">
                {WEEKENDER_COLOUR_OPTIONS.map((option) => (
                  <li key={option.title}>
                    <span className="font-semibold text-text-dark">{option.title}:</span>{' '}
                    {option.description}
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={loadRegistration}
              disabled={lookupLoading}
              className="mt-4 bg-yellow-accent text-text-dark px-5 py-2 rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-md transition-all disabled:opacity-50"
            >
              {lookupLoading ? 'Loading...' : 'Load registration'}
            </button>

            {lookup && (
              <div className="mt-6 rounded-lg border border-text-dark/10 bg-cloud-dancer/40 p-4 space-y-3">
                <div>
                  <p className="font-semibold text-text-dark">Registration details</p>
                  <p className="text-sm text-text-dark/80">
                    {lookup.member.name} {lookup.member.surname}
                  </p>
                  <p className="text-sm text-text-dark/70">
                    {lookup.member.email}
                  </p>
                </div>

                <div className="rounded-lg bg-white border border-text-dark/10 p-3 text-sm text-text-dark/80 space-y-1">
                  <p><span className="font-semibold">Pass:</span> {lookup.registration.passTypeLabel}</p>
                  <p><span className="font-semibold">Role:</span> {normalizeRole(lookup.registration.role)}</p>
                  <p><span className="font-semibold">Level:</span> {lookup.registration.level}</p>
                  <p><span className="font-semibold">Registration type:</span> {lookup.registration.registrationType}</p>
                  {lookup.registration.passType === 'day' && (
                    <p><span className="font-semibold">Day pass details:</span> {lookup.registration.weekendDay || 'Day not specified'}</p>
                  )}
                  {lookup.registration.passType === 'day' && (
                    <p><span className="font-semibold">Party add-on:</span> {lookup.registration.partyAddOn ? 'Yes' : 'No'}</p>
                  )}
                  <p><span className="font-semibold">Spinning add-on:</span> {lookup.registration.spinningAddOn ? 'Yes' : 'No'}</p>
                  <p><span className="font-semibold">Spotlight add-on:</span> {lookup.registration.spotlightAddOn ? 'Yes' : 'No'}</p>
                  <p><span className="font-semibold">Payment status:</span> {lookup.registration.paymentStatus}</p>
                  <p><span className="font-semibold">Registration status:</span> {lookup.registration.registrationStatus}</p>
                  <p><span className="font-semibold">Colour:</span> {lookup.checkIn.colour || 'Not set'}</p>
                  <p>
                    <span className="font-semibold">Check-in status:</span>{' '}
                    {lookup.checkIn.checkedIn ? 'Checked in' : 'Not checked in'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={checkIn}
                  disabled={checkInLoading || lookup.checkIn.checkedIn}
                  className="w-full bg-yellow-accent text-text-dark px-6 py-3 rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkInLoading
                    ? 'Checking in...'
                    : lookup.checkIn.checkedIn
                      ? 'Checked in'
                      : 'Check in'}
                </button>
              </div>
            )}

            {error && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                {error}
              </div>
            )}

            {info && (
              <div className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800">
                {info}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
