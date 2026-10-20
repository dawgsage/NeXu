import { Shield, Code2, ShoppingBag, Bike, ChevronRight } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import NexuLogo from '@/components/NexuLogo';

export type Role = 'admin' | 'developer' | 'customer' | 'rider';

type Props = {
  onSelectRole: (role: Role) => void;
};

const roles: { id: Role; icon: React.ReactNode; desc: string; color: string }[] = [
  { id: 'admin', icon: <Shield size={28} />, desc: 'Manage orders, drivers & merchants', color: 'bg-[#2C3E50]' },
  { id: 'developer', icon: <Code2 size={28} />, desc: 'Debug & inspect system data', color: 'bg-slate-600' },
  { id: 'customer', icon: <ShoppingBag size={28} />, desc: 'Test customer experience', color: 'bg-teal-600' },
  { id: 'rider', icon: <Bike size={28} />, desc: 'Accept offers & deliver', color: 'bg-[#2ECC71]' },
];

export default function Landing({ onSelectRole }: Props) {
  const { t } = useLang();

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      {/* Hero */}
      <div className="bg-white px-6 pt-16 pb-12 text-center border-b border-gray-100">
        <div className="flex justify-center mb-4">
          <NexuLogo size={64} showWordmark />
        </div>
        <p className="text-gray-500 text-sm mt-2">Delivery platform for Filipino riders</p>
        <p className="text-gray-400 text-xs mt-1">Motorcycle · Car · Tricycle · Van</p>
      </div>

      {/* Role cards */}
      <div className="flex-1 px-6 py-8 max-w-md mx-auto w-full">
        <h2 className="text-[#2C3E50] text-lg font-bold mb-1">{t('selectRole')}</h2>
        <p className="text-gray-400 text-sm mb-5">Choose how you want to use the app</p>

        <div className="grid grid-cols-2 gap-3">
          {roles.map(role => (
            <button
              key={role.id}
              onClick={() => onSelectRole(role.id)}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-start gap-3 active:scale-95 transition-transform hover:shadow-md"
            >
              <div className={`w-12 h-12 rounded-xl ${role.color} text-white flex items-center justify-center`}>
                {role.icon}
              </div>
              <div className="text-left">
                <p className="text-[#2C3E50] font-bold text-sm">{t(role.id === 'admin' ? 'admin' : role.id === 'developer' ? 'developer' : role.id === 'customer' ? 'customer' : 'rider')}</p>
                <p className="text-gray-400 text-xs mt-0.5 leading-snug">{role.desc}</p>
              </div>
              <ChevronRight size={16} className="text-gray-300 group-hover:text-[#2ECC71] transition-colors" />
            </button>
          ))}
        </div>
      </div>

      <div className="text-center pb-6 space-y-1">
        <p className="text-gray-400 text-xs">NeXu Driver v2.0 · Supabase Realtime</p>
        <p className="text-gray-400 text-[11px] font-medium">Designed & Developed by Angel Kim x Spudsage</p>
      </div>
    </div>
  );
}
