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
    <div className="bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex items-center justify-around px-2 py-2 flex-shrink-0 safe-area-pb">
      {tabs.map(tab => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="flex flex-col items-center gap-0.5 px-6 py-1.5 transition-all duration-200"
          >
            <div className={`transition-transform duration-200 ${isActive ? 'text-[#10B981] scale-110' : 'text-[#94A3B8]'}`}>
              {tab.icon}
            </div>
            <span className={`text-[11px] font-medium ${isActive ? 'text-[#10B981]' : 'text-[#94A3B8]'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
