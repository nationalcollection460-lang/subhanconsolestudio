import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, BadgeCheck, CheckCircle2, ClipboardList, Search, Send } from 'lucide-react';

import PageHero from '../components/PageHero';
import Reveal from '../components/Reveal';
import { ErrorNote, Field, Spinner, WhatsappIcon } from '../components/ui';
import { api } from '../lib/api';
import { useList, useSite } from '../lib/site';
import { cn, formatDate } from '../lib/utils';

const KINDS = [
  { key: 'job', label: 'Job in office', hint: 'Work with us — laptop provided, training given' },
  { key: 'course', label: 'Course / training', hint: '3 month course with job opportunity' },
  { key: 'service', label: 'Client work / service', hint: 'Play Console account, app publishing, appeals' },
  { key: 'other', label: 'Something else', hint: 'Any other question' },
];

const STATUS_LABEL: Record<string, string> = {
  new: 'Received — our team will call you',
  contacted: 'Contacted — please stay in touch',
  interview: 'Interview / office visit scheduled',
  joined: 'Joined / admitted',
  hired: 'Hired 🎉',
  rejected: 'Closed for now',
};

export default function Apply() {
  const { settings, site } = useSite();
  const [params] = useSearchParams();
  const courses = useList<any>('/courses');
  const jobs = useList<any>('/jobs');

  const [kind, setKind] = useState(params.get('kind') || 'job');
  const [interest, setInterest] = useState(params.get('interest') || '');
  const [form, setForm] = useState({ name: '', phone: '', email: '', city: 'Hyderabad', experience: '', message: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ id: number } | null>(null);

  const [trackId, setTrackId] = useState('');
  const [trackResult, setTrackResult] = useState<any | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [tracking, setTracking] = useState(false);

  useEffect(() => {
    const qKind = params.get('kind');
    const qInterest = params.get('interest');
    if (qKind) setKind(qKind);
    if (qInterest) setInterest(qInterest);
  }, [params]);

  const options = useMemo(() => {
    if (kind === 'course') return courses.items.map((c: any) => c.title);
    if (kind === 'job') return jobs.items.map((j: any) => j.title);
    if (kind === 'service') return site?.categories?.service || [];
    return [];
  }, [kind, courses.items, jobs.items, site?.categories?.service]);

  const waHref = site?.links?.whatsapp || 'https://wa.me/923003440200';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const data = await api.post<{ id: number }>('/applications', { ...form, kind, interest });
      setResult({ id: data.id });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err?.message || 'Could not submit your application.');
    } finally {
      setBusy(false);
    }
  }

  async function track(e: React.FormEvent) {
    e.preventDefault();
    setTracking(true);
    setTrackError(null);
    setTrackResult(null);
    try {
      const data = await api.get<{ application: any }>(`/track/${trackId.trim()}`);
      setTrackResult(data.application);
    } catch (err: any) {
      setTrackError(err?.message || 'Could not find this application.');
    } finally {
      setTracking(false);
    }
  }

  const waMessage = result
    ? `Assalam-o-Alaikum! Main ne Subhan Console Studio par application #${result.id} submit ki hai (${kind}: ${interest || '-'}). Mera naam ${form.name || '—'} hai.`
    : '';

  return (
    <>
      <PageHero
        eyebrow="Apply online"
        title={
          <>
            Apply for a <span className="gradient-text">course or office job</span>
          </>
        }
        subtitle="Fill this short form — our team calls you back, answers your questions and books your seat in the next batch. Or send the same details on WhatsApp."
        actions={
          <>
            <a href={waHref} target="_blank" rel="noreferrer" className="btn-whatsapp">
              <WhatsappIcon className="h-4 w-4" />
              Apply on WhatsApp
            </a>
            <Link to="/courses" className="btn-outline">
              See courses first
            </Link>
          </>
        }
      />

      <section className="section">
        <div className="container-x grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal>
            <div className="card p-6 sm:p-8">
              {result ? (
                <div className="space-y-5 text-center">
                  <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400/30 to-neon-violet/30 text-cyan-200">
                    <CheckCircle2 className="h-8 w-8" />
                  </span>
                  <h2 className="font-display text-2xl font-extrabold text-white">Application received!</h2>
                  <p className="text-sm text-slate-300">
                    Aap ka reference number <span className="font-bold text-white">#{result.id}</span> hai. Hamari team aap ko
                    phone par contact karegi, In sha Allah bohat jald.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <a
                      href={`${waHref}${waMessage ? `?text=${encodeURIComponent(waMessage)}` : ''}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-whatsapp"
                    >
                      <WhatsappIcon className="h-4 w-4" />
                      Send reference on WhatsApp
                    </a>
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() => {
                        setResult(null);
                        setInterest('');
                        setForm({ name: '', phone: '', email: '', city: 'Hyderabad', experience: '', message: '' });
                      }}
                    >
                      Submit another application
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <span className="label">What are you applying for?</span>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {KINDS.map((k) => (
                        <button
                          key={k.key}
                          type="button"
                          onClick={() => {
                            setKind(k.key);
                            setInterest('');
                          }}
                          className={cn(
                            'rounded-2xl border p-3.5 text-left transition',
                            kind === k.key
                              ? 'border-cyan-300/50 bg-cyan-400/10'
                              : 'border-white/[0.12] bg-white/[0.03] hover:border-white/25',
                          )}
                        >
                          <span className="flex items-center gap-2 font-semibold text-white">
                            {kind === k.key ? <BadgeCheck className="h-4 w-4 text-cyan-300" /> : null}
                            {k.label}
                          </span>
                          <span className="mt-1 block text-xs text-slate-400">{k.hint}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Field label="Full name *">
                    <input
                      required
                      className="input"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Ahmed Khan"
                    />
                  </Field>
                  <Field label="Mobile / WhatsApp *">
                    <input
                      required
                      className="input"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="03XX XXXXXXX"
                      inputMode="tel"
                    />
                  </Field>

                  {options.length ? (
                    <Field label={kind === 'job' ? 'Which job?' : kind === 'course' ? 'Which course?' : 'Which service?'}>
                      <select className="input" value={interest} onChange={(e) => setInterest(e.target.value)}>
                        <option value="">— Select —</option>
                        {options.map((opt: string) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                        <option value="Other / not sure">Other / not sure</option>
                      </select>
                    </Field>
                  ) : (
                    <Field label="What do you need?">
                      <input
                        className="input"
                        value={interest}
                        onChange={(e) => setInterest(e.target.value)}
                        placeholder="e.g. Play Console account, app upload"
                      />
                    </Field>
                  )}

                  <Field label="City / area">
                    <input
                      className="input"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="Hyderabad, Sarfraz Colony…"
                    />
                  </Field>
                  <Field label="Email (optional)">
                    <input
                      type="email"
                      className="input"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@gmail.com"
                    />
                  </Field>
                  <Field label="Experience / education">
                    <input
                      className="input"
                      value={form.experience}
                      onChange={(e) => setForm({ ...form, experience: e.target.value })}
                      placeholder="Matric / B.Com / 1 year computer course…"
                    />
                  </Field>

                  <Field label="Message (optional)" className="sm:col-span-2">
                    <textarea
                      rows={4}
                      className="input"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Aap kab start kar sakte hain, koi sawal…"
                    />
                  </Field>

                  {error ? (
                    <div className="sm:col-span-2">
                      <ErrorNote>{error}</ErrorNote>
                    </div>
                  ) : null}

                  <div className="sm:col-span-2">
                    <button type="submit" className="btn-primary w-full" disabled={busy}>
                      {busy ? <Spinner className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                      Submit application
                    </button>
                    <p className="mt-3 text-xs text-slate-500">
                      Aap ka number sirf studio ki team dekh sakti hai. Hum aap ko call ya WhatsApp karenge.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </Reveal>

          <div className="space-y-4">
            <Reveal delay={0.06}>
              <div className="card p-6">
                <p className="flex items-center gap-2 font-display font-bold text-white">
                  <ClipboardList className="h-5 w-5 text-cyan-300" />
                  Admission information
                </p>
                <ul className="mt-4 grid gap-3 text-sm text-slate-300">
                  {[
                    settings.admission_note || 'Bring CNIC/B-Form copy and 2 photos.',
                    'Laptops are provided in the office — apna computer lana zaroori nahi.',
                    'Morning aur evening batches available.',
                    'Instalments ki sahulat — WhatsApp par poochein.',
                    'Course ke baad job opportunity hamare office mein.',
                  ].map((line) => (
                    <li key={line} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-lime-300" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="card p-6">
                <p className="flex items-center gap-2 font-display font-bold text-white">
                  <Search className="h-5 w-5 text-cyan-300" />
                  Check your application
                </p>
                <p className="mt-2 text-sm text-slate-400">Apna reference number likhein aur status dekhein.</p>
                <form onSubmit={track} className="mt-4 flex gap-2">
                  <input
                    className="input"
                    value={trackId}
                    onChange={(e) => setTrackId(e.target.value)}
                    placeholder="e.g. 12"
                    inputMode="numeric"
                    aria-label="Reference number"
                  />
                  <button type="submit" className="btn-outline !px-4" disabled={tracking || !trackId.trim()}>
                    {tracking ? <Spinner className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                  </button>
                </form>
                {trackError ? (
                  <div className="mt-3">
                    <ErrorNote>{trackError}</ErrorNote>
                  </div>
                ) : null}
                {trackResult ? (
                  <div className="mt-4 rounded-2xl border border-cyan-300/25 bg-cyan-400/10 p-4 text-sm">
                    <p className="font-display font-bold text-white">
                      #{trackResult.id} — {trackResult.name}
                    </p>
                    <p className="mt-1 text-cyan-100">{STATUS_LABEL[trackResult.status] || trackResult.status}</p>
                    <p className="mt-2 text-xs text-slate-300">
                      {trackResult.kind} {trackResult.interest ? `• ${trackResult.interest}` : ''} • {formatDate(trackResult.created_at)}
                    </p>
                  </div>
                ) : null}
              </div>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="card p-6">
                <p className="font-display font-bold text-white">Office</p>
                <p className="mt-2 text-sm text-slate-400">{settings.address}</p>
                <p className="mt-1 text-sm text-slate-400">{settings.hours}</p>
                <a href={waHref} target="_blank" rel="noreferrer" className="btn-whatsapp btn-sm mt-4">
                  <WhatsappIcon className="h-4 w-4" />
                  WhatsApp {settings.whatsapp || '03003440200'}
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
