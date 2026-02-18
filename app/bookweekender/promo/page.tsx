'use client';

import { useState, useEffect } from 'react';
import Header from "@/components/Header";
import { getOrCreateSessionId } from '@/lib/sessionId';

type Step = 'select-type' | 'single-form' | 'couple-form' | 'processing';
type Role = 'L' | 'F';
type Level = 1 | 2;

const PROMO_PRICE = 1600; // R1600 per person

export default function PromoBookWeekender() {
  const [step, setStep] = useState<Step>('select-type');
  const [sessionId, setSessionId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Single registration form
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('F');
  const [level, setLevel] = useState<Level>(2);
  
  // Couple registration form
  const [leaderName, setLeaderName] = useState('');
  const [leaderSurname, setLeaderSurname] = useState('');
  const [leaderLevel, setLeaderLevel] = useState<Level>(2);
  const [followerName, setFollowerName] = useState('');
  const [followerSurname, setFollowerSurname] = useState('');
  const [followerLevel, setFollowerLevel] = useState<Level>(2);
  const [coupleEmail, setCoupleEmail] = useState('');
  
  useEffect(() => {
    setSessionId(getOrCreateSessionId());
  }, []);

  const handleSelectSingle = () => {
    setStep('single-form');
  };

  const handleSelectCouple = () => {
    setStep('couple-form');
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
          priceTier: 'promo',
          passType: 'weekend',
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

      // Redirect to Yoco payment
      window.location.href = data.checkoutUrl;
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
          priceTier: 'promo',
          passType: 'weekend',
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

      // Redirect to Yoco payment
      window.location.href = data.checkoutUrl;
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
              Special Weekender Pass
            </h1>
            <p className="text-lg text-white/80">March 20–22, 2026</p>
          </div>
        </section>

        <section className="px-[5%] py-12">
          <div className="mx-auto max-w-lg">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Step: Select Type */}
            {step === 'select-type' && (
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <h2 className="font-spartan font-semibold text-2xl mb-2 text-center">Weekend Pass</h2>
                <p className="text-center text-text-dark/60 mb-6">Special pricing — how are you registering?</p>
                
                <div className="space-y-4">
                  <button
                    onClick={handleSelectSingle}
                    disabled={loading}
                    className="w-full bg-cloud-dancer border-2 border-text-dark/10 hover:border-yellow-accent px-6 py-4 rounded-lg text-left transition-colors disabled:opacity-50"
                  >
                    <p className="font-semibold text-lg">Just me</p>
                    <p className="text-sm text-text-dark/60">
                      Single registration — R{PROMO_PRICE.toLocaleString()}
                    </p>
                  </button>
                  
                  <button
                    onClick={handleSelectCouple}
                    disabled={loading}
                    className="w-full bg-cloud-dancer border-2 border-text-dark/10 hover:border-yellow-accent px-6 py-4 rounded-lg text-left transition-colors disabled:opacity-50"
                  >
                    <p className="font-semibold text-lg">Lead & Follow pair</p>
                    <p className="text-sm text-text-dark/60">
                      Couple registration — R{(PROMO_PRICE * 2).toLocaleString()}
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* Step: Single Form */}
            {step === 'single-form' && (
              <form onSubmit={handleSubmitSingle} className="bg-white rounded-xl p-8 shadow-lg">
                <h2 className="font-spartan font-semibold text-2xl mb-6">Your Details</h2>
                
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

                <div className="mt-8 pt-6 border-t border-text-dark/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Weekend Pass (Special)</span>
                    <span className="text-2xl font-bold">R{PROMO_PRICE.toLocaleString()}</span>
                  </div>
                </div>
                  
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-8 py-4 rounded-lg font-semibold text-lg bg-yellow-accent text-text-dark hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Continue to Payment'}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('select-type')}
                  className="w-full mt-4 text-text-dark/60 hover:text-text-dark text-sm"
                >
                  ← Back
                </button>
              </form>
            )}

            {/* Step: Couple Form */}
            {step === 'couple-form' && (
              <form onSubmit={handleSubmitCouple} className="bg-white rounded-xl p-8 shadow-lg">
                <h2 className="font-spartan font-semibold text-2xl mb-6">Couple Registration</h2>
                
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

                <div className="mt-8 pt-6 border-t border-text-dark/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Total (2 people)</span>
                    <span className="text-2xl font-bold">R{(PROMO_PRICE * 2).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-text-dark/60 mb-4">
                    Weekend Pass (Special)
                  </p>
                </div>
                  
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-8 py-4 rounded-lg font-semibold text-lg bg-yellow-accent text-text-dark hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Continue to Payment'}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('select-type')}
                  className="w-full mt-4 text-text-dark/60 hover:text-text-dark text-sm"
                >
                  ← Back
                </button>
              </form>
            )}

            {/* Step: Processing */}
            {step === 'processing' && (
              <div className="bg-white rounded-xl p-8 shadow-lg text-center">
                <div className="animate-spin h-12 w-12 border-4 border-yellow-accent border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-lg font-semibold">Setting up your payment...</p>
                <p className="text-sm text-text-dark/60 mt-2">You will be redirected to the payment page shortly.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
