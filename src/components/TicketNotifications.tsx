'use client';

import { useEffect, useRef, useState } from 'react';

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

export function TicketNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(true);

  const lastTicketIdRef = useRef<string | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!('Notification' in window)) {
      setIsSupported(false);
      return;
    }

    setPermission(Notification.permission);
  }, []);

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

  return (
    <button
      type="button"
      onClick={requestPermission}
      className="fixed bottom-6 right-6 z-50 rounded-2xl bg-[#0b5cff] px-5 py-3 text-sm font-medium text-white shadow-xl hover:bg-[#084bd1] transition"
    >
      Włącz powiadomienia
    </button>
  );
}