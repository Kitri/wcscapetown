'use client';

import { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from "@/components/Header";
import Link from 'next/link';
import { getOrCreateSessionId } from '@/lib/sessionId';

type BootcampType = 'beginner' | 'fasttrack';
type Role = 'L' | 'F';
type Step = 'form' | 'processing' | 'success';
type Tab = 'booking' | 'info';

const WCS_EXPERIENCE_OPTIONS = [
  'Never',
  'One or two classes',
  'A couple of classes',
  'Many classes',
];

const PARTNER_EXPERIENCE_OPTIONS = ['None', 'A little', 'A lot'];

const DANCE_STYLES = [
  'Ballroom',
  'Latin American',
  'Salsa',
  'Bachata',
  'Kizomba',
  'Lindy Hop',
  'Sokkie',
  'Blues',
  'Argentine Tango',
  'Zouk',
  'Jazz',
  'Other',
];

// Component to handle URL params
function UrlParamHandler({
  onBootcampType,
  onTab,
}: {
  onBootcampType: (type: BootcampType) => void;
  onTab: (tab: Tab) => void;
}) {
  const searchParams = useSearchParams();
  const initializedRef = useRef(false);

  useEffect(() => {
    // Only run once on mount
    if (initializedRef.current) return;
    initializedRef.current = true;

    const typeParam = searchParams.get('type');
    if (typeParam && ['beginner', 'fasttrack'].includes(typeParam)) {
      onBootcampType(typeParam as BootcampType);
    }

    const tabParam = searchParams.get('tab');
    if (tabParam && ['booking', 'info'].includes(tabParam)) {
      onTab(tabParam as Tab);
    }
  }, [searchParams, onBootcampType, onTab]);

  return null;
}

export default function BookBootcamp() {
  const [step, setStep] = useState<Step>('form');
  const [sessionId, setSessionId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Bootcamp type
  const [bootcampType, setBootcampType] = useState<BootcampType>('beginner');

  const [tab, setTab] = useState<Tab>('info');
  
  // Common fields
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('F');
  const [wcsExperience, setWcsExperience] = useState('');
  const [howDidYouFindUs, setHowDidYouFindUs] = useState('');
  
  // Beginner bootcamp specific
  const [partnerDanceExperience, setPartnerDanceExperience] = useState('');
  
  // Fasttrack specific
  const [yearsExperience, setYearsExperience] = useState<string>('');
  const [experienceUnit, setExperienceUnit] = useState<'years' | 'months'>('years');
  const [danceStyles, setDanceStyles] = useState<string[]>([]);
  const [otherDanceStyle, setOtherDanceStyle] = useState('');
  const [danceRole, setDanceRole] = useState('');
  
  // Weekender pass discount
  const [hasWeekenderPass, setHasWeekenderPass] = useState(false);
  const [weekenderValidated, setWeekenderValidated] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [showOrderIdInput, setShowOrderIdInput] = useState(false);
  const [weekenderOrderId, setWeekenderOrderId] = useState('');
  const [validatingOrderId, setValidatingOrderId] = useState(false);
  
  // Success state
  const [reference, setReference] = useState('');
  
  useEffect(() => {
    setSessionId(getOrCreateSessionId());
  }, []);

  // Set bootcamp type from URL param (no reset)
  const setBootcampTypeFromUrl = useCallback((type: BootcampType) => {
    setBootcampType(type);
  }, []);

  const setTabFromUrl = useCallback((nextTab: Tab) => {
    setTab(nextTab);
  }, []);

  // User manually switches bootcamp type (reset type-specific fields)
  const handleBootcampTypeChange = (type: BootcampType) => {
    if (type === bootcampType) return; // No change
    setBootcampType(type);
    // Only reset type-specific fields, not common fields
    setWcsExperience('');
    setPartnerDanceExperience('');
    setYearsExperience('');
    setDanceStyles([]);
    setOtherDanceStyle('');
    setDanceRole('');
  };

  // Validate weekender pass when checkbox is checked
  useEffect(() => {
    if (hasWeekenderPass && name && surname && validationStatus === 'idle') {
      validateWeekenderByName();
    } else if (!hasWeekenderPass) {
      setWeekenderValidated(false);
      setValidationStatus('idle');
      setShowOrderIdInput(false);
    }
  }, [hasWeekenderPass]);

  const validateWeekenderByName = async () => {
    if (!name.trim() || !surname.trim()) return;
    
    setValidationStatus('checking');
    try {
      const res = await fetch('/api/bootcamp/validate-weekender', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), surname: surname.trim() }),
      });
      const data = await res.json();
      
      if (data.valid) {
        setWeekenderValidated(true);
        setValidationStatus('valid');
        setShowOrderIdInput(false);
      } else {
        setWeekenderValidated(false);
        setValidationStatus('invalid');
        setShowOrderIdInput(true);
      }
    } catch (err) {
      setValidationStatus('invalid');
      setShowOrderIdInput(true);
    }
  };

  const validateWeekenderByOrderId = async () => {
    if (!weekenderOrderId.trim()) return;
    
    setValidatingOrderId(true);
    try {
      const res = await fetch('/api/bootcamp/validate-weekender', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: weekenderOrderId.trim() }),
      });
      const data = await res.json();
      
      if (data.valid) {
        setWeekenderValidated(true);
        setValidationStatus('valid');
      } else {
        setError('Order ID not found. Please check and try again.');
      }
    } catch (err) {
      setError('Failed to validate order ID. Please try again.');
    } finally {
      setValidatingOrderId(false);
    }
  };

  const handleDanceStyleToggle = (style: string) => {
    setDanceStyles(prev => 
      prev.includes(style) 
        ? prev.filter(s => s !== style)
        : [...prev, style]
    );
  };

  const isFormValid = () => {
    // Common validation
    if (!name.trim() || !surname.trim() || !email.trim() || !role || !wcsExperience) {
      return false;
    }

    // Beginner bootcamp validation
    if (bootcampType === 'beginner') {
      if (wcsExperience === 'Never' && !partnerDanceExperience) {
        return false;
      }
    }

    // Fasttrack validation
    if (bootcampType === 'fasttrack') {
      if (!yearsExperience || !danceStyles.length || !danceRole) {
        return false;
      }
      // If "Other" is selected, otherDanceStyle is required
      if (danceStyles.includes('Other') && !otherDanceStyle.trim()) {
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setStep('processing');

    try {
      const response = await fetch('/api/bootcamp/submit-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          registration: {
            name: name.trim(),
            surname: surname.trim(),
            email: email.trim(),
            role,
            bootcampType,
            wcsExperience,
            partnerDanceExperience: bootcampType === 'beginner' ? partnerDanceExperience : undefined,
            yearsExperience: bootcampType === 'fasttrack' ? parseFloat(yearsExperience) : undefined,
            experienceUnit: bootcampType === 'fasttrack' ? experienceUnit : undefined,
            danceStyles: bootcampType === 'fasttrack' ? danceStyles : undefined,
            otherDanceStyle: bootcampType === 'fasttrack' && danceStyles.includes('Other') ? otherDanceStyle : undefined,
            danceRole: bootcampType === 'fasttrack' ? danceRole : undefined,
            howDidYouFindUs: howDidYouFindUs.trim() || undefined,
            hasWeekenderPass,
            weekenderValidated,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStep('form');
        throw new Error(data.error || 'Failed to submit registration');
      }

      // Redirect to Yoco payment
      window.location.href = data.redirectUrl;
    } catch (err) {
      setStep('form');
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const price = weekenderValidated ? 200 : 400;

  return (
    <>
      <Suspense fallback={null}>
        <UrlParamHandler onBootcampType={setBootcampTypeFromUrl} onTab={setTabFromUrl} />
      </Suspense>
      <Header />
      <main className="min-h-screen bg-cloud-dancer">
        <section className="bg-black text-white py-12">
          <div className="px-[5%] text-center">
            <h1 className="font-spartan font-semibold text-[28px] md:text-[40px] mb-2">
              Bootcamps
            </h1>
            <p className="text-lg text-white/80">Saturday 7 March 2026 • OBS Community Hall</p>
            <p className="text-base md:text-lg text-white/80 mt-4 max-w-[900px] mx-auto">
              The perfect place to start your WCS journey — just in time for our{' '}
              <Link href="/weekender" className="text-yellow-accent underline font-semibold">
                March Weekender
              </Link>{' '}
              with international pros.
            </p>
          </div>
        </section>

        {/* Tabs */}
        <section className="sticky top-[90px] z-[900] bg-black text-white border-b border-white/10">
          <div className="px-[5%] py-4 max-w-[900px] mx-auto">
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setTab('booking')}
                className={`rounded-full px-7 md:px-10 py-3 md:py-4 text-base md:text-lg font-semibold border-2 transition-colors ${
                  tab === 'booking'
                    ? 'bg-white/15 border-yellow-accent text-white'
                    : 'bg-white/10 border-pink-accent/80 text-white/90 hover:bg-white/15 hover:border-yellow-accent'
                }`}
                aria-pressed={tab === 'booking'}
              >
                Book
              </button>
              <button
                type="button"
                onClick={() => setTab('info')}
                className={`rounded-full px-7 md:px-10 py-3 md:py-4 text-base md:text-lg font-semibold border-2 transition-colors ${
                  tab === 'info'
                    ? 'bg-white/15 border-yellow-accent text-white'
                    : 'bg-white/10 border-pink-accent/80 text-white/90 hover:bg-white/15 hover:border-yellow-accent'
                }`}
                aria-pressed={tab === 'info'}
              >
                Info
              </button>
            </div>
          </div>
        </section>

        {tab === 'booking' && (
          <section className="px-[5%] py-12">
            <div className="max-w-lg mx-auto">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Bootcamp Type Selector */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
              <h2 className="font-spartan font-semibold text-lg mb-4">Select Bootcamp</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleBootcampTypeChange('beginner')}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    bootcampType === 'beginner'
                      ? 'border-purple-accent bg-purple-accent/10'
                      : 'border-text-dark/10 hover:border-purple-accent/50'
                  }`}
                >
                  <div className="font-semibold text-sm">Beginner Bootcamp</div>
                  <div className="text-xs text-text-dark/60 mt-1">11:00 - 14:00</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleBootcampTypeChange('fasttrack')}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    bootcampType === 'fasttrack'
                      ? 'border-yellow-accent bg-yellow-accent/10'
                      : 'border-text-dark/10 hover:border-yellow-accent/50'
                  }`}
                >
                  <div className="font-semibold text-sm">Fast-Track Intensive</div>
                  <div className="text-xs text-text-dark/60 mt-1">14:30 - 17:30</div>
                </button>
              </div>
            </div>

            {/* Processing State */}
            {step === 'processing' && (
              <div className="bg-white rounded-xl p-8 shadow-sm text-center">
                <div className="animate-spin w-8 h-8 border-4 border-yellow-accent border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-text-dark/70">Processing your registration...</p>
              </div>
            )}

            {/* Registration Form */}
            {step === 'form' && (
              <form 
                onSubmit={handleSubmit} 
                className={`rounded-xl p-6 shadow-sm space-y-6 ${
                  bootcampType === 'beginner'
                    ? 'bg-gradient-to-br from-purple-accent/5 to-white border-2 border-purple-accent/20'
                    : 'bg-gradient-to-br from-yellow-accent/5 to-white border-2 border-yellow-accent/20'
                }`}
              >
                {/* Personal Details */}
                <div>
                  <h3 className="font-semibold mb-3">Personal Details</h3>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name *</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-text-dark/10 rounded-lg focus:border-yellow-accent focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Surname *</label>
                      <input
                        type="text"
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-text-dark/10 rounded-lg focus:border-yellow-accent focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-text-dark/10 rounded-lg focus:border-yellow-accent focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Role *</label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setRole('L')}
                        className={`flex-1 py-2 rounded-lg border-2 font-medium transition-all ${
                          role === 'L'
                            ? 'border-purple-accent bg-purple-accent text-white'
                            : 'border-text-dark/10 hover:border-purple-accent/50'
                        }`}
                      >
                        Lead
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('F')}
                        className={`flex-1 py-2 rounded-lg border-2 font-medium transition-all ${
                          role === 'F'
                            ? 'border-pink-accent bg-pink-accent text-white'
                            : 'border-text-dark/10 hover:border-pink-accent/50'
                        }`}
                      >
                        Follow
                      </button>
                    </div>
                  </div>
                </div>

                {/* WCS Experience */}
                <div>
                  <label className="block text-sm font-medium mb-2">Have you ever done WCS before? *</label>
                  <div className="space-y-2">
                    {WCS_EXPERIENCE_OPTIONS.map((option) => (
                      <label key={option} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="wcsExperience"
                          value={option}
                          checked={wcsExperience === option}
                          onChange={(e) => setWcsExperience(e.target.value)}
                          className="w-4 h-4 text-yellow-accent"
                        />
                        <span className="text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Beginner Bootcamp: Partner Dance Experience */}
                {bootcampType === 'beginner' && wcsExperience === 'Never' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Do you have any partner dance experience? *</label>
                    <div className="space-y-2">
                      {PARTNER_EXPERIENCE_OPTIONS.map((option) => (
                        <label key={option} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="partnerExperience"
                            value={option}
                            checked={partnerDanceExperience === option}
                            onChange={(e) => setPartnerDanceExperience(e.target.value)}
                            className="w-4 h-4 text-yellow-accent"
                          />
                          <span className="text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                    
                    {/* Show fast-track suggestion if they have a lot of experience */}
                    {partnerDanceExperience === 'A lot' && (
                      <div className="mt-3 p-3 bg-yellow-accent/20 rounded-lg border border-yellow-accent/50">
                        <p className="text-sm">
                          <strong>Did you know?</strong> There&apos;s a{' '}
                          <Link href="/bookbootcamp?tab=booking&type=fasttrack" className="text-yellow-accent underline font-semibold">
                            Fast-Track Intensive
                          </Link>{' '}
                          designed specifically for dancers with partner dance experience. It may be a better fit for you!
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Fast-Track: Experience Details */}
                {bootcampType === 'fasttrack' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">How much partner dance experience do you have (roughly)? *</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={yearsExperience}
                          onChange={(e) => setYearsExperience(e.target.value)}
                          placeholder="e.g. 3"
                          className="flex-1 px-3 py-2 border-2 border-text-dark/10 rounded-lg focus:border-yellow-accent focus:outline-none"
                          required
                        />
                        <select
                          value={experienceUnit}
                          onChange={(e) => setExperienceUnit(e.target.value as 'years' | 'months')}
                          className="px-3 py-2 border-2 border-text-dark/10 rounded-lg focus:border-yellow-accent focus:outline-none"
                        >
                          <option value="years">years</option>
                          <option value="months">months</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">What dance styles do you have experience in? *</label>
                      <div className="grid grid-cols-2 gap-2">
                        {DANCE_STYLES.map((style) => (
                          <label key={style} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={danceStyles.includes(style)}
                              onChange={() => handleDanceStyleToggle(style)}
                              className="w-4 h-4 text-yellow-accent rounded"
                            />
                            <span className="text-sm">{style}</span>
                          </label>
                        ))}
                      </div>
                      {danceStyles.includes('Other') && (
                        <input
                          type="text"
                          value={otherDanceStyle}
                          onChange={(e) => setOtherDanceStyle(e.target.value)}
                          placeholder="Please specify other style(s)"
                          className="w-full mt-2 px-3 py-2 border-2 border-text-dark/10 rounded-lg focus:border-yellow-accent focus:outline-none"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">What role do you dance in your other partner dance? *</label>
                      <div className="flex gap-3">
                        {['Lead', 'Follow', 'Both'].map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setDanceRole(option)}
                            className={`flex-1 py-2 rounded-lg border-2 font-medium text-sm transition-all ${
                              danceRole === option
                                ? 'border-yellow-accent bg-yellow-accent text-text-dark'
                                : 'border-text-dark/10 hover:border-yellow-accent/50'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* How did you hear about us */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    How did you hear about the bootcamp? <span className="text-text-dark/50">(optional)</span>
                  </label>
                  <textarea
                    value={howDidYouFindUs}
                    onChange={(e) => setHowDidYouFindUs(e.target.value.slice(0, 400))}
                    maxLength={400}
                    rows={2}
                    className="w-full px-3 py-2 border-2 border-text-dark/10 rounded-lg focus:border-yellow-accent focus:outline-none resize-none"
                    placeholder="e.g. Instagram, friend, Google..."
                  />
                  <p className="text-xs text-text-dark/50 mt-1">{howDidYouFindUs.length}/400</p>
                </div>

                {/* Weekender Pass Discount */}
                <div className="border-t pt-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasWeekenderPass}
                      onChange={(e) => setHasWeekenderPass(e.target.checked)}
                      className="w-5 h-5 mt-0.5 text-yellow-accent rounded"
                    />
                    <div>
                      <span className="font-medium">I have a WCS Weekender full weekend pass</span>
                      <p className="text-sm text-text-dark/60">Get 50% off: R200 instead of R400</p>
                    </div>
                  </label>

                  {/* Validation Status */}
                  {hasWeekenderPass && (
                    <div className="mt-3 ml-8">
                      {validationStatus === 'checking' && (
                        <p className="text-sm text-text-dark/60">Checking registration...</p>
                      )}
                      {validationStatus === 'valid' && (
                        <p className="text-sm text-green-600 font-medium">✓ Registration validated</p>
                      )}
                      {showOrderIdInput && (
                        <div className="space-y-2">
                          <p className="text-sm text-text-dark/70">
                            Registration not found by name. Please enter your weekender order ID:
                          </p>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={weekenderOrderId}
                              onChange={(e) => setWeekenderOrderId(e.target.value)}
                              placeholder="e.g. WKN-2026-123456"
                              className="flex-1 px-3 py-2 border-2 border-text-dark/10 rounded-lg focus:border-yellow-accent focus:outline-none text-sm"
                            />
                            <button
                              type="button"
                              onClick={validateWeekenderByOrderId}
                              disabled={validatingOrderId || !weekenderOrderId.trim()}
                              className="px-4 py-2 bg-text-dark text-white rounded-lg text-sm font-medium disabled:opacity-50"
                            >
                              {validatingOrderId ? '...' : 'Validate'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Price Summary */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold">
                      {bootcampType === 'beginner' ? 'Beginner Bootcamp' : 'Fast-Track Intensive'}
                    </span>
                    <div className="text-right">
                      {weekenderValidated && (
                        <span className="text-sm text-text-dark/50 line-through mr-2">R400</span>
                      )}
                      <span className="font-bold text-xl">R{price}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !isFormValid() || (hasWeekenderPass && !weekenderValidated)}
                    className={`w-full py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      bootcampType === 'beginner'
                        ? 'bg-purple-accent text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-accent/30'
                        : 'bg-yellow-accent text-text-dark hover:-translate-y-0.5 hover:shadow-lg hover:shadow-yellow-accent/30'
                    }`}
                  >
                    {loading ? 'Processing...' : 'Continue to Payment'}
                  </button>

                  {hasWeekenderPass && !weekenderValidated && validationStatus !== 'checking' && (
                    <p className="text-sm text-text-dark/60 text-center mt-2">
                      Please validate your weekender pass to continue
                    </p>
                  )}
                </div>
              </form>
            )}
          </div>
        </section>
        )}

        {tab === 'info' && (
          <section className="px-[5%] py-12 bg-white">
            <div className="max-w-[900px] mx-auto">
              <h2 className="font-spartan font-semibold text-[26px] md:text-[32px] text-center mb-4">
                Bootcamp Details
              </h2>
              <p className="text-center text-text-dark/70 mb-10 max-w-[760px] mx-auto">
                Build confidence in the fundamentals, and walk into the March Weekender ready to get the most out of world-class teaching.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Beginner Bootcamp */}
                <div
                  className={`rounded-xl p-6 border-2 transition-all ${
                    bootcampType === 'beginner'
                      ? 'border-purple-accent bg-purple-accent/5'
                      : 'border-text-dark/10 bg-white/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="font-spartan font-semibold text-xl">Beginner Bootcamp</h3>
                      <p className="text-sm text-text-dark/70 mt-1">Brand new to West Coast Swing? Perfect.</p>
                    </div>
                    <span className="shrink-0 inline-block bg-purple-accent text-white px-3 py-1 rounded-full font-semibold text-xs">
                      3 hours
                    </span>
                  </div>
                  <p className="text-sm text-text-dark/80 mb-3">
                    This is your one-stop shop for the core WCS basics. Build confidence, learn the foundations, and walk into the WCS Weekender Level 1 Track feeling ready.
                  </p>
                  <ul className="space-y-1 text-sm text-text-dark/80 mb-4">
                    <li>✓ Learn the 5 basics and core foundations</li>
                    <li>✓ Connection basics: frame, elasticity, timing</li>
                    <li>✓ Simple WCS technique to get you on the social dance floor</li>
                    <li>✓ Get ready for the Weekender</li>
                  </ul>
                  <p className="text-xs text-text-dark/60">11:00 - 14:00</p>
                </div>

                {/* Fast-Track Intensive */}
                <div
                  className={`rounded-xl p-6 border-2 transition-all ${
                    bootcampType === 'fasttrack'
                      ? 'border-yellow-accent bg-yellow-accent/5'
                      : 'border-text-dark/10 bg-white/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                    <h3 className="font-spartan font-semibold text-xl">Fast-Track Intensive</h3>
                    </div>
                    <span className="shrink-0 inline-block bg-yellow-accent text-text-dark px-3 py-1 rounded-full font-semibold text-xs">
                      3 hours
                    </span>
                  </div>
                  <p className="text-sm text-text-dark/80 mb-3">
                    If you already know the basics of partnered dancing (Salsa, Bachata, Kizomba, Sokkie, Lindy Hop, Ballroom, Latin American, etc.), this 3-hour fast-track intensive translates your foundations into the slot, elasticity, and “WCS feel” — so you can arrive at the Weekender ready to focus on nuance, not just keeping up.
                  </p>
                  <ul className="space-y-1 text-sm text-text-dark/80 mb-4">
                    <li>✓ Translate your existing dance skills into WCS fundamentals</li>
                    <li>✓ Learn the techniques and concepts unique to WCS and get the “WCS feel”</li>
                    <li>✓ Foundational moves + practical drills</li>
                    <li>✓ Weekender-ready: focus on refinement, not just keeping up</li>
                  </ul>
                  <p className="text-xs text-text-dark/60">14:30 - 17:30</p>
                </div>
              </div>

              <div className="mt-10 bg-cloud-dancer rounded-xl p-6 md:p-8 border-2 border-text-dark/10">
                <h3 className="font-spartan font-semibold text-2xl mb-4">
                  Worried about joining the Weekender because you&apos;re new to WCS — but you really want to learn from 4 international pros?
                </h3>
                <div className="space-y-4 text-text-dark/80">
                  <p>
                    You&apos;re in exactly the right place. Learning from pros who teach this dance for a living is one of the fastest ways to build the fundamentals properly — connection,
                    communication, and musicality — not just “more moves”.
                  </p>
                  <p>
                    Our goal is to create and grow a strong WCS community in Cape Town. There&apos;s no better way to do that than spending a full weekend learning and social dancing with other westies here.
                    If you want a feel for the culture you&apos;re joining, here&apos;s what we&apos;re about:{' '}
                    <Link href="/community-culture" className="text-pink-accent hover:text-yellow-accent underline font-semibold">
                      Community Culture
                    </Link>
                    .
                  </p>
                  <p>
                    That&apos;s also why we have a <span className="font-semibold">Level 1</span> and <span className="font-semibold">Level 2</span> track. Level 1&apos;s only entry requirement is knowing the 5 basics.
                    The weekend builds up as it goes, and because we&apos;re a smaller group, the pros can get to know us and adjust the classes to the actual level in the room (not just deliver a fixed script) — they meet us where we&apos;re at, which helps ensure everyone learns something.
                  </p>
                  <p>
                    Want to feel extra prepared before the Weekender? Build confidence with a bootcamp first:{' '}
                    <Link href="/bookbootcamp?tab=booking" className="text-pink-accent hover:text-yellow-accent underline font-semibold">
                      Book a bootcamp
                    </Link>
                    .
                  </p>
                  <p>
                    And if you&apos;re unsure which track is right for you, our teachers are here to help you prepare — please reach out at{' '}
                    <a href="mailto:community@wcscapetown.co.za" className="text-pink-accent hover:text-yellow-accent underline font-semibold">
                      community@wcscapetown.co.za
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
