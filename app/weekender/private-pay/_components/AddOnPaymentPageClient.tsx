'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import { getOrCreateSessionId } from '@/lib/sessionId';

type AddOnPassType = 'spinning_intensive' | 'spotlight_critique';
type RegistrationType = 'single' | 'couple';
type LookupStatus =
  | 'ready'
  | 'member_not_found'
  | 'not_on_list_spinning'
  | 'not_on_list_spotlight_closed';
type PayLaterOption = 'April' | 'May' | '2 installments';

type LookupResponse = {
  found: boolean;
  message: string;
  lookupStatus: LookupStatus;
  helpHref: string | null;
  inputEmail: string;
  passType: AddOnPassType;
  bookingFound: boolean;
  pricePerPersonCents: number;
  primary: {
    memberId: number;
    name: string;
    surname: string;
    role: 'L' | 'F';
    level: 1 | 2;
    email: string;
  } | null;
  partner: {
    memberId: number;
    name: string;
    surname: string;
    role: 'L' | 'F';
    level: 1 | 2;
    email: string;
  } | null;
  partnerEmail: string;
  canPayCouple: boolean;
  allowedRegistrationTypes: RegistrationType[];
  existing: {
    singleAlreadyPaid: boolean;
    coupleAlreadyPaid: boolean;
    singlePayLaterSelected: boolean;
    couplePayLaterSelected: boolean;
    singlePayLaterNote: string | null;
    couplePayLaterNote: string | null;
  };
};

type ActionResponse = {
  success: boolean;
  checkoutUrl?: string;
  reference?: string;
  message?: string;
  error?: string;
};

const PAGE_CONFIG: Record<
  AddOnPassType,
  {
    title: string;
    subtitle: string;
    perPersonAmountLabel: string;
  }
> = {
  spinning_intensive: {
    title: 'Spinning Intensive Payment',
    subtitle:
      'R200 per person. Load your details first, then choose pay now by card or save a pay-later plan.',
    perPersonAmountLabel: 'R200 per person',
  },
  spotlight_critique: {
    title: 'Spotlight Critique Payment',
    subtitle:
      'R125 per person. Load your details first, then pay for yourself or for both you and your partner.',
    perPersonAmountLabel: 'R125 per person',
  },
};

function formatCurrency(cents: number): string {
  return `R${(cents / 100).toFixed(2)}`;
}

function formatRole(role: 'L' | 'F'): string {
  return role === 'L' ? 'Lead' : 'Follow';
}

function toPayLaterOption(value: string | null | undefined): PayLaterOption | null {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (normalized === 'april') return 'April';
  if (normalized === 'may') return 'May';
  if (normalized === '2 installments' || normalized === '2_installments') return '2 installments';
  return null;
}

