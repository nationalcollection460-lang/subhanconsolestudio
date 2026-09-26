import { motion } from 'framer-motion';

export default function PageHero({
  eyebrow,
  title,
  subtitle,
  actions,
  children,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-white/10 pb-12 pt-10 sm:pb-16 sm:pt-14">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-25" aria-hidden="true" />
      <div className="container-x relative">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          {eyebrow ? <span className="badge-neon mb-4">{eyebrow}</span> : null}
          <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">{title}</h1>
          {subtitle ? <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">{subtitle}</p> : null}
          {actions ? <div className="mt-7 flex flex-wrap gap-3">{actions}</div> : null}
        </motion.div>
        {children}
      </div>
    </section>
  );
}
