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
  BookOpen,
} from 'lucide-react';
import type { ComponentType } from 'react';
import type { View } from '@/types/view';
import { viewToPath } from '@/lib/viewRouter';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  onNavigate: (view: View) => void;
}

type LayoutMenuItem = {
  id: View;
  label: string;
  icon: ComponentType<{ className?: string }>;
  openInNewTab?: boolean;
};

const menuItems: LayoutMenuItem[] = [
  { id: 'dashboard', label: 'Panel główny', icon: LayoutDashboard },
  { id: 'tickets', label: 'Zgłoszenia', icon: Ticket },
  { id: 'customers', label: 'Klienci', icon: Users },
  { id: 'devices', label: 'Urządzenia', icon: Smartphone },
  { id: 'quotes', label: 'Kosztorysy', icon: FileText },
  { id: 'inventory', label: 'Magazyn', icon: Package },
  { id: 'sla', label: 'SLA i Śledzenie', icon: Clock },
  { id: 'public-status', label: 'Status publiczny', icon: Globe, openInNewTab: true },
  { id: 'knowledge-base', label: 'Baza wiedzy', icon: BookOpen },
  { id: 'admin', label: 'Panel admina', icon: Settings },
];

export function Layout({ children, currentView, onNavigate }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#0D1B35] to-[#0F1F42]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#0C1222] border-r border-[#1A2642] z-10">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00FF88] to-[#00CC6A] rounded-lg flex items-center justify-center">
              <Ticket className="w-6 h-6 text-[#0C1222]" />
            </div>
            <div>
              <h1 className="text-white">ITSM Pro</h1>
              <p className="text-[#64748B] text-xs">Szybki, Inteligentny, Zautomatyzowany</p>
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              const className = `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#00FF88]/10 to-[#00CC6A]/5 text-[#00FF88] border-l-2 border-[#00FF88]'
                  : 'text-[#94A3B8] hover:bg-[#121B2D] hover:text-white'
              }`;

              if (item.openInNewTab) {
                return (
                  <a
                    key={item.id}
                    href={viewToPath(item.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={className}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </a>
                );
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className={className}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-[#1A2642]">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#94A3B8] hover:bg-[#121B2D] hover:text-white transition-all">
            <LogOut className="w-5 h-5" />
            <span>Wyloguj</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64">
        {/* Top Bar */}
        <header className="bg-[#0C1222]/50 backdrop-blur-sm border-b border-[#1A2642] sticky top-0 z-20">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-white">System Zarządzania Serwisem</h2>
              <p className="text-[#64748B] text-sm">Inteligentny, Szybki, Zautomatyzowany.</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-[#94A3B8] hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF6B35] rounded-full"></span>
              </button>
              <div className="flex items-center gap-3 px-4 py-2 bg-[#121B2D] rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-[#00D9FF] to-[#0099CC] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">AD</span>
                </div>
                <div>
                  <p className="text-white text-sm">Użytkownik Admin</p>
                  <p className="text-[#64748B] text-xs">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
