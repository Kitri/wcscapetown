'use client';

import { useState, useEffect } from 'react';
import Header from "@/components/Header";
import { getOrCreateSessionId } from '@/lib/sessionId';

type Step = 'start' | 'verify-name' | 'select-type' | 'single-form' | 'couple-form' | 'processing' | 'sold-out' | 'waitlist';
type Role = 'L' | 'F';
type Level = 1 | 2;
type PricingTier = 'now' | 'now-now' | 'just-now' | 'ai-tog';

const PRICES: Record<PricingTier, { single: number; couple: number; display: string }> = {
  'now': { single: 1600, couple: 3200, display: 'Now' },
  'now-now': { single: 1800, couple: 3600, display: 'Now Now' },
  'just-now': { single: 2200, couple: 4400, display: 'Just Now' },
  'ai-tog': { single: 2400, couple: 4800, display: 'Ai Tog' },
};

// Registration opens: Wednesday 18 February 2026 07:00 SAST
const REGISTRATION_OPENS = new Date('2026-02-18T05:00:00Z'); // 07:00 SAST = 05:00 UTC

export default function BookWeekender() {
  const [step, setStep] = useState<Step>('start');
  const [sessionId, setSessionId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registrationOpen, setRegistrationOpen] = useState(false);
  
  // Single registration form
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('F');
  const [level, setLevel] = useState<Level>(1);
  
  // Couple registration form
  const [leaderName, setLeaderName] = useState('');
  const [leaderSurname, setLeaderSurname] = useState('');
  const [leaderLevel, setLeaderLevel] = useState<Level>(1);
  const [followerName, setFollowerName] = useState('');
  const [followerSurname, setFollowerSurname] = useState('');
  const [followerLevel, setFollowerLevel] = useState<Level>(1);
  const [coupleEmail, setCoupleEmail] = useState('');
  
  // Name verification (when session is flagged)
  const [verifyName, setVerifyName] = useState('');
  const [verifySurname, setVerifySurname] = useState('');
  
  // Pricing tier based on availability
  const [pricingTier, setPricingTier] = useState<PricingTier>('now');
  const [availabilityMessage, setAvailabilityMessage] = useState('');
  const [waitlistPosition, setWaitlistPosition] = useState<number | null>(null);
  
  // Waitlist mode
  const [isWaitlist, setIsWaitlist] = useState(false);
  const [pendingRegistrationType, setPendingRegistrationType] = useState<'single' | 'couple'>('single');
  
  // Tier sold out status (from database)
  const [nowTierSoldOut, setNowTierSoldOut] = useState(false);
  
  useEffect(() => {
    setSessionId(getOrCreateSessionId());
    // Check if registration is open
    const now = new Date();
    setRegistrationOpen(now >= REGISTRATION_OPENS);
    
    // Check tier status from database
    fetch('/api/weekender/tier-status')
      .then(res => res.json())
      .then(data => {
        if (data.nowTierSoldOut) {
          setNowTierSoldOut(true);
          setPricingTier('now-now');
        }
      })
      .catch(console.error);
  }, []);

  const handleStartRegistration = async () => {
    if (!registrationOpen) {
      setError('Registration is not yet open. Please come back at 7am on 18 February 2026.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/weekender/start-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'already_registered') {
          // Show name verification step instead of just an error
          setStep('verify-name');
          setError('');
        } else {
          throw new Error(data.error || 'Failed to start registration');
        }
        setLoading(false);
        return;
      }

      setStep('select-type');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async (spotCount: number): Promise<{ canProceed: boolean; tier: PricingTier }> => {
    try {
      const response = await fetch('/api/weekender/check-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spotCount })
      });
      
      const data = await response.json();
      
      if (data.tier === 'now') {
        setPricingTier('now');
        setAvailabilityMessage('');
        return { canProceed: true, tier: 'now' };
      } else if (data.tier === 'now-now') {
        setPricingTier('now-now');
        setAvailabilityMessage(data.message);
        return { canProceed: true, tier: 'now-now' };
      } else if (data.tier === 'waitlist') {
        setAvailabilityMessage(data.message);
        setWaitlistPosition(data.waitlistPosition || null);
        return { canProceed: false, tier: 'now' };
      }
      
      return { canProceed: true, tier: 'now' };
    } catch (err) {
      console.error('Error checking availability:', err);
      // Default to allowing registration on error
      return { canProceed: true, tier: 'now' };
    }
  };

  const handleSelectSingle = async () => {
    setLoading(true);
    setIsWaitlist(false);
    setPendingRegistrationType('single');
    const { canProceed, tier } = await checkAvailability(1);
    setLoading(false);
    
    if (canProceed) {
      setPricingTier(tier);
      setStep('single-form');
    } else {
      setStep('waitlist');
    }
  };

  const handleSelectCouple = async () => {
    setLoading(true);
    setIsWaitlist(false);
    setPendingRegistrationType('couple');
    const { canProceed, tier } = await checkAvailability(2);
    setLoading(false);
    
    if (canProceed) {
      setPricingTier(tier);
      setStep('couple-form');
    } else {
      setStep('waitlist');
    }
  };

  const handleJoinWaitlist = () => {
    setIsWaitlist(true);
    setPricingTier('now'); // Waitlist is for "now" tier
    setStep(pendingRegistrationType === 'single' ? 'single-form' : 'couple-form');
  };

  const handleAcceptNowNow = (type: 'single' | 'couple') => {
    setPricingTier('now-now');
    setStep(type === 'single' ? 'single-form' : 'couple-form');
  };

  const handleVerifyName = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verifyName.trim() || !verifySurname.trim()) {
      setError('Please enter your name and surname');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/weekender/check-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: verifyName.trim(), 
          surname: verifySurname.trim() 
        })
      });

      const data = await response.json();

      if (data.isRegistered) {
        // They ARE registered - tell them to contact admin
        setError(`${verifyName} ${verifySurname} is already registered for the weekender. If this is incorrect, please contact weekender@wcscapetown.co.za`);
      } else {
        // They're NOT registered - let them continue
        // Pre-fill the name fields
        setName(verifyName.trim());
        setSurname(verifySurname.trim());
        setStep('select-type');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !surname.trim() || !email.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    setStep('processing');

    try {
      const response = await fetch('/api/weekender/submit-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          priceTier: pricingTier,
          isWaitlist,
          registration: {
            type: 'single',
            name: name.trim(),
            surname: surname.trim(),
            email: email.trim(),
            role,
            level,
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setStep('single-form');
        if (data.error === 'already_registered') {
          setError(data.message);
        } else {
          throw new Error(data.error || 'Failed to submit registration');
        }
        setLoading(false);
        return;
      }

      if (isWaitlist) {
        // Waitlist - redirect to success page without payment
        window.location.href = `/bookweekender/success?ref=${data.reference}&waitlist=true`;
      } else {
        // Regular - redirect to Yoco payment
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      setStep('single-form');
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleSubmitCouple = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!leaderName.trim() || !leaderSurname.trim() || !followerName.trim() || !followerSurname.trim() || !coupleEmail.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    setStep('processing');

    try {
      const response = await fetch('/api/weekender/submit-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          priceTier: pricingTier,
          isWaitlist,
          registration: {
            type: 'couple',
            email: coupleEmail.trim(),
            leader: {
              name: leaderName.trim(),
              surname: leaderSurname.trim(),
              level: leaderLevel,
            },
            follower: {
              name: followerName.trim(),
              surname: followerSurname.trim(),
              level: followerLevel,
            },
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setStep('couple-form');
        if (data.error === 'already_registered') {
          setError(data.message);
        } else {
          throw new Error(data.error || 'Failed to submit registration');
        }
        setLoading(false);
        return;
      }

      if (isWaitlist) {
        // Waitlist - redirect to success page without payment
        window.location.href = `/bookweekender/success?ref=${data.reference}&waitlist=true`;
      } else {
        // Regular - redirect to Yoco payment
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      setStep('couple-form');
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
              Book Your Weekender Pass
            </h1>
            <p className="text-lg text-white/80">March 20–22, 2026</p>
          </div>
        </section>

        <section className="px-[5%] py-12">
          <div className="max-w-lg mx-auto">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Step: Start */}
            {step === 'start' && (
              <div className="bg-white rounded-xl p-8 shadow-lg text-center">
                <h2 className="font-spartan font-semibold text-2xl mb-4">Weekend Pass</h2>
                <p className="text-3xl font-bold text-pink-accent mb-2">
                  R{PRICES[pricingTier].single.toLocaleString()}
                </p>
                <p className="text-sm text-text-dark/60 mb-6">
                  {nowTierSoldOut 
                    ? '"Now Now" price' 
                    : '"Now" price — first 10 tickets'
                  }
                </p>
                
                {nowTierSoldOut && (
                  <div className="bg-pink-accent/10 border border-pink-accent/30 rounded-lg p-4 mb-6">
                    <p className="text-sm font-semibold text-pink-accent">
                      🎉 The first 10 &quot;Now&quot; tickets are sold out!
                    </p>
                    <p className="text-xs text-text-dark/60 mt-1">
                      Register now at the &quot;Now Now&quot; price
                    </p>
                  </div>
                )}
                
                <ul className="text-left text-sm text-text-dark/80 space-y-2 mb-8">
                  <li>✓ Friday pre-party</li>
                  <li>✓ All workshops (Sat + Sun)</li>
                  <li>✓ Community lunch (Saturday)</li>
                  <li>✓ All evening parties (Fri + Sat + Sun)</li>
                </ul>

                {!registrationOpen ? (
                  <div className="bg-yellow-accent/20 rounded-lg p-4 mb-6">
                    <p className="font-semibold text-text-dark">Registration opens:</p>
                    <p className="text-lg font-bold">7am, 18 February 2026</p>
                  </div>
                ) : null}

                <button
                  onClick={handleStartRegistration}
                  disabled={loading}
                  className="w-full bg-yellow-accent text-text-dark px-8 py-4 rounded-lg font-semibold text-lg hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Starting...' : 'Register Now'}
                </button>
              </div>
            )}

            {/* Step: Verify Name (when session flagged as registered) */}
            {step === 'verify-name' && (
              <form onSubmit={handleVerifyName} className="bg-white rounded-xl p-8 shadow-lg">
                <h2 className="font-spartan font-semibold text-2xl mb-4 text-center">Already registered?</h2>
                <p className="text-text-dark/70 text-center mb-6">
                  It looks like someone has already registered from this device. Enter your name to check if it was you.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-1">Name</label>
                    <input
                      type="text"
                      value={verifyName}
                      onChange={(e) => setVerifyName(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border-2 border-text-dark/10 focus:border-yellow-accent focus:outline-none"
                      placeholder="Your first name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-1">Surname</label>
                    <input
                      type="text"
                      value={verifySurname}
                      onChange={(e) => setVerifySurname(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border-2 border-text-dark/10 focus:border-yellow-accent focus:outline-none"
                      placeholder="Your surname"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 bg-yellow-accent text-text-dark px-8 py-4 rounded-lg font-semibold text-lg hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Checking...' : 'Check & Continue'}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('start')}
                  className="w-full mt-4 text-text-dark/60 hover:text-text-dark text-sm"
                >
                  ← Back
                </button>
              </form>
            )}

            {/* Step: Select Type */}
            {step === 'select-type' && (
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <h2 className="font-spartan font-semibold text-2xl mb-6 text-center">How are you registering?</h2>
                
                <div className="space-y-4">
                  <button
                    onClick={handleSelectSingle}
                    disabled={loading}
                    className="w-full bg-cloud-dancer border-2 border-text-dark/10 hover:border-yellow-accent px-6 py-4 rounded-lg text-left transition-colors disabled:opacity-50"
                  >
                    <p className="font-semibold text-lg">Just me</p>
                    <p className="text-sm text-text-dark/60">Single registration — R{PRICES[pricingTier].single.toLocaleString()}</p>
                  </button>
                  
                  <button
                    onClick={handleSelectCouple}
                    disabled={loading}
                    className="w-full bg-cloud-dancer border-2 border-text-dark/10 hover:border-yellow-accent px-6 py-4 rounded-lg text-left transition-colors disabled:opacity-50"
                  >
                    <p className="font-semibold text-lg">Lead & Follow pair</p>
                    <p className="text-sm text-text-dark/60">Couple registration — R{PRICES[pricingTier].couple.toLocaleString()}</p>
                  </button>
                </div>

                {loading && (
                  <p className="text-center text-text-dark/60 mt-4">Checking availability...</p>
                )}

                <button
                  onClick={() => setStep('start')}
                  className="w-full mt-6 text-text-dark/60 hover:text-text-dark text-sm"
                >
                  ← Back
                </button>
              </div>
            )}

            {/* Step: Waitlist */}
            {step === 'waitlist' && (
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <h2 className="font-spartan font-semibold text-2xl mb-4 text-center">"Now" Tickets Reserved</h2>
                
                <div className="bg-yellow-accent/20 rounded-lg p-4 mb-6">
                  <p className="text-text-dark/80">{availabilityMessage}</p>
                  {waitlistPosition && (
                    <p className="mt-2 font-semibold">Your waitlist position: #{waitlistPosition}</p>
                  )}
                </div>
                
                <p className="text-text-dark/70 mb-6 text-center">
                  You can join the waitlist and we&apos;ll contact you if a spot opens up, or register now at the "Now Now" price.
                </p>
                
                <div className="space-y-4">
                  <button
                    onClick={handleJoinWaitlist}
                    className="w-full bg-yellow-accent text-text-dark px-6 py-4 rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all"
                  >
                    Join Waitlist for "Now" Price
                  </button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-text-dark/20"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-text-dark/60">or pay now at the next tier</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleAcceptNowNow(pendingRegistrationType)}
                    className="w-full bg-cloud-dancer border-2 border-text-dark/20 text-text-dark px-6 py-4 rounded-lg font-semibold hover:border-yellow-accent transition-colors"
                  >
                    Register at "Now Now" price — R{PRICES['now-now'][pendingRegistrationType === 'single' ? 'single' : 'couple'].toLocaleString()}
                  </button>
                </div>

                <button
                  onClick={() => setStep('select-type')}
                  className="w-full mt-6 text-text-dark/60 hover:text-text-dark text-sm"
                >
                  ← Back
                </button>
              </div>
            )}

            {/* Step: Single Form */}
            {step === 'single-form' && (
              <form onSubmit={handleSubmitSingle} className="bg-white rounded-xl p-8 shadow-lg">
                <h2 className="font-spartan font-semibold text-2xl mb-6">
                  {isWaitlist ? 'Waitlist Registration' : 'Your Details'}
                </h2>
                
                {isWaitlist && (
                  <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-6">
                    <p className="text-sm">You&apos;re joining the waitlist for the &quot;Now&quot; price (R{PRICES['now'].single.toLocaleString()}). We&apos;ll contact you if a spot opens up.</p>
                  </div>
                )}
                
                <div className="space-y-4">
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
                  
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border-2 border-text-dark/10 focus:border-yellow-accent focus:outline-none"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">Role</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="role"
                          checked={role === 'L'}
                          onChange={() => setRole('L')}
                          className="w-4 h-4 text-yellow-accent"
                        />
                        <span>Lead</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="role"
                          checked={role === 'F'}
                          onChange={() => setRole('F')}
                          className="w-4 h-4 text-yellow-accent"
                        />
                        <span>Follow</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">Level</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="level"
                          checked={level === 1}
                          onChange={() => setLevel(1)}
                          className="w-4 h-4 text-yellow-accent"
                        />
                        <span>Level 1</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="level"
                          checked={level === 2}
                          onChange={() => setLevel(2)}
                          className="w-4 h-4 text-yellow-accent"
                        />
                        <span>Level 2</span>
                      </label>
                    </div>
                    <p className="text-xs text-text-dark/60 mt-1">Not sure? Choose Level 1 — we can adjust later.</p>
                  </div>
                </div>

                {!isWaitlist && (
                  <div className="mt-8 pt-6 border-t border-text-dark/10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">Total</span>
                      <span className="text-2xl font-bold">R{PRICES[pricingTier].single.toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-text-dark/60 mb-4">
                      &quot;{PRICES[pricingTier].display}&quot; pricing tier
                    </p>
                  </div>
                )}
                  
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full px-8 py-4 rounded-lg font-semibold text-lg hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    isWaitlist ? 'mt-6 bg-blue-500 text-white' : 'bg-yellow-accent text-text-dark'
                  }`}
                >
                  {loading ? 'Processing...' : isWaitlist ? 'Add to Waitlist' : 'Continue to Payment'}
                </button>

                <button
                  type="button"
                  onClick={() => isWaitlist ? setStep('waitlist') : setStep('select-type')}
                  className="w-full mt-4 text-text-dark/60 hover:text-text-dark text-sm"
                >
                  ← Back
                </button>
              </form>
            )}

            {/* Step: Couple Form */}
            {step === 'couple-form' && (
              <form onSubmit={handleSubmitCouple} className="bg-white rounded-xl p-8 shadow-lg">
                <h2 className="font-spartan font-semibold text-2xl mb-6">
                  {isWaitlist ? 'Waitlist Registration (Couple)' : 'Couple Registration'}
                </h2>
                
                {isWaitlist && (
                  <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-6">
                    <p className="text-sm">You&apos;re joining the waitlist for the &quot;Now&quot; price (R{PRICES['now'].couple.toLocaleString()} for both). We&apos;ll contact you if spots open up.</p>
                  </div>
                )}
                
                {/* Leader Section */}
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-3 text-pink-accent">Leader</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-1">Name</label>
                        <input
                          type="text"
                          value={leaderName}
                          onChange={(e) => setLeaderName(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border-2 border-text-dark/10 focus:border-yellow-accent focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-1">Surname</label>
                        <input
                          type="text"
                          value={leaderSurname}
                          onChange={(e) => setLeaderSurname(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border-2 border-text-dark/10 focus:border-yellow-accent focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-2">Level</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="leader-level"
                            checked={leaderLevel === 1}
                            onChange={() => setLeaderLevel(1)}
                            className="w-4 h-4"
                          />
                          <span>Level 1</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="leader-level"
                            checked={leaderLevel === 2}
                            onChange={() => setLeaderLevel(2)}
                            className="w-4 h-4"
                          />
                          <span>Level 2</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Follower Section */}
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-3 text-pink-accent">Follower</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-1">Name</label>
                        <input
                          type="text"
                          value={followerName}
                          onChange={(e) => setFollowerName(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border-2 border-text-dark/10 focus:border-yellow-accent focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-1">Surname</label>
                        <input
                          type="text"
                          value={followerSurname}
                          onChange={(e) => setFollowerSurname(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border-2 border-text-dark/10 focus:border-yellow-accent focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-2">Level</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="follower-level"
                            checked={followerLevel === 1}
                            onChange={() => setFollowerLevel(1)}
                            className="w-4 h-4"
                          />
                          <span>Level 1</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="follower-level"
                            checked={followerLevel === 2}
                            onChange={() => setFollowerLevel(2)}
                            className="w-4 h-4"
                          />
                          <span>Level 2</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shared Email */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-text-dark mb-1">Email (for both)</label>
                  <input
                    type="email"
                    value={coupleEmail}
                    onChange={(e) => setCoupleEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-text-dark/10 focus:border-yellow-accent focus:outline-none"
                    required
                  />
                </div>

                {!isWaitlist && (
                  <div className="mt-8 pt-6 border-t border-text-dark/10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">Total (2 people)</span>
                      <span className="text-2xl font-bold">R{PRICES[pricingTier].couple.toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-text-dark/60 mb-4">
                      &quot;{PRICES[pricingTier].display}&quot; pricing tier
                    </p>
                  </div>
                )}
                  
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full px-8 py-4 rounded-lg font-semibold text-lg hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    isWaitlist ? 'mt-6 bg-blue-500 text-white' : 'bg-yellow-accent text-text-dark'
                  }`}
                >
                  {loading ? 'Processing...' : isWaitlist ? 'Add to Waitlist' : 'Continue to Payment'}
                </button>

                <button
                  type="button"
                  onClick={() => isWaitlist ? setStep('waitlist') : setStep('select-type')}
                  className="w-full mt-4 text-text-dark/60 hover:text-text-dark text-sm"
                >
                  ← Back
                </button>
              </form>
            )}

            {/* Step: Processing */}
            {step === 'processing' && (
              <div className="bg-white rounded-xl p-8 shadow-lg text-center">
                <div className={`animate-spin h-12 w-12 border-4 border-t-transparent rounded-full mx-auto mb-4 ${
                  isWaitlist ? 'border-blue-500' : 'border-yellow-accent'
                }`}></div>
                <p className="text-lg font-semibold">
                  {isWaitlist ? 'Adding you to the waitlist...' : 'Setting up your payment...'}
                </p>
                <p className="text-sm text-text-dark/60 mt-2">
                  {isWaitlist ? 'Just a moment...' : 'You will be redirected to the payment page shortly.'}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
