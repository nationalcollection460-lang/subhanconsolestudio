import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, Filter, Inbox, Phone, RefreshCw, Save, Search, Trash2 } from 'lucide-react';

import { ErrorNote, Field, LoadingBlock, Modal, Spinner, SuccessNote, WhatsappIcon } from '../components/ui';
import { api } from '../lib/api';
import { cn, formatDate, timeAgo, waDigits } from '../lib/utils';

const STATUSES = [
  { key: 'new', label: 'New', tone: 'border-cyan-300/30 bg-cyan-400/10 text-cyan-100' },
  { key: 'contacted', label: 'Contacted', tone: 'border-sky-300/30 bg-sky-400/10 text-sky-100' },
  { key: 'interview', label: 'Interview', tone: 'border-amber-300/30 bg-amber-400/10 text-amber-100' },
  { key: 'joined', label: 'Joined', tone: 'border-violet-300/30 bg-violet-400/10 text-violet-100' },
  { key: 'hired', label: 'Hired', tone: 'border-emerald-300/30 bg-emerald-400/10 text-emerald-100' },
  { key: 'rejected', label: 'Closed', tone: 'border-white/[0.15] bg-white/[0.05] text-slate-300' },
];

const KINDS = [
  { key: 'all', label: 'All' },
  { key: 'job', label: 'Jobs' },
  { key: 'course', label: 'Courses' },
  { key: 'service', label: 'Services' },
  { key: 'other', label: 'Other' },
];

function statusTone(status: string) {
  return STATUSES.find((s) => s.key === status)?.tone || STATUSES[0].tone;
}