export default function AddOnPaymentPageClient({ passType }: { passType: AddOnPassType }) {
  const config = PAGE_CONFIG[passType];
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<null | 'pay_now' | 'pay_later'>(null);
  const [lookup, setLookup] = useState<LookupResponse | null>(null);
  const [registrationType, setRegistrationType] = useState<RegistrationType>('single');
  const [payLaterOption, setPayLaterOption] = useState<PayLaterOption>('April');
  const [payLaterExpanded, setPayLaterExpanded] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const paid = searchParams.get('paid') === 'true';
  const cancelled = searchParams.get('cancelled') === 'true';
  const failed = searchParams.get('failed') === 'true';

  const selectedAmountCents = useMemo(() => {
    if (!lookup) return 0;
    const quantity = registrationType === 'couple' ? 2 : 1;
    return lookup.pricePerPersonCents * quantity;
  }, [lookup, registrationType]);

  const selectedAlreadyPaid = useMemo(() => {
    if (!lookup) return false;
    return registrationType === 'couple'
      ? lookup.existing.coupleAlreadyPaid
      : lookup.existing.singleAlreadyPaid;
  }, [lookup, registrationType]);

  const canProceed = lookup?.lookupStatus === 'ready' && lookup.bookingFound && Boolean(lookup.primary);
  const selectedPayLaterSelected = useMemo(() => {
    if (!lookup) return false;
    return registrationType === 'couple'
      ? lookup.existing.couplePayLaterSelected
      : lookup.existing.singlePayLaterSelected;
  }, [lookup, registrationType]);
  const selectedPayLaterNote = useMemo(() => {
    if (!lookup) return null;
    return registrationType === 'couple'
      ? lookup.existing.couplePayLaterNote
      : lookup.existing.singlePayLaterNote;
  }, [lookup, registrationType]);
  const alreadyPaidMessage = 'Member paid already.';

  useEffect(() => {
    if (!lookup) return;

    if (passType === 'spinning_intensive') {
      setRegistrationType('single');
      return;
    }

    if (lookup.allowedRegistrationTypes.includes('couple')) {
      setRegistrationType('couple');
      return;
    }

    setRegistrationType('single');
  }, [lookup, passType]);

  useEffect(() => {
    const normalized = toPayLaterOption(selectedPayLaterNote);
    if (!normalized) return;
    setPayLaterOption(normalized);
  }, [selectedPayLaterNote]);

  async function loadRegistration() {
    setError('');
    setInfo('');
    setLookup(null);
    setPayLaterExpanded(false);

    if (!email.trim()) {
      setError('Please enter your email address first.');
      return;
    }

    setLookupLoading(true);
    try {
      const response = await fetch('/api/weekender/add-ons/payments/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          passType,
        }),
      });

      const data = (await response.json()) as LookupResponse & { error?: string };
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load registration details.');
      }

      setLookup(data);
      if (data.lookupStatus === 'ready') {
        setInfo(data.message || 'Registration loaded.');
      } else {
        setInfo('');
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load registration details.');
    } finally {
      setLookupLoading(false);
    }
  }

  async function submitAction(action: 'pay_now' | 'pay_later') {
    setError('');
    setInfo('');

    if (!lookup || !canProceed || !lookup.primary) {
      setError('Please load a valid registration first.');
      return;
    }

    if (selectedAlreadyPaid) {
      setError(alreadyPaidMessage);
      return;
    }

    if (action === 'pay_later' && !payLaterExpanded) {
      setPayLaterExpanded(true);
      return;
    }

    if (action === 'pay_now') {
      setPayLaterExpanded(false);
    }

    const endpoint =
      action === 'pay_now'
        ? '/api/weekender/add-ons/payments/create-checkout'
        : '/api/weekender/add-ons/payments/pay-later';

    setActionLoading(action);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: lookup.inputEmail,
          passType,
          registrationType,
          sessionId: getOrCreateSessionId(),
          payLaterOption: action === 'pay_later' ? payLaterOption : undefined,
        }),
      });

      const data = (await response.json()) as ActionResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Could not process your request.');
      }

      if (action === 'pay_now' && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      setInfo(data.message || 'Saved successfully.');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not process your request.');
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cloud-dancer">
        <section className="bg-black text-white py-12">
          <div className="px-[5%] text-center">
            <h1 className="font-spartan font-semibold text-[28px] md:text-[40px] mb-2">
              {config.title}
            </h1>
            <p className="text-lg text-white/80 max-w-3xl mx-auto">
              {config.subtitle}
            </p>
          </div>
        </section>

        <section className="px-[5%] py-12">
          <div className="max-w-3xl mx-auto bg-white rounded-xl p-6 md:p-8 shadow-sm border border-text-dark/10">
            <p className="text-sm text-text-dark/80 mb-5">
              Please put in your email address and click <span className="font-semibold">Load registration</span>.
              This loads your details and tells the system who you are.
            </p>

            {paid && (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800">
                Payment successful. Your registration will be marked as paid once the payment confirmation is processed.
              </div>
            )}
            {cancelled && (
              <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-yellow-800">
                Payment was cancelled. You can try again whenever you’re ready.
              </div>
            )}
            {failed && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                Payment failed. Please try again or choose “pay later”.
              </div>
            )}

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

            {lookup?.lookupStatus === 'not_on_list_spinning' && lookup.helpHref && (
              <div className="mt-5 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-yellow-900 text-sm">
                <p>{lookup.message}</p>
                <p className="mt-2">
                  <Link href={lookup.helpHref} className="underline font-semibold">
                    Go to weekender add-ons signup
                  </Link>
                </p>
              </div>
            )}

            {lookup?.lookupStatus === 'not_on_list_spotlight_closed' && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
                {lookup.message}
              </div>
            )}

            {lookup?.lookupStatus === 'member_not_found' && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
                {lookup.message}
              </div>
            )}

            {lookup?.lookupStatus === 'ready' && lookup.primary && (
              <div className="mt-6 rounded-lg border border-text-dark/10 bg-cloud-dancer/40 p-4 space-y-3">
                <div>
                  <p className="font-semibold text-text-dark">Loaded registration</p>
                  <p className="text-sm text-text-dark/80">
                    {lookup.primary.name} {lookup.primary.surname}
                  </p>
                  <p className="text-sm text-text-dark/70">
                    {lookup.primary.email || lookup.inputEmail} • {formatRole(lookup.primary.role)} • Level {lookup.primary.level}
                  </p>
                </div>

                {passType === 'spotlight_critique' && (
                  <div className="rounded-lg bg-white border border-text-dark/10 p-3">
                    <p className="text-sm font-semibold text-text-dark mb-1">Partner details</p>
                    {lookup.partner ? (
                      <>
                        <p className="text-sm text-text-dark/80">
                          {lookup.partner.name} {lookup.partner.surname}
                        </p>
                        <p className="text-sm text-text-dark/70">
                          {lookup.partner.email || 'No email found'}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-text-dark/70">
                        Partner details were not fully resolved, so only single payment is available.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {canProceed && lookup && (
              <div className="mt-6 space-y-4">
                {passType === 'spotlight_critique' && (
                  <div className="rounded-lg border border-text-dark/10 p-4">
                    <p className="text-sm font-medium text-text-dark mb-2">Payment option</p>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          checked={registrationType === 'single'}
                          onChange={() => setRegistrationType('single')}
                        />
                        Pay for myself only ({config.perPersonAmountLabel})
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          checked={registrationType === 'couple'}
                          onChange={() => setRegistrationType('couple')}
                          disabled={!lookup.allowedRegistrationTypes.includes('couple')}
                        />
                        Pay for myself and partner ({formatCurrency(lookup.pricePerPersonCents * 2)})
                      </label>
                    </div>
                  </div>
                )}

                <div className="rounded-lg border border-text-dark/10 p-4">
                  <p className="text-sm text-text-dark/80 mb-3">
                    Amount due: <span className="font-semibold">{formatCurrency(selectedAmountCents)}</span>
                  </p>

                  {selectedPayLaterSelected && !selectedAlreadyPaid && (
                    <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
                      <p>
                        You already selected pay later
                        {selectedPayLaterNote ? ` (${selectedPayLaterNote})` : ''}. Do you want to change it?
                      </p>
                    </div>
                  )}
                  {payLaterExpanded && (
                    <div className="rounded-lg border border-text-dark/10 bg-cloud-dancer/30 p-3 mb-3">
                      <p className="text-sm font-medium text-text-dark mb-2">If you pay later, when will you pay?</p>
                      <div className="space-y-2">
                        {(['April', 'May', '2 installments'] as PayLaterOption[]).map((option) => (
                          <label key={option} className="flex items-center gap-2 text-sm">
                            <input
                              type="radio"
                              checked={payLaterOption === option}
                              onChange={() => setPayLaterOption(option)}
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedAlreadyPaid && (
                    <div className="mb-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
                      {alreadyPaidMessage}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={Boolean(actionLoading) || selectedAlreadyPaid}
                      onClick={() => submitAction('pay_now')}
                      className="bg-yellow-accent text-text-dark px-6 py-3 rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading === 'pay_now' ? 'Starting card payment...' : 'Pay now (card)'}
                    </button>
                    <button
                      type="button"
                      disabled={Boolean(actionLoading) || selectedAlreadyPaid}
                      onClick={() => submitAction('pay_later')}
                      className="bg-text-dark/5 text-text-dark px-6 py-3 rounded-lg font-semibold border border-text-dark/10 hover:bg-text-dark/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading === 'pay_later'
                        ? 'Saving plan...'
                        : payLaterExpanded
                          ? 'Save pay-later plan'
                          : selectedPayLaterSelected
                            ? 'Change pay-later plan'
                            : 'Pay later'}
                    </button>
                  </div>
                </div>
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
