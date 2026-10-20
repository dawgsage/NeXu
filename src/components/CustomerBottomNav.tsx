import { Home, Compass, ShoppingCart, Package, User } from 'lucide-react';

export type CustomerTab = 'home' | 'explore' | 'cart' | 'orders' | 'profile';

type Props = {
  active: CustomerTab;
  onChange: (tab: CustomerTab) => void;
  cartCount?: number;
};

const tabs: { id: CustomerTab; label: string; icon: React.ReactNode }[] = [
  { id: 'home', label: 'Home', icon: <Home size={20} /> },
  { id: 'explore', label: 'Explore', icon: <Compass size={20} /> },
  { id: 'cart', label: 'Cart', icon: <ShoppingCart size={20} /> },
  { id: 'orders', label: 'Orders', icon: <Package size={20} /> },
  { id: 'profile', label: 'Profile', icon: <User size={20} /> },
];

export default function CustomerBottomNav({ active, onChange, cartCount = 0 }: Props) {
  return (
    <div className="bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex items-center justify-around px-1 py-2 flex-shrink-0 safe-area-pb">
      {tabs.map(tab => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 transition-all duration-200"
          >
            <div className={`transition-transform duration-200 ${isActive ? 'text-[#10B981] scale-110' : 'text-[#94A3B8]'}`}>
              {tab.icon}
            </div>
            <span className={`text-[11px] font-medium ${isActive ? 'text-[#10B981]' : 'text-[#94A3B8]'}`}>
              {tab.label}
            </span>
            {tab.id === 'cart' && cartCount > 0 && (
              <span className="absolute top-0 right-2 bg-[#F59E0B] text-[#0F172A] text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
