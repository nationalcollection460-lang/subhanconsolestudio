import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, KeyRound, Lock, Mail, ShieldCheck } from 'lucide-react';

import { ErrorNote, Field, Logo, Spinner } from '../components/ui';
import { useAdmin } from '../lib/admin';

export default function AdminLogin() {
  const { admin, loading, login } = useAdmin();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!loading && admin) return <Navigate to="/admin" replace />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email.trim(), password);
      navigate('/admin', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check the email and password.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-25" aria-hidden="true" />
      <div className="pointer-events-none absolute left-1/4 top-10 h-72 w-72 animate-blob rounded-full bg-cyan-500/20 blur-3xl" aria-hidden="true" />

      <div className="relative grid w-full max-w-5xl gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card hidden flex-col justify-between p-8 lg:flex"
        >
          <div className="flex items-center gap-3">
            <Logo size={46} />
            <div>
              <p className="font-display text-lg font-extrabold text-white">Subhan Console Studio</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-300">Admin Panel</p>
            </div>
          </div>

          <div className="space-y-4 py-8">
            {[
              { icon: ShieldCheck, title: 'Secure admin access', text: 'Only admins with the studio Gmail and password can open this panel.' },
              { icon: KeyRound, title: 'You can change the password', text: 'Admin access → change the Gmail or password any time you want.' },
              { icon: Mail, title: 'See all apply people', text: 'Every course/job application and contact message lands in this panel.' },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
                <div>
                  <p className="font-display text-sm font-bold text-white">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          <Link to="/" className="btn-ghost btn-sm self-start">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to website
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="card p-7 sm:p-9"
        >
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <Logo size={40} />
            <div>
              <p className="font-display text-base font-extrabold text-white">Admin Panel</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">Subhan Console Studio</p>
            </div>
          </div>

          <h1 className="font-display text-2xl font-extrabold text-white">Admin sign in</h1>
          <p className="mt-2 text-sm text-slate-400">
            Apna studio ka Gmail aur password likhein. Ye page sirf admin ke liye hai.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field label="Gmail / email">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  required
                  type="email"
                  autoComplete="username"
                  className="input pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="subhanconsolestudio@gmail.com"
                />
              </div>
            </Field>
            <Field label="Password">
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  required
                  type="password"
                  autoComplete="current-password"
                  className="input pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </Field>

            {error ? <ErrorNote>{error}</ErrorNote> : null}

            <button type="submit" className="btn-primary w-full" disabled={busy}>
              {busy ? <Spinner className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
              Sign in to admin panel
            </button>

            <p className="text-center text-xs text-slate-500">
              Password bhool gaye? Gmail aur password badalne ke liye admin panel ke “Admin access” page par jayein.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
