import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Code2,
  Laptop,
  Rocket,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react';

import PageHero from '../components/PageHero';
import Reveal, { Stagger, StaggerItem } from '../components/Reveal';
import { ErrorNote, LoadingBlock, WhatsappIcon } from '../components/ui';
import { useList, useSite } from '../lib/site';

const ICONS: Record<string, any> = {
  BadgeCheck,
  Rocket,
  ShieldAlert,
  Code2,
  Laptop,
  Building2,
  ShieldCheck,
  Sparkles,
  Star,
};

export default function Services() {
  const { settings, site } = useSite();
  const { items, loading, error } = useList<any>('/services');
  const waHref = site?.links?.whatsapp || 'https://wa.me/923003440200';

  return (
    <>
      <PageHero
        eyebrow="Services"
        title={
          <>
            Google Play Console accounts, app publishing and <span className="gradient-text">appeal handling</span>
          </>
        }
        subtitle="We do this work every day for our own apps and for clients — accounts, uploads, rejections, appeals, websites and apps. Same team, same office in Hyderabad."
        actions={
          <>
            <a href={waHref} target="_blank" rel="noreferrer" className="btn-whatsapp">
              <WhatsappIcon className="h-4 w-4" />
              Get a quote on WhatsApp
            </a>
            <Link to="/contact" className="btn-outline">
              Send your requirement
            </Link>
          </>
        }
      />

      <section className="section">
        <div className="container-x">
          {loading ? (
            <LoadingBlock label="Loading services…" />
          ) : error ? (
            <ErrorNote>{error}</ErrorNote>
          ) : (
            <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((service) => {
                const Icon = ICONS[service.icon] || Sparkles;
                return (
                  <StaggerItem key={service.id}>
                    <article className="card card-hover flex h-full flex-col p-6">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/25 to-neon-violet/25 text-cyan-200">
                        <Icon className="h-6 w-6" />
                      </span>
                      <h2 className="mt-4 font-display text-lg font-bold text-white">{service.title}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-slate-400">{service.description}</p>
                      {Array.isArray(service.features) && service.features.length ? (
                        <ul className="mt-4 grid gap-2">
                          {service.features.map((f: string) => (
                            <li key={f} className="flex gap-2 text-sm text-slate-300">
                              <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-lime-300" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                        <p className="text-sm font-semibold text-cyan-300">{service.price || 'Ask us'}</p>
                        <a
                          href={`${waHref}?text=${encodeURIComponent(`Assalam-o-Alaikum! Mujhe ye service chahiye: ${service.title}`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-primary btn-sm"
                        >
                          Enquire
                          <ArrowRight className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </article>
                  </StaggerItem>
                );
              })}
            </Stagger>
          )}

          <Reveal className="mt-14">
            <div className="card grid gap-8 p-8 lg:grid-cols-2 lg:p-10">
              <div>
                <span className="badge-neon">For clients</span>
                <h2 className="mt-4 font-display text-2xl font-extrabold text-white sm:text-3xl">
                  App rejected or account suspended?
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  Play Store rejections and suspensions are our daily work. Send us the rejection email or the console screenshot
                  on WhatsApp — we tell you honestly what is possible, what it costs and how long it takes.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a href={waHref} target="_blank" rel="noreferrer" className="btn-whatsapp">
                    <WhatsappIcon className="h-4 w-4" />
                    Send screenshot on WhatsApp
                  </a>
                  <a href={`mailto:${settings.email || 'subhanconsolestudio@gmail.com'}`} className="btn-outline">
                    {settings.email || 'subhanconsolestudio@gmail.com'}
                  </a>
                </div>
              </div>
              <ul className="grid gap-3">
                {[
                  'New & old Play Console accounts — individual and company',
                  'App upload, testing tracks and production release',
                  'Policy rejection reading and fix before re-upload',
                  'Suspension appeals with proper evidence',
                  'Store listing, icons, feature graphic and screenshots',
                  'Websites, Android apps and admin panels',
                ].map((line) => (
                  <li key={line} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-200">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
