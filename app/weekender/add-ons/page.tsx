'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

type BookingType = 'private_lesson' | 'spotlight_critique' | 'advanced_spinning_intensive';
type PrivatePro = 'igor' | 'fernanda' | 'harold' | 'kristen';
type LookupState = 'idle' | 'checking' | 'found' | 'not_found' | 'error';
type Role = 'L' | 'F';

type LookupResponse = {
  found: boolean;
  email?: string;
  role?: Role;
  level?: number;
  passType?: 'weekend' | 'day';
  registrationStatus?: string;
  error?: string;
};

type SlotOption = {
  id: string;
  label: string;
};

type PrivateLessonRequest = {
  preferredSlots: string[];
  lessonCount: number;
};

const PRIVATE_PRO_LABELS: Record<PrivatePro, string> = {
  igor: 'Igor',
  fernanda: 'Fernanda',
  harold: 'Harold',
  kristen: 'Kristen',
};
const ANY_TIME_PRIVATE_SLOT_ID = 'any_time';

const COMMON_PRIVATE_SLOTS: SlotOption[] = [
  {
    id: ANY_TIME_PRIVATE_SLOT_ID,
    label: 'Any time (I’m flexible)',
  },
  {
    id: 'sat_9_11',
    label: 'Saturday 9:00–11:00 at Hellenic Centre',
  },
  {
    id: 'sun_9_11',
    label: 'Sunday 9:00–11:00 at Hellenic Centre',
  },
];

const PRO_SPECIFIC_PRIVATE_SLOTS: Record<PrivatePro, SlotOption[]> = {
  igor: [],
  fernanda: [
    { id: 'mon_9_12_fernanda', label: 'Monday 9:00–12:00 (Pinelands or Plumstead)' },
    { id: 'mon_12_17_fernanda', label: 'Monday 12:00–17:00 (Pinelands or Plumstead)' },
    { id: 'tue_9_12_fernanda', label: 'Tuesday 9:00–12:00 (Pinelands or Plumstead)' },
    { id: 'tue_12_17_fernanda', label: 'Tuesday 12:00–17:00 (Pinelands or Plumstead)' },
  ],
  harold: [
    { id: 'mar17_18_20_harold', label: '17 March 18:00–20:00 (Plumstead)' },
    { id: 'mar18_9_12_harold', label: '18 March 9:00–12:00 (Plumstead)' },
    { id: 'mar18_12_17_harold', label: '18 March 12:00–17:00 (Plumstead)' },
    { id: 'mar18_18_20_harold', label: '18 March 18:00–20:00 (Plumstead)' },
    { id: 'mar19_9_12_harold', label: '19 March 9:00–12:00 (Plumstead)' },
    { id: 'mar19_12_17_harold', label: '19 March 12:00–17:00 (Plumstead)' },
    { id: 'mar23_9_12_harold', label: '23 March 9:00–12:00 (Plumstead)' },
    { id: 'mar23_12_17_harold', label: '23 March 12:00–17:00 (Plumstead)' },
    { id: 'mar24_9_12_harold', label: '24 March 9:00–12:00 (Plumstead)' },
    { id: 'mar24_12_17_harold', label: '24 March 12:00–17:00 (Plumstead)' },
    { id: 'mar24_18_20_harold', label: '24 March 18:00–20:00 (Plumstead)' },
    { id: 'mar25_9_12_harold', label: '25 March 9:00–12:00 (Plumstead)' },
    { id: 'mar25_12_17_harold', label: '25 March 12:00–17:00 (Plumstead)' },
    { id: 'mar25_18_20_harold', label: '25 March 18:00–20:00 (Plumstead)' },
    { id: 'mar26_9_12_harold', label: '26 March 9:00–12:00 (Plumstead)' },
    { id: 'mar26_12_17_harold', label: '26 March 12:00–17:00 (Plumstead)' },
  ],
  kristen: [
    { id: 'mar16_9_12_kristen', label: '16 March 9:00–12:00 (Vredehoek or Plumstead)' },
    { id: 'mar16_12_17_kristen', label: '16 March 12:00–17:00 (Vredehoek or Plumstead)' },
    { id: 'mar17_9_12_kristen', label: '17 March 9:00–12:00 (Vredehoek or Plumstead)' },
    { id: 'mar17_12_17_kristen', label: '17 March 12:00–17:00 (Vredehoek or Plumstead)' },
    { id: 'mar17_18_20_kristen', label: '17 March 18:00–20:00 (Vredehoek or Plumstead)' },
    { id: 'mar18_9_12_kristen', label: '18 March 9:00–12:00 (Vredehoek or Plumstead)' },
    { id: 'mar18_12_17_kristen', label: '18 March 12:00–17:00 (Vredehoek or Plumstead)' },
    { id: 'mar18_18_20_kristen', label: '18 March 18:00–20:00 (Vredehoek or Plumstead)' },
    { id: 'mar19_9_12_kristen', label: '19 March 9:00–12:00 (Vredehoek or Plumstead)' },
    { id: 'mar19_12_17_kristen', label: '19 March 12:00–17:00 (Vredehoek or Plumstead)' },
    { id: 'mar23_9_12_kristen', label: '23 March 9:00–12:00 (Vredehoek or Plumstead)' },
    { id: 'mar23_12_17_kristen', label: '23 March 12:00–17:00 (Vredehoek or Plumstead)' },
    { id: 'mar24_9_12_kristen', label: '24 March 9:00–12:00 (Vredehoek or Plumstead)' },
    { id: 'mar24_12_17_kristen', label: '24 March 12:00–17:00 (Vredehoek or Plumstead)' },
  ],
};

