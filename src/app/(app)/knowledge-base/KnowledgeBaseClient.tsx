"use client";

import { useEffect, useMemo, useState } from "react";
import {
  HelpCircle,
  BookOpen,
  X,
  ArrowRight,
  Search,
  Wrench,
  ShieldAlert,
  ClipboardList,
  Cpu,
} from "lucide-react";

type Entry = {
  id: string;
  title: string;
  short: string;
  full: string;
  tag: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: {
    // gradient for icon tile
    grad: string;
    // ring/border on hover
    ring: string;
    // tag chip colors
    chipBg: string;
    chipText: string;
    chipBorder: string;
  };
};

const ACCENT_GREEN = {
  grad: "from-[#00FF88] to-[#00CC6A]",
  ring: "hover:border-[#00FF88]/40",
  chipBg: "bg-[#00FF88]/10",
  chipText: "text-[#00FF88]",
  chipBorder: "border-[#00FF88]/20",
};
const ACCENT_CYAN = {
  grad: "from-[#00D9FF] to-[#0099CC]",
  ring: "hover:border-[#00D9FF]/40",
  chipBg: "bg-[#00D9FF]/10",
  chipText: "text-[#00D9FF]",
  chipBorder: "border-[#00D9FF]/20",
};
const ACCENT_PURPLE = {
  grad: "from-[#A78BFA] to-[#8B5CF6]",
  ring: "hover:border-[#A78BFA]/40",
  chipBg: "bg-[#A78BFA]/10",
  chipText: "text-[#A78BFA]",
  chipBorder: "border-[#A78BFA]/20",
};
const ACCENT_ORANGE = {
  grad: "from-[#FF6B35] to-[#CC5529]",
  ring: "hover:border-[#FF6B35]/40",
  chipBg: "bg-[#FF6B35]/10",
  chipText: "text-[#FF6B35]",
  chipBorder: "border-[#FF6B35]/20",
};

const faqs: Entry[] = [
  {
    id: "faq-1",
    title: "Co zrobić, gdy SLA zlecenia jest zagrożone?",
    short:
      "Procedura postępowania serwisanta przy zbliżającym się przekroczeniu czasu reakcji – eskalacja, komunikacja, dokumentacja.",
    full:
      "1. Monitoruj SLA w systemie – zakładka „Zlecenia” pokazuje status każdego zgłoszenia i czas pozostały do przekroczenia SLA.\n\n" +
      "2. Jeśli SLA jest zagrożone (np. mniej niż 1 godzina do przekroczenia), natychmiast poinformuj swojego przełożonego i zespół serwisowy – użyj dedykowanego kanału komunikacji (np. Slack) z informacją o zgłoszeniu i przewidywanym czasie przekroczenia.\n\n" +
      "3. Skontaktuj się z klientem, informując o sytuacji i przewidywanym czasie rozwiązania problemu. Utrzymuj transparentną komunikację, aby zminimalizować frustrację klienta.\n\n" +
      "4. Dokładnie udokumentuj wszystkie podjęte działania w systemie – dodaj notatki do zgłoszenia, opisując podjęte kroki, komunikację z klientem i wszelkie przeszkody napotkane podczas rozwiązywania problemu.\n\n" +
      "5. Po rozwiązaniu problemu, przeprowadź analizę przyczyn przekroczenia SLA i wprowadź działania korygujące, aby zapobiec podobnym sytuacjom w przyszłości.",
    tag: "Proces",
    icon: ShieldAlert,
    accent: ACCENT_ORANGE,
  },
  {
    id: "faq-2",
    title: "Jak prawidłowo wycenić zlecenie i wystawić kosztorys?",
    short:
      "Kiedy tworzyć kosztorys, jakie pozycje uwzględnić, kiedy wymagana jest akceptacja klienta przed przystąpieniem do naprawy.",
    full:
      "Kosztorys (widok „Kosztorysy) jest obowiązkowy zawsze, gdy szacowany koszt naprawy przekracza 150 zł brutto " +
      "lub gdy klient zaznaczył wymóg wyceny przed przystąpieniem do prac.\n\n" +
      "Zasady tworzenia kosztorysu:\n\n" +
      "1. Diagnoza ZAWSZE jako osobna pozycja. Nawet jeśli klient zrezygnuje z naprawy, koszt diagnozy jest naliczany.\n\n" +
      "2. Części wybieraj z modułu Magazyn – nie wpisuj cen ręcznie. Pozycje magazynowe automatycznie blokują stan i aktualizują dostępność.\n\n" +
      "3. Robocizna liczona w stawkach: standardowa 120 zł/h, ekspresowa 180 zł/h, VIP 240 zł/h. Zawsze zaokrąglaj w górę do pełnego pół godziny.\n\n" +
      "4. Każdy kosztorys o wartości powyżej 800 zł brutto wymaga statusu SENT i akceptacji klienta (ACCEPTED) przed rozpoczęciem prac. Rozpoczęcie naprawy bez akceptacji obciąża serwisanta.\n\n" +
      "5. Po zakończeniu naprawy zaktualizuj kosztorys do stanu rzeczywistego – jeżeli rzeczywisty koszt różni się od zaakceptowanego o więcej niż 10%, wymagana jest ponowna akceptacja klienta.\n\n" +
      "Kosztorysy odrzucone (REJECTED) zostają w systemie jako historia – nie usuwaj ich, są podstawą do raportowania konwersji.",
    tag: "Wycena",
    icon: ClipboardList,
    accent: ACCENT_GREEN,
  },
];

const articles: Entry[] = [
  {
    id: "art-1",
    title: "Standardowy workflow obsługi zlecenia",
    short:
      "Pełna ścieżka od przyjęcia urządzenia do wydania klientowi – statusy, dokumentacja, komunikacja, zamknięcie.",
    full:
      "1. Przyjęcie zgłoszenia – klient kontaktuje się z serwisem, zgłaszając problem. Serwisant rejestruje zgłoszenie w systemie, przypisując odpowiednie dane (klient, urządzenie, opis problemu) i nadaje status CREATED.\n\n" +
      "2. Diagnoza – serwisant przeprowadza wstępną diagnozę, aktualizując status na IN_PROGRESS. W tym czasie może tworzyć kosztorys, zamawiać części i komunikować się z klientem.\n\n" +
      "3. Naprawa – po akceptacji kosztorysu (jeśli wymagany) serwisant przystępuje do naprawy, dokumentując postęp i aktualizując status na IN_PROGRESS.\n\n" +
      "4. Oczekiwanie na części – jeśli podczas naprawy okaże się, że potrzebne są dodatkowe części, serwisant aktualizuje status na WAITING i informuje klienta o przewidywanym czasie oczekiwania.\n\n" +
      "5. Zakończenie naprawy – po zakończeniu prac serwisant aktualizuje status na DONE, generuje protokół naprawy i informuje klienta o możliwości odbioru urządzenia.\n\n" +
      "6. Zamknięcie zgłoszenia – po odbiorze urządzenia przez klienta serwisant zamyka zgłoszenie, aktualizując status na CLOSED i dokumentując wszelkie uwagi końcowe.",
    tag: "Workflow",
    icon: Wrench,
    accent: ACCENT_CYAN,
  },
  {
    id: "art-2",
    title: "Diagnostyka komputerów stacjonarnych i laptopów",
    short:
      "Standardowa procedura diagnostyczna – kolejność testów, narzędzia, częste pułapki i sposób dokumentacji wyników.",
    full:
      "1. Zbieranie informacji – zapytaj klienta o objawy, historię problemu i wszelkie wcześniejsze próby naprawy. Sprawdź dane urządzenia (model, specyfikacja) w systemie.\n\n" +
      "2. Testy podstawowe – sprawdź zasilanie, połączenia, stan baterii (dla laptopów) i ewentualne uszkodzenia fizyczne. Użyj multimetru do pomiaru napięć i testowania komponentów.\n\n" +
      "3. Diagnostyka oprogramowania – uruchom narzędzia diagnostyczne (np. MemTest86, CrystalDiskInfo) w celu sprawdzenia pamięci RAM, dysku twardego i innych komponentów. Zbadaj logi systemowe pod kątem błędów.\n\n" +
      "4. Testy zaawansowane – jeśli podstawowe testy nie wykazały problemu, przeprowadź testy bardziej zaawansowane (np. testowanie płyty głównej, karty graficznej) przy użyciu specjalistycznych narzędzi diagnostycznych.\n\n" +
      "5. Dokumentacja – dokładnie udokumentuj wszystkie przeprowadzone testy, wyniki i wnioski w systemie. Dodaj notatki do zgłoszenia, opisując każdy krok diagnostyki i jego rezultat.",
    tag: "Diagnostyka",
    icon: Cpu,
    accent: ACCENT_PURPLE,
  },
];

function Tile({ entry, onOpen }: { entry: Entry; onOpen: (e: Entry) => void }) {
  const Icon = entry.icon;
  return (
    <button
      onClick={() => onOpen(entry)}
      className={[
        "group text-left w-full h-full",
        "bg-[#0C1222] border border-[#1A2642] rounded-xl shadow-lg",
        "p-5 sm:p-6 flex flex-col gap-4 transition-all",
        entry.accent.ring,
      ].join(" ")}
    >
      <div className="flex items-start gap-4">
        <div
          className={`shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br ${entry.accent.grad} flex items-center justify-center shadow-lg`}
        >
          <Icon className="w-6 h-6 text-[#0C1222]" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`px-2 py-0.5 rounded text-[11px] uppercase tracking-wide border ${entry.accent.chipBg} ${entry.accent.chipText} ${entry.accent.chipBorder}`}
            >
              {entry.tag}
            </span>
          </div>
          <h3 className="text-white text-base sm:text-lg leading-snug">
            {entry.title}
          </h3>
        </div>
      </div>

      <p className="text-[#94A3B8] text-sm leading-relaxed line-clamp-3">
        {entry.short}
      </p>

      <div className="mt-auto pt-2 border-t border-[#1A2642] flex items-center justify-between">
        <span className={`text-sm ${entry.accent.chipText}`}>Czytaj dalej</span>
        <ArrowRight
          className={`w-4 h-4 ${entry.accent.chipText} group-hover:translate-x-1 transition-transform`}
        />
      </div>
    </button>
  );
}

