import { Link } from 'react-router-dom';
import { ArrowRight, Award, Briefcase, GraduationCap, Quote, Users } from 'lucide-react';

import PageHero from '../components/PageHero';
import Reveal, { Stagger, StaggerItem } from '../components/Reveal';
import { Avatar, EmptyState, ErrorNote, LoadingBlock, SectionHeading, WhatsappIcon } from '../components/ui';
import { useList, useSite } from '../lib/site';

export default function Students() {
  const { settings, site } = useSite();
  const { items, loading, error } = useList<any>('/students');
  const waHref = site?.links?.whatsapp || 'https://wa.me/923003440200';

  const placed = items.filter((s) => s.placed).length;

  return (
    <>
      <PageHero
        eyebrow="Our students"
        title={
          <>
            Students of <span className="gradient-text">Subhan Console Studio</span>
          </>
        }
        subtitle="Real students, real results. Many of them now work in our own office, in Hyderabad IT offices, or freelance from home with the skills they learned here."
        actions={
          <>
            <Link to="/apply?kind=course" className="btn-primary">
              Become a student
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
            { icon: Users, label: 'Students trained', value: `${settings.stat_students || '500'}+` },
            { icon: Briefcase, label: 'Placed / working', value: `${settings.stat_jobs || '150'}+` },
            { icon: Award, label: 'Years in Hyderabad', value: `${settings.stat_years || '3'}+` },
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
            <LoadingBlock label="Loading students…" />
          ) : error ? (
            <ErrorNote>{error}</ErrorNote>
          ) : items.length === 0 ? (
            <EmptyState title="Student list is being updated" hint="WhatsApp us and we will share results and student references." />
          ) : (
            <>
              <SectionHeading
                eyebrow="Placements"
                title={`${placed || items.length} students are working right now`}
                subtitle="Photos and details are added by the studio admin — each of these students completed a course here."
              />
              <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((student) => (
                  <StaggerItem key={student.id}>
                    <article className="card card-hover flex h-full flex-col p-6">
                      <div className="flex items-center gap-4">
                        <Avatar src={student.photo_url} name={student.name} size={64} />
                        <div className="min-w-0">
                          <p className="truncate font-display text-base font-bold text-white">{student.name}</p>
                          <p className="truncate text-xs text-slate-400">{student.position}{student.company ? ` • ${student.company}` : ''}</p>
                          {student.placed ? (
                            <span className="badge-neon mt-2">Working now</span>
                          ) : (
                            <span className="badge mt-2">In training</span>
                          )}
                        </div>
                      </div>

                      {student.quote ? (
                        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                          <Quote className="h-4 w-4 text-cyan-300" />
                          <p className="mt-2 text-sm italic leading-relaxed text-slate-300">{student.quote}</p>
                        </div>
                      ) : null}

                      <dl className="mt-5 grid gap-2 border-t border-white/10 pt-4 text-sm">
                        <div className="flex items-center justify-between gap-3">
                          <dt className="flex items-center gap-2 text-slate-500">
                            <GraduationCap className="h-4 w-4" />
                            Course
                          </dt>
                          <dd className="text-right font-medium text-slate-200">{student.course}</dd>
                        </div>
                        {student.batch || student.year ? (
                          <div className="flex items-center justify-between gap-3">
                            <dt className="text-slate-500">Batch / year</dt>
                            <dd className="font-medium text-slate-200">
                              {student.batch} {student.year ? `• ${student.year}` : ''}
                            </dd>
                          </div>
                        ) : null}
                      </dl>
                    </article>
                  </StaggerItem>
                ))}
              </Stagger>
            </>
          )}

          <Reveal className="mt-14">
            <div className="card flex flex-col items-center gap-5 p-8 text-center sm:p-10">
              <h2 className="font-display text-2xl font-extrabold text-white sm:text-3xl">Aap bhi is list mein aa sakte hain</h2>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-300">
                3 month course, office laptop, live Play Console work aur course ke baad job opportunity. Sirf mehnat karni hai —
                baqi sab hum sikhate hain.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/apply?kind=course" className="btn-primary">
                  Apply as student
                </Link>
                <a href={waHref} target="_blank" rel="noreferrer" className="btn-whatsapp">
                  <WhatsappIcon className="h-4 w-4" />
                  WhatsApp
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