export default function AdminApplications() {
  const [params] = useSearchParams();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [status, setStatus] = useState('all');
  const [kind, setKind] = useState(params.get('kind') || 'all');
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<any | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const search = new URLSearchParams();
      if (status !== 'all') search.set('status', status);
      if (kind !== 'all') search.set('kind', kind);
      if (query.trim()) search.set('q', query.trim());
      const data = await api.get<any>(`/admin/applications?${search.toString()}`);
      setItems(data.applications || []);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Could not load applications.');
    } finally {
      setLoading(false);
    }
  }, [status, kind, query]);

  useEffect(() => {
    load();
  }, [load]);

  async function update(item: any, patch: { status?: string; notes?: string }) {
    try {
      const data = await api.put<any>(`/admin/applications/${item.id}`, patch);
      setItems((prev) => prev.map((i) => (i.id === item.id ? data.application : i)));
      setNotice('Saved.');
      return true;
    } catch (err: any) {
      setError(err?.message || 'Could not save.');
      return false;
    }
  }

  async function remove(item: any) {
    if (!window.confirm(`Delete the application of ${item.name}? This cannot be undone.`)) return;
    try {
      await api.del(`/admin/applications/${item.id}`);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      setNotice('Application deleted.');
    } catch (err: any) {
      setError(err?.message || 'Could not delete.');
    }
  }

  function exportCsv() {
    const header = ['ID', 'Name', 'Phone', 'Email', 'City', 'Kind', 'Interest', 'Experience', 'Status', 'Message', 'Applied at'];
    const rows = items.map((a) => [
      a.id,
      a.name,
      a.phone,
      a.email,
      a.city,
      a.kind,
      a.interest,
      a.experience,
      a.status,
      (a.message || '').replace(/\s+/g, ' '),
      a.created_at,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `apply-people-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">Apply people</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            Website se apply karne wale tamam log — job, course, service. Status change karein, notes likhein aur WhatsApp par baat karein.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-outline btn-sm" onClick={exportCsv} disabled={!items.length}>
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
          <button type="button" className="btn-ghost btn-sm" onClick={load}>
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
      </header>

      <div className="card grid gap-4 p-5 lg:grid-cols-[1fr_auto_auto] lg:items-end">
        <Field label="Search (name, phone, city, course/job)">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              className="input pl-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Ahmed, 0300, Hyderabad"
            />
          </div>
        </Field>
        <Field label="Status">
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Type">
          <div className="flex gap-1.5">
            {KINDS.map((k) => (
              <button
                key={k.key}
                type="button"
                onClick={() => setKind(k.key)}
                className={cn(
                  'rounded-xl border px-3 py-2.5 text-xs font-semibold transition',
                  kind === k.key ? 'border-cyan-300/50 bg-cyan-400/15 text-white' : 'border-white/[0.12] text-slate-400 hover:text-white',
                )}
              >
                {k.label}
              </button>
            ))}
          </div>
        </Field>
      </div>

      {notice ? <SuccessNote>{notice}</SuccessNote> : null}
      {error ? <ErrorNote>{error}</ErrorNote> : null}

      {loading ? (
        <LoadingBlock label="Loading applications…" />
      ) : items.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-10 text-center">
          <Inbox className="h-8 w-8 text-cyan-300" />
          <p className="font-display text-lg font-bold text-white">No applications found</p>
          <p className="max-w-md text-sm text-slate-400">
            Filter badal kar dekhein, ya website ke Apply page se test application bhejein — wo foran yahan show hogi.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((app) => (
            <article key={app.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-lg font-bold text-white">
                      #{app.id} {app.name}
                    </span>
                    <span className={cn('rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase', statusTone(app.status))}>
                      {STATUSES.find((s) => s.key === app.status)?.label || app.status}
                    </span>
                    <span className="badge">{app.kind}</span>
                  </div>
                  <p className="mt-1.5 text-sm text-slate-300">
                    {app.interest || '—'} {app.experience ? `• ${app.experience}` : ''}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {app.phone} {app.email ? `• ${app.email}` : ''} {app.city ? `• ${app.city}` : ''} • {formatDate(app.created_at)}{' '}
                    ({timeAgo(app.created_at)})
                  </p>
                  {app.message ? (
                    <p className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-300">{app.message}</p>
                  ) : null}
                  {app.notes ? <p className="mt-2 text-xs text-amber-200">Note: {app.notes}</p> : null}
                </div>

                <div className="flex w-full flex-col gap-2 sm:w-56">
                  <select
                    className="input !py-2 text-sm"
                    value={app.status}
                    onChange={(e) => update(app, { status: e.target.value })}
                    aria-label={`Status for ${app.name}`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <a
                    href={`https://wa.me/${waDigits(app.phone)}?text=${encodeURIComponent(
                      `Assalam-o-Alaikum ${app.name}! Subhan Console Studio se — aap ki application #${app.id} (${app.interest || app.kind}) mil gayi hai.`,
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-whatsapp btn-sm"
                  >
                    <WhatsappIcon className="h-3.5 w-3.5" />
                    WhatsApp
                  </a>
                  <a href={`tel:${String(app.phone || '').replace(/\s/g, '')}`} className="btn-outline btn-sm">
                    <Phone className="h-3.5 w-3.5" />
                    Call
                  </a>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn-outline btn-sm flex-1"
                      onClick={() => {
                        setActive(app);
                        setNotes(app.notes || '');
                      }}
                    >
                      <Filter className="h-3.5 w-3.5" />
                      Notes
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm border border-rose-400/25 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20"
                      onClick={() => remove(app)}
                      aria-label={`Delete application of ${app.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={Boolean(active)}
        onClose={() => setActive(null)}
        title={active ? `Notes — #${active.id} ${active.name}` : ''}
        subtitle="Ye notes sirf admin panel mein dikhte hain."
      >
        <div className="space-y-4">
          <Field label="Internal note (call ka result, interview date, salary talk…)">
            <textarea rows={5} className="input" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-primary"
              disabled={saving}
              onClick={async () => {
                if (!active) return;
                setSaving(true);
                await update(active, { notes });
                setSaving(false);
                setActive(null);
              }}
            >
              {saving ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              Save note
            </button>
            <button type="button" className="btn-outline" onClick={() => setActive(null)}>
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
