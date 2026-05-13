import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const statusLabels: Record<string, string> = {
  CREATED: 'Utworzenie zgłoszenia',
  IN_PROGRESS: 'Sprzęt w trakcie naprawy',
  DONE: 'Naprawa zakończona. Sprzęt gotowy do odbioru',
  WAITING: 'Oczekiwanie na części',
  CANCELED: 'Anulowanie zgłoszenia',
  NEW: 'Przyjęcie sprzętu na serwis',
};

export async function sendStatusEmail({
  email,
  ticketNumber,
  status,
  device,
}: {
  email: string;
  ticketNumber: string;
  status: string;
  device?: string | null;
}) {
  const statusText = statusLabels[status] ?? status;

  const subject =
    status === 'CREATED'
      ? `Przyjęliśmy Twoje zgłoszenie ${ticketNumber}`
      : status === 'DONE'
      ? `Twoje urządzenie jest gotowe do odbioru ${ticketNumber}`
      : `Aktualizacja statusu zgłoszenia ${ticketNumber}`;

  const doneExtra =
    status === 'DONE'
      ? `
        <div style="margin-top:20px;padding:15px;background:#f3f4f6;border-radius:8px">
          <h3>📍 Odbiór sprzętu</h3>
          <p>Twój sprzęt jest gotowy do odbioru w naszym serwisie:</p>
          <p>
            <strong>Serwis IT</strong><br/>
            ul. Przykładowa 12<br/>
            40-000 Katowice<br/>
            Tel: +48 111 222 333
          </p>
        </div>
      `
      : '';

  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: email,
    subject,
    html: `
<div style="background:#ffffff;padding:40px 0;font-family:Arial,sans-serif">

  <div style="max-width:600px;margin:0 auto;background:#0b1220;border-radius:18px;overflow:hidden;border:1px solid #1f2937;box-shadow:0 25px 50px rgba(0,0,0,0.25)">

    <!-- HEADER -->
    <div style="background:linear-gradient(135deg,#00FF88,#00C2FF);padding:22px;text-align:center">
      <div style="font-size:18px;font-weight:bold;color:#0b1220">
        Serwis IT
      </div>
    </div>

    <!-- BODY -->
    <div style="padding:28px;color:#e5e7eb">

      ${
        status === 'CREATED'
          ? `<h2 style="margin:0 0 10px 0;color:#ffffff">📥 Przyjęliśmy Twoje zgłoszenie</h2>`
          : status === 'DONE'
          ? `<h2 style="margin:0 0 10px 0;color:#ffffff">🎉 Sprzęt gotowy do odbioru</h2>`
          : `<h2 style="margin:0 0 10px 0;color:#ffffff">🔧 Aktualizacja statusu zgłoszenia</h2>`
      }

      <p style="color:#9ca3af;margin:0 0 6px 0;font-size:13px">
        Numer zgłoszenia
      </p>

      <div style="font-size:20px;font-weight:bold;margin-bottom:18px;color:#ffffff;letter-spacing:1px">
        ${ticketNumber}
      </div>

      ${
        device
          ? `
        <div style="background:#111827;border:1px solid #1f2937;padding:10px 14px;border-radius:10px;margin-bottom:14px;font-size:14px;color:#e5e7eb">
          <strong>Urządzenie:</strong> ${device}
        </div>
      `
          : ''
      }

      <div style="background:#1f2937;border:1px solid #374151;color:#ffffff;padding:12px 14px;border-radius:10px;margin-bottom:18px;font-size:14px">
        <strong>Status:</strong> ${statusLabels[status] ?? status}
      </div>

      ${
        status === 'DONE'
          ? `
        <div style="background:#0f172a;border-left:4px solid #00C2FF;padding:14px;border-radius:10px;margin-bottom:18px;border:1px solid #1f2937">
          <h3 style="margin:0 0 8px 0;font-size:15px;color:#ffffff">📍 Odbiór sprzętu</h3>
          <p style="margin:0;font-size:13px;line-height:1.6;color:#cbd5e1">
            Serwis IT<br/>
            ul. Przykładowa 12<br/>
            40-000 Katowice<br/>
            Tel: +48 111 222 333<br/><br/>
            ⏰ Pon–Pt 9:00 - 17:00
          </p>
        </div>
      `
          : ''
      }

      <p style="font-size:13px;color:#9ca3af;line-height:1.6;margin-top:20px">
        Dziękujemy za skorzystanie z naszego serwisu.<br/>
        W razie pytań skontaktuj się z nami.
      </p>

    </div>

    <!-- FOOTER -->
    <div style="background:#0f172a;padding:14px;text-align:center;font-size:12px;color:#9ca3af;border-top:1px solid #1f2937">
      © Serwis IT — system powiadomień
    </div>

  </div>

</div>
    `,
  });
}