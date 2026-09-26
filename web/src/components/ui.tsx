import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Loader2, X } from 'lucide-react';

import { cn, initials } from '../lib/utils';
import Reveal from './Reveal';

export function Logo({ size = 40 }: { size?: number }) {
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 via-brand-500 to-neon-violet text-ink-950 shadow-[0_10px_30px_-12px_rgba(63,92,242,0.9)]"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" width={size * 0.62} height={size * 0.62} fill="none">
        <path d="M6 17c0-4 2.5-5.5 6.5-5.5S18 9.5 18 6.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="6" cy="17" r="2.1" fill="currentColor" />
        <circle cx="18" cy="6.5" r="2.1" fill="currentColor" />
      </svg>
    </span>
  );
}

export function WhatsappIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
      <path d="M16.04 3.2c-7.1 0-12.86 5.76-12.86 12.86 0 2.27.6 4.48 1.72 6.44L3.2 28.8l6.46-1.68a12.8 12.8 0 0 0 6.38 1.7h.01c7.1 0 12.86-5.76 12.86-12.86 0-3.43-1.34-6.66-3.77-9.08a12.75 12.75 0 0 0-9.1-3.68Zm0 23.28h-.01a10.66 10.66 0 0 1-5.42-1.48l-.39-.24-4.03 1.06 1.08-3.93-.25-.4a10.62 10.62 0 0 1-1.63-5.68c0-5.9 4.8-10.7 10.7-10.7 2.86 0 5.54 1.11 7.56 3.13a10.62 10.62 0 0 1 3.13 7.57c0 5.9-4.8 10.67-10.74 10.67Zm5.87-7.99c-.32-.16-1.9-.94-2.2-1.05-.3-.11-.51-.16-.73.16-.21.32-.84.99-1.03 1.2-.19.21-.38.24-.7.08-.32-.16-1.36-.5-2.59-1.6-.96-.85-1.6-1.9-1.79-2.22-.19-.32-.02-.5.14-.66.16-.16.35-.4.53-.61.18-.21.24-.35.35-.58.11-.21.05-.4-.03-.56-.08-.16-.72-1.74-.99-2.38-.26-.63-.53-.54-.72-.55l-.61-.01c-.21 0-.56.08-.85.4-.29.32-1.11 1.08-1.11 2.63 0 1.55 1.13 3.05 1.29 3.26.16.21 2.23 3.4 5.4 4.77.75.32 1.34.51 1.8.66.76.24 1.45.21 2 .13.61-.09 1.87-.76 2.14-1.5.26-.74.26-1.37.18-1.5-.08-.13-.29-.21-.61-.37Z" />
    </svg>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className = '',
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: 'center' | 'left';
  className?: string;
}) {
  return (
    <Reveal className={cn(align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl', className)}>
      {eyebrow ? <span className="badge-neon mb-4">{eyebrow}</span> : null}
      <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-[2.6rem]">{title}</h2>
      {subtitle ? <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">{subtitle}</p> : null}
    </Reveal>
  );
}

export function Spinner({ className = 'h-5 w-5' }: { className?: string }) {
  return <Loader2 className={cn('animate-spin text-cyan-300', className)} aria-hidden="true" />;
}

export function LoadingBlock({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-14 text-sm text-slate-400">
      <Spinner />
      {label}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="card p-10 text-center">
      <p className="font-display text-lg font-semibold text-white">{title}</p>
      {hint ? <p className="mt-2 text-sm text-slate-400">{hint}</p> : null}
    </div>
  );
}

export function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{children}</div>
  );
}

export function SuccessNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
      {children}
    </div>
  );
}

export function Avatar({
  src,
  name,
  size = 56,
  className = '',
}: {
  src?: string;
  name?: string;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-400/20 via-brand-500/25 to-neon-violet/25 font-display font-bold text-white',
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.max(14, size * 0.34) }}
    >
      {showImage ? (
        <img
          src={src}
          alt={name ? `${name} photo` : 'Photo'}
          width={size}
          height={size}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        initials(name)
      )}
    </span>
  );
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[90] overflow-y-auto overscroll-contain bg-ink-950/80 p-3 backdrop-blur-sm sm:p-6">
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={cn('mx-auto w-full rounded-3xl border border-white/10 bg-ink-900/95 p-5 shadow-card sm:p-6', wide ? 'max-w-3xl' : 'max-w-xl')}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-xl font-bold text-white">{title}</h3>
                {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
              </div>
              <button type="button" onClick={onClose} className="btn-ghost btn-sm" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

export function Accordion({ items }: { items: { q: string; a: React.ReactNode }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <Reveal key={item.q} delay={i * 0.04}>
            <div className={cn('card overflow-hidden', isOpen && 'border-cyan-300/30 bg-white/[0.06]')}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                aria-expanded={isOpen}
              >
                <span className="font-display text-base font-semibold text-white">{item.q}</span>
                <ChevronDown className={cn('h-5 w-5 shrink-0 text-cyan-300 transition', isOpen && 'rotate-180')} />
              </button>
              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="border-t border-white/10 px-5 py-4 text-sm leading-relaxed text-slate-300">{item.a}</div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
  className = '',
}: {
  label?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn('block', className)}>
      {label ? <span className="label">{label}</span> : null}
      {children}
      {hint ? <span className="mt-1.5 block text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-3 text-sm text-slate-300"
      aria-pressed={checked}
    >
      <span
        className={cn(
          'relative h-6 w-11 rounded-full border transition',
          checked ? 'border-cyan-300/50 bg-cyan-400/30' : 'border-white/[0.15] bg-white/10',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white transition-all',
            checked ? 'left-[22px]' : 'left-0.5',
          )}
          style={{ height: 18, width: 18 }}
        />
      </span>
      <span className="font-medium">{label}</span>
    </button>
  );
}
