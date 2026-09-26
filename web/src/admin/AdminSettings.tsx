import { useEffect, useState } from 'react';
import { Building2, Image as ImageIcon, Phone, Save, Share2, Sparkles, User } from 'lucide-react';

import { ErrorNote, Field, LoadingBlock, Spinner, SuccessNote } from '../components/ui';
import { api } from '../lib/api';
import { useSite } from '../lib/site';
import ImageField from './ImageField';

type SField = {
  name: string;
  label: string;
  type?: 'text' | 'textarea' | 'image';
  placeholder?: string;
  hint?: string;
  full?: boolean;
};

const SECTIONS: { key: string; title: string; note: string; icon: any; fields: SField[] }[] = [
  {
    key: 'identity',
    title: 'Studio name & announcement',
    note: 'Ye naam, tagline aur scrolling announcement poori website par use hoti hai.',
    icon: Building2,
    fields: [
      { name: 'studio_name', label: 'Studio name', placeholder: 'Subhan Console Studio' },
      { name: 'short_name', label: 'Short name (chat & admin)', placeholder: 'Subhan Console' },
      { name: 'tagline', label: 'Tagline', full: true },
      { name: 'announcement', label: 'Top scrolling announcement', type: 'textarea', full: true },
      { name: 'admission_note', label: 'Admission note (courses page)', type: 'textarea', full: true },
    ],
  },
  {
    key: 'hero',
    title: 'Home page hero',
    note: 'Website khulte hi jo bara heading aur tasveer dikhti hai.',
    icon: ImageIcon,
    fields: [
      { name: 'hero_heading', label: 'Big heading', type: 'textarea', full: true },
      { name: 'hero_sub', label: 'Heading ke neeche text', type: 'textarea', full: true },
      { name: 'hero_image_url', label: 'Hero photo', type: 'image', full: true, hint: 'Apni office ya class ki tasveer upload karein.' },
      { name: 'office_image_url', label: 'About page office photo', type: 'image', full: true },
      { name: 'chat_welcome', label: 'AI chat welcome message', type: 'textarea', full: true, hint: 'AI assistant jab khule to ye message bhejta hai.' },
    ],
  },
  {
    key: 'owner',
    title: 'My detail (admin / owner)',
    note: 'Yahan apni tasveer aur tafseel add karein — ye About page par show hoti hai.',
    icon: User,
    fields: [
      { name: 'owner_name', label: 'My name', placeholder: 'Subhan' },
      { name: 'owner_title', label: 'My designation', placeholder: 'Founder & Lead Instructor' },
      { name: 'owner_phone', label: 'My WhatsApp / phone', placeholder: '03003440200' },
      { name: 'owner_photo_url', label: 'My photo', type: 'image', full: true },
      { name: 'owner_bio', label: 'My introduction / detail', type: 'textarea', full: true },
    ],
  },
  {
    key: 'contact',
    title: 'Contact details',
    note: 'WhatsApp button, call button, email aur map in details se bante hain.',
    icon: Phone,
    fields: [
      { name: 'phone', label: 'Phone number', placeholder: '03003440200' },
      { name: 'whatsapp', label: 'WhatsApp number', placeholder: '03003440200' },
      { name: 'email', label: 'Email / Gmail', placeholder: 'subhanconsolestudio@gmail.com' },
      {
        name: 'whatsapp_message',
        label: 'WhatsApp default message',
        type: 'textarea',
        full: true,
        hint: 'Jab koi WhatsApp button dabata hai to ye message pehle se likha hota hai.',
      },
      { name: 'address', label: 'Office address', type: 'textarea', full: true },
      { name: 'map_query', label: 'Map search text', placeholder: 'Sarfraz Colony, Hyderabad, Sindh, Pakistan' },
      { name: 'hours', label: 'Office timings', placeholder: 'Monday – Saturday: 10:00 AM – 8:00 PM' },
    ],
  },
  {
    key: 'stats',
    title: 'Numbers shown on website',
    note: 'Home page aur Students page par ye counters dikhte hain.',
    icon: Sparkles,
    fields: [
      { name: 'stat_years', label: 'Years of experience', placeholder: '3' },
      { name: 'stat_students', label: 'Students trained', placeholder: '500' },
      { name: 'stat_jobs', label: 'People placed / working', placeholder: '150' },
      { name: 'stat_courses', label: 'Courses & tracks', placeholder: '12' },
      { name: 'about', label: 'About the studio (About page)', type: 'textarea', full: true },
    ],
  },
  {
    key: 'social',
    title: 'Social links',
    note: 'Khali chhor dein agar page nahi hai.',
    icon: Share2,
    fields: [
      { name: 'facebook', label: 'Facebook page link' },
      { name: 'instagram', label: 'Instagram link' },
      { name: 'youtube', label: 'YouTube channel link' },
      { name: 'tiktok', label: 'TikTok link' },
    ],
  },
];

