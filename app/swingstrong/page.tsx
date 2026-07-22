'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';

type Role = 'Lead' | 'Follow' | '';
type Experience = 'new' | 'basics' | 'intermediate' | 'advanced' | '';

export default function SwingStrong() {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('');
  const [experience, setExperience] = useState<Experience>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

              {/* Left: copy */}
              <div>
                <div className="inline-block bg-purple-accent text-white px-4 py-2 rounded-full font-semibold text-xs tracking-wider mb-6">
                  SAVE THE DATE · 6 SEPTEMBER 2026
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
                    <p className="font-semibold">Saturday, 6 September</p>
                  </div>
                  <div>
                    <p className="text-white/40 uppercase tracking-widest text-[10px] mb-1">Time</p>
                    <p className="font-semibold">11:30 – 15:30</p>
                  </div>
                  <div>
                    <p className="text-white/40 uppercase tracking-widest text-[10px] mb-1">Investment</p>
                    <p className="font-semibold">R400 per person</p>
                  </div>
                  <div>
                    <p className="text-white/40 uppercase tracking-widest text-[10px] mb-1">Venue</p>
                    <p className="font-semibold">Pinelands, Cape Town</p>
                  </div>
                </div>

                <button
                  onClick={scrollToForm}
                  className="bg-purple-accent text-white px-8 py-4 rounded-lg font-semibold text-lg hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-accent/40 transition-all duration-200"
                >
                  Register Now — R400
                </button>
              </div>

              {/* Right: Jeff image */}
              <div className="flex justify-center md:justify-end">
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
        <section className="px-[5%] py-[24px] bg-purple-accent text-white text-center">
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
                  <span className="text-purple-accent font-bold text-lg mt-0.5">•</span>
                  <p className="text-text-dark/80">{item}</p>
                </div>
              ))}
            </div>
            <div className="bg-purple-accent/10 border-2 border-purple-accent/30 rounded-xl p-6">
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
              <div className="rounded-2xl p-8" style={{ background: 'linear-gradient(135deg, rgba(138,43,226,0.08), rgba(138,43,226,0.03))' }}>
                <div className="inline-block bg-purple-accent text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                  PART 1
                </div>
                <h3 className="font-spartan font-semibold text-xl mb-3">🧘 Mobility &amp; Movement Foundations</h3>
                <ul className="space-y-2 text-text-dark/80 text-sm md:text-base">
                  <li className="flex items-start gap-2"><span className="text-purple-accent mt-1">✓</span> Move with more ease and less tension</li>
                  <li className="flex items-start gap-2"><span className="text-purple-accent mt-1">✓</span> Improve balance and body awareness</li>
                  <li className="flex items-start gap-2"><span className="text-purple-accent mt-1">✓</span> Unlock mobility in the joints that matter most for WCS</li>
                  <li className="flex items-start gap-2"><span className="text-purple-accent mt-1">✓</span> Build movement patterns that support your dancing</li>
                </ul>
              </div>

              {/* Part 2 */}
              <div className="rounded-2xl p-8" style={{ background: 'linear-gradient(135deg, rgba(219,64,156,0.08), rgba(219,64,156,0.03))' }}>
                <div className="inline-block bg-pink-accent text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                  PART 2
                </div>
                <h3 className="font-spartan font-semibold text-xl mb-3">💃 Apply It to Your Dancing</h3>
                <ul className="space-y-2 text-text-dark/80 text-sm md:text-base">
                  <li className="flex items-start gap-2"><span className="text-pink-accent mt-1">✓</span> More grounded, confident basics</li>
                  <li className="flex items-start gap-2"><span className="text-pink-accent mt-1">✓</span> Smoother transitions and cleaner footwork</li>
                  <li className="flex items-start gap-2"><span className="text-pink-accent mt-1">✓</span> Better connection with your partner</li>
                  <li className="flex items-start gap-2"><span className="text-pink-accent mt-1">✓</span> A more natural sense of flow and timing</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── Who this is for ────────────────────────────────────────────────── */}
        <section className="px-[5%] py-[60px] bg-cloud-dancer">
          <div className="max-w-[800px] mx-auto text-center">
            <h2 className="font-spartan font-semibold text-[28px] md:text-[36px] mb-4">
              🌿 Who This Is For
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
                  src="/images/jeff.jpeg"
                  alt="Jeff Mumford"
                  width={480}
                  height={400}
                  className="w-full h-auto rounded-2xl object-cover"
                />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-purple-accent mb-3">Your Instructor</p>
                <h2 className="font-spartan font-semibold text-[28px] md:text-[36px] mb-4">Jeff Mumford</h2>
                <p className="text-text-dark/80 text-base md:text-lg mb-4">
                  Professional WCS dancer and mobility specialist, Jeff brings a unique approach that bridges athletic movement with social dance.
                </p>
                <p className="text-text-dark/80 text-base md:text-lg">
                  His workshops are designed to be supportive, practical, and immediately applicable — this is the kind of experience that changes how you feel in your body, and that changes everything in your dancing.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── What to bring + Venue ──────────────────────────────────────────── */}
        <section className="px-[5%] py-[60px] bg-cloud-dancer">
          <div className="max-w-[900px] mx-auto grid md:grid-cols-2 gap-8">

            <div>
              <h3 className="font-spartan font-semibold text-xl mb-4">🧘 What to Bring</h3>
              <ul className="space-y-2 text-text-dark/80">
                {[
                  'Comfortable, movement-friendly clothing',
                  'A yoga mat',
                  'Socks or bare feet for the mobility section',
                  'Dance shoes for the second half',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 bg-white rounded-lg p-3">
                    <span className="text-purple-accent font-bold mt-0.5">•</span>
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
                  <p className="text-text-dark/80">Saturday, 6 September 2026<br />11:30 – 15:30</p>
                </div>
                <div>
                  <p className="font-semibold mb-0.5">Cost</p>
                  <p className="text-text-dark/80 font-semibold text-lg">R400 per person</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Registration Form ──────────────────────────────────────────────── */}
        <div ref={formRef}>
          <section
            className="px-[5%] py-[60px]"
            style={{ background: 'linear-gradient(135deg, rgba(138,43,226,0.12), rgba(138,43,226,0.04))' }}
          >
            <div className="max-w-[600px] mx-auto">
              <h2 className="font-spartan font-semibold text-[28px] md:text-[36px] text-center mb-2">
                Register for Swing Strong
              </h2>
              <p className="text-center text-text-dark/70 mb-8">
                Saturday, 6 September · R400 per person<br />
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
                      className="w-full border-2 border-text-dark/15 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-accent transition-colors"
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
                      className="w-full border-2 border-text-dark/15 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-accent transition-colors"
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
                    className="w-full border-2 border-text-dark/15 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-accent transition-colors"
                    placeholder="jane@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Role in WCS</label>
                  <div className="flex gap-3">
                    {(['Lead', 'Follow'] as Role[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`flex-1 py-3 rounded-lg border-2 font-semibold text-sm transition-all ${
                          role === r
                            ? 'border-purple-accent bg-purple-accent/10 text-purple-accent'
                            : 'border-text-dark/15 text-text-dark/60 hover:border-purple-accent/50'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Your WCS Experience</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'new', label: 'New to WCS' },
                      { value: 'basics', label: 'Still building basics' },
                      { value: 'intermediate', label: 'Intermediate' },
                      { value: 'advanced', label: 'Advanced' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setExperience(opt.value as Experience)}
                        className={`py-2.5 px-3 rounded-lg border-2 font-medium text-sm transition-all text-left ${
                          experience === opt.value
                            ? 'border-purple-accent bg-purple-accent/10 text-purple-accent'
                            : 'border-text-dark/15 text-text-dark/60 hover:border-purple-accent/50'
                        }`}
                      >
                        {opt.label}
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
                  className="w-full bg-purple-accent text-white py-4 rounded-lg font-semibold text-lg hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-accent/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                      Preparing payment…
                    </span>
                  ) : (
                    'Register & Pay — R400'
                  )}
                </button>

                <p className="text-xs text-text-dark/50 text-center">
                  Secure payment via Yoco. No card details stored on our servers.
                </p>
              </form>

              <p className="text-center text-sm text-text-dark/60 mt-6">
                Questions? Email{' '}
                <a href="mailto:hello@wcscapetown.co.za" className="text-purple-accent hover:underline">
                  hello@wcscapetown.co.za
                </a>
              </p>
            </div>
          </section>
        </div>

      </main>
    </>
  );
}
