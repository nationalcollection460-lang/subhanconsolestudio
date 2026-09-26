import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Eye, EyeOff, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';

import { ErrorNote, Field, LoadingBlock, Modal, Spinner, SuccessNote, Toggle } from '../components/ui';
import { api } from '../lib/api';
import { useSite } from '../lib/site';
import { cn, listToText } from '../lib/utils';
import { RESOURCES, type FieldDef } from './config';
import ImageField from './ImageField';

function blankForm(resource: string) {
  const config = RESOURCES[resource];
  const form: Record<string, any> = {};
  for (const field of config.fields) {
    if (field.type === 'toggle') form[field.name] = field.name === 'active';
    else if (field.type === 'number') form[field.name] = 0;
    else form[field.name] = '';
  }
  return form;
}

export default function AdminContent({ resource }: { resource: string }) {
  const config = RESOURCES[resource];
  const { site, refresh } = useSite();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<Record<string, any>>(() => blankForm(resource));
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<any>(config.endpoint);
      setItems(data.items || []);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Could not load this list.');
    } finally {
      setLoading(false);
    }
  }, [config.endpoint]);

  useEffect(() => {
    load();
  }, [load]);

  function resolveOptions(field: FieldDef) {
    if (!field.options) return [];
    return typeof field.options === 'function' ? field.options(site) : field.options;
  }

  function openNew() {
    setEditing(null);
    setForm(blankForm(resource));
    setFormError(null);
    setOpen(true);
  }

  function openEdit(item: any) {
    const next: Record<string, any> = {};
    for (const field of config.fields) {
      const raw = item[field.name];
      if (field.type === 'list') next[field.name] = listToText(raw);
      else if (field.type === 'toggle') next[field.name] = Boolean(raw);
      else if (field.type === 'number') next[field.name] = Number(raw) || 0;
      else next[field.name] = raw ?? '';
    }
    setEditing(item);
    setForm(next);
    setFormError(null);
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const payload: Record<string, any> = {};
      for (const field of config.fields) {
        const value = form[field.name];
        if (field.type === 'number') payload[field.name] = Number(value) || 0;
        else if (field.type === 'toggle') payload[field.name] = Boolean(value);
        else payload[field.name] = value ?? '';
      }
      if (editing?.id) await api.put(`${config.endpoint}/${editing.id}`, payload);
      else await api.post(config.endpoint, payload);
      setOpen(false);
      setNotice(editing?.id ? 'Changes saved.' : `${config.singular} added.`);
      await load();
      await refresh();
    } catch (err: any) {
      setFormError(err?.message || 'Could not save. Please check the fields.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(item: any) {
    try {
      await api.put(`${config.endpoint}/${item.id}`, { active: !item.active });
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, active: !item.active } : i)));
      await refresh();
    } catch (err: any) {
      setError(err?.message || 'Could not update.');
    }
  }

  async function remove(item: any) {
    const label = item[config.titleField] || config.singular;
    if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return;
    try {
      await api.del(`${config.endpoint}/${item.id}`);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      setNotice('Deleted.');
      await refresh();
    } catch (err: any) {
      setError(err?.message || 'Could not delete.');
    }
  }

  const publicLink = useMemo(() => {
    if (resource === 'courses') return '/courses';
    if (resource === 'jobs') return '/jobs';
    if (resource === 'services') return '/services';
    if (resource === 'students') return '/students';
    if (resource === 'ads') return '/';
    return null;
  }, [resource]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">{config.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">{config.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {publicLink ? (
            <Link to={publicLink} className="btn-outline btn-sm" target="_blank">
              <Eye className="h-3.5 w-3.5" />
              View on website
            </Link>
          ) : null}
          <button type="button" className="btn-ghost btn-sm" onClick={load} aria-label="Refresh list">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
          <button type="button" className="btn-primary btn-sm" onClick={openNew}>
            <Plus className="h-3.5 w-3.5" />
            Add {config.singular}
          </button>
        </div>
      </header>

      {notice ? (
        <div className="flex items-center justify-between gap-3">
          <SuccessNote>{notice}</SuccessNote>
          <button type="button" className="btn-ghost btn-sm" onClick={() => setNotice(null)}>
            Dismiss
          </button>
        </div>
      ) : null}
      {error ? <ErrorNote>{error}</ErrorNote> : null}

      {loading ? (
        <LoadingBlock label={`Loading ${config.title.toLowerCase()}…`} />
      ) : items.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="font-display text-lg font-bold text-white">Nothing added yet</p>
          <p className="mt-1 text-sm text-slate-400">
            Click “Add {config.singular}” to create the first one — it will appear on the website straight away.
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-semibold">{config.titleField === 'name' ? 'Name' : 'Title'}</th>
                  {config.tableColumns.map((col) => (
                    <th key={col.name} className="px-5 py-3 font-semibold">
                      {col.label}
                    </th>
                  ))}
                  {config.activeField ? <th className="px-5 py-3 font-semibold">Live</th> : null}
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.08]">
                {items.map((item) => (
                  <tr key={item.id} className="transition hover:bg-white/[0.03]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {config.imageField && item[config.imageField] ? (
                          <img src={item[config.imageField]} alt="" className="h-10 w-10 rounded-xl object-cover" />
                        ) : null}
                        <div>
                          <p className="font-semibold text-white">{item[config.titleField]}</p>
                          {config.badgeField && item[config.badgeField] ? (
                            <span className="text-[11px] uppercase tracking-wide text-cyan-300">{item[config.badgeField]}</span>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    {config.tableColumns.map((col) => (
                      <td key={col.name} className="px-5 py-3 text-slate-300">
                        {String(item[col.name] ?? '—')}
                      </td>
                    ))}
                    {config.activeField ? (
                      <td className="px-5 py-3">
                        <button
                          type="button"
                          onClick={() => toggleActive(item)}
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold',
                            item.active
                              ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
                              : 'border-white/[0.15] bg-white/[0.05] text-slate-400',
                          )}
                          title="Click to show / hide on the website"
                        >
                          {item.active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          {item.active ? 'Live' : 'Hidden'}
                        </button>
                      </td>
                    ) : null}
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button type="button" className="btn-outline btn-sm" onClick={() => openEdit(item)}>
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm border border-rose-400/25 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20"
                          onClick={() => remove(item)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing?.id ? `Edit ${config.singular}` : `Add ${config.singular}`}
        subtitle="Changes appear on the website immediately after saving."
        wide
      >
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          {config.fields.map((field) => {
            const value = form[field.name];
            const setValue = (v: any) => setForm((prev) => ({ ...prev, [field.name]: v }));
            const wrapperClass = field.full || field.type === 'textarea' || field.type === 'list' || field.type === 'image' ? 'sm:col-span-2' : '';

            if (field.type === 'toggle') {
              return (
                <div key={field.name} className={cn('rounded-2xl border border-white/10 bg-white/[0.03] p-4', wrapperClass)}>
                  <Toggle checked={Boolean(value)} onChange={setValue} label={field.label} />
                  {field.hint ? <p className="mt-2 text-xs text-slate-500">{field.hint}</p> : null}
                </div>
              );
            }

            if (field.type === 'image') {
              return (
                <div key={field.name} className={wrapperClass}>
                  <ImageField
                    value={value}
                    onChange={setValue}
                    folder={config.folder}
                    label={field.label}
                    hint={field.hint}
                  />
                </div>
              );
            }

            if (field.type === 'select') {
              const options = resolveOptions(field);
              return (
                <Field key={field.name} label={field.label} hint={field.hint} className={wrapperClass}>
                  <select className="input" value={value || ''} onChange={(e) => setValue(e.target.value)}>
                    <option value="">— Select —</option>
                    {options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                    {value && !options.includes(value) ? <option value={value}>{value}</option> : null}
                  </select>
                </Field>
              );
            }

            if (field.type === 'textarea' || field.type === 'list') {
              return (
                <Field
                  key={field.name}
                  label={field.label}
                  hint={field.hint || (field.type === 'list' ? 'Ek line par ek point likhein.' : undefined)}
                  className={wrapperClass}
                >
                  <textarea
                    rows={field.type === 'list' ? 4 : 5}
                    className="input"
                    value={value || ''}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={field.placeholder}
                  />
                </Field>
              );
            }

            return (
              <Field key={field.name} label={field.label} hint={field.hint} className={wrapperClass}>
                <input
                  className="input"
                  type={field.type === 'number' ? 'number' : 'text'}
                  value={value ?? ''}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                />
              </Field>
            );
          })}

          {formError ? (
            <div className="sm:col-span-2">
              <ErrorNote>{formError}</ErrorNote>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <Spinner className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
              {editing?.id ? 'Save changes' : `Add ${config.singular}`}
            </button>
            <button type="button" className="btn-outline" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
