import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, MessageSquare, Send, Sparkles, X } from 'lucide-react';

import { api } from '../lib/api';
import { useSite } from '../lib/site';
import { cn } from '../lib/utils';
import { Spinner, WhatsappIcon } from './ui';

type Msg = { role: 'user' | 'assistant'; content: string };

const DEFAULT_SUGGESTIONS = ['Courses aur fees', 'Jobs available', 'Office address', 'Apply karna hai'];

function renderInline(line: string) {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|https?:\/\/[^\s]+|www\.[^\s]+)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(line)) !== null) {
    if (match.index > last) parts.push(line.slice(last, match.index));
    const token = match[0];
    if (token.startsWith('**')) {
      parts.push(
        <strong key={key++} className="font-semibold text-white">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith('*')) {
      parts.push(
        <strong key={key++} className="font-semibold text-white">
          {token.slice(1, -1)}
        </strong>,
      );
    } else {
      parts.push(
        <a
          key={key++}
          href={token.startsWith('http') ? token : `https://${token}`}
          target="_blank"
          rel="noreferrer"
          className="break-all text-cyan-300 underline decoration-cyan-300/40"
        >
          {token}
        </a>,
      );
    }
    last = match.index + token.length;
  }
  if (last < line.length) parts.push(line.slice(last));
  return parts;
}

function RichText({ text }: { text: string }) {
  const lines = String(text || '').split('\n');
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) =>
        line.trim() === '' ? <div key={i} className="h-2" /> : <p key={i} className="whitespace-pre-wrap break-words">{renderInline(line)}</p>,
      )}
    </div>
  );
}

export default function ChatWidget() {
  const { settings, site } = useSite();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS);
  const scroller = useRef<HTMLDivElement | null>(null);

  const waHref = useMemo(
    () => site?.links?.whatsapp || `https://wa.me/923003440200`,
    [site?.links?.whatsapp],
  );

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content:
            settings.chat_welcome ||
            'Assalam-o-Alaikum! I am the Subhan Console Studio assistant — online 24/7. Ask me about courses, fees, jobs, timings or apply.',
        },
      ]);
    }
  }, [open, messages.length, settings.chat_welcome]);

  useEffect(() => {
    if (scroller.current) {
      scroller.current.scrollTop = scroller.current.scrollHeight;
    }
  }, [messages, busy, open]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    const next: Msg[] = [...messages, { role: 'user', content: question }];
    setMessages(next);
    setInput('');
    setBusy(true);
    try {
      const data = await api.post<{ reply: string; suggestions?: string[]; whatsapp?: string }>('/chat', {
        messages: next.slice(-10),
      });
      setMessages([...next, { role: 'assistant', content: data.reply }]);
      if (data.suggestions?.length) setSuggestions(data.suggestions);
    } catch (err: any) {
      setMessages([
        ...next,
        {
          role: 'assistant',
          content: `Maazrat, network issue ho gaya. Aap humein WhatsApp par message kar sakte hain: ${settings.whatsapp || '03003440200'}`,
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="pointer-events-auto fixed inset-x-3 bottom-24 z-[78] flex h-[68vh] max-h-[600px] flex-col overflow-hidden rounded-3xl border border-white/[0.12] bg-ink-900/95 shadow-card backdrop-blur-xl sm:inset-x-auto sm:right-5 sm:bottom-24 sm:h-[560px] sm:w-[398px]"
            role="dialog"
            aria-label="AI support chat"
          >
            <div className="flex items-center gap-3 border-b border-white/10 bg-gradient-to-r from-cyan-400/15 via-brand-500/10 to-neon-violet/[0.15] px-4 py-3">
              <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-neon-violet text-ink-950">
                <Bot className="h-5 w-5" />
                <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-ink-900 bg-emerald-400" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm font-bold text-white">
                  {settings.short_name || 'Studio'} Assistant
                </p>
                <p className="text-[11px] font-medium text-emerald-300">Online 24/7 • AI support</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="btn-ghost btn-sm" aria-label="Close chat">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m, i) => (
                <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div
                    className={cn(
                      'max-w-[86%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm',
                      m.role === 'user'
                        ? 'rounded-br-md bg-gradient-to-br from-cyan-400 to-brand-500 font-medium text-white'
                        : 'rounded-bl-md border border-white/10 bg-white/[0.06] text-slate-200',
                    )}
                  >
                    <RichText text={m.content} />
                  </div>
                </div>
              ))}

              {busy ? (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.06] px-4 py-3">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-300" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-300" style={{ animationDelay: '140ms' }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-300" style={{ animationDelay: '280ms' }} />
                  </div>
                </div>
              ) : null}
            </div>

            <div className="border-t border-white/10 px-3 pt-3 pb-3">
              <div className="mb-2.5 flex gap-2 overflow-x-auto no-scrollbar">
                {suggestions.slice(0, 4).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    disabled={busy}
                    className="shrink-0 rounded-full border border-white/[0.12] bg-white/[0.05] px-3 py-1.5 text-[11px] font-medium text-slate-300 transition hover:border-cyan-300/40 hover:text-white"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex items-center gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Apna sawal likhein…"
                  aria-label="Type your question"
                  className="input py-2.5 text-[13px]"
                />
                <button type="submit" className="btn-primary !px-3.5 !py-2.5" disabled={busy || !input.trim()} aria-label="Send message">
                  {busy ? <Spinner className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                </button>
              </form>
              <a href={waHref} target="_blank" rel="noreferrer" className="mt-2.5 flex items-center justify-center gap-2 text-[11px] font-semibold text-emerald-300 hover:text-emerald-200">
                <WhatsappIcon className="h-3.5 w-3.5" />
                Insan se baat karni hai? WhatsApp: {settings.whatsapp || '03003440200'}
              </a>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="pointer-events-none fixed bottom-4 right-4 z-[79] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
        <a
          href={waHref}
          target="_blank"
          rel="noreferrer"
          className="pointer-events-auto group flex items-center gap-2 rounded-full bg-[#25D366] px-3.5 py-3 font-semibold text-[#052e16] shadow-[0_16px_40px_-14px_rgba(37,211,102,0.85)] transition hover:brightness-110 active:scale-95"
          aria-label="Chat with us on WhatsApp"
        >
          <WhatsappIcon className="h-6 w-6" />
          <span className="hidden text-sm sm:inline">WhatsApp</span>
        </a>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="pointer-events-auto relative flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-brand-500 to-neon-violet px-4 py-3 font-semibold text-white shadow-[0_16px_40px_-14px_rgba(63,92,242,0.95)] transition hover:brightness-110 active:scale-95"
          aria-label={open ? 'Close AI support chat' : 'Open AI support chat'}
        >
          {!open ? <span className="absolute inset-0 -z-10 rounded-full bg-cyan-300/40 animate-pulse-ring" aria-hidden="true" /> : null}
          {open ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
          <span className="hidden text-sm sm:inline">{open ? 'Close' : 'AI Help 24/7'}</span>
          <Sparkles className="h-3.5 w-3.5 sm:hidden" />
        </button>
      </div>
    </>
  );
}
