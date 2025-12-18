import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SERWIS IT',
  description: 'IT Service Management Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