function Modal({ entry, onClose }: { entry: Entry | null; onClose: () => void }) {
  useEffect(() => {
    if (!entry) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [entry, onClose]);

  if (!entry) return null;
  const Icon = entry.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-3xl max-h-[92vh] sm:max-h-[85vh] overflow-hidden flex flex-col bg-[#0C1222] border border-[#1A2642] rounded-t-2xl sm:rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 px-5 sm:px-6 py-5 border-b border-[#1A2642]">
          <div
            className={`shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br ${entry.accent.grad} flex items-center justify-center shadow-lg`}
          >
            <Icon className="w-6 h-6 text-[#0C1222]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`px-2 py-0.5 rounded text-[11px] uppercase tracking-wide border ${entry.accent.chipBg} ${entry.accent.chipText} ${entry.accent.chipBorder}`}
              >
                {entry.tag}
              </span>
            </div>
            <h2 className="text-white text-lg sm:text-xl leading-tight">
              {entry.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#121B2D] border border-[#1A2642] hover:border-[#FF6B35]/40 transition"
            aria-label="Zamknij"
          >
            <X className="w-4 h-4 text-[#94A3B8]" />
          </button>
        </div>

        <div className="px-5 sm:px-6 py-5 overflow-y-auto text-[#CBD5E1] text-sm sm:text-[15px] leading-relaxed whitespace-pre-line">
          {entry.full}
        </div>

        <div className="px-5 sm:px-6 py-4 border-t border-[#1A2642] bg-[#121B2D]/40 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#121B2D] border border-[#1A2642] text-sm text-white hover:border-[#00FF88]/40 transition"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  description,
  count,
  entries,
  onOpen,
  accentGrad,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  count: number;
  entries: Entry[];
  onOpen: (e: Entry) => void;
  accentGrad: string;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-lg bg-gradient-to-br ${accentGrad} flex items-center justify-center shadow-lg`}
          >
            <Icon className="w-5 h-5 text-[#0C1222]" />
          </div>
          <div>
            <h2 className="text-white text-lg sm:text-xl">{title}</h2>
            <p className="text-[#94A3B8] text-xs sm:text-sm">{description}</p>
          </div>
        </div>
        <span className="text-xs text-[#64748B] bg-[#121B2D] border border-[#1A2642] rounded-full px-3 py-1">
          {count} {count === 1 ? "wpis" : "wpisy"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {entries.map((entry) => (
          <Tile key={entry.id} entry={entry} onOpen={onOpen} />
        ))}
      </div>
    </section>
  );
}

export default function KnowledgeBaseClient() {
  const [active, setActive] = useState<Entry | null>(null);
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const filteredFaqs = useMemo(
    () =>
      q
        ? faqs.filter(
            (e) =>
              e.title.toLowerCase().includes(q) ||
              e.short.toLowerCase().includes(q) ||
              e.tag.toLowerCase().includes(q),
          )
        : faqs,
    [q],
  );
  const filteredArticles = useMemo(
    () =>
      q
        ? articles.filter(
            (e) =>
              e.title.toLowerCase().includes(q) ||
              e.short.toLowerCase().includes(q) ||
              e.tag.toLowerCase().includes(q),
          )
        : articles,
    [q],
  );

  return (
    <div className="space-y-6 lg:space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="bg-[#0C1222] border border-[#1A2642] rounded-xl shadow-lg p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <h1 className="text-white text-xl sm:text-2xl">Baza wiedzy serwisanta</h1>
            <p className="text-[#94A3B8] text-sm mt-1">
              Procedury, instrukcje techniczne i odpowiedzi na pytania pojawiające się w codziennej pracy serwisu.
            </p>
          </div>

          <div className="w-full md:w-auto md:min-w-[320px] flex items-center gap-2 px-3 h-10 rounded-lg bg-[#121B2D] border border-[#1A2642] focus-within:border-[#00FF88]/40 transition">
            <Search className="w-4 h-4 text-[#64748B] shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-transparent outline-none text-sm placeholder:text-[#64748B] text-white w-full"
              placeholder="Szukaj w bazie wiedzy..."
            />
          </div>
        </div>
      </div>

      {/* FAQ */}
      <Section
        icon={HelpCircle}
        title="FAQ"
        description="Najczęściej zadawane pytania serwisantów."
        count={filteredFaqs.length}
        entries={filteredFaqs}
        onOpen={setActive}
        accentGrad="from-[#FF6B35] to-[#CC5529]"
      />

      {/* Articles */}
      <Section
        icon={BookOpen}
        title="Artykuły"
        description="Procedury, workflow i instrukcje techniczne."
        count={filteredArticles.length}
        entries={filteredArticles}
        onOpen={setActive}
        accentGrad="from-[#00D9FF] to-[#0099CC]"
      />

      {/* Empty state */}
      {q && filteredFaqs.length === 0 && filteredArticles.length === 0 && (
        <div className="bg-[#0C1222] border border-[#1A2642] rounded-xl shadow-lg p-10 text-center">
          <p className="text-[#94A3B8] text-sm">
            Brak wyników dla zapytania <span className="text-white">„{query}"</span>.
          </p>
        </div>
      )}

      <Modal entry={active} onClose={() => setActive(null)} />
    </div>
  );
}