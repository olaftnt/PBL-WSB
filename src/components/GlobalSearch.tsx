'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Loader2,
  MonitorSmartphone,
  Package,
  Search,
  Ticket,
  User,
  X,
} from 'lucide-react';

type SearchResult = {
  id: string;
  type: 'ticket' | 'customer' | 'device' | 'quote' | 'part';
  title: string;
  subtitle: string;
  href: string;
};

const typeConfig = {
  ticket: {
    label: 'Zlecenie',
    icon: Ticket,
    color: 'text-[#00D9FF]',
    bg: 'bg-[#00D9FF]/10',
  },
  customer: {
    label: 'Klient',
    icon: User,
    color: 'text-[#00FF88]',
    bg: 'bg-[#00FF88]/10',
  },
  device: {
    label: 'Urządzenie',
    icon: MonitorSmartphone,
    color: 'text-[#A78BFA]',
    bg: 'bg-[#A78BFA]/10',
  },
  quote: {
    label: 'Kosztorys',
    icon: FileText,
    color: 'text-[#FFB800]',
    bg: 'bg-[#FFB800]/10',
  },
  part: {
    label: 'Część',
    icon: Package,
    color: 'text-[#94A3B8]',
    bg: 'bg-[#64748B]/10',
  },
};

export function GlobalSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const canSearch = query.trim().length >= 2;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
      }

      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;

    const timeout = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    if (!canSearch) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, {
          signal: controller.signal,
        });
        const data = await response.json();
        setResults(Array.isArray(data.results) ? data.results : []);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Search failed', error);
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 200);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [canSearch, query]);

  const helperText = useMemo(() => {
    if (!query.trim()) {
      return 'Szukaj po numerze zlecenia, kliencie, telefonie, urządzeniu, numerze seryjnym albo kosztorysie.';
    }

    if (!canSearch) {
      return 'Wpisz minimum 2 znaki.';
    }

    if (loading) {
      return 'Szukam...';
    }

    if (!results.length) {
      return 'Brak wyników.';
    }

    return null;
  }, [canSearch, loading, query, results.length]);

  const close = () => {
    setOpen(false);
    setQuery('');
    setResults([]);
  };

  const openResult = (href: string) => {
    close();
    router.push(href);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden md:flex w-[26rem] max-w-[40vw] items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-left text-white/60 transition hover:border-[#00D9FF]/50 hover:bg-white/10"
      >
        <span className="flex min-w-0 items-center gap-2">
          <Search className="h-4 w-4 shrink-0" />
          <span className="truncate text-sm">
            Szukaj zleceń, klientów, urządzeń, kosztorysów...
          </span>
        </span>
        <span className="rounded-md border border-white/10 bg-black/20 px-2 py-0.5 text-xs text-white/40">
          Ctrl K
        </span>
      </button>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 md:hidden"
        aria-label="Szukaj"
      >
        <Search className="h-5 w-5" />
      </button>

      {mounted &&
        open &&
        createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/40"
          onMouseDown={close}
          style={{
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
          }}
        >
          <div
            className="fixed left-1/2 top-1/2 w-[calc(100vw-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/10 bg-[#0C1222]/95 shadow-2xl shadow-black/50"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
              <Search className="h-5 w-5 text-[#00D9FF]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Szukaj po numerze, kliencie, telefonie, SN..."
                className="min-w-0 flex-1 bg-transparent text-lg text-white outline-none placeholder:text-white/35"
              />
              {loading && <Loader2 className="h-5 w-5 animate-spin text-white/40" />}
              <button
                type="button"
                onClick={close}
                className="rounded-lg p-2 text-white/50 transition hover:bg-white/5 hover:text-white"
                aria-label="Zamknij wyszukiwanie"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[28rem] overflow-y-auto p-3">
              {helperText && (
                <div className="px-3 py-8 text-center text-sm text-white/45">
                  {helperText}
                </div>
              )}

              {!helperText && (
                <div className="space-y-2">
                  {results.map((result) => {
                    const config = typeConfig[result.type];
                    const Icon = config.icon;

                    return (
                      <button
                        key={`${result.type}-${result.id}`}
                        type="button"
                        onClick={() => openResult(result.href)}
                        className="flex w-full items-center gap-4 rounded-xl px-3 py-3 text-left transition hover:bg-white/5"
                      >
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${config.bg}`}
                        >
                          <Icon className={`h-5 w-5 ${config.color}`} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-medium text-white">
                              {result.title}
                            </span>
                            <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-xs text-white/45">
                              {config.label}
                            </span>
                          </div>
                          <p className="mt-1 truncate text-sm text-white/45">
                            {result.subtitle || result.href}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>,
          document.body,
        )}
    </>
  );
}
