import { useState, type ReactNode } from 'react';
import {
  LayoutDashboard, LogOut, Menu, X, Shield, Code2, ShoppingBag, Bike,
} from 'lucide-react';
import { useLang, type Lang } from '@/lib/i18n';
import { type Role } from '@/screens/Landing';
import NexuLogo from '@/components/NexuLogo';

export type NavItem = {
  id: string;
  labelKey: 'liveOrders' | 'createOrder' | 'drivers' | 'merchants' | 'liveMap';
  icon: ReactNode;
};

type Props = {
  role: Role;
  navItems: NavItem[];
  activeId: string;
  onNavigate: (id: string) => void;
  onLogout: () => void;
  children: ReactNode;
};

const roleIcon: Record<Role, ReactNode> = {
  admin: <Shield size={16} className="text-[#2ECC71]" />,
  developer: <Code2 size={16} className="text-[#2ECC71]" />,
  customer: <ShoppingBag size={16} className="text-[#2ECC71]" />,
  rider: <Bike size={16} className="text-[#2ECC71]" />,
};

const roleLabel: Record<Role, string> = {
  admin: 'Admin',
  developer: 'Developer',
  customer: 'Customer',
  rider: 'Rider',
};

export default function SidebarLayout({ role, navItems, activeId, onNavigate, onLogout, children }: Props) {
  const { lang, setLang, t } = useLang();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <>
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-200">
        <NexuLogo size={36} />
        <div className="flex-1 min-w-0">
          <p className="text-[#2C3E50] font-bold text-sm">NeXu Dashboard</p>
          <div className="flex items-center gap-1.5">
            {roleIcon[role]}
            <span className="text-gray-500 text-xs">{roleLabel[role]}</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => { onNavigate(item.id); setMobileOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeId === item.id ? 'bg-[#2ECC71] text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {item.icon}
            <span>{t(item.labelKey)}</span>
          </button>
        ))}
      </nav>

      <div className="px-3 pb-3">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-2">
          {(['en', 'tl'] as Lang[]).map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`flex-1 text-xs font-medium py-1.5 rounded-lg transition-colors ${
                lang === l ? 'bg-[#2ECC71] text-white' : 'text-gray-500'
              }`}
            >
              {l === 'en' ? 'English' : 'Tagalog'}
            </button>
          ))}
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-100 text-sm font-medium transition-colors"
        >
          <LogOut size={17} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col fixed inset-y-0 left-0 z-30">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-3 text-gray-400">
              <X size={20} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 md:ml-64 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden bg-white border-b border-gray-200 flex items-center justify-between px-4 py-3 sticky top-0 z-20">
          <button onClick={() => setMobileOpen(true)} className="text-[#2C3E50]">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <NexuLogo size={24} />
            <span className="text-[#2C3E50] font-bold text-sm">{roleLabel[role]}</span>
          </div>
          <div className="w-6" />
        </div>

        <main className="flex-1 p-4 md:p-8 overflow-x-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export { LayoutDashboard };