export default function AdminSettings() {
  const { settings, refresh } = useSite();
  const [form, setForm] = useState<Record<string, any>>({});
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!ready && settings && Object.keys(settings).length) {
      setForm(settings);
      setReady(true);
    }
  }, [settings, ready]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const payload: Record<string, any> = {};
      for (const section of SECTIONS) {
        for (const field of section.fields) payload[field.name] = form[field.name] ?? '';
      }
      const data = await api.put<any>('/admin/settings', payload);
      setForm(data.settings);
      await refresh();
      setNotice('Website details saved — your website is updated.');
    } catch (err: any) {
      setError(err?.message || 'Could not save the details.');
    } finally {
      setSaving(false);
    }
  }

  if (!ready) return <LoadingBlock label="Loading website details…" />;

  return (
    <form onSubmit={save} className="space-y-6 pb-24">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">Website &amp; my detail</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            Studio ka naam, phone, WhatsApp number, address, apni tasveer aur detail — sab yahan se change karein. Save karte hi
            website par update ho jata hai.
          </p>
        </div>
        <button type="submit" className="btn-primary btn-sm" disabled={saving}>
          {saving ? <Spinner className="h-4 w-4" /> : <Save className="h-3.5 w-3.5" />}
          Save changes
        </button>
      </header>

      {notice ? <SuccessNote>{notice}</SuccessNote> : null}
      {error ? <ErrorNote>{error}</ErrorNote> : null}

      {SECTIONS.map((section) => (
        <section key={section.key} className="card p-6">
          <div className="mb-5 flex items-start gap-3 border-b border-white/10 pb-4">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/25 to-neon-violet/25 text-cyan-200">
              <section.icon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-white">{section.title}</h2>
              <p className="mt-0.5 text-xs text-slate-400">{section.note}</p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {section.fields.map((field) => {
              const wrapperClass = field.full || field.type === 'textarea' || field.type === 'image' ? 'sm:col-span-2' : '';
              if (field.type === 'image') {
                return (
                  <div key={field.name} className={wrapperClass}>
                    <ImageField
                      value={form[field.name] || ''}
                      onChange={(url) => setForm((prev) => ({ ...prev, [field.name]: url }))}
                      folder="team"
                      label={field.label}
                      hint={field.hint || 'Upload a photo or paste an image link.'}
                    />
                  </div>
                );
              }
              if (field.type === 'textarea') {
                return (
                  <Field key={field.name} label={field.label} hint={field.hint} className={wrapperClass}>
                    <textarea
                      rows={4}
                      className="input"
                      value={form[field.name] || ''}
                      onChange={(e) => setForm((prev) => ({ ...prev, [field.name]: e.target.value }))}
                      placeholder={field.placeholder}
                    />
                  </Field>
                );
              }
              return (
                <Field key={field.name} label={field.label} hint={field.hint} className={wrapperClass}>
                  <input
                    className="input"
                    value={form[field.name] || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field.name]: e.target.value }))}
                    placeholder={field.placeholder}
                  />
                </Field>
              );
            })}
          </div>
        </section>
      ))}

      <div className="sticky bottom-4 z-30 flex flex-wrap items-center gap-3 rounded-2xl border border-white/[0.12] bg-ink-900/95 p-4 backdrop-blur-xl">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          Save changes
        </button>
        <p className="text-xs text-slate-400">Save karte hi website par naya naam, number aur photo live ho jayega.</p>
      </div>
    </form>
  );
}
