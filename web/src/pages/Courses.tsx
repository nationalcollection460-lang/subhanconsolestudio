import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2, Clock, GraduationCap, Laptop, Layers } from 'lucide-react';

import PageHero from '../components/PageHero';
import Reveal, { Stagger, StaggerItem } from '../components/Reveal';
import { EmptyState, ErrorNote, LoadingBlock, Modal, SectionHeading, WhatsappIcon } from '../components/ui';
import { useList, useSite } from '../lib/site';
import { cn } from '../lib/utils';

export default function Courses() {
  const { settings, site } = useSite();
  const { items, loading, error } = useList<any>('/courses');
  const [category, setCategory] = useState('all');
  const [active, setActive] = useState<any | null>(null);

  const waHref = site?.links?.whatsapp || 'https://wa.me/923003440200';
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((c) => c.category && set.add(c.category));
    return ['all', ...Array.from(set)];
  }, [items]);

  const visible = category === 'all' ? items : items.filter((c) => c.category === category);

  return (
    <>
      <PageHero
        eyebrow="Courses"
        title={
          <>
            Professional IT courses in Hyderabad — <span className="gradient-text">3 month course with job opportunity</span>
          </>
        }
        subtitle="Google Play Console, app development, web development, design, marketing and computer basics. Office laptops are provided, batches are small, and practical work starts on day one."
        actions={
          <>
            <Link to="/apply" className="btn-primary">
              Apply for a course
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href={waHref} target="_blank" rel="noreferrer" className="btn-whatsapp">
              <WhatsappIcon className="h-4 w-4" />
              Fees poochhein
            </a>
          </>
        }
      >
        <div className="mt-8 flex flex-wrap gap-3 text-xs text-slate-300">
          <span className="badge">
            <Laptop className="h-3.5 w-3.5 text-cyan-300" />
            Office laptop provided
          </span>
          <span className="badge">
            <Clock className="h-3.5 w-3.5 text-cyan-300" />
            Morning / evening batches
          </span>
          <span className="badge">
            <GraduationCap className="h-3.5 w-3.5 text-cyan-300" />
            Certificate on completion
          </span>
        </div>
      </PageHero>

      <section className="section">
        <div className="container-x">
          {loading ? (
            <LoadingBlock label="Loading courses…" />
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
                    {cat === 'all' ? 'All courses' : cat}
                  </button>
                ))}
              </div>

              {visible.length === 0 ? (
                <EmptyState title="No courses in this category yet" hint="Try another category or WhatsApp us for the full list." />
              ) : (
                <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {visible.map((course) => (
                    <StaggerItem key={course.id}>
                      <article className="card card-hover group flex h-full flex-col overflow-hidden">
                        {course.image_url ? (
                          <img
                            src={course.image_url}
                            alt={course.title}
                            width={940}
                            height={420}
                            loading="lazy"
                            className="h-44 w-full object-cover opacity-90 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
                          />
                        ) : (
                          <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-cyan-500/20 via-brand-600/20 to-neon-violet/20">
                            <BookOpen className="h-10 w-10 text-white/70" />
                          </div>
                        )}
                        <div className="flex flex-1 flex-col p-6">
                          <div className="flex flex-wrap items-center gap-2">
                            {course.badge ? <span className="badge-neon">{course.badge}</span> : null}
                            <span className="badge">{course.duration}</span>
                            {course.level ? <span className="badge">{course.level}</span> : null}
                          </div>
                          <h2 className="mt-3 font-display text-lg font-bold leading-snug text-white">{course.title}</h2>
                          <p className="mt-2 text-sm leading-relaxed text-slate-400">{course.summary}</p>
                          <dl className="mt-4 grid gap-2 text-sm">
                            <div className="flex items-center justify-between gap-3">
                              <dt className="text-slate-500">Fee</dt>
                              <dd className="font-semibold text-white">{course.fee || 'Ask us'}</dd>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <dt className="text-slate-500">Mode</dt>
                              <dd className="text-right font-medium text-slate-200">{course.mode}</dd>
                            </div>
                          </dl>
                          <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                            <button type="button" className="btn-outline btn-sm" onClick={() => setActive(course)}>
                              <Layers className="h-3.5 w-3.5" />
                              Details
                            </button>
                            <Link to={`/apply?kind=course&interest=${encodeURIComponent(course.title)}`} className="btn-primary btn-sm">
                              Apply
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        </div>
                      </article>
                    </StaggerItem>
                  ))}
                </Stagger>
              )}
            </>
          )}

          <Reveal className="mt-14">
            <div className="card flex flex-col items-center gap-5 p-8 text-center sm:p-10">
              <SectionHeading
                eyebrow="Admission"
                title="Admission open — bring CNIC/B-Form and 2 photos"
                subtitle={settings.admission_note}
              />
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/apply" className="btn-primary">
                  Apply online now
                </Link>
                <a href={waHref} target="_blank" rel="noreferrer" className="btn-whatsapp">
                  <WhatsappIcon className="h-4 w-4" />
                  WhatsApp {settings.whatsapp || '03003440200'}
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Modal open={Boolean(active)} onClose={() => setActive(null)} title={active?.title || ''} subtitle={active?.category} wide>
        {active ? (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <span className="badge-neon">{active.duration}</span>
              <span className="badge">{active.level}</span>
              <span className="badge">{active.mode}</span>
            </div>
            {active.image_url ? (
              <img
                src={active.image_url}
                alt={active.title}
                width={940}
                height={420}
                loading="lazy"
                className="h-52 w-full rounded-2xl object-cover"
              />
            ) : null}
            <p className="text-sm leading-relaxed text-slate-300">{active.description || active.summary}</p>
            {Array.isArray(active.highlights) && active.highlights.length ? (
              <div>
                <p className="label">What you will learn</p>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {active.highlights.map((h: string) => (
                    <li key={h} className="flex gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-lime-300" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">Course fee</p>
                <p className="font-display text-lg font-bold text-white">{active.fee || 'Ask us on WhatsApp'}</p>
              </div>
              <div className="flex gap-2">
                <Link to={`/apply?kind=course&interest=${encodeURIComponent(active.title)}`} className="btn-primary btn-sm">
                  Apply for this course
                </Link>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-whatsapp btn-sm"
                  onClick={() => setActive(null)}
                >
                  <WhatsappIcon className="h-4 w-4" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
