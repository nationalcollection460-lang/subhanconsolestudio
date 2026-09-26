import { useRef, useState } from 'react';
import { ImagePlus, Link2, Loader2, X } from 'lucide-react';

import { api } from '../lib/api';
import { ErrorNote } from '../components/ui';

export default function ImageField({
  value,
  onChange,
  folder = 'uploads',
  label = 'Image',
  hint = 'Upload a photo from your phone/computer, or paste an image link.',
}: {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  hint?: string;
}) {
  const MAX_BYTES = 25 * 1024 * 1024;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement | null>(null);

  async function pick(file?: File | null) {
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setError('That file is bigger than 25MB. Please choose a smaller photo, or paste an image link.');
      if (input.current) input.current.value = '';
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const data = await api.upload(file, folder);
      onChange(data.url);
    } catch (err: any) {
      setError(err?.message || 'Upload failed. Please try again or paste a link.');
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  }

  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex items-start gap-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-white/[0.12] bg-ink-950/60">
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-slate-600">
              <ImagePlus className="h-6 w-6" />
            </span>
          )}
          {busy ? (
            <span className="absolute inset-0 flex items-center justify-center bg-ink-950/70">
              <Loader2 className="h-5 w-5 animate-spin text-cyan-300" />
            </span>
          ) : null}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-outline btn-sm" onClick={() => input.current?.click()} disabled={busy}>
              <ImagePlus className="h-3.5 w-3.5" />
              {value ? 'Change photo' : 'Upload photo'}
            </button>
            {value ? (
              <button type="button" className="btn-ghost btn-sm" onClick={() => onChange('')}>
                <X className="h-3.5 w-3.5" />
                Remove
              </button>
            ) : null}
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-white/[0.12] bg-ink-900/70 px-3 py-2">
            <Link2 className="h-4 w-4 shrink-0 text-slate-500" />
            <input
              className="w-full bg-transparent text-xs text-white placeholder-slate-500 outline-none"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://image-link.jpg"
              aria-label={`${label} link`}
            />
          </div>
          <p className="text-xs text-slate-500">{hint}</p>
          {error ? <ErrorNote>{error}</ErrorNote> : null}
        </div>
      </div>

      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,application/pdf"
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0])}
      />
    </div>
  );
}
