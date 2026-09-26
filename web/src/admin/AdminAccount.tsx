import { useState } from 'react';
import { KeyRound, LogOut, Mail, ShieldCheck, UserCog } from 'lucide-react';

import { ErrorNote, Field, Spinner, SuccessNote } from '../components/ui';
import { api } from '../lib/api';
import { useAdmin } from '../lib/admin';
import { formatDate } from '../lib/utils';

export default function AdminAccount() {
  const { admin, setAdmin, logout } = useAdmin();
  const [name, setName] = useState(admin?.name || '');
  const [email, setEmail] = useState(admin?.email || '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [current, setCurrent] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (password && password !== confirm) {
      setError('New password aur confirm password match nahi kar rahe.');
      return;
    }
    setBusy(true);
    try {
      const data = await api.put<any>('/admin/account', {
        current_password: current,
        name,
        email,
        password: password || undefined,
      });
      setAdmin(data.admin);
      setPassword('');
      setConfirm('');
      setCurrent('');
      setNotice(data.message || 'Admin login details updated.');
    } catch (err: any) {
      setError(err?.message || 'Could not save. Check your current password.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">Admin access</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-400">
          Ye aap ka admin panel login hai. Gmail ya password badalna ho to yahin se karein — naya password foran apply ho jata hai.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <form onSubmit={save} className="card space-y-5 p-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/25 to-neon-violet/25 text-cyan-200">
              <UserCog className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-white">Change Gmail or password</h2>
              <p className="text-xs text-slate-400">Har change ke liye apna current password dena zaroori hai.</p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Admin name">
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Subhan" />
            </Field>
            <Field label="Admin Gmail / email">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  className="input pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="subhanconsolestudio@gmail.com"
                />
              </div>
            </Field>
            <Field label="New password" hint="Kam az kam 6 characters. Khali chhoren to password wahi rahega.">
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  className="input pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
            </Field>
            <Field label="Confirm new password">
              <input
                type="password"
                className="input"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </Field>
            <Field label="Current password *" className="sm:col-span-2">
              <input
                required
                type="password"
                className="input"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="Current password likhein"
                autoComplete="current-password"
              />
            </Field>
          </div>

          {notice ? <SuccessNote>{notice}</SuccessNote> : null}
          {error ? <ErrorNote>{error}</ErrorNote> : null}

          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? <Spinner className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
            Save admin access
          </button>
        </form>

        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-white">Current session</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Signed in as</dt>
                <dd className="truncate font-medium text-white">{admin?.email}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Name</dt>
                <dd className="font-medium text-white">{admin?.name}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Role</dt>
                <dd className="font-medium capitalize text-white">{admin?.role}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Last login</dt>
                <dd className="font-medium text-white">{admin?.last_login_at ? formatDate(admin.last_login_at) : '—'}</dd>
              </div>
            </dl>
            <button type="button" className="btn-outline mt-5 w-full" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>

          <div className="card p-6">
            <h2 className="font-display text-base font-bold text-white">Safety tips</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li>• Apna password kisi ke saath share na karein.</li>
              <li>• Password mein capital letter, number aur symbol rakhein.</li>
              <li>• Sirf apne phone ya computer se admin panel kholein.</li>
              <li>• Login page: <span className="text-cyan-300">/admin/login</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
