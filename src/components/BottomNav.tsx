import { LayoutList, History, User } from 'lucide-react';

export type Tab = 'feed' | 'history' | 'profile';

type Props = {
  active: Tab;
  onChange: (tab: Tab) => void;
};

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'feed', label: 'Feed', icon: <LayoutList size={20} /> },
  { id: 'history', label: 'History', icon: <History size={20} /> },
  { id: 'profile', label: 'Profile', icon: <User size={20} /> },
];

export default function BottomNav({ active, onChange }: Props) {
  return (
    <div className="bg-white border-t border-gray-100 flex items-center justify-around px-2 py-2 flex-shrink-0 safe-area-pb">
      {tabs.map(tab => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="flex flex-col items-center gap-0.5 px-6 py-1.5 transition-colors"
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
