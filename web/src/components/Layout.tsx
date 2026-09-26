import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Clock,
  Mail,
  MapPin,
  Menu,
  Phone,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';

import { useSite } from '../lib/site';
import { cn } from '../lib/utils';
import ChatWidget from './ChatWidget';
import { Logo, WhatsappIcon } from './ui';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/courses', label: 'Courses' },
  { to: '/jobs', label: 'Jobs' },
  { to: '/services', label: 'Services' },
  { to: '/students', label: 'Students' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

function AnnouncementTicker({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-r from-cyan-500/15 via-brand-600/15 to-neon-violet/[0.15] py-2">
      <div className="flex w-max animate-marquee gap-12 pr-12">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex items-center gap-12">
            {[0, 1].map((i) => (
              <span key={i} className="flex items-center gap-2 whitespace-nowrap text-xs font-semibold text-cyan-100">
                <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                {text}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Nav() {
  const { settings, site } = useSite();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const waHref = site?.links?.whatsapp || 'https://wa.me/923003440200';

  return (
    <>
      <AnnouncementTicker text={settings.announcement} />
      <header
        className={cn(
          'sticky top-0 z-[70] border-b transition duration-300',
          scrolled ? 'border-white/10 bg-ink-950/85 backdrop-blur-xl' : 'border-transparent bg-transparent',
        )}
      >
        <div className="container-x flex h-16 items-center justify-between gap-4 sm:h-18">
          <Link to="/" className="flex items-center gap-3">
            <Logo size={40} />
            <span className="leading-tight">
              <span className="block font-display text-sm font-extrabold tracking-tight text-white sm:text-base">
                {settings.studio_name || 'Subhan Console Studio'}
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
                Sarfraz Colony • Hyderabad
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-2 text-sm font-medium transition',
                    isActive ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/[0.06] hover:text-white',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              className="btn-outline btn-sm hidden sm:inline-flex"
              aria-label="WhatsApp us"
            >
              <WhatsappIcon className="h-4 w-4 text-[#25D366]" />
              {settings.whatsapp || '03003440200'}
            </a>
            <Link to="/apply" className="btn-primary btn-sm">
              Apply Now
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <button
              type="button"
              className="btn-ghost btn-sm lg:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.24 }}
              className="overflow-hidden border-t border-white/10 bg-ink-950/95 backdrop-blur-xl lg:hidden"
            >
              <div className="container-x grid gap-1 py-3">
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      cn('rounded-xl px-4 py-3 text-sm font-semibold', isActive ? 'bg-white/10 text-white' : 'text-slate-300')
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
                <a href={waHref} target="_blank" rel="noreferrer" className="btn-whatsapp mt-2">
                  <WhatsappIcon className="h-4 w-4" />
                  WhatsApp {settings.whatsapp || '03003440200'}
                </a>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>
    </>
  );
}

function Footer() {
  const { settings, site } = useSite();
  const waHref = site?.links?.whatsapp || 'https://wa.me/923003440200';

  return (
    <footer className="relative mt-10 border-t border-white/10 bg-ink-950/70">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <Logo size={42} />
            <div>
              <p className="font-display text-base font-extrabold text-white">{settings.studio_name || 'Subhan Console Studio'}</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-300">Since 3+ years</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            {settings.tagline ||
              'Google Play Console, app publishing training and jobs — 3 month course with office laptop and job opportunity.'}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <a href={waHref} target="_blank" rel="noreferrer" className="btn-whatsapp btn-sm">
              <WhatsappIcon className="h-4 w-4" />
              WhatsApp
            </a>
            <a href={`tel:${String(settings.phone || '').replace(/\s/g, '')}`} className="btn-outline btn-sm">
              <Phone className="h-4 w-4" />
              Call
            </a>
          </div>
        </div>

        <div>
          <p className="font-display text-sm font-bold uppercase tracking-wider text-white">Quick links</p>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="link-underline transition hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-display text-sm font-bold uppercase tracking-wider text-white">Popular courses</p>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
            <li>Google Play Console Mastery — 3 months</li>
            <li>Android App Development — 3 months</li>
            <li>Web Development — 3 months</li>
            <li>Graphic Design &amp; Video Editing</li>
            <li>Computer &amp; Office IT Basics</li>
          </ul>
        </div>

        <div>
          <p className="font-display text-sm font-bold uppercase tracking-wider text-white">Visit our office</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
              <span>{settings.address || 'Near Sarfraz Colony, Hyderabad, Sindh, Pakistan'}</span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
              <a href={`tel:${String(settings.phone || '').replace(/\s/g, '')}`} className="hover:text-white">
                {settings.phone || '03003440200'}
              </a>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
              <a href={`mailto:${settings.email || 'subhanconsolestudio@gmail.com'}`} className="break-all hover:text-white">
                {settings.email || 'subhanconsolestudio@gmail.com'}
              </a>
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
              <span>{settings.hours || 'Mon – Sat: 10:00 AM – 8:00 PM'}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <div className="container-x flex flex-col items-center justify-between gap-3 text-xs text-slate-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {settings.studio_name || 'Subhan Console Studio'}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
              AI support 24/7
            </span>
            <Link to="/admin" className="flex items-center gap-1.5 transition hover:text-slate-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin panel
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="pointer-events-none fixed inset-0 -z-10 grid-lines opacity-[0.35]" aria-hidden="true" />
      <div
        className="pointer-events-none fixed -left-32 top-10 -z-10 h-80 w-80 animate-blob rounded-full bg-cyan-500/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed -right-20 top-1/3 -z-10 h-96 w-96 animate-blob-slow rounded-full bg-neon-violet/20 blur-3xl"
        aria-hidden="true"
      />
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
