'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';

type LatestTicketResponse = {
  latestTicketId: string | null;
  latestTicketNumber: string | null;
  latestTicketTitle: string | null;
  latestTicketCreatedAt: string | null;
  latestTicketStatus: string | null;
  latestTicketPriority: string | null;
};

function getPriorityLabel(priority: string | null) {
  if (priority === 'LOW') return 'Niski';
  if (priority === 'NORMAL') return 'Normalny';
  if (priority === 'HIGH') return 'Wysoki';
  if (priority === 'CRITICAL') return 'Krytyczny';

  return priority ?? 'Brak priorytetu';
}

function getStatusLabel(status: string | null) {
  if (status === 'NEW') return 'Nowe';
  if (status === 'IN_PROGRESS') return 'W trakcie';
  if (status === 'WAITING') return 'Oczekujące';
  if (status === 'DONE') return 'Zakończone';
  if (status === 'CANCELED') return 'Anulowane';

  return status ?? 'Brak statusu';
}

const hiddenCookieName = 'ticketNotificationsHidden';

function setHiddenCookie(hidden: boolean) {
  document.cookie = `${hiddenCookieName}=${hidden ? '1' : '0'}; path=/; max-age=31536000; SameSite=Lax`;
}

function getHiddenCookie() {
  return document.cookie
    .split('; ')
    .some((cookie) => cookie === `${hiddenCookieName}=1`);
}

export function TicketNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(true);
  const [isHidden, setIsHidden] = useState(false);

  const lastTicketIdRef = useRef<string | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!('Notification' in window)) {
      setIsSupported(false);
      return;
    }

    setPermission(Notification.permission);
    setIsHidden(getHiddenCookie());
  }, []);

  function hidePrompt() {
    setIsHidden(true);
    setHiddenCookie(true);
  }

  function showPrompt() {
    setIsHidden(false);
    setHiddenCookie(false);
  }

  async function requestPermission() {
    if (typeof window === 'undefined') return;

    if (!('Notification' in window)) {
      setIsSupported(false);
      alert('Ta przeglądarka nie obsługuje powiadomień systemowych.');
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    async function checkLatestTicket() {
      try {
        const res = await fetch('/api/tickets/latest', {
          method: 'GET',
          cache: 'no-store',
        });

        if (!res.ok) {
          return;
        }

        const data: LatestTicketResponse = await res.json();

        if (!data.latestTicketId) {
          return;
        }

        /*
          Pierwsze pobranie tylko zapamiętuje ostatnie zgłoszenie.
          Dzięki temu po odświeżeniu strony nie wyskakuje powiadomienie
          o starym zgłoszeniu.
        */
        if (!initializedRef.current) {
          lastTicketIdRef.current = data.latestTicketId;
          initializedRef.current = true;
          return;
        }

        /*
          Jeśli ID najnowszego zgłoszenia się zmieniło,
          to znaczy, że powstało nowe zgłoszenie.
        */
        if (lastTicketIdRef.current !== data.latestTicketId) {
          lastTicketIdRef.current = data.latestTicketId;

          const notification = new Notification('Nowe zgłoszenie serwisowe', {
            body: `${data.latestTicketNumber ?? 'Nowe zgłoszenie'} — ${
              data.latestTicketTitle ?? 'Brak tytułu'
            } | Status: ${getStatusLabel(data.latestTicketStatus)} | Priorytet: ${getPriorityLabel(
              data.latestTicketPriority,
            )}`,
            tag: data.latestTicketId,
            icon: '/icon-192.png',
          });

          notification.onclick = () => {
            window.focus();

            if (data.latestTicketId) {
              window.location.href = `/tickets/${data.latestTicketId}`;
            }
          };
        }
      } catch (error) {
        console.error('Błąd sprawdzania nowych zgłoszeń:', error);
      }
    }

    checkLatestTicket();

    const interval = window.setInterval(checkLatestTicket, 15000);

    return () => {
      window.clearInterval(interval);
    };
  }, [permission]);

  if (!isSupported) {
    return null;
  }

  if (permission === 'granted') {
    return null;
  }

  if (permission === 'denied') {
    return null;
  }

  if (isHidden) {
    return (
      <button
        type="button"
        onClick={showPrompt}
        className="fixed bottom-8 right-0 z-50 flex h-9 w-8 items-center justify-center rounded-l-xl border border-r-0 border-white/10 bg-[#0b5cff] text-sm text-white shadow-lg hover:bg-[#084bd1] transition"
        title="Pokaż powiadomienia"
        aria-label="Pokaż powiadomienia"
      >
        <Bell className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center overflow-hidden rounded-2xl bg-[#0b5cff] shadow-xl">
      <button
        type="button"
        onClick={requestPermission}
        className="px-5 py-3 text-sm font-medium leading-none text-white hover:bg-[#084bd1] transition"
      >
        Włącz powiadomienia
      </button>

      <button
        type="button"
        onClick={hidePrompt}
        className="self-stretch border-l border-white/20 px-3 text-lg font-medium leading-none text-white/80 hover:bg-black/15 hover:text-white transition"
        aria-label="Schowaj przycisk powiadomień"
        title="Schowaj"
      >
        ×
      </button>
    </div>
  );
}