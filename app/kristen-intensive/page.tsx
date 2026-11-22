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

// Picked up from the blue stage lighting in Kristen's photo
const ACCENT = '#1C8AD1';
const accentTint = (alpha: number) => `rgba(28,138,209,${alpha})`;

export default function KristenIntensive() {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('');
  const [experience, setExperience] = useState<Experience>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      const res = await fetch('/api/kristen-intensive/check-registration', {
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
      const res = await fetch('/api/kristen-intensive/register', {
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

  const selectedStyle = { borderColor: ACCENT, backgroundColor: accentTint(0.1), color: ACCENT };
  const unselectedStyle = { borderColor: 'rgba(40,39,35,0.15)', color: 'rgba(40,39,35,0.6)' };

  return (
    <>
      <Header />
      <main>

        {/* ── Hero: photo on top (mobile) / right half (desktop) ───────────── */}
        <section className="relative bg-text-dark text-white overflow-hidden">
          <div className="relative h-[420px] sm:h-[520px] md:absolute md:inset-y-0 md:right-0 md:h-auto md:w-[50%]">
            <Image
              src="/images/kristen_intensive.JPEG"
              alt="Kristen Wallace dancing West Coast Swing"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-[40%_30%]"
            />
            {/* Fade the photo into the dark background: bottom edge on mobile, left edge on desktop */}
            <div className="absolute inset-0 bg-gradient-to-t from-text-dark via-transparent to-transparent md:bg-gradient-to-r md:from-text-dark md:via-text-dark/20 md:to-transparent" />
          </div>

          <div className="relative px-[5%] pb-[50px] -mt-[40px] md:mt-0 md:py-[100px]">
            <div className="max-w-[1100px] mx-auto">
              <div className="max-w-[560px] md:max-w-[48%]">
                <div className="inline-block text-white px-4 py-2 rounded-full font-semibold text-xs tracking-wider mb-6" style={{ backgroundColor: ACCENT }}>
                  INTERNATIONAL INTENSIVE · 16 DECEMBER 2026
                </div>
                <h1 className="font-spartan font-bold text-[48px] md:text-[68px] leading-none mb-3">
                  Kristen<br />Wallace
                </h1>
                <p className="text-lg md:text-xl text-white/80 mb-8 font-medium">
                  A 2-hour West Coast Swing intensive in Cape Town
                </p>

                <div className="flex flex-wrap gap-x-8 gap-y-4 mb-10 text-sm">
                  <div>
                    <p className="text-white/50 uppercase tracking-widest text-[10px] mb-1">Date</p>
                    <p className="font-semibold">Wednesday, 16 December</p>
                  </div>
                  <div>
                    <p className="text-white/50 uppercase tracking-widest text-[10px] mb-1">Time</p>
                    <p className="font-semibold">15:00 – 17:00</p>
                  </div>
                  <div>
                    <p className="text-white/50 uppercase tracking-widest text-[10px] mb-1">Investment</p>
                    <p className="font-semibold">R250 per person</p>
                  </div>
                  <div>
                    <p className="text-white/50 uppercase tracking-widest text-[10px] mb-1">Venue</p>
                    <p className="font-semibold">Pinelands, Cape Town</p>
                  </div>
                </div>

                <button
                  onClick={scrollToForm}
                  className="text-white px-8 py-4 rounded-lg font-semibold text-lg hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
                  style={{ backgroundColor: ACCENT }}
                >
                  Book now — R250
                </button>
                <p className="mt-3 text-sm text-white/60">
                  Already booked?{' '}
                  <a href="#check-registration" className="underline hover:text-white/90 transition-colors">
                    Check your registration
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Tagline strip ──────────────────────────────────────────────────── */}
        <section className="px-[5%] py-[24px] text-white text-center" style={{ backgroundColor: ACCENT }}>
          <p className="font-spartan font-semibold text-lg md:text-2xl">
            Two hours with a champion-level dancer, right here in Cape Town.
          </p>
        </section>

        {/* ── About Kristen ──────────────────────────────────────────────────── */}
        <section className="px-[5%] py-[60px] bg-white">
          <div className="max-w-[900px] mx-auto">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <Image
                  src="/images/pros/kristen.jpg"
                  alt="Kristen Wallace"
                  width={480}
                  height={640}
                  className="w-full h-auto rounded-2xl object-cover"
                />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: ACCENT }}>Your Instructor</p>
                <h2 className="font-spartan font-semibold text-[28px] md:text-[36px] mb-1">Kristen Wallace</h2>
                <p className="text-sm text-text-dark/60 mb-4">🇺🇸 United States</p>
                <p className="text-text-dark/80 text-base md:text-lg mb-6">
                  Kristen is the queen of connection. Many of you met her at our Cape Town Weekender in April, and now she&apos;s back for an afternoon of focused training with our community.
                </p>
                <div className="flex flex-col gap-3">
                  <a
                    href="https://www.instagram.com/kwalla.bear"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold hover:opacity-70 transition-opacity"
                    style={{ color: ACCENT }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ fill: ACCENT }} aria-hidden="true">
                      <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
                    </svg>
                    @kwalla.bear
                  </a>
                  <a
                    href="https://youtu.be/Z76ybrXpnSw?si=vOjXixCE7BibMKoH"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold hover:opacity-70 transition-opacity"
                    style={{ color: ACCENT }}
                  >
                    ▶ Watch: Rising Star showcase, US Open 2025
                  </a>
                  <a
                    href="https://youtu.be/oXsYJZvgPQg?si=m27tCUFjiwFLyi--&t=14"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold hover:opacity-70 transition-opacity"
                    style={{ color: ACCENT }}
                  >
                    ▶ Watch: Kristen competing
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Why come ───────────────────────────────────────────────────────── */}
        <section className="px-[5%] py-[60px] bg-cloud-dancer">
          <div className="max-w-[900px] mx-auto">
            <h2 className="font-spartan font-semibold text-[28px] md:text-[36px] text-center mb-4">
              Why You Shouldn&apos;t Miss It
            </h2>
            <p className="text-center text-text-dark/70 mb-10 max-w-[600px] mx-auto">
              Champion-level dancers don&apos;t pass through Cape Town often. This is a rare chance to learn from one up close, in a small group, at our home venue.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: '🌍', title: 'World-class teaching', desc: 'Learn from a dancer who teaches and competes on the international circuit.' },
                { icon: '🎯', title: 'Focused & hands-on', desc: 'Two hours of concentrated work, with plenty of time to drill and get feedback.' },
                { icon: '💃', title: 'Straight to the social floor', desc: 'Take what you learn into your dancing at the next Monday social.' },
              ].map((item) => (
                <div key={item.title} className="bg-white rounded-xl p-5">
                  <p className="text-2xl mb-2">{item.icon}</p>
                  <p className="font-spartan font-semibold mb-2">{item.title}</p>
                  <p className="text-sm text-text-dark/70">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── What to bring + Venue ──────────────────────────────────────────── */}
        <section className="px-[5%] py-[60px] bg-white">
          <div className="max-w-[900px] mx-auto grid md:grid-cols-2 gap-8">

            <div>
              <h3 className="font-spartan font-semibold text-xl mb-4">👟 What to Bring</h3>
              <ul className="space-y-2 text-text-dark/80">
                {[
                  'Dance shoes',
                  'Comfortable clothes you can move in',
                  'Water — it’s mid-December!',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 bg-cloud-dancer rounded-lg p-3">
                    <span className="font-bold mt-0.5" style={{ color: ACCENT }}>•</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-text-dark/60 italic mt-3">
                No partner needed. We&apos;ll rotate partners during the intensive.
              </p>
            </div>

            <div>
              <h3 className="font-spartan font-semibold text-xl mb-4">📍 Venue &amp; Timing</h3>
              <div className="bg-cloud-dancer rounded-xl p-5 space-y-4">
                <div>
                  <p className="font-semibold mb-0.5">Location</p>
                  <p className="text-text-dark/80">Pinelands North Primary School<br />Cape Town (where we hold our Thursday practice)</p>
                </div>
                <div>
                  <p className="font-semibold mb-0.5">Date &amp; Time</p>
                  <p className="text-text-dark/80">Wednesday, 16 December 2026<br />15:00 – 17:00</p>
                </div>
                <div>
                  <p className="font-semibold mb-0.5">Cost</p>
                  <p className="text-text-dark/80 font-semibold text-lg">R250 per person</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Registration Form ──────────────────────────────────────────────── */}
        <div ref={formRef} id="book" className="scroll-mt-20">
          <section
            className="px-[5%] py-[60px]"
            style={{ background: `linear-gradient(135deg, ${accentTint(0.1)}, ${accentTint(0.03)})` }}
          >
            <div className="max-w-[600px] mx-auto">
              <h2 className="font-spartan font-semibold text-[28px] md:text-[36px] text-center mb-2">
                Book your spot
              </h2>
              <p className="text-center text-text-dark/70 mb-8">
                Wednesday, 16 December · 15:00 – 17:00 · R250 per person<br />
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
                      className="w-full border-2 border-text-dark/15 rounded-lg px-4 py-3 focus:outline-none transition-colors"
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
                        style={role === r ? selectedStyle : unselectedStyle}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Your WCS Experience</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { value: 'newcomer', label: 'Newcomer', sub: 'New to WCS' },
                      { value: 'level1', label: 'Level 1', sub: 'Know the basics, still building confidence' },
                      { value: 'level2', label: 'Level 2', sub: 'Comfortable social dancing, exploring musicality and style' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setExperience(opt.value as Experience)}
                        className="py-2.5 px-3 rounded-lg border-2 font-medium text-sm transition-all text-left"
                        style={experience === opt.value ? selectedStyle : unselectedStyle}
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
                  style={{ backgroundColor: ACCENT }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                      Preparing payment…
                    </span>
                  ) : (
                    'Book & Pay — R250'
                  )}
                </button>

                <p className="text-xs text-text-dark/50 text-center">
                  Secure payment via Yoco. No card details stored on our servers.
                </p>
              </form>

              <p className="text-center text-sm text-text-dark/60 mt-6">
                Questions? Email{' '}
                <a href="mailto:hello@wcscapetown.co.za" className="hover:underline" style={{ color: ACCENT }}>
                  hello@wcscapetown.co.za
                </a>
              </p>
            </div>
          </section>
        </div>

        {/* ── Check Registration ─────────────────────────────────────────────── */}
        <section id="check-registration" className="px-[5%] py-[48px] bg-cloud-dancer scroll-mt-20">
          <div className="max-w-[600px] mx-auto">
            <h2 className="font-spartan font-semibold text-[22px] text-center mb-2">Check your registration</h2>
            <p className="text-center text-sm text-text-dark/60 mb-6">
              Already booked? Look up your status using your email or name.
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
                      ? checkResult.paid ? accentTint(0.1) : 'rgba(255,209,23,0.15)'
                      : 'rgba(239,68,68,0.07)',
                    borderWidth: 1,
                    borderStyle: 'solid',
                    borderColor: checkResult.found
                      ? checkResult.paid ? accentTint(0.4) : 'rgba(255,209,23,0.6)'
                      : 'rgba(239,68,68,0.3)',
                  }}
                >
                  {!checkResult.found && (
                    <p className="font-semibold text-red-600">No registration found.</p>
                  )}
                  {checkResult.found && checkResult.paid && (
                    <p className="font-semibold" style={{ color: ACCENT }}>
                      Hi {checkResult.firstName || 'there'} 👋 You&apos;re booked and confirmed!
                    </p>
                  )}
                  {checkResult.found && !checkResult.paid && (
                    <>
                      <p className="font-semibold text-yellow-600">
                        Hi {checkResult.firstName || 'there'}, we have your registration but payment isn&apos;t confirmed yet.
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
                style={{ backgroundColor: ACCENT }}
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
