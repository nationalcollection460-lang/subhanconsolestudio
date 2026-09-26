import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';

import PageHero from '../components/PageHero';
import Reveal from '../components/Reveal';
import { ErrorNote, Field, SectionHeading, Spinner, SuccessNote, WhatsappIcon } from '../components/ui';
import { api } from '../lib/api';
import { useSite } from '../lib/site';

export default function Contact() {
  const { settings, site } = useSite();
  const [form, setForm] = useState({ name: '', phone: '', email: '', subject: '', message: '' });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const waHref = site?.links?.whatsapp || 'https://wa.me/923003440200';
  const mapQuery = settings.map_query || settings.address || 'Sarfraz Colony Hyderabad';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.post('/messages', form);
      setDone(true);
      setForm({ name: '', phone: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      setError(err?.message || 'Could not send your message.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Talk to <span className="gradient-text">Subhan Console Studio</span>
          </>
        }
        subtitle="WhatsApp is the fastest way to reach us. You can also call, email, send the form below, or visit the office near Sarfraz Colony, Hyderabad."
        actions={
          <>
            <a href={waHref} target="_blank" rel="noreferrer" className="btn-whatsapp">
              <WhatsappIcon className="h-4 w-4" />
              WhatsApp {settings.whatsapp || '03003440200'}
            </a>
            <a href={`tel:${String(settings.phone || '').replace(/\s/g, '')}`} className="btn-outline">
              <Phone className="h-4 w-4" />
              Call now
            </a>
          </>
        }
      />

      <section className="section">
        <div className="container-x grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <div className="card p-6 sm:p-8">
              <SectionHeading align="left" title="Send us a message" subtitle="Fill this form and our team will contact you on your mobile number." />
              {done ? (
                <div className="mt-6 space-y-4">
                  <SuccessNote>
                    Shukriya! Your message has reached the studio. We will contact you soon. For an urgent reply, WhatsApp us.
                  </SuccessNote>
                  <a href={waHref} target="_blank" rel="noreferrer" className="btn-whatsapp">
                    <WhatsappIcon className="h-4 w-4" />
                    Continue on WhatsApp
                  </a>
                </div>
              ) : (
                <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Field label="Your name *">
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
                  <Field label="Email (optional)">
                    <input
                      type="email"
                      className="input"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@gmail.com"
                    />
                  </Field>
                  <Field label="Subject">
                    <input
                      className="input"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder="Course / job / client work"
                    />
                  </Field>
                  <Field label="Message *" className="sm:col-span-2">
                    <textarea
                      required
                      rows={5}
                      className="input"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Apna sawal ya requirement likhein…"
                    />
                  </Field>
                  {error ? (
                    <div className="sm:col-span-2">
                      <ErrorNote>{error}</ErrorNote>
                    </div>
                  ) : null}
                  <div className="sm:col-span-2">
                    <button type="submit" className="btn-primary w-full sm:w-auto" disabled={busy}>
                      {busy ? <Spinner className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                      Send message
                    </button>
                  </div>
                </form>
              )}
            </div>
          </Reveal>

          <div className="space-y-4">
            <Reveal delay={0.05}>
              <div className="card p-6">
                <p className="label">Direct contact</p>
                <div className="grid gap-4 text-sm">
                  <a href={waHref} target="_blank" rel="noreferrer" className="flex items-start gap-3 text-slate-200 hover:text-white">
                    <WhatsappIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#25D366]" />
                    <span>
                      <span className="block font-semibold">WhatsApp</span>
                      {settings.whatsapp || '03003440200'}
                    </span>
                  </a>
                  <a href={`tel:${String(settings.phone || '').replace(/\s/g, '')}`} className="flex items-start gap-3 text-slate-200 hover:text-white">
                    <Phone className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
                    <span>
                      <span className="block font-semibold">Phone</span>
                      {settings.phone || '03003440200'}
                    </span>
                  </a>
                  <a href={`mailto:${settings.email}`} className="flex items-start gap-3 break-all text-slate-200 hover:text-white">
                    <Mail className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
                    <span>
                      <span className="block font-semibold">Email</span>
                      {settings.email || 'subhanconsolestudio@gmail.com'}
                    </span>
                  </a>
                  <div className="flex items-start gap-3 text-slate-200">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
                    <span>
                      <span className="block font-semibold">Office address</span>
                      {settings.address}
                    </span>
                  </div>
                  <div className="flex items-start gap-3 text-slate-200">
                    <Clock className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
                    <span>
                      <span className="block font-semibold">Timings</span>
                      {settings.hours}
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="card overflow-hidden">
                <iframe
                  title="Office location map"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
                  className="h-64 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <p className="text-xs text-slate-400">{settings.address}</p>
                  <a
                    href={site?.links?.maps || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-outline btn-sm"
                  >
                    Open in Google Maps
                  </a>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="card p-6">
                <p className="flex items-center gap-2 font-display font-bold text-white">
                  <MessageCircle className="h-5 w-5 text-cyan-300" />
                  AI assistant — 24/7
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  Nechy right corner par chat icon se humara AI assistant 24 ghante available hai. Courses, fees, timings ya job
                  ke baare mein foran jawab milega.
                </p>
                <Link to="/apply" className="btn-primary btn-sm mt-4">
                  Apply online
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
