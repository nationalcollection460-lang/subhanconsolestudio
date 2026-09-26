import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Building2,
  Clock,
  Laptop,
  Mail,
  MapPin,
  Phone,
  Rocket,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

import PageHero from '../components/PageHero';
import Reveal, { Stagger, StaggerItem } from '../components/Reveal';
import { Avatar, SectionHeading, WhatsappIcon } from '../components/ui';
import { useSite } from '../lib/site';

export default function About() {
  const { settings, site } = useSite();
  const waHref = site?.links?.whatsapp || 'https://wa.me/923003440200';

  const timeline = [
    { year: 'Start', title: 'Studio started in Hyderabad', text: 'Subhan started handling Google Play Console accounts and app publishing work from a small office set-up.' },
    { year: 'Growth', title: 'First training batches', text: 'Students from Sarfraz Colony and nearby areas joined for practical Play Console and app training.' },
    { year: 'Now', title: '3 month course + office jobs', text: 'We teach on office laptops, work on live client accounts and give job opportunity to our own students.' },
  ];

  return (
    <>
      <PageHero
        eyebrow="About us"
        title={
          <>
            {settings.studio_name || 'Subhan Console Studio'} — <span className="gradient-text">near Sarfraz Colony, Hyderabad</span>
          </>
        }
        subtitle={settings.about}
        actions={
          <>
            <a href={waHref} target="_blank" rel="noreferrer" className="btn-whatsapp">
              <WhatsappIcon className="h-4 w-4" />
              WhatsApp {settings.whatsapp || '03003440200'}
            </a>
            <Link to="/contact" className="btn-outline">
              Visit our office
            </Link>
          </>
        }
      />

      {/* owner */}
      <section className="section">
        <div className="container-x grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <div className="card overflow-hidden p-6">
              <div className="flex items-center gap-4">
                <Avatar src={settings.owner_photo_url} name={settings.owner_name || 'Subhan'} size={84} />
                <div>
                  <p className="font-display text-xl font-extrabold text-white">{settings.owner_name || 'Subhan'}</p>
                  <p className="text-sm text-cyan-300">{settings.owner_title || 'Founder & Lead Instructor'}</p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-slate-300">{settings.owner_bio}</p>
              <div className="mt-6 grid gap-3 border-t border-white/10 pt-5 text-sm">
                <a href={`tel:${String(settings.owner_phone || settings.phone || '').replace(/\s/g, '')}`} className="flex items-center gap-3 text-slate-300 hover:text-white">
                  <Phone className="h-4 w-4 text-cyan-300" />
                  {settings.owner_phone || settings.phone || '03003440200'}
                </a>
                <a href={`mailto:${settings.email}`} className="flex items-center gap-3 break-all text-slate-300 hover:text-white">
                  <Mail className="h-4 w-4 shrink-0 text-cyan-300" />
                  {settings.email || 'subhanconsolestudio@gmail.com'}
                </a>
                <span className="flex items-start gap-3 text-slate-300">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                  {settings.address}
                </span>
                <span className="flex items-start gap-3 text-slate-300">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                  {settings.hours}
                </span>
              </div>
            </div>
          </Reveal>

          <div>
            <SectionHeading
              align="left"
              eyebrow="Our story"
              title="We teach the work we actually do every day"
              subtitle="Play Console accounts, app uploads, rejections and appeals are not theory for us — it is our daily office work. That is exactly what students learn at Subhan Console Studio."
            />
            <Reveal className="mt-8">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { icon: Laptop, title: 'Office laptops', text: 'Students and staff work on office machines with internet — no personal computer needed.' },
                  { icon: Users, title: 'Small batches', text: 'Limited students per batch so everyone gets individual attention.' },
                  { icon: ShieldCheck, title: 'Confidential handling', text: 'Client accounts are handled with strict confidentiality and safety rules.' },
                  { icon: Rocket, title: 'Live projects', text: 'Real accounts, real apps, real deadlines — the fastest way to learn.' },
                ].map((f) => (
                  <div key={f.title} className="card p-5">
                    <f.icon className="h-5 w-5 text-cyan-300" />
                    <p className="mt-3 font-display font-bold text-white">{f.title}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{f.text}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* office images */}
      <section className="section border-y border-white/10 bg-ink-900/40">
        <div className="container-x">
          <SectionHeading eyebrow="Our office" title="A working IT set-up, not just a classroom" />
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {[settings.office_image_url, settings.hero_image_url]
              .filter(Boolean)
              .slice(0, 2)
              .map((src, i) => (
                <Reveal key={`${src}-${i}`} delay={i * 0.08}>
                  <img
                    src={src}
                    alt={`${settings.studio_name || 'Studio'} office and computer lab`}
                    width={940}
                    height={620}
                    loading="lazy"
                    className="h-64 w-full rounded-3xl border border-white/10 object-cover sm:h-80"
                  />
                </Reveal>
              ))}
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Award, label: '3+ years experience', text: 'Serving Hyderabad students and clients since we started.' },
              { icon: BadgeCheck, label: 'Certificate', text: 'Every student gets a completion certificate and CV help.' },
              { icon: Sparkles, label: 'Support after course', text: 'WhatsApp support group and office help after you finish.' },
            ].map((c, i) => (
              <Reveal key={c.label} delay={i * 0.06}>
                <div className="card h-full p-6">
                  <c.icon className="h-5 w-5 text-cyan-300" />
                  <p className="mt-3 font-display font-bold text-white">{c.label}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{c.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* timeline */}
      <section className="section">
        <div className="container-x">
          <SectionHeading eyebrow="Journey" title="From a small set-up to a training + job studio" />
          <Stagger className="mt-12 grid gap-5 md:grid-cols-3">
            {timeline.map((t) => (
              <StaggerItem key={t.year}>
                <div className="card h-full p-6">
                  <span className="badge-neon">{t.year}</span>
                  <p className="mt-4 font-display text-lg font-bold text-white">{t.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{t.text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal className="mt-12">
            <div className="card flex flex-col items-center gap-5 p-8 text-center sm:p-10">
              <Building2 className="h-8 w-8 text-cyan-300" />
              <h2 className="font-display text-2xl font-extrabold text-white">Come and see the office yourself</h2>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-300">
                {settings.address} — {settings.hours}. WhatsApp us before visiting so the instructor is free to show you around and
                explain the course.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <a href={waHref} target="_blank" rel="noreferrer" className="btn-whatsapp">
                  <WhatsappIcon className="h-4 w-4" />
                  Book a visit
                </a>
                <Link to="/apply" className="btn-primary">
                  Apply online
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
