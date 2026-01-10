'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Ticket,
  Users,
  Smartphone,
  Globe,
  Clock,
  Package,
  FileText,
  Settings,
  LogOut,
  Bell,
  Search,
} from 'lucide-react';
import { clearAuthedCookie } from '@/lib/auth';

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Panel', icon: LayoutDashboard },
  { href: '/tickets', label: 'Zlecenia', icon: Ticket },
  { href: '/customers', label: 'Klienci', icon: Users },
  { href: '/devices', label: 'Urządzenia', icon: Smartphone },
  { href: '/public-status', label: 'Status Publiczny', icon: Globe },
  { href: '/sla', label: 'SLA & Tracking', icon: Clock },
  { href: '/inventory', label: 'Magazyn', icon: Package },
  { href: '/quotes', label: 'Kosztorysy', icon: FileText },
  { href: '/admin', label: 'Admin', icon: Settings },
];

function getTitleFromPath(pathname: string | null) {
  if (!pathname) return 'SERWIS IT';
  if (pathname.startsWith('/dashboard')) return 'Panel';
  if (pathname.startsWith('/tickets')) return 'Zlecenia';
  if (pathname.startsWith('/customers')) return 'Klienci';
  if (pathname.startsWith('/devices')) return 'Urządzenia';
  if (pathname.startsWith('/public-status')) return 'Status Publiczny';
  if (pathname.startsWith('/sla')) return 'SLA & Tracking';
  if (pathname.startsWith('/inventory')) return 'Magazyn';
  if (pathname.startsWith('/quotes')) return 'Kosztorysy';
  if (pathname.startsWith('/admin')) return 'Admin';
  return 'SERWIS IT';
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const title = getTitleFromPath(pathname);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <aside className="w-72 border-r border-white/10 bg-[#0a0a0f] flex flex-col">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold tracking-tight">SERWIS IT</div>
                <div className="text-xs text-white/60">IT Service Management</div>
              </div>

              <button
                className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 transition"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
              </button>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href ||
                (item.href !== '/' && pathname?.startsWith(item.href + '/')) ||
                (item.href === '/tickets' && pathname?.startsWith('/tickets')) ||
                (item.href === '/customers' && pathname?.startsWith('/customers')) ||
                (item.href === '/devices' && pathname?.startsWith('/devices')) ||
                (item.href === '/quotes' && pathname?.startsWith('/quotes'));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    'flex items-center gap-3 px-4 py-3 rounded-2xl transition',
                    active ? 'bg-[#0b5cff]/20 text-white' : 'text-white/70 hover:text-white hover:bg-white/5',
                  ].join(' ')}
                >
                  <Icon className={['w-5 h-5', active ? 'text-[#0b5cff]' : 'text-white/60'].join(' ')} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="hidden p-4 mt-auto border-t border-white/10">
            <button
              onClick={() => {
                clearAuthedCookie();
                router.replace('/login');
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-white/70 hover:text-white hover:bg-white/5 transition"
            >
              <LogOut className="w-5 h-5 text-white/60" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </aside>

        {/* RIGHT SIDE: TOPBAR + CONTENT */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* TOPBAR */}
          <header className="h-16 border-b border-white/10 bg-[#0a0a0f]/60 backdrop-blur supports-[backdrop-filter]:bg-[#0a0a0f]/40">
            <div className="h-full px-6 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-xs text-white/50">SERWIS IT</div>
                <div className="text-lg font-semibold truncate">{title}</div>
              </div>

              <div className="hidden flex items-center gap-3">
                {/* SEARCH (opcjonalnie) */}
                <div className="hidden md:flex items-center gap-2 px-3 h-10 rounded-2xl bg-white/5 border border-white/10">
                  <Search className="w-4 h-4 text-white/60" />
                  <input
                    className="hidden bg-transparent outline-none text-sm placeholder:text-white/40 w-56"
                    placeholder="Szukaj..."
                  />
                </div>

                {/* NOTIFICATIONS */}
                <button
                  className="hidden inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition"
                  title="Powiadomienia"
                >
                  <Bell className="w-5 h-5 text-white/80" />
                </button>
              </div>
            </div>
          </header>

          {/* CONTENT */}
          <main className="flex-1 p-6 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
