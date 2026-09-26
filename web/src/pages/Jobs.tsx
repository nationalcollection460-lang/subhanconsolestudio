import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Briefcase, Building2, ClipboardList, Laptop, MapPin, Users } from 'lucide-react';

import PageHero from '../components/PageHero';
import Reveal, { Stagger, StaggerItem } from '../components/Reveal';
import { EmptyState, ErrorNote, LoadingBlock, WhatsappIcon } from '../components/ui';
import { useList, useSite } from '../lib/site';
import { cn } from '../lib/utils';

export default function Jobs() {
  const { settings, site } = useSite();
  const { items, loading, error } = useList<any>('/jobs');
  const [category, setCategory] = useState('all');

  const waHref = site?.links?.whatsapp || 'https://wa.me/923003440200';
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((j) => j.category && set.add(j.category));
    return ['all', ...Array.from(set)];
  }, [items]);

  const visible = category === 'all' ? items : items.filter((j) => j.category === category);
  const totalPositions = items.reduce((sum, j) => sum + (Number(j.positions) || 0), 0);

  return (
    <>
      <PageHero
        eyebrow="Jobs & office work"
        title={
          <>
            Work in our office — <span className="gradient-text">laptop provided, training given</span>
          </>
        }
        subtitle="We hire from our own students and train people from zero. Google Play Console work, app publishing, data, design and support roles — all sitting in our Hyderabad office near Sarfraz Colony."
        actions={
          <>
            <Link to="/apply?kind=job" className="btn-primary">
              Apply for a job
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href={waHref} target="_blank" rel="noreferrer" className="btn-whatsapp">
              <WhatsappIcon className="h-4 w-4" />
              WhatsApp {settings.whatsapp || '03003440200'}
            </a>
          </>
        }
      >
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Briefcase, label: 'Open positions', value: totalPositions || items.length },
            { icon: Laptop, label: 'Roles with office laptop', value: items.filter((j) => j.laptop).length },
            { icon: BadgeCheck, label: 'Training provided', value: items.filter((j) => j.training).length },
          ].map((s) => (
            <div key={s.label} className="card flex items-center gap-3 p-4">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/25 to-neon-violet/25 text-cyan-200">
                <s.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-lg font-extrabold text-white">{s.value}</p>
                <p className="text-[11px] uppercase tracking-wide text-slate-400">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </PageHero>

      <section className="section">
        <div className="container-x">
          {loading ? (
            <LoadingBlock label="Loading jobs…" />
          ) : error ? (
            <ErrorNote>{error}</ErrorNote>
          ) : (
            <>
              <div className="mb-8 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={cn(
                      'shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition',
                      category === cat
                        ? 'border-cyan-300/50 bg-cyan-400/15 text-white'
                        : 'border-white/[0.12] bg-white/[0.04] text-slate-300 hover:border-white/25 hover:text-white',
                    )}
                  >
                    {cat === 'all' ? 'All jobs' : cat}
                  </button>
                ))}
              </div>

              {visible.length === 0 ? (
                <EmptyState title="No openings in this category right now" hint="Send us your details anyway — we keep CVs for the next batch." />
              ) : (
                <Stagger className="grid gap-5 lg:grid-cols-2">
                  {visible.map((job) => (
                    <StaggerItem key={job.id}>
                      <article className="card card-hover flex h-full flex-col p-6">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="badge-neon">{job.type || 'Full time'}</span>
                          {job.laptop ? (
                            <span className="badge">
                              <Laptop className="h-3.5 w-3.5 text-cyan-300" />
                              Laptop provided
                            </span>
                          ) : null}
                          {job.badge ? <span className="badge">{job.badge}</span> : null}
                        </div>

                        <h2 className="mt-3 font-display text-xl font-bold text-white">{job.title}</h2>
                        <p className="mt-2 text-sm leading-relaxed text-slate-400">{job.description}</p>

                        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                          <div className="flex items-start gap-2">
                            <span className="text-2xl">💰</span>
                            <div>
                              <dt className="text-[11px] uppercase tracking-wide text-slate-500">Salary</dt>
                              <dd className="font-semibold text-white">{job.salary}</dd>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="mt-1 h-4 w-4 shrink-0 text-cyan-300" />
                            <div>
                              <dt className="text-[11px] uppercase tracking-wide text-slate-500">Location</dt>
                              <dd className="font-medium text-slate-200">{job.location}</dd>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Users className="mt-1 h-4 w-4 shrink-0 text-cyan-300" />
                            <div>
                              <dt className="text-[11px] uppercase tracking-wide text-slate-500">Positions</dt>
                              <dd className="font-medium text-slate-200">{job.positions}</dd>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <ClipboardList className="mt-1 h-4 w-4 shrink-0 text-cyan-300" />
                            <div>
                              <dt className="text-[11px] uppercase tracking-wide text-slate-500">Experience</dt>
                              <dd className="font-medium text-slate-200">{job.experience || 'Any'}</dd>
                            </div>
                          </div>
                        </dl>

                        {Array.isArray(job.requirements) && job.requirements.length ? (
                          <div className="mt-4 border-t border-white/10 pt-4">
                            <p className="label">Requirements</p>
                            <ul className="grid gap-1.5">
                              {job.requirements.map((r: string) => (
                                <li key={r} className="flex gap-2 text-sm text-slate-300">
                                  <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-lime-300" />
                                  {r}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}

                        {job.training ? (
                          <p className="mt-4 flex items-start gap-2 rounded-xl border border-cyan-300/20 bg-cyan-400/10 p-3 text-xs text-cyan-100">
                            <Building2 className="mt-0.5 h-4 w-4 shrink-0" />
                            {job.training}
                          </p>
                        ) : null}

                        <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                          <Link to={`/apply?kind=job&interest=${encodeURIComponent(job.title)}`} className="btn-primary btn-sm">
                            Apply for this job
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                          <a
                            href={`${waHref}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-outline btn-sm"
                          >
                            <WhatsappIcon className="h-3.5 w-3.5 text-[#25D366]" />
                            Ask a question
                          </a>
                        </div>
                      </article>
                    </StaggerItem>
                  ))}
                </Stagger>
              )}
            </>
          )}

          <Reveal className="mt-14">
            <div className="card grid gap-6 p-8 sm:grid-cols-[1.4fr_1fr] sm:items-center">
              <div>
                <h2 className="font-display text-2xl font-extrabold text-white">3 month course ke baad job</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  Agar aap ke paas experience nahi hai to pehle 3 month course karein — office laptop, live Play Console work
                  aur course ke baad hamare office mein job opportunity. Puri tafseel WhatsApp par bhi mil sakti hai.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Link to="/courses" className="btn-primary">
                  See 3 month courses
                </Link>
                <Link to="/apply?kind=course" className="btn-outline">
                  Apply as student
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
