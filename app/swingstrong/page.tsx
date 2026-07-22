'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';

type Role = 'Lead' | 'Follow' | '';
type Experience = 'newcomer' | 'level1' | 'level2' | '';

interface CheckResult {
  found: boolean;
  paid?: boolean;
  firstName?: string;
}

export default function SwingStrong() {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('');
  const [experience, setExperience] = useState<Experience>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check registration state
  const [checkEmail, setCheckEmail] = useState('');
  const [checkFirst, setCheckFirst] = useState('');
  const [checkSurname, setCheckSurname] = useState('');
  const [checkLoading, setCheckLoading] = useState(false);
  const [checkError, setCheckError] = useState('');
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);

  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckError('');
    setCheckResult(null);
    setCheckLoading(true);
    try {
      const res = await fetch('/api/swingstrong/check-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: checkEmail, firstName: checkFirst, surname: checkSurname }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCheckError(data.error || 'Something went wrong.');
      } else {
        setCheckResult(data);
      }
    } catch {
      setCheckError('Something went wrong. Please try again.');
    } finally {
      setCheckLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/swingstrong/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, surname, email, role, experience }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      window.location.href = data.checkoutUrl;
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main>

        {/* ── Hero ───────────────────────────────────────────────────────────── */}
        <section className="px-[5%] py-[60px] md:py-[80px] bg-text-dark text-white">
          <div className="max-w-[1100px] mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">

              {/* Left: copy — shown second on mobile, first on desktop */}
              <div className="order-2 md:order-1">
                <div className="inline-block text-white px-4 py-2 rounded-full font-semibold text-xs tracking-wider mb-6" style={{ backgroundColor: '#00B49A' }}>
                  INTERNATIONAL WORKSHOP · 6 SEPTEMBER 2026
                </div>
                <h1 className="font-spartan font-bold text-[48px] md:text-[64px] leading-none mb-3">
                  Swing<br />Strong
                </h1>
                <p className="text-lg md:text-xl text-white/70 mb-2 font-medium">
                  Mobility &amp; Movement for West Coast Swing
                </p>
                <p className="text-white/50 mb-8">
                  A 4-hour workshop with Jeff Mumford · Cape Town
                </p>

                <div className="flex flex-wrap gap-8 mb-10 text-sm">
                  <div>
                    <p className="text-white/40 uppercase tracking-widest text-[10px] mb-1">Date</p>
                    <p className="font-semibold">Sunday, 6 September</p>
                  </div>
                  <div>
                    <p className="text-white/40 uppercase tracking-widest text-[10px] mb-1">Time</p>
                    <p className="font-semibold">11:30 – 15:30</p>
                  </div>
                  <div>
                  <p className="text-white/40 uppercase tracking-widest text-[10px] mb-1">Investment</p>
                    <p className="font-semibold">R350 per person</p>
                  </div>
                  <div>
                    <p className="text-white/40 uppercase tracking-widest text-[10px] mb-1">Venue</p>
                    <p className="font-semibold">Pinelands, Cape Town</p>
                  </div>
                </div>

                <button
                  onClick={scrollToForm}
                  className="text-white px-8 py-4 rounded-lg font-semibold text-lg hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
                  style={{ backgroundColor: '#00B49A' }}
                >
                  Register Now — R350
                </button>
                <p className="mt-3 text-sm text-white/50">
                  Already registered?{' '}
                  <a href="#check-registration" className="underline hover:text-white/80 transition-colors">
                    Check your registration
                  </a>
                </p>
              </div>

              {/* Right: Jeff image — shown first on mobile, second on desktop */}
              <div className="order-1 md:order-2 flex justify-center md:justify-end">
                <Image
                  src="/images/jeff.jpeg"
                  alt="Jeff Mumford — WCS dancer and mobility specialist"
                  width={480}
                  height={540}
                  className="w-full max-w-[400px] h-auto rounded-2xl object-cover shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Tagline strip ──────────────────────────────────────────────────── */}
        <section className="px-[5%] py-[24px] text-white text-center" style={{ backgroundColor: '#00B49A' }}>
          <p className="font-spartan font-semibold text-lg md:text-2xl">
            Better movement creates better dance. Period.
          </p>
        </section>

        {/* ── Problem / Why this matters ─────────────────────────────────────── */}
        <section className="px-[5%] py-[60px] bg-cloud-dancer">
          <div className="max-w-[800px] mx-auto text-center">
            <h2 className="font-spartan font-semibold text-[28px] md:text-[36px] mb-6">
              Sound familiar?
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 text-left mb-8">
              {[
                'Feeling off-balance when you dance',
                'Stiff or restricted movement',
                'Unsure how your body is supposed to move',
                'Thinking too much while dancing',
              ].map((item) => (
                <div key={item} className="bg-white rounded-xl p-4 flex items-start gap-3">
                  <span className="font-bold text-lg mt-0.5" style={{ color: '#00B49A' }}>•</span>
                  <p className="text-text-dark/80">{item}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl p-6 border-2" style={{ backgroundColor: 'rgba(0,180,154,0.1)', borderColor: 'rgba(0,180,154,0.35)' }}>
              <p className="text-base md:text-lg font-medium">
                You&apos;re not alone. And more importantly — <strong>it&apos;s fixable.</strong>
              </p>
            </div>
          </div>
        </section>

        {/* ── What you'll experience ─────────────────────────────────────────── */}
        <section className="px-[5%] py-[60px] bg-white">
          <div className="max-w-[900px] mx-auto">
            <h2 className="font-spartan font-semibold text-[28px] md:text-[36px] text-center mb-4">
              What You&apos;ll Experience
            </h2>
            <p className="text-center text-text-dark/70 mb-10 max-w-[600px] mx-auto">
              This 4-hour workshop is designed to meet you where you are and elevate how you move.
            </p>
            <div className="grid md:grid-cols-2 gap-8">

              {/* Part 1 */}
              <div className="rounded-2xl p-8" style={{ background: 'linear-gradient(135deg, rgba(0,180,154,0.1), rgba(0,180,154,0.03))' }}>
                <div className="inline-block text-white text-xs font-semibold px-3 py-1 rounded-full mb-4" style={{ backgroundColor: '#00B49A' }}>
                  PART 1
                </div>
                <h3 className="font-spartan font-semibold text-xl mb-3">🧘 Mobility &amp; Movement Foundations</h3>
                <ul className="space-y-2 text-text-dark/80 text-sm md:text-base">
                  <li className="flex items-start gap-2"><span className="mt-1" style={{ color: '#00B49A' }}>✓</span> Move with more ease and less tension</li>
                  <li className="flex items-start gap-2"><span className="mt-1" style={{ color: '#00B49A' }}>✓</span> Improve balance and body awareness</li>
                  <li className="flex items-start gap-2"><span className="mt-1" style={{ color: '#00B49A' }}>✓</span> Unlock mobility in the joints that matter most for WCS</li>
                  <li className="flex items-start gap-2"><span className="mt-1" style={{ color: '#00B49A' }}>✓</span> Build movement patterns that support your dancing</li>
                </ul>
              </div>

              {/* Part 2 */}
              <div className="rounded-2xl p-8" style={{ background: 'linear-gradient(135deg, rgba(255,209,23,0.15), rgba(255,209,23,0.05))' }}>
                <div className="inline-block bg-yellow-accent text-text-dark text-xs font-semibold px-3 py-1 rounded-full mb-4">
                  PART 2
                </div>
                <h3 className="font-spartan font-semibold text-xl mb-3">💃 Apply It to Your Dancing</h3>
                <ul className="space-y-2 text-text-dark/80 text-sm md:text-base">
                  <li className="flex items-start gap-2"><span className="text-yellow-accent mt-1">✓</span> More grounded, confident basics</li>
                  <li className="flex items-start gap-2"><span className="text-yellow-accent mt-1">✓</span> Smoother transitions and cleaner footwork</li>
                  <li className="flex items-start gap-2"><span className="text-yellow-accent mt-1">✓</span> Better connection with your partner</li>
                  <li className="flex items-start gap-2"><span className="text-yellow-accent mt-1">✓</span> A more natural sense of flow and timing</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── Who this is for ────────────────────────────────────────────────── */}
        <section className="px-[5%] py-[60px] bg-cloud-dancer">
          <div className="max-w-[800px] mx-auto text-center">
            <h2 className="font-spartan font-semibold text-[28px] md:text-[36px] mb-4">
              Who This Is For
            </h2>
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Newer & Intermediate Dancers', desc: 'Build the foundations you wish you\'d had from day one' },
                { label: 'Stuck or Frustrated?', desc: 'If you feel like your body isn\'t cooperating, this is for you' },
                { label: 'Advanced Dancers Welcome', desc: 'Refine movement quality and clean up underlying mechanics' },
              ].map((item) => (
                <div key={item.label} className="bg-white rounded-xl p-5 text-left">
                  <p className="font-spartan font-semibold mb-2">{item.label}</p>
                  <p className="text-sm text-text-dark/70">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-text-dark/70 italic">No partner needed. Just come ready to move.</p>
          </div>
        </section>

        {/* ── About Jeff ─────────────────────────────────────────────────────── */}
        <section className="px-[5%] py-[60px] bg-white">
          <div className="max-w-[900px] mx-auto">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <Image
                  src="/images/jeff_2.jpeg"
                  alt="Jeff Mumford"
                  width={480}
                  height={400}
                  className="w-full h-auto rounded-2xl object-cover"
                />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#00B49A' }}>Your Instructor</p>
                <h2 className="font-spartan font-semibold text-[28px] md:text-[36px] mb-4">Jeff Mumford</h2>
                <p className="text-text-dark/80 text-base md:text-lg mb-4">
                  Professional WCS dancer and mobility specialist, Jeff brings a unique approach that bridges athletic movement with social dance.
                </p>
                <p className="text-text-dark/80 text-base md:text-lg mb-6">
                  His workshops are designed to be supportive, practical, and immediately applicable — this is the kind of experience that changes how you feel in your body, and that changes everything in your dancing.
                </p>
                <a
                  href="https://www.instagram.com/mumfuriousfitness"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold hover:opacity-70 transition-opacity"
                  style={{ color: '#00B49A' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ fill: '#00B49A' }}>
                    <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
                  </svg>
                  @mumfuriousfitness
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── What to bring + Venue ──────────────────────────────────────────── */}
        <section className="px-[5%] py-[60px] bg-cloud-dancer">
          <div className="max-w-[900px] mx-auto grid md:grid-cols-2 gap-8">

            <div>
              <h3 className="font-spartan font-semibold text-xl mb-4">👟 What to Bring</h3>
              <ul className="space-y-2 text-text-dark/80">
              {[
                  'Comfortable, movement-friendly clothing',
                  'A yoga mat',
                  'Socks or bare feet for the mobility section',
                  'Dance shoes for the second half',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 bg-white rounded-lg p-3">
                    <span className="font-bold mt-0.5" style={{ color: '#00B49A' }}>•</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-text-dark/60 italic mt-3">
                You should be comfortable getting down on the floor for movement exercises.
              </p>
            </div>

            <div>
              <h3 className="font-spartan font-semibold text-xl mb-4">📍 Venue &amp; Timing</h3>
              <div className="bg-white rounded-xl p-5 space-y-4">
                <div>
                  <p className="font-semibold mb-0.5">Location</p>
                  <p className="text-text-dark/80">Pinelands North Primary School Hall<br />Cape Town</p>
                </div>
                <div>
                  <p className="font-semibold mb-0.5">Date &amp; Time</p>
                  <p className="text-text-dark/80">Sunday, 6 September 2026<br />11:30 – 15:30</p>
                </div>
                <div>
                  <p className="font-semibold mb-0.5">Cost</p>
                  <p className="text-text-dark/80 font-semibold text-lg">R350 per person</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Registration Form ──────────────────────────────────────────────── */}
        <div ref={formRef}>
          <section
            className="px-[5%] py-[60px]"
            style={{ background: 'linear-gradient(135deg, rgba(0,180,154,0.1), rgba(0,180,154,0.03))' }}
          >
            <div className="max-w-[600px] mx-auto">
              <h2 className="font-spartan font-semibold text-[28px] md:text-[36px] text-center mb-2">
                Register for Swing Strong
              </h2>
              <p className="text-center text-text-dark/70 mb-8">
                Sunday, 6 September · R350 per person<br />
                <span className="text-sm">You&apos;ll be taken to our payment page after submitting.</span>
              </p>

              <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 shadow-lg space-y-5">

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                  className="w-full border-2 border-text-dark/15 rounded-lg px-4 py-3 focus:outline-none transition-colors" style={{ '--tw-ring-color': '#00B49A' } as React.CSSProperties}
                      placeholder="Jane"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Surname *</label>
                    <input
                      type="text"
                      required
                      value={surname}
                      onChange={(e) => setSurname(e.target.value)}
                      className="w-full border-2 border-text-dark/15 rounded-lg px-4 py-3 focus:outline-none transition-colors"
                      placeholder="Smith"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border-2 border-text-dark/15 rounded-lg px-4 py-3 focus:outline-none transition-colors"
                    placeholder="jane@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Primary Role in WCS</label>
                  <div className="flex gap-3">
                    {(['Lead', 'Follow'] as Role[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className="flex-1 py-3 rounded-lg border-2 font-semibold text-sm transition-all"
                        style={role === r
                          ? { borderColor: '#00B49A', backgroundColor: 'rgba(0,180,154,0.1)', color: '#00B49A' }
                          : { borderColor: 'rgba(40,39,35,0.15)', color: 'rgba(40,39,35,0.6)' }
                        }
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Your WCS Experience</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'newcomer', label: 'Newcomer', sub: 'Never danced WCS before' },
                      { value: 'level1', label: 'Level 1', sub: 'Know the basics, still building confidence' },
                      { value: 'level2', label: 'Level 2', sub: 'Comfortable social dancing, exploring musicality and style' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setExperience(opt.value as Experience)}
                        className="py-2.5 px-3 rounded-lg border-2 font-medium text-sm transition-all text-left"
                        style={experience === opt.value
                          ? { borderColor: '#00B49A', backgroundColor: 'rgba(0,180,154,0.1)', color: '#00B49A' }
                          : { borderColor: 'rgba(40,39,35,0.15)', color: 'rgba(40,39,35,0.6)' }
                        }
                      >
                        <span className="block font-semibold">{opt.label}</span>
                        <span className="block text-xs opacity-70 mt-0.5 font-normal">{opt.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white py-4 rounded-lg font-semibold text-lg hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                  style={{ backgroundColor: '#00B49A' }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                      Preparing payment…
                    </span>
                  ) : (
                    'Register & Pay — R350'
                  )}
                </button>

                <p className="text-xs text-text-dark/50 text-center">
                  Secure payment via Yoco. No card details stored on our servers.
                </p>
              </form>

              <p className="text-center text-sm text-text-dark/60 mt-6">
                Questions? Email{' '}
                <a href="mailto:hello@wcscapetown.co.za" className="hover:underline" style={{ color: '#00B49A' }}>
                  hello@wcscapetown.co.za
                </a>
              </p>
            </div>
          </section>
        </div>

        {/* ── Check Registration ────────────────────────────────────────────────── */}
        <section id="check-registration" className="px-[5%] py-[48px] bg-cloud-dancer">
          <div className="max-w-[600px] mx-auto">
            <h2 className="font-spartan font-semibold text-[22px] text-center mb-2">Check your registration</h2>
            <p className="text-center text-sm text-text-dark/60 mb-6">
              Already registered? Look up your status using your email or name.
            </p>

            <form onSubmit={handleCheck} className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Email address</label>
                <input
                  type="email"
                  value={checkEmail}
                  onChange={(e) => setCheckEmail(e.target.value)}
                  className="w-full border-2 border-text-dark/15 rounded-lg px-4 py-3 focus:outline-none transition-colors"
                  placeholder="jane@example.com"
                />
              </div>

              <div className="flex items-center gap-3 text-xs text-text-dark/40">
                <div className="flex-1 h-px bg-text-dark/15" />
                <span>or search by name</span>
                <div className="flex-1 h-px bg-text-dark/15" />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">First Name</label>
                  <input
                    type="text"
                    value={checkFirst}
                    onChange={(e) => setCheckFirst(e.target.value)}
                    className="w-full border-2 border-text-dark/15 rounded-lg px-4 py-3 focus:outline-none transition-colors"
                    placeholder="Jane"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Surname</label>
                  <input
                    type="text"
                    value={checkSurname}
                    onChange={(e) => setCheckSurname(e.target.value)}
                    className="w-full border-2 border-text-dark/15 rounded-lg px-4 py-3 focus:outline-none transition-colors"
                    placeholder="Smith"
                  />
                </div>
              </div>

              {checkError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  {checkError}
                </div>
              )}

              {checkResult && (
                <div
                  className="rounded-lg p-4 text-sm"
                  style={{
                    backgroundColor: checkResult.found
                      ? checkResult.paid ? 'rgba(0,180,154,0.1)' : 'rgba(255,209,23,0.15)'
                      : 'rgba(239,68,68,0.07)',
                    borderWidth: 1,
                    borderStyle: 'solid',
                    borderColor: checkResult.found
                      ? checkResult.paid ? 'rgba(0,180,154,0.4)' : 'rgba(255,209,23,0.6)'
                      : 'rgba(239,68,68,0.3)',
                  }}
                >
                  {!checkResult.found && (
                    <p className="font-semibold text-red-600">No registration found.</p>
                  )}
                  {checkResult.found && checkResult.paid && (
                    <>
                      <p className="font-semibold" style={{ color: '#00B49A' }}>
                        Hi {checkResult.firstName || 'there'} 👋 You&apos;re registered and confirmed!
                      </p>
                    </>
                  )}
                  {checkResult.found && !checkResult.paid && (
                    <>
                      <p className="font-semibold text-yellow-600">
                        Hi {checkResult.firstName || 'there'} — we have your registration but payment isn&apos;t confirmed yet.
                      </p>
                      <p className="text-text-dark/70 text-xs mt-1">If you&apos;ve paid, it may take a moment to update. Email us if you&apos;re unsure.</p>
                    </>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={checkLoading}
                className="w-full text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#00B49A' }}
              >
                {checkLoading ? 'Checking…' : 'Check registration'}
              </button>
            </form>
          </div>
        </section>

      </main>
    </>
  );
}
