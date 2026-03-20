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

function normalizeRole(role: string): string {
  const raw = String(role ?? '').trim().toUpperCase();
  if (raw === 'L' || raw === 'LEAD') return 'Lead';
  if (raw === 'F' || raw === 'FOLLOW') return 'Follow';
  return role || 'Unknown';
}

export default function WeekenderSelfCheckInClient() {
  const [email, setEmail] = useState('');
  const [lookup, setLookup] = useState<LookupResponse | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  async function loadRegistration() {
    setError('');
    setInfo('');
    setLookup(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email address first.');
      return;
    }

    setLookupLoading(true);
    try {
      const response = await fetch('/api/weekender/check-in/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
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
      const response = await fetch('/api/weekender/check-in/self-check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: lookup.member.email || email.trim(),
          registrationId: lookup.registration.registrationId,
        }),
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
              Enter your email address to load your registration details, then check in.
            </p>
          </div>
        </section>

        <section className="px-[5%] py-12">
          <div className="max-w-3xl mx-auto bg-white rounded-xl p-6 md:p-8 shadow-sm border border-text-dark/10">
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-text-dark/10 focus:border-yellow-accent focus:outline-none"
              />
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
