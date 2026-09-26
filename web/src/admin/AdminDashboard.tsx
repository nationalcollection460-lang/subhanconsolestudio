import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Briefcase,
  Inbox,
  Megaphone,
  MessageSquare,
  Plus,
  Sparkles,
  Tags,
  Users,
} from 'lucide-react';

import { ErrorNote, LoadingBlock, SuccessNote, WhatsappIcon } from '../components/ui';
import { api } from '../lib/api';
import { useAdmin } from '../lib/admin';
import { cn, timeAgo, waDigits } from '../lib/utils';

const STATUSES = [
  { key: 'new', label: 'New' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'interview', label: 'Interview' },
  { key: 'joined', label: 'Joined' },
  { key: 'hired', label: 'Hired' },
  { key: 'rejected', label: 'Closed' },
];

export default function AdminDashboard() {
  const { admin } = useAdmin();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<any>('/admin/stats');
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Could not load the dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(id: number, status: string) {
    try {
      await api.put(`/admin/applications/${id}`, { status });
      setData((prev: any) => ({
        ...prev,
        recentApplications: prev.recentApplications.map((a: any) => (a.id === id ? { ...a, status } : a)),
        counts: {
          ...prev.counts,
          new_applications: prev.counts.new_applications - (status === 'new' ? 0 : 1),
        },
      }));
      setNotice('Application status updated.');
    } catch (err: any) {
      setError(err?.message || 'Could not update.');
    }
  }

  const counts = data?.counts || {};

  const cards = [
    { label: 'New applications', value: counts.new_applications ?? 0, hint: `${counts.applications_week ?? 0} in last 7 days`, to: '/admin/applications', icon: Inbox, accent: 'from-cyan-400/25 to-brand-500/25' },
    { label: 'Job apply', value: counts.job_applications ?? 0, hint: 'People who want office work', to: '/admin/applications?kind=job', icon: Briefcase, accent: 'from-lime-400/25 to-cyan-400/25' },
    { label: 'Course apply', value: counts.course_applications ?? 0, hint: 'Students who want admission', to: '/admin/applications?kind=course', icon: BookOpen, accent: 'from-neon-violet/25 to-brand-500/25' },
    { label: 'New messages', value: counts.new_messages ?? 0, hint: 'Contact form messages', to: '/admin/messages', icon: MessageSquare, accent: 'from-amber-400/25 to-rose-400/25' },
  ];

  const shortcuts = [
    { to: '/admin/courses', label: 'Add course', icon: BookOpen },
    { to: '/admin/jobs', label: 'Add job', icon: Briefcase },
    { to: '/admin/services', label: 'Add service', icon: Sparkles },
    { to: '/admin/ads', label: 'Add ad', icon: Megaphone },
    { to: '/admin/students', label: 'Add student', icon: Users },
    { to: '/admin/categories', label: 'Add category', icon: Tags },
  ];

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
            Assalam-o-Alaikum, {admin?.name || 'Subhan'} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Ye aap ka studio control panel hai — apply karne wale log, courses, jobs, students aur website details yahan se manage karein.
          </p>
        </div>
        <Link to="/admin/settings" className="btn-primary btn-sm">
          Website &amp; my detail
        </Link>
      </header>

      {notice ? <SuccessNote>{notice}</SuccessNote> : null}
      {error ? <ErrorNote>{error}</ErrorNote> : null}

      {loading ? (
        <LoadingBlock label="Loading dashboard…" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
              <Link key={card.label} to={card.to} className="card card-hover p-5">
                <span className={cn('inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-cyan-100', card.accent)}>
                  <card.icon className="h-5 w-5" />
                </span>
                <p className="mt-4 font-display text-3xl font-extrabold text-white">{card.value}</p>
                <p className="text-sm font-semibold text-slate-200">{card.label}</p>
                <p className="mt-1 text-xs text-slate-500">{card.hint}</p>
              </Link>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { label: 'Courses', value: counts.courses },
              { label: 'Jobs', value: counts.jobs },
              { label: 'Services', value: counts.services },
              { label: 'Students', value: counts.students },
              { label: 'Ads', value: counts.ads },
              { label: 'Categories', value: counts.categories },
            ].map((c) => (
              <div key={c.label} className="card p-4">
                <p className="font-display text-xl font-extrabold text-white">{c.value ?? 0}</p>
                <p className="text-[11px] uppercase tracking-wide text-slate-400">{c.label}</p>
              </div>
            ))}
          </div>

          <section className="card overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div>
                <h2 className="font-display text-lg font-bold text-white">Latest apply people</h2>
                <p className="text-xs text-slate-400">Jo log website se apply kar chuke hain</p>
              </div>
              <Link to="/admin/applications" className="btn-outline btn-sm">
                See all
              </Link>
            </div>

            {data?.recentApplications?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Name</th>
                      <th className="px-5 py-3 font-semibold">Applying for</th>
                      <th className="px-5 py-3 font-semibold">Phone</th>
                      <th className="px-5 py-3 font-semibold">When</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 text-right font-semibold">Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.08]">
                    {data.recentApplications.map((app: any) => (
                      <tr key={app.id} className="hover:bg-white/[0.03]">
                        <td className="px-5 py-3">
                          <p className="font-semibold text-white">#{app.id} {app.name}</p>
                          <p className="text-xs text-slate-500">{app.city}</p>
                        </td>
                        <td className="px-5 py-3">
                          <span className="badge mb-1">{app.kind}</span>
                          <p className="text-xs text-slate-300">{app.interest || '—'}</p>
                        </td>
                        <td className="px-5 py-3 text-slate-300">{app.phone}</td>
                        <td className="px-5 py-3 text-xs text-slate-400">{timeAgo(app.created_at)}</td>
                        <td className="px-5 py-3">
                          <select
                            className="input !py-2 text-xs"
                            value={app.status}
                            onChange={(e) => setStatus(app.id, e.target.value)}
                            aria-label={`Status for ${app.name}`}
                          >
                            {STATUSES.map((s) => (
                              <option key={s.key} value={s.key}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <a
                            href={`https://wa.me/${waDigits(app.phone)}?text=${encodeURIComponent(
                              `Assalam-o-Alaikum ${app.name}! Subhan Console Studio se baat kar rahe hain — aap ki application #${app.id} mil gayi hai.`,
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-whatsapp btn-sm"
                          >
                            <WhatsappIcon className="h-3.5 w-3.5" />
                            WhatsApp
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="px-5 py-8 text-center text-sm text-slate-400">
                Abhi koi application nahi aayi. Jab koi website se apply karega, yahan show hogi.
              </p>
            )}
          </section>

          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="card overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
                <h2 className="font-display text-lg font-bold text-white">Latest messages</h2>
                <Link to="/admin/messages" className="btn-outline btn-sm">
                  See all
                </Link>
              </div>
              {data?.recentMessages?.length ? (
                <ul className="divide-y divide-white/[0.08]">
                  {data.recentMessages.map((m: any) => (
                    <li key={m.id} className="px-5 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-white">{m.name}</p>
                        <span className="text-xs text-slate-500">{timeAgo(m.created_at)}</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-400">{m.message}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-5 py-8 text-center text-sm text-slate-400">No messages yet.</p>
              )}
            </section>

            <section className="card p-5">
              <h2 className="font-display text-lg font-bold text-white">Quick add</h2>
              <p className="mt-1 text-xs text-slate-400">Aik click par naya course, job ya student add karein.</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {shortcuts.map((s) => (
                  <Link key={s.to} to={s.to} className="btn-outline btn-sm justify-start">
                    <Plus className="h-3.5 w-3.5" />
                    <s.icon className="h-3.5 w-3.5 text-cyan-300" />
                    {s.label}
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
