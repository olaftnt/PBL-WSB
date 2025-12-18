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
  Bell
} from 'lucide-react';
import type { View } from '@/types/view';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  onNavigate: (view: View) => void;
}

const menuItems = [
  { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tickets' as View, label: 'Tickets', icon: Ticket },
  { id: 'customers' as View, label: 'Customers', icon: Users },
  { id: 'devices' as View, label: 'Devices', icon: Smartphone },
  { id: 'public-status' as View, label: 'Public Status', icon: Globe },
  { id: 'sla' as View, label: 'SLA & Tracking', icon: Clock },
  { id: 'inventory' as View, label: 'Inventory', icon: Package },
  { id: 'quotes' as View, label: 'Quotes', icon: FileText },
  { id: 'admin' as View, label: 'Admin Panel', icon: Settings },
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
              <p className="text-[#64748B] text-xs">Smart, Fast, Automated</p>
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#00FF88]/10 to-[#00CC6A]/5 text-[#00FF88] border-l-2 border-[#00FF88]'
                      : 'text-[#94A3B8] hover:bg-[#121B2D] hover:text-white'
                  }`}
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
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64">
        {/* Top Bar */}
        <header className="bg-[#0C1222]/50 backdrop-blur-sm border-b border-[#1A2642] sticky top-0 z-20">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-white">IT Service Management Platform</h2>
              <p className="text-[#64748B] text-sm">Smart, Fast, Automated.</p>
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
                  <p className="text-white text-sm">Admin User</p>
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
