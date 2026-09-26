import { useCallback, useEffect, useState } from 'react';
import { Check, Mail, MessageSquare, Phone, RefreshCw, Trash2 } from 'lucide-react';

import { ErrorNote, LoadingBlock, SuccessNote, WhatsappIcon } from '../components/ui';
import { api } from '../lib/api';
import { cn, formatDate, timeAgo, waDigits } from '../lib/utils';

export default function AdminMessages() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<any>('/admin/messages');
      setItems(data.messages || []);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Could not load messages.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function setHandled(item: any, handled: boolean) {
    try {
      const data = await api.put<any>(`/admin/messages/${item.id}`, { handled });
      setItems((prev) => prev.map((i) => (i.id === item.id ? data.message : i)));
    } catch (err: any) {
      setError(err?.message || 'Could not update.');
    }
  }

  async function remove(item: any) {
    if (!window.confirm(`Delete the message from ${item.name}?`)) return;
    try {
      await api.del(`/admin/messages/${item.id}`);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      setNotice('Message deleted.');
    } catch (err: any) {
      setError(err?.message || 'Could not delete.');
    }
  }

  const visible = filter === 'unread' ? items.filter((m) => !m.handled) : items;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">Contact messages</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            Website ke Contact form se aaye hue messages. Handle karne ke baad “Done” mark karein.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className={cn('btn-sm', filter === 'all' ? 'btn-primary' : 'btn-outline')}
            onClick={() => setFilter('all')}
          >
            All ({items.length})
          </button>
          <button
            type="button"
            className={cn('btn-sm', filter === 'unread' ? 'btn-primary' : 'btn-outline')}
            onClick={() => setFilter('unread')}
          >
            New ({items.filter((m) => !m.handled).length})
          </button>
          <button type="button" className="btn-ghost btn-sm" onClick={load} aria-label="Refresh messages">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {notice ? <SuccessNote>{notice}</SuccessNote> : null}
      {error ? <ErrorNote>{error}</ErrorNote> : null}

      {loading ? (
        <LoadingBlock label="Loading messages…" />
      ) : visible.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-10 text-center">
          <MessageSquare className="h-8 w-8 text-cyan-300" />
          <p className="font-display text-lg font-bold text-white">No messages here</p>
          <p className="text-sm text-slate-400">Jab koi Contact form se message bhejega, wo yahan aa jayega.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {visible.map((m) => (
            <article key={m.id} className={cn('card p-5', !m.handled && 'border-cyan-300/25 bg-cyan-400/[0.06]')}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-base font-bold text-white">{m.name}</span>
                    {!m.handled ? <span className="badge-neon">New</span> : null}
                    {m.subject ? <span className="badge">{m.subject}</span> : null}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {m.phone} {m.email ? `• ${m.email}` : ''} • {formatDate(m.created_at)} ({timeAgo(m.created_at)})
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{m.message}</p>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-48">
                  {m.phone ? (
                    <a
                      href={`https://wa.me/${waDigits(m.phone)}?text=${encodeURIComponent(`Assalam-o-Alaikum ${m.name}! Subhan Console Studio se reply kar rahe hain.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-whatsapp btn-sm"
                    >
                      <WhatsappIcon className="h-3.5 w-3.5" />
                      WhatsApp
                    </a>
                  ) : null}
                  {m.phone ? (
                    <a href={`tel:${String(m.phone).replace(/\s/g, '')}`} className="btn-outline btn-sm">
                      <Phone className="h-3.5 w-3.5" />
                      Call
                    </a>
                  ) : null}
                  {m.email ? (
                    <a href={`mailto:${m.email}`} className="btn-outline btn-sm">
                      <Mail className="h-3.5 w-3.5" />
                      Email
                    </a>
                  ) : null}
                  <div className="flex gap-2">
                    <button type="button" className="btn-outline btn-sm flex-1" onClick={() => setHandled(m, !m.handled)}>
                      <Check className="h-3.5 w-3.5" />
                      {m.handled ? 'Mark new' : 'Done'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm border border-rose-400/25 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20"
                      onClick={() => remove(m)}
                      aria-label={`Delete message from ${m.name}`}
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
    </div>
  );
}
