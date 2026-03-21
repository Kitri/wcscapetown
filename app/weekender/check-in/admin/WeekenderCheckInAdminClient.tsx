'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { WEEKENDER_COLOUR_OPTIONS } from '@/lib/weekenderColourOptions';

type AdminListItem = {
  checkInEntryId: number | null;
  memberId: number;
  registrationId: number;
  name: string;
  surname: string;
  email: string;
  role: string;
  level: number;
  registrationType: string;
  passType: string;
  weekendDay: string | null;
  partyAddOn: boolean;
  spinningAddOn: boolean;
  spotlightAddOn: boolean;
  colour: string | null;
  checkedIn: boolean;
  updatedAt: string | null;
};

type PartyAdminListItem = {
  partyCheckInEntryId: number | null;
  memberId: number;
  registrationId: number;
  name: string;
  surname: string;
  email: string;
  role: string;
  level: number;
  registrationType: string;
  passType: string;
  partyAccessType: 'party_pass' | 'day_pass_add_on';
  checkedIn: boolean;
  updatedAt: string | null;
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

function partyAccessLabel(accessType: PartyAdminListItem['partyAccessType']): string {
  if (accessType === 'party_pass') return 'Party Pass';
  return 'Day Pass + Friday Party Add-on';
}

const KNOWN_WEEKENDER_COLOUR_VALUES = new Set(
  WEEKENDER_COLOUR_OPTIONS.map((option) => option.value)
);

export default function WeekenderCheckInAdminClient({ initialAuthed }: { initialAuthed: boolean }) {
  const [authed, setAuthed] = useState(initialAuthed);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [listQuery, setListQuery] = useState('');
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState('');
  const [listItems, setListItems] = useState<AdminListItem[]>([]);
  const [colourDrafts, setColourDrafts] = useState<Record<number, string>>({});
  const [savingColourId, setSavingColourId] = useState<number | null>(null);
  const [checkingInRegistrationId, setCheckingInRegistrationId] = useState<number | null>(null);
  const [partyListQuery, setPartyListQuery] = useState('');
  const [partyListLoading, setPartyListLoading] = useState(false);
  const [partyListError, setPartyListError] = useState('');
  const [partyListItems, setPartyListItems] = useState<PartyAdminListItem[]>([]);
  const [checkingInPartyRegistrationId, setCheckingInPartyRegistrationId] = useState<number | null>(null);

  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const checkedInCount = useMemo(
    () => listItems.filter((item) => item.checkedIn).length,
    [listItems]
  );
  const partyCheckedInCount = useMemo(
    () => partyListItems.filter((item) => item.checkedIn).length,
    [partyListItems]
  );


  async function login() {
    setAuthError('');
    setAuthLoading(true);
    try {
      const response = await fetch('/api/check-in/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });

      if (!response.ok) {
        throw new Error('Incorrect passcode.');
      }

      setAuthed(true);
      setPasscode('');
    } catch (loginError) {
      setAuthError(loginError instanceof Error ? loginError.message : 'Login failed.');
    } finally {
      setAuthLoading(false);
    }
  }

  async function logout() {
    try {
      await fetch('/api/check-in/logout', { method: 'POST' });
    } catch {
      // ignore logout error
    }

    setAuthed(false);
    setPasscode('');
    setListItems([]);
    setPartyListItems([]);
    setColourDrafts({});
    setInfo('');
    setError('');
  }

  const loadList = useCallback(async (query: string) => {
    setListError('');
    setListLoading(true);
    try {
      const response = await fetch(
        `/api/weekender/check-in/admin/list?q=${encodeURIComponent(query)}`
      );
      const data = (await response.json()) as { items?: AdminListItem[]; error?: string };
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load check-in list.');
      }

      const items = data.items ?? [];
      setListItems(items);
      setColourDrafts(
        items.reduce<Record<number, string>>((acc, item) => {
          acc[item.registrationId] = item.colour || '';
          return acc;
        }, {})
      );
    } catch (listLoadError) {
      setListError(listLoadError instanceof Error ? listLoadError.message : 'Failed to load check-in list.');
    } finally {
      setListLoading(false);
    }
  }, []);

  const loadPartyList = useCallback(async (query: string) => {
    setPartyListError('');
    setPartyListLoading(true);
    try {
      const response = await fetch(
        `/api/weekender/check-in/admin/party/list?q=${encodeURIComponent(query)}`
      );
      const data = (await response.json()) as { items?: PartyAdminListItem[]; error?: string };
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load Friday party check-in list.');
      }
      setPartyListItems(data.items ?? []);
    } catch (partyListLoadError) {
      setPartyListError(
        partyListLoadError instanceof Error
          ? partyListLoadError.message
          : 'Failed to load Friday party check-in list.'
      );
    } finally {
      setPartyListLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authed) return;
    void loadList('');
    void loadPartyList('');
  }, [authed, loadList, loadPartyList]);
  async function checkInFromList(item: AdminListItem) {
    setError('');
    setInfo('');
    if (item.checkedIn) {
      setInfo('Member is already checked in.');
      return;
    }

    setCheckingInRegistrationId(item.registrationId);
    try {
      const response = await fetch('/api/weekender/check-in/admin/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: item.registrationId,
          email: item.email,
          ...(typeof colourDrafts[item.registrationId] === 'string'
            ? { colour: colourDrafts[item.registrationId] }
            : {}),
        }),
      });
      const data = (await response.json()) as ActionResponse;
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to check in member.');
      }
      setInfo(data.message || 'Member checked in successfully.');
      await loadList(listQuery.trim());
    } catch (checkInError) {
      setError(checkInError instanceof Error ? checkInError.message : 'Failed to check in member.');
    } finally {
      setCheckingInRegistrationId(null);
    }
  }

  async function checkInPartyFromList(item: PartyAdminListItem) {
    setError('');
    setInfo('');
    if (item.checkedIn) {
      setInfo('Member is already checked in for Friday party.');
      return;
    }

    setCheckingInPartyRegistrationId(item.registrationId);
    try {
      const response = await fetch('/api/weekender/check-in/admin/party/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: item.registrationId,
        }),
      });
      const data = (await response.json()) as ActionResponse;
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to check in member for Friday party.');
      }
      setInfo(data.message || 'Member checked in for Friday party.');
      await loadPartyList(partyListQuery.trim());
    } catch (checkInError) {
      setError(
        checkInError instanceof Error
          ? checkInError.message
          : 'Failed to check in member for Friday party.'
      );
    } finally {
      setCheckingInPartyRegistrationId(null);
    }
  }

  async function saveColour(item: AdminListItem) {
    setError('');
    setInfo('');
    if (!item.checkInEntryId) {
      setError('Check in this member first before setting a colour.');
      return;
    }

    setSavingColourId(item.checkInEntryId);
    try {
      const response = await fetch('/api/weekender/check-in/admin/update-colour', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entryId: item.checkInEntryId,
          colour: colourDrafts[item.registrationId] ?? '',
        }),
      });
      const data = (await response.json()) as ActionResponse;
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update colour.');
      }

      setInfo('Colour updated.');
      setListItems((prev) =>
        prev.map((entry) =>
          entry.registrationId === item.registrationId
            ? { ...entry, colour: (colourDrafts[item.registrationId] ?? '').trim() || null }
            : entry
        )
      );
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to update colour.');
    } finally {
      setSavingColourId(null);
    }
  }

  if (!authed) {
    return (
      <main className="min-h-screen bg-cloud-dancer flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 shadow-lg max-w-md w-full">
          <h1 className="font-spartan font-semibold text-2xl text-center mb-2">
            Weekender Check-in Admin
          </h1>
          <p className="text-text-dark/70 text-center mb-6">
            Log in to access admin check-in tools.
          </p>

          <label className="block text-sm font-medium text-text-dark mb-1">
            Passcode
          </label>
          <input
            type="password"
            value={passcode}
            onChange={(event) => setPasscode(event.target.value)}
            className="w-full px-4 py-3 rounded-lg border-2 border-text-dark/10 focus:border-yellow-accent focus:outline-none"
          />

          {authError && (
            <p className="mt-3 text-sm text-red-600">{authError}</p>
          )}

          <button
            type="button"
            onClick={login}
            disabled={authLoading || !passcode.trim()}
            className="mt-4 w-full bg-yellow-accent text-text-dark px-6 py-3 rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {authLoading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cloud-dancer">
      <section className="bg-black text-white py-8">
        <div className="px-[5%] flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-spartan font-semibold text-2xl">Weekender Check-in Admin</h1>
            <p className="text-white/80 text-sm">
              Weekender checked in: {checkedInCount} • Friday party checked in: {partyCheckedInCount}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/weekender/check-in"
              className="px-4 py-2 rounded-lg border border-white/40 text-white/90 hover:text-white hover:border-white"
            >
              Self check-in page
            </Link>
            <button
              type="button"
              onClick={logout}
              className="px-4 py-2 rounded-lg border border-white/40 text-white/90 hover:text-white hover:border-white"
            >
              Logout
            </button>
          </div>
        </div>
      </section>

      <section className="px-[5%] py-8 space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-text-dark/10">
          <p className="font-semibold text-text-dark mb-3">Check-in sheets</p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#weekender-checkin-sheet"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-text-dark/20 bg-cloud-dancer/50 text-text-dark font-semibold hover:bg-cloud-dancer transition-colors"
            >
              Weekender sheet
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-text-dark/10">
                {checkedInCount}
              </span>
            </a>
            <a
              href="#friday-party-checkin-sheet"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-yellow-accent bg-yellow-accent/20 text-text-dark font-semibold hover:bg-yellow-accent/30 transition-colors"
            >
              Friday party sheet
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-text-dark/10">
                {partyCheckedInCount}
              </span>
            </a>
          </div>
        </div>

        <div id="weekender-checkin-sheet" className="bg-white rounded-xl p-6 shadow-sm border border-text-dark/10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <p className="font-semibold text-text-dark">Registered members</p>
            <button
              type="button"
              onClick={() => loadList(listQuery.trim())}
              disabled={listLoading}
              className="text-sm underline text-text-dark/70 hover:text-text-dark disabled:opacity-50"
            >
              {listLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 mb-4">
            <input
              type="text"
              value={listQuery}
              onChange={(event) => setListQuery(event.target.value)}
              placeholder="Search by name or email"
              className="w-full px-4 py-3 rounded-lg border-2 border-text-dark/10 focus:border-yellow-accent focus:outline-none"
            />
            <button
              type="button"
              onClick={() => loadList(listQuery.trim())}
              disabled={listLoading}
              className="bg-text-dark/5 text-text-dark px-5 py-3 rounded-lg font-semibold border border-text-dark/10 hover:bg-text-dark/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Search
            </button>
          </div>

          {listError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {listError}
            </div>
          )}

          {!listLoading && listItems.length === 0 && (
            <p className="text-sm text-text-dark/70">No registered members found.</p>
          )}

          <div className="space-y-3">
            {listItems.map((item) => {
              const draftColour = colourDrafts[item.registrationId] ?? '';
              const hasCustomColour =
                Boolean(draftColour) &&
                !KNOWN_WEEKENDER_COLOUR_VALUES.has(draftColour);

              return (
                <div
                  key={item.registrationId}
                  className="rounded-lg border border-text-dark/10 p-4 bg-cloud-dancer/30"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-text-dark">
                        {item.name} {item.surname}
                      </p>
                      <p className="text-sm text-text-dark/70">{item.email}</p>
                      <p className="text-sm text-text-dark/80">
                        {item.passType} • Level {item.level} • {normalizeRole(item.role)}
                      </p>
                      {item.weekendDay && (
                        <p className="text-sm text-text-dark/70">Day: {item.weekendDay}</p>
                      )}
                      <p className="text-sm text-text-dark/80">
                        <span className="font-semibold">Checked in:</span> {item.checkedIn ? 'Yes' : 'No'}
                      </p>
                    </div>

                    <div className="min-w-[220px]">
                      <button
                        type="button"
                        onClick={() => checkInFromList(item)}
                        disabled={checkingInRegistrationId === item.registrationId || item.checkedIn}
                        className="mb-3 w-full bg-yellow-accent text-text-dark px-3 py-2 rounded-lg text-sm font-semibold hover:-translate-y-0.5 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {checkingInRegistrationId === item.registrationId
                          ? 'Checking in...'
                          : item.checkedIn
                            ? 'Checked in'
                            : 'Check in'}
                      </button>
                      <label className="block text-xs font-semibold text-text-dark/70 mb-1">
                        Colour
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={draftColour}
                          onChange={(event) =>
                            setColourDrafts((prev) => ({
                              ...prev,
                              [item.registrationId]: event.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 rounded-lg border border-text-dark/20 bg-white focus:border-yellow-accent focus:outline-none"
                        >
                          <option value="">No colour selected</option>
                          {hasCustomColour && (
                            <option value={draftColour}>{draftColour} (existing)</option>
                          )}
                          {WEEKENDER_COLOUR_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.title}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => saveColour(item)}
                          disabled={savingColourId === item.checkInEntryId || !item.checkInEntryId}
                          className="px-3 py-2 rounded-lg border border-text-dark/20 bg-white text-sm font-semibold hover:bg-text-dark/5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {savingColourId === item.checkInEntryId ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div id="friday-party-checkin-sheet" className="bg-white rounded-xl p-6 shadow-sm border border-text-dark/10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <p className="font-semibold text-text-dark">Friday Night Party check-in sheet</p>
            <button
              type="button"
              onClick={() => loadPartyList(partyListQuery.trim())}
              disabled={partyListLoading}
              className="text-sm underline text-text-dark/70 hover:text-text-dark disabled:opacity-50"
            >
              {partyListLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 mb-4">
            <input
              type="text"
              value={partyListQuery}
              onChange={(event) => setPartyListQuery(event.target.value)}
              placeholder="Search by name or email"
              className="w-full px-4 py-3 rounded-lg border-2 border-text-dark/10 focus:border-yellow-accent focus:outline-none"
            />
            <button
              type="button"
              onClick={() => loadPartyList(partyListQuery.trim())}
              disabled={partyListLoading}
              className="bg-text-dark/5 text-text-dark px-5 py-3 rounded-lg font-semibold border border-text-dark/10 hover:bg-text-dark/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Search
            </button>
          </div>

          {partyListError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {partyListError}
            </div>
          )}

          {!partyListLoading && partyListItems.length === 0 && (
            <p className="text-sm text-text-dark/70">No Friday party registrations found.</p>
          )}

          <div className="space-y-3">
            {partyListItems.map((item) => (
              <div
                key={`party-${item.registrationId}`}
                className="rounded-lg border border-text-dark/10 p-4 bg-cloud-dancer/30"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-text-dark">
                      {item.name} {item.surname}
                    </p>
                    <p className="text-sm text-text-dark/70">{item.email}</p>
                    <p className="text-sm text-text-dark/80">
                      {partyAccessLabel(item.partyAccessType)} • Level {item.level} • {normalizeRole(item.role)}
                    </p>
                    <p className="text-sm text-text-dark/80">
                      <span className="font-semibold">Checked in:</span> {item.checkedIn ? 'Yes' : 'No'}
                    </p>
                  </div>

                  <div className="min-w-[220px]">
                    <button
                      type="button"
                      onClick={() => checkInPartyFromList(item)}
                      disabled={checkingInPartyRegistrationId === item.registrationId || item.checkedIn}
                      className="w-full bg-yellow-accent text-text-dark px-3 py-2 rounded-lg text-sm font-semibold hover:-translate-y-0.5 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {checkingInPartyRegistrationId === item.registrationId
                        ? 'Checking in...'
                        : item.checkedIn
                          ? 'Checked in'
                          : 'Check in'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {info && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800">
            {info}
          </div>
        )}
      </section>
    </main>
  );
}
