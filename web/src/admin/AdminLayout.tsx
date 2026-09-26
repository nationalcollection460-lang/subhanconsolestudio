import { useState } from 'react';
import { Link, Navigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Briefcase,
  ExternalLink,
  Inbox,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  MessageSquare,
  Settings,
  ShieldCheck,
  Sparkles,
  Tags,
  UserCog,
  Users,
  X,
} from 'lucide-react';

import { Logo, Spinner } from '../components/ui';
import { useAdmin } from '../lib/admin';
import { useSite } from '../lib/site';
import { cn } from '../lib/utils';

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/applications', label: 'Apply people', icon: Inbox },
  { to: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { to: '/admin/courses', label: 'Courses', icon: BookOpen },
  { to: '/admin/jobs', label: 'Jobs', icon: Briefcase },
  { to: '/admin/services', label: 'Services', icon: Sparkles },
  { to: '/admin/ads', label: 'Ads', icon: Megaphone },
  { to: '/admin/students', label: 'Students', icon: Users },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/settings', label: 'Website & my detail', icon: Settings },
  { to: '/admin/account', label: 'Admin access', icon: UserCog },
];

export default function AdminLayout() {
  const { admin, loading, logout } = useAdmin();
  const { settings } = useSite();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 text-sm text-slate-400">
        <Spinner />
        Checking your admin access…
      </div>
    );
  }

  if (!admin) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;

  const sidebar = (
    <div className="flex h-full flex-col gap-6 p-5">
      <Link to="/admin" className="flex items-center gap-3">
        <Logo size={40} />
        <span>
          <span className="block font-display text-sm font-extrabold text-white">Admin Panel</span>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">
            {settings.short_name || 'Subhan Console'}
          </span>
        </span>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar" aria-label="Admin navigation">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition',
                isActive ? 'bg-gradient-to-r from-cyan-400/20 to-neon-violet/20 text-white' : 'text-slate-400 hover:bg-white/[0.06] hover:text-white',
              )
            }
          >
            <link.icon className="h-4 w-4 shrink-0" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-2 border-t border-white/10 pt-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <p className="flex items-center gap-2 text-xs font-semibold text-white">
            <ShieldCheck className="h-3.5 w-3.5 text-lime-300" />
            Signed in
          </p>
          <p className="mt-1 truncate text-xs text-slate-400">{admin.email}</p>
        </div>
        <Link to="/" target="_blank" className="btn-outline btn-sm w-full">
          <ExternalLink className="h-3.5 w-3.5" />
          Open website
        </Link>
        <button type="button" className="btn-ghost btn-sm w-full" onClick={logout}>
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ink-950">
      <div className="pointer-events-none fixed inset-0 -z-10 grid-lines opacity-25" aria-hidden="true" />

      <div className="mx-auto flex w-full max-w-[1500px]">
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-white/10 bg-ink-900/60 backdrop-blur-xl lg:block">
          {sidebar}
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-white/10 bg-ink-950/85 px-4 py-3 backdrop-blur-xl lg:hidden">
            <Link to="/admin" className="flex items-center gap-2">
              <Logo size={32} />
              <span className="font-display text-sm font-bold text-white">Admin Panel</span>
            </Link>
            <button
              type="button"
              className="btn-ghost btn-sm"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Close admin menu' : 'Open admin menu'}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </header>

          {menuOpen ? (
            <div className="border-b border-white/10 bg-ink-900/95 backdrop-blur-xl lg:hidden">{sidebar}</div>
          ) : null}

          <main className="px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