const INITIAL_PRIVATE_LESSON_REQUESTS: Record<PrivatePro, PrivateLessonRequest> = {
  igor: { preferredSlots: [], lessonCount: 1 },
  fernanda: { preferredSlots: [], lessonCount: 1 },
  harold: { preferredSlots: [], lessonCount: 1 },
  kristen: { preferredSlots: [], lessonCount: 1 },
};

export default function WeekenderAddOnsPage() {
  const router = useRouter();
  const [bookingType, setBookingType] = useState<BookingType>('private_lesson');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [lookupState, setLookupState] = useState<LookupState>('idle');
  const [lookupInfo, setLookupInfo] = useState<LookupResponse | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [selectedPrivatePros, setSelectedPrivatePros] = useState<PrivatePro[]>([]);
  const [privateLessonRequests, setPrivateLessonRequests] = useState<Record<PrivatePro, PrivateLessonRequest>>(
    INITIAL_PRIVATE_LESSON_REQUESTS
  );
  const [privateUnavailablePlan, setPrivateUnavailablePlan] = useState('');
  const [privateBookWithPartner, setPrivateBookWithPartner] = useState(false);
  const [privatePartnerName, setPrivatePartnerName] = useState('');
  const [privatePartnerSurname, setPrivatePartnerSurname] = useState('');
  const [spotlightPartnerName, setSpotlightPartnerName] = useState('');
  const [spotlightPartnerSurname, setSpotlightPartnerSurname] = useState('');
  const [spotlightAvailable17, setSpotlightAvailable17] = useState(false);
  const [spotlightAvailable18, setSpotlightAvailable18] = useState(false);
  const [intensiveRole, setIntensiveRole] = useState<Role>('F');
  const [manualLevel, setManualLevel] = useState<1 | 2>(1);


  const hasWeekenderLookup = lookupState === 'found' && lookupInfo?.found;
  const needsManualEmail = lookupState === 'not_found' || lookupState === 'error';
  const needsManualLevel = bookingType === 'advanced_spinning_intensive' && !hasWeekenderLookup;

  const getPrivateSlotOptions = (pro: PrivatePro): SlotOption[] => [
    ...COMMON_PRIVATE_SLOTS,
    ...PRO_SPECIFIC_PRIVATE_SLOTS[pro],
  ];

  const togglePrivatePro = (pro: PrivatePro) => {
    setSelectedPrivatePros((prev) =>
      prev.includes(pro) ? prev.filter((selected) => selected !== pro) : [...prev, pro]
    );
  };

  const togglePrivateSlot = (pro: PrivatePro, slotId: string) => {
    setPrivateLessonRequests((prev) => {
      const currentSlots = prev[pro].preferredSlots;
      let updatedSlots: string[] = [];

      if (slotId === ANY_TIME_PRIVATE_SLOT_ID) {
        updatedSlots = currentSlots.includes(ANY_TIME_PRIVATE_SLOT_ID)
          ? currentSlots.filter((slot) => slot !== ANY_TIME_PRIVATE_SLOT_ID)
          : [ANY_TIME_PRIVATE_SLOT_ID];
      } else {
        updatedSlots = currentSlots.includes(slotId)
          ? currentSlots.filter((slot) => slot !== slotId)
          : [...currentSlots.filter((slot) => slot !== ANY_TIME_PRIVATE_SLOT_ID), slotId];
      }

      return {
        ...prev,
        [pro]: {
          ...prev[pro],
          preferredSlots: updatedSlots,
        },
      };
    });
  };

  const setPrivateLessonCount = (pro: PrivatePro, lessonCount: number) => {
    setPrivateLessonRequests((prev) => ({
      ...prev,
      [pro]: {
        ...prev[pro],
        lessonCount,
      },
    }));
  };

  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get('tab');
    if (tab === 'private_lesson' || tab === 'spotlight_critique' || tab === 'advanced_spinning_intensive') {
      setBookingType(tab);
    }
  }, []);

  async function handleLookup() {
    setError('');
    setLookupInfo(null);

    if (!name.trim() || !surname.trim()) {
      setError('Please enter your name and surname before checking registration.');
      return;
    }

    setLookupState('checking');
    try {
      const response = await fetch('/api/weekender/add-ons/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), surname: surname.trim() }),
      });
      const data = (await response.json()) as LookupResponse;

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check registration.');
      }

      if (data.found) {
        setLookupState('found');
        setLookupInfo(data);
        setEmail('');
        if (data.role === 'L' || data.role === 'F') {
          setIntensiveRole(data.role);
        }
      } else {
        setLookupState('not_found');
        setLookupInfo(data);
      }
    } catch (err) {
      setLookupState('error');
      setError(err instanceof Error ? err.message : 'Failed to check registration.');
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    const trimmedSurname = surname.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedSurname) {
      setError('Please provide your name and surname.');
      return;
    }

    if (lookupState === 'idle' || lookupState === 'checking') {
      setError('Please click “Check weekender registration” before submitting.');
      return;
    }

    if (needsManualEmail && !trimmedEmail) {
      setError('Please provide your email address (no weekender registration was found).');
      return;
    }

    if (bookingType === 'private_lesson') {
      if (selectedPrivatePros.length === 0) {
        setError('Please select at least one pro.');
        return;
      }

      for (const pro of selectedPrivatePros) {
        const request = privateLessonRequests[pro];
        if (!request || request.preferredSlots.length === 0) {
          setError(`Please select at least one preferred time slot for ${PRIVATE_PRO_LABELS[pro]}.`);
          return;
        }
        if (!Number.isInteger(request.lessonCount) || request.lessonCount < 1 || request.lessonCount > 4) {
          setError(`Please select a valid number of lessons for ${PRIVATE_PRO_LABELS[pro]}.`);
          return;
        }
      }

      if (!privateUnavailablePlan.trim()) {
        setError('Please tell us what to do if your pro is unavailable.');
        return;
      }

      if (privateBookWithPartner && (!privatePartnerName.trim() || !privatePartnerSurname.trim())) {
        setError('Please provide your partner name and surname for private lessons.');
        return;
      }
    }

    if (bookingType === 'spotlight_critique') {
      if (!spotlightPartnerName.trim() || !spotlightPartnerSurname.trim()) {
        setError('Please provide your partner name and surname for spotlight critique.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const resolvedContactEmail = (hasWeekenderLookup ? lookupInfo?.email : trimmedEmail)?.trim() ?? '';
      const payload = {
        bookingType,
        contact: {
          name: trimmedName,
          surname: trimmedSurname,
          email: trimmedEmail,
        },
        privateLesson:
          bookingType === 'private_lesson'
            ? {
                requests: selectedPrivatePros.map((pro) => ({
                  pro,
                  preferredSlots: privateLessonRequests[pro].preferredSlots,
                  lessonCount: privateLessonRequests[pro].lessonCount,
                })),
                unavailablePlan: privateUnavailablePlan.trim(),
                bookWithPartner: privateBookWithPartner,
                partnerName: privateBookWithPartner ? privatePartnerName.trim() : '',
                partnerSurname: privateBookWithPartner ? privatePartnerSurname.trim() : '',
              }
            : undefined,
        spotlightCritique:
          bookingType === 'spotlight_critique'
            ? {
                partnerName: spotlightPartnerName.trim(),
                partnerSurname: spotlightPartnerSurname.trim(),
                earlierAvailability: [
                  ...(spotlightAvailable17 ? ['17 March'] : []),
                  ...(spotlightAvailable18 ? ['18 March'] : []),
                ],
              }
            : undefined,
        advancedSpinning:
          bookingType === 'advanced_spinning_intensive'
            ? {
                role: intensiveRole,
                level: hasWeekenderLookup ? lookupInfo?.level : manualLevel,
              }
            : undefined,
      };

      const response = await fetch('/api/weekender/add-ons/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit booking.');
      }
      const successParams = new URLSearchParams();
      if (resolvedContactEmail) {
        successParams.set('email', resolvedContactEmail);
      }
      const successQuery = successParams.toString();
      router.push(
        successQuery
          ? `/weekender/add-ons/success?${successQuery}`
          : '/weekender/add-ons/success'
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit booking.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cloud-dancer">
        <section className="bg-black text-white py-12">
          <div className="px-[5%] text-center">
            <h1 className="font-spartan font-semibold text-[28px] md:text-[40px] mb-2">
              Weekender Add-ons
            </h1>
            <p className="text-lg text-white/80">
              Private lessons, Spotlight Critique, and Advanced Spinning Intensive
            </p>
          </div>
        </section>

        <section className="px-[5%] py-12">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-text-dark/10">
              <h2 className="font-spartan font-semibold text-2xl mb-4">Book your add-on</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-text-dark/10 focus:border-yellow-accent focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Surname</label>
                  <input
                    type="text"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-text-dark/10 focus:border-yellow-accent focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleLookup}
                  disabled={lookupState === 'checking'}
                  className="bg-yellow-accent text-text-dark px-5 py-2 rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-md transition-all disabled:opacity-50"
                >
                  {lookupState === 'checking' ? 'Checking...' : 'Check weekender registration'}
                </button>
              </div>

              {hasWeekenderLookup && (
                <div className="mt-4 bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 text-sm">
                  Registration found ({lookupInfo?.passType} pass). We&apos;ll use your registered email:
                  <span className="font-semibold"> {lookupInfo?.email}</span>
                  {bookingType === 'advanced_spinning_intensive' && (
                    <span>
                      {' '}• Role: <span className="font-semibold">{lookupInfo?.role === 'L' ? 'Lead' : 'Follow'}</span>
                      {' '}• Level: <span className="font-semibold">{lookupInfo?.level}</span>
                    </span>
                  )}
                </div>
              )}

              {needsManualEmail && (
                <div className="mt-4">
                  <p className="text-sm text-text-dark/70 mb-2">
                    We couldn&apos;t find a weekender full/day registration for this name. Please provide your email.
                  </p>
                  <label className="block text-sm font-medium text-text-dark mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-text-dark/10 focus:border-yellow-accent focus:outline-none"
                    required={needsManualEmail}
                  />
                </div>
              )}

              <div className="mt-8">
                <label className="block text-sm font-medium text-text-dark mb-2">Booking type</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { value: 'private_lesson', label: 'Private lesson' },
                    { value: 'spotlight_critique', label: 'Spotlight critique' },
                    { value: 'advanced_spinning_intensive', label: 'Advanced spinning intensive' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`cursor-pointer rounded-lg border-2 p-3 text-sm font-semibold transition-colors ${
                        bookingType === option.value
                          ? 'border-yellow-accent bg-yellow-accent/10'
                          : 'border-text-dark/10 hover:border-yellow-accent/60'
                      }`}
                    >
                      <input
                        type="radio"
                        className="sr-only"
                        checked={bookingType === option.value}
                        onChange={() => setBookingType(option.value as BookingType)}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>

              {bookingType === 'private_lesson' && (
                <div className="mt-8 rounded-lg border border-text-dark/10 bg-cloud-dancer/40 p-4">
                  <h3 className="font-spartan font-semibold text-xl mb-2">Private lesson</h3>
                  <p className="text-sm text-text-dark/80">
                    Private lesson cost is paid in cash directly to the pro (details are in the weekender mailer).
                  </p>
                  <p className="text-sm text-text-dark/80 mt-2">
                    Each private lesson is a <span className="font-semibold">45-minute slot</span>.
                  </p>
                  <p className="text-sm text-text-dark/80 mt-2">
                    This is an interest booking, not a guaranteed exact slot booking. We&apos;ll use this to arrange schedules that work for as many people as possible, then contact you with exact timing.
                  </p>
                  <p className="text-sm text-text-dark/80 mt-2">
                    You can select multiple pros and multiple date/time preferences below, then submit once.
                  </p>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-text-dark mb-2">Which pro(s) would you like?</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {(Object.keys(PRIVATE_PRO_LABELS) as PrivatePro[]).map((pro) => (
                        <label
                          key={pro}
                          className={`cursor-pointer rounded-lg border-2 p-2 text-sm font-semibold text-center transition-colors ${
                            selectedPrivatePros.includes(pro)
                              ? 'border-yellow-accent bg-yellow-accent/10'
                              : 'border-text-dark/10 hover:border-yellow-accent/60'
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={selectedPrivatePros.includes(pro)}
                            onChange={() => togglePrivatePro(pro)}
                          />
                          {PRIVATE_PRO_LABELS[pro]}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg border border-text-dark/10 bg-white p-4">
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-text-dark cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privateBookWithPartner}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setPrivateBookWithPartner(checked);
                          if (!checked) {
                            setPrivatePartnerName('');
                            setPrivatePartnerSurname('');
                          }
                        }}
                      />
                      Book with partner (optional)
                    </label>

                    {privateBookWithPartner && (
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Partner name</label>
                          <input
                            type="text"
                            value={privatePartnerName}
                            onChange={(e) => setPrivatePartnerName(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border-2 border-text-dark/10 focus:border-yellow-accent focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Partner surname</label>
                          <input
                            type="text"
                            value={privatePartnerSurname}
                            onChange={(e) => setPrivatePartnerSurname(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border-2 border-text-dark/10 focus:border-yellow-accent focus:outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedPrivatePros.length > 0 && (
                    <div className="mt-4 space-y-4">
                      {selectedPrivatePros.map((pro) => (
                        <div key={pro} className="rounded-lg border border-text-dark/10 bg-white p-4">
                          <h4 className="font-semibold text-text-dark">{PRIVATE_PRO_LABELS[pro]}</h4>

                          <div className="mt-3">
                            <label className="block text-sm font-medium text-text-dark mb-1">
                              How many 45-minute lessons do you want?
                            </label>
                            <select
                              value={privateLessonRequests[pro].lessonCount}
                              onChange={(e) => setPrivateLessonCount(pro, Number(e.target.value))}
                              className="w-full md:w-48 px-4 py-3 rounded-lg border-2 border-text-dark/10 focus:border-yellow-accent focus:outline-none bg-white"
                            >
                              <option value={1}>1 lesson</option>
                              <option value={2}>2 lessons</option>
                              <option value={3}>3 lessons</option>
                              <option value={4}>4 lessons</option>
                            </select>
                          </div>

                          <div className="mt-3">
                            <label className="block text-sm font-medium text-text-dark mb-2">Preferred day/time(s)</label>
                            <div className="space-y-2 max-h-72 overflow-y-auto rounded-lg border border-text-dark/10 p-3 bg-cloud-dancer/30">
                              {getPrivateSlotOptions(pro).map((slot) => (
                                <label key={`${pro}_${slot.id}`} className="flex items-start gap-3 cursor-pointer text-sm">
                                  <input
                                    type="checkbox"
                                    className="mt-0.5"
                                    checked={privateLessonRequests[pro].preferredSlots.includes(slot.id)}
                                    onChange={() => togglePrivateSlot(pro, slot.id)}
                                  />
                                  <span>{slot.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-text-dark mb-1">
                      If one of your selected pros isn&apos;t available, what should we do?
                    </label>
                    <textarea
                      value={privateUnavailablePlan}
                      onChange={(e) => setPrivateUnavailablePlan(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg border-2 border-text-dark/10 focus:border-yellow-accent focus:outline-none"
                      placeholder="Would you like to book with another pro or not book at all?"
                    />
                  </div>
                </div>
              )}

              {bookingType === 'spotlight_critique' && (
                <div className="mt-8 rounded-lg border border-text-dark/10 bg-cloud-dancer/40 p-4">
                  <h3 className="font-spartan font-semibold text-xl mb-2">Spotlight critique</h3>
                  <p className="text-sm text-text-dark/80">
                    Sign up as a pair. Cost is R400 per pair.
                  </p>
                  <p className="text-sm text-text-dark/80 mt-2">
                    There is no payment at this stage. We&apos;re collecting interest first; once enough people sign up we&apos;ll send payment links.
                  </p>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Partner name</label>
                      <input
                        type="text"
                        value={spotlightPartnerName}
                        onChange={(e) => setSpotlightPartnerName(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border-2 border-text-dark/10 focus:border-yellow-accent focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Partner surname</label>
                      <input
                        type="text"
                        value={spotlightPartnerSurname}
                        onChange={(e) => setSpotlightPartnerSurname(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border-2 border-text-dark/10 focus:border-yellow-accent focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">
                      If we get high demand and need a second session, are you available earlier in the week?
                    </p>
                    <label className="inline-flex items-center gap-2 text-sm mr-6">
                      <input
                        type="checkbox"
                        checked={spotlightAvailable17}
                        onChange={(e) => setSpotlightAvailable17(e.target.checked)}
                      />
                      17 March
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={spotlightAvailable18}
                        onChange={(e) => setSpotlightAvailable18(e.target.checked)}
                      />
                      18 March
                    </label>
                  </div>
                </div>
              )}

              {bookingType === 'advanced_spinning_intensive' && (
                <div className="mt-8 rounded-lg border border-text-dark/10 bg-cloud-dancer/40 p-4">
                  <h3 className="font-spartan font-semibold text-xl mb-2">Advanced Spinning Intensive</h3>
                  <p className="text-sm text-text-dark/80">
                    Initial sign-up is to measure interest and help determine final pricing (more people = lower cost).
                  </p>
                  <p className="text-sm text-text-dark/80 mt-2">
                    This workshop is aimed at dancers with basic spinning technique who want to take it to the next level.
                  </p>
                  <p className="text-sm text-text-dark/80 mt-2">
                    We build up progressively to one-foot spins (for both leads and follows)
                  </p>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Role for this intensive</label>
                      <select
                        value={intensiveRole}
                        onChange={(e) => setIntensiveRole(e.target.value as Role)}
                        className="w-full px-4 py-3 rounded-lg border-2 border-text-dark/10 focus:border-yellow-accent focus:outline-none bg-white"
                      >
                        <option value="L">Lead</option>
                        <option value="F">Follow</option>
                      </select>
                    </div>
                    {needsManualLevel && (
                      <div>
                        <label className="block text-sm font-medium mb-1">Level</label>
                        <select
                          value={manualLevel}
                          onChange={(e) => setManualLevel(Number(e.target.value) as 1 | 2)}
                          className="w-full px-4 py-3 rounded-lg border-2 border-text-dark/10 focus:border-yellow-accent focus:outline-none bg-white"
                        >
                          <option value={1}>Level 1</option>
                          <option value={2}>Level 2</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}


              <button
                type="submit"
                disabled={submitting}
                className="mt-8 w-full bg-yellow-accent text-text-dark px-8 py-4 rounded-lg font-semibold text-lg hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit add-on booking'}
              </button>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}
