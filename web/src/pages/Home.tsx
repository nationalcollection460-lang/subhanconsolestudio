import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Clock,
  GraduationCap,
  Laptop,
  MapPin,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';

import Reveal, { Stagger, StaggerItem } from '../components/Reveal';
import { Accordion, Avatar, LoadingBlock, SectionHeading, WhatsappIcon } from '../components/ui';
import { useList, useSite } from '../lib/site';
import { cn } from '../lib/utils';

function Counter({ value, suffix = '' }: { value: string | number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const target = Number(String(value).replace(/[^0-9.]/g, '')) || 0;
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    const total = 60;
    const tick = () => {
      frame += 1;
      const progress = 1 - Math.pow(1 - frame / total, 3);
      setShown(Math.round(target * progress));
      if (frame < total) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {shown}
      {suffix}
    </span>
  );
}

function HeroVisual({ imageUrl, studio }: { imageUrl?: string; studio: string }) {
  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        className="relative overflow-hidden rounded-[2rem] border border-white/[0.12] bg-ink-900/70 p-2 shadow-card backdrop-blur"
      >
        <div className="relative overflow-hidden rounded-[1.6rem]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`${studio} training office`}
              width={940}
              height={650}
              className="h-[300px] w-full object-cover sm:h-[380px] lg:h-[420px]"
            />
          ) : (
            <div className="h-[300px] w-full bg-gradient-to-br from-cyan-500/30 via-brand-600/30 to-neon-violet/30 sm:h-[380px]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />

          <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/[0.12] bg-ink-950/80 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-300 to-neon-violet text-ink-950">
                  <Rocket className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display text-sm font-bold text-white">Uploading to Play Console…</p>
                  <p className="text-[11px] text-slate-400">Live practice in our Hyderabad office</p>
                </div>
              </div>
              <span className="badge-neon">LIVE</span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-neon-violet"
                initial={{ width: '12%' }}
                animate={{ width: ['12%', '94%', '62%'] }}
                transition={{ duration: 6, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute -left-3 top-8 hidden animate-float rounded-2xl border border-white/[0.12] bg-ink-900/90 px-3.5 py-2.5 shadow-card backdrop-blur sm:block"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <p className="flex items-center gap-2 text-xs font-semibold text-white">
          <Laptop className="h-4 w-4 text-cyan-300" />
          Office laptop provided
        </p>
      </motion.div>

      <motion.div
        className="absolute -right-3 bottom-24 hidden animate-float rounded-2xl border border-white/[0.12] bg-ink-900/90 px-3.5 py-2.5 shadow-card backdrop-blur sm:block"
        style={{ animationDelay: '1.2s' }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7 }}
      >
        <p className="flex items-center gap-2 text-xs font-semibold text-white">
          <Briefcase className="h-4 w-4 text-lime-300" />
          Job after 3 month course
        </p>
      </motion.div>
    </div>
  );
}

function AdBanner({ ad }: { ad: any }) {
  const content = (
    <div className="card card-hover flex h-full flex-col gap-3 p-5">
      <div className="flex items-center justify-between gap-3">
        {ad.badge ? <span className="badge-neon">{ad.badge}</span> : <span className="badge">Announcement</span>}
        <Zap className="h-4 w-4 text-cyan-300" />
      </div>
      <p className="font-display text-lg font-bold text-white">{ad.title}</p>
      <p className="text-sm leading-relaxed text-slate-400">{ad.body}</p>
      {ad.link ? (
        <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-300">
          {ad.link_label || 'Read more'}
          <ArrowRight className="h-4 w-4" />
        </span>
      ) : null}
    </div>
  );

  if (!ad.link) return content;
  const external = /^https?:/i.test(ad.link);
  return external ? (
    <a href={ad.link} target="_blank" rel="noreferrer" className="block h-full">
      {content}
    </a>
  ) : (
    <Link to={ad.link} className="block h-full">
      {content}
    </Link>
  );
}

export default function Home() {
  const { settings, site } = useSite();
  const courses = useList('/courses');
  const jobs = useList('/jobs');
  const services = useList('/services');
  const students = useList('/students');

  const waHref = site?.links?.whatsapp || 'https://wa.me/923003440200';
  const ads = site?.ads || [];

  const stats = [
    { label: 'Years in Hyderabad', value: settings.stat_years || '3', suffix: '+', icon: TrendingUp },
    { label: 'Students trained', value: settings.stat_students || '500', suffix: '+', icon: Users },
    { label: 'Placed / working', value: settings.stat_jobs || '150', suffix: '+', icon: Briefcase },
    { label: 'Courses & tracks', value: settings.stat_courses || '12', suffix: '', icon: BookOpen },
  ];

  return (
    <>
      {/* ---------------------------------------------------------- hero */}
      <section className="relative overflow-hidden pb-14 pt-10 sm:pb-20 sm:pt-14">
        <div className="container-x grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-wrap items-center gap-2"
            >
              <span className="badge-neon">
                <Sparkles className="h-3.5 w-3.5" />
                Google Play Console specialists
              </span>
              <span className="badge">
                <MapPin className="h-3.5 w-3.5" />
                Sarfraz Colony, Hyderabad
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="mt-5 text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-[3.4rem]"
            >
              {settings.hero_heading || 'Learn Google Play Console work and get a job in our own office'}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg"
            >
              {settings.hero_sub ||
                '3 month professional course, office laptops provided, live Play Console practice, and a job opportunity after the course.'}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="mt-7 flex flex-wrap gap-3"
            >
              <Link to="/apply" className="btn-primary">
                Apply Now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href={waHref} target="_blank" rel="noreferrer" className="btn-whatsapp">
                <WhatsappIcon className="h-4 w-4" />
                WhatsApp {settings.whatsapp || '03003440200'}
              </a>
              <Link to="/courses" className="btn-outline">
                See all courses
              </Link>
            </motion.div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.24 + i * 0.06 }}
                  className="card p-3.5"
                >
                  <stat.icon className="h-4 w-4 text-cyan-300" />
                  <p className="mt-2 font-display text-2xl font-extrabold text-white">
                    <Counter value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <HeroVisual imageUrl={settings.hero_image_url} studio={settings.studio_name || 'Subhan Console Studio'} />
        </div>
      </section>

      {/* ------------------------------------------------------- ticker */}
      <section className="border-y border-white/10 bg-ink-900/50 py-4">
        <div className="flex w-max animate-marquee gap-8 pr-8">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center gap-8">
              {(site?.categories?.all || [])
                .slice(0, 10)
                .map((c) => (
                  <span key={`${dup}-${c.kind}-${c.name}`} className="flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-slate-300">
                    <BadgeCheck className="h-4 w-4 text-cyan-300" />
                    {c.name}
                  </span>
                ))}
            </div>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------- services */}
      <section className="section">
        <div className="container-x">
          <SectionHeading
            eyebrow="What we do"
            title="Google Play Console, app publishing & IT training — all under one roof"
            subtitle="From account creation to app launch and appeal handling, we do the real work daily. Students learn on those live projects."
          />
          {services.loading ? (
            <LoadingBlock label="Loading services…" />
          ) : (
            <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.items.slice(0, 6).map((service: any) => (
                <StaggerItem key={service.id}>
                  <div className="card card-hover h-full p-6">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/25 to-neon-violet/25 text-cyan-200">
                      <ShieldCheck className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 font-display text-lg font-bold text-white">{service.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">{service.description}</p>
                    {service.price ? <p className="mt-4 text-sm font-semibold text-cyan-300">{service.price}</p> : null}
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          )}
          <Reveal className="mt-8 text-center">
            <Link to="/services" className="btn-outline">
              All services
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------ courses */}
      <section className="section border-y border-white/10 bg-ink-900/40">
        <div className="container-x">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              align="left"
              eyebrow="Courses"
              title="3 month courses with job opportunity"
              subtitle="Small batches, office laptops, practical work from day one — and a job opportunity in our own office for students who perform."
            />
            <Reveal delay={0.1}>
              <Link to="/courses" className="btn-primary shrink-0">
                All courses
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>

          {courses.loading ? (
            <LoadingBlock label="Loading courses…" />
          ) : (
            <Stagger className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {courses.items.slice(0, 6).map((course: any) => (
                <StaggerItem key={course.id}>
                  <article className="card card-hover group flex h-full flex-col overflow-hidden">
                    {course.image_url ? (
                      <img
                        src={course.image_url}
                        alt={course.title}
                        width={940}
                        height={420}
                        loading="lazy"
                        className="h-40 w-full object-cover opacity-90 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
                      />
                    ) : (
                      <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-cyan-500/20 via-brand-600/20 to-neon-violet/20">
                        <GraduationCap className="h-10 w-10 text-white/70" />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex flex-wrap items-center gap-2">
                        {course.badge ? <span className="badge-neon">{course.badge}</span> : null}
                        <span className="badge">{course.duration}</span>
                      </div>
                      <h3 className="mt-3 font-display text-lg font-bold leading-snug text-white">{course.title}</h3>
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-400">{course.summary}</p>
                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                        <div>
                          <p className="text-[11px] uppercase tracking-wide text-slate-500">Fee</p>
                          <p className="text-sm font-bold text-white">{course.fee || 'Ask us'}</p>
                        </div>
                        <Link to="/apply" className="btn-primary btn-sm">
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
        </div>
      </section>

      {/* -------------------------------------------------------- ads */}
      {ads.length ? (
        <section className="section">
          <div className="container-x">
            <SectionHeading eyebrow="Announcements" title="Latest from the studio" />
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {ads.slice(0, 3).map((ad: any, i: number) => (
                <Reveal key={ad.id} delay={i * 0.08}>
                  <AdBanner ad={ad} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ------------------------------------------------------- jobs */}
      <section className="section border-y border-white/10 bg-ink-900/40">
        <div className="container-x">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              align="left"
              eyebrow="Work with us"
              title="Office jobs — laptop provided, training given"
              subtitle="We hire from our own students. If you have basic computer knowledge, we train you and give you a real seat in the office."
            />
            <Reveal delay={0.1}>
              <Link to="/jobs" className="btn-primary shrink-0">
                All openings
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>

          {jobs.loading ? (
            <LoadingBlock label="Loading jobs…" />
          ) : (
            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              {jobs.items.slice(0, 4).map((job: any, i: number) => (
                <Reveal key={job.id} delay={i * 0.06}>
                  <article className="card card-hover h-full p-6">
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
                    <h3 className="mt-3 font-display text-xl font-bold text-white">{job.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">{job.description}</p>
                    <dl className="mt-4 grid gap-3 border-t border-white/10 pt-4 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-[11px] uppercase tracking-wide text-slate-500">Salary</dt>
                        <dd className="font-semibold text-white">{job.salary}</dd>
                      </div>
                      <div>
                        <dt className="text-[11px] uppercase tracking-wide text-slate-500">Location</dt>
                        <dd className="font-semibold text-white">{job.location}</dd>
                      </div>
                    </dl>
                    <div className="mt-5 flex gap-3">
                      <Link to="/apply" className="btn-primary btn-sm">
                        Apply for this job
                      </Link>
                      <Link to="/jobs" className="btn-outline btn-sm">
                        Details
                      </Link>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------------------------------------------------- features */}
      <section className="section">
        <div className="container-x">
          <SectionHeading
            eyebrow="Why students choose us"
            title="A real office, real client work, real job"
            subtitle="You are not sitting in a classroom with theory slides. You work on live Google Play Console accounts on our office laptops."
          />
          <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Laptop, title: 'Office laptop provided', text: 'No computer at home? No problem. Every student works on an office laptop with internet.' },
              { icon: Briefcase, title: '3 month course + job', text: 'Complete the course and perform well — we offer a job opportunity in our own office.' },
              { icon: Rocket, title: 'Live Play Console work', text: 'Account creation, uploads, releases, rejection fixes and appeals — done on real accounts.' },
              { icon: Users, title: 'Small batches', text: 'Limited seats per batch so every student gets personal attention from the instructor.' },
              { icon: ShieldCheck, title: 'Certificate & CV help', text: 'Completion certificate plus help writing your CV and preparing for interviews.' },
              { icon: Clock, title: 'Support after course', text: 'Stay in our WhatsApp support group and come to the office whenever you need help.' },
            ].map((f) => (
              <StaggerItem key={f.title}>
                <div className="card card-hover h-full p-6">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/25 to-neon-violet/25 text-cyan-200">
                    <f.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold text-white">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ---------------------------------------------------- students */}
      <section className="section border-y border-white/10 bg-ink-900/40">
        <div className="container-x">
          <SectionHeading
            eyebrow="Our students"
            title="Students who trained and are working now"
            subtitle="Some are in our own office, some in Hyderabad IT companies, some freelancing from home."
          />
          {students.loading ? (
            <LoadingBlock label="Loading students…" />
          ) : (
            <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {students.items.slice(0, 6).map((student: any) => (
                <StaggerItem key={student.id}>
                  <div className="card card-hover h-full p-6">
                    <div className="flex items-center gap-3">
                      <Avatar src={student.photo_url} name={student.name} size={54} />
                      <div>
                        <p className="font-display font-bold text-white">{student.name}</p>
                        <p className="text-xs text-slate-400">
                          {student.position}
                          {student.company ? ` • ${student.company}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-0.5 text-amber-300">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                    {student.quote ? <p className="mt-3 text-sm italic leading-relaxed text-slate-300">“{student.quote}”</p> : null}
                    <p className="mt-3 text-[11px] uppercase tracking-wide text-slate-500">
                      {student.course} {student.year ? `• ${student.year}` : ''}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          )}
          <Reveal className="mt-8 text-center">
            <Link to="/students" className="btn-outline">
              See all students
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ----------------------------------------------------- process */}
      <section className="section">
        <div className="container-x">
          <SectionHeading eyebrow="How it works" title="From applying to your first salary" />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              { step: '01', title: 'Apply online', text: 'Fill the Apply form or send us a WhatsApp message with your name, city and course.' },
              { step: '02', title: 'Visit or call', text: 'Our team calls you, answers your questions and books your seat in the next batch.' },
              { step: '03', title: '3 month training', text: 'Learn on office laptops with live Play Console accounts and real client work.' },
              { step: '04', title: 'Job opportunity', text: 'Perform well and get the job opportunity in our office or with our client offices.' },
            ].map((item, i) => (
              <Reveal key={item.step} delay={i * 0.08}>
                <div className="card relative h-full overflow-hidden p-6">
                  <span className="absolute -right-2 -top-4 font-display text-6xl font-black text-white/[0.06]">{item.step}</span>
                  <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">Step {item.step}</p>
                  <h3 className="mt-3 font-display text-lg font-bold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- faq */}
      <section className="section border-t border-white/10">
        <div className="container-x grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Questions"
              title="Frequently asked questions"
              subtitle="Still confused? Our AI assistant is bottom-right on your screen 24/7, or WhatsApp us directly."
            />
            <Reveal className="mt-6">
              <a href={waHref} target="_blank" rel="noreferrer" className="btn-whatsapp">
                <WhatsappIcon className="h-4 w-4" />
                Ask on WhatsApp
              </a>
            </Reveal>
          </div>
          <Accordion
            items={[
              {
                q: 'Do I need my own laptop or computer?',
                a: 'No. Laptops are provided in the office for every student and team member, with internet and printing. You only need to come to the office.',
              },
              {
                q: 'What are the fees and can I pay in instalments?',
                a: 'Short courses start from around Rs 5,000 and the 3 month professional courses are Rs 15,000 – 20,000. Instalments are possible — WhatsApp us for the current batch offer.',
              },
              {
                q: 'Is there a job after the course?',
                a: 'Yes. Students who complete the 3 month course and perform well get a job opportunity in our own office. We also refer students to client offices and help with freelancing.',
              },
              {
                q: 'What documents are needed for admission?',
                a: 'A copy of your CNIC or B-Form and 2 passport size photos. Bring them on your first day at the office.',
              },
              {
                q: 'Where exactly is the office?',
                a: `Near Sarfraz Colony, Hyderabad, Sindh. Timings: ${settings.hours || 'Monday – Saturday, 10:00 AM – 8:00 PM'}. WhatsApp us before visiting so the instructor is available.`,
              },
              {
                q: 'Do you also do work for clients (not only teaching)?',
                a: 'Yes — Play Console accounts, app uploads and publishing, rejection and appeal handling, websites and apps. See our Services page.',
              },
            ]}
          />
        </div>
      </section>

      {/* --------------------------------------------------------- cta */}
      <section className="pb-4">
        <div className="container-x">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-white/[0.12] bg-gradient-to-br from-cyan-500/20 via-brand-600/20 to-neon-violet/20 p-8 text-center sm:p-12">
              <div className="pointer-events-none absolute inset-0 grid-lines opacity-30" aria-hidden="true" />
              <h2 className="relative font-display text-2xl font-extrabold text-white sm:text-3xl">
                Seats are limited in every batch — reserve yours today
              </h2>
              <p className="relative mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-200 sm:text-base">
                {settings.admission_note ||
                  'Admission: bring a copy of your CNIC/B-Form and 2 photos. Laptop is provided in the office.'}
              </p>
              <div className="relative mt-7 flex flex-wrap justify-center gap-3">
                <Link to="/apply" className="btn-primary">
                  Apply online
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a href={waHref} target="_blank" rel="noreferrer" className="btn-whatsapp">
                  <WhatsappIcon className="h-4 w-4" />
                  WhatsApp {settings.whatsapp || '03003440200'}
                </a>
                <a href={`tel:${String(settings.phone || '').replace(/\s/g, '')}`} className="btn-outline">
                  Call {settings.phone || '03003440200'}
                </a>
              </div>
              <div className="relative mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-lime-300" />
                  Laptop provided in office
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-lime-300" />
                  3 month course
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-lime-300" />
                  Job opportunity
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
