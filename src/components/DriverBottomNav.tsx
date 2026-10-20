import { LayoutDashboard, Briefcase, Wallet, User } from 'lucide-react';

export type DriverTab = 'dashboard' | 'jobs' | 'earnings' | 'profile';

type Props = {
  active: DriverTab;
  onChange: (tab: DriverTab) => void;
};

const tabs: { id: DriverTab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'jobs', label: 'Jobs', icon: <Briefcase size={20} /> },
  { id: 'earnings', label: 'Earnings', icon: <Wallet size={20} /> },
  { id: 'profile', label: 'Profile', icon: <User size={20} /> },
];

export default function DriverBottomNav({ active, onChange }: Props) {
  return (
    <div className="bg-white border-t border-gray-100 flex items-center justify-around px-2 py-2 flex-shrink-0 safe-area-pb">
      {tabs.map(tab => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="flex flex-col items-center gap-0.5 px-4 py-1.5 transition-colors"
          >
            <div className={isActive ? 'text-[#2ECC71]' : 'text-gray-400'}>
              {tab.icon}
            </div>
            <span className={`text-[11px] font-medium ${isActive ? 'text-[#2ECC71]' : 'text-gray-400'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
