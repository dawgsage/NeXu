import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  MapPin, Search, X, ChevronRight, Loader2, AlertCircle, Store,
  Utensils, ShoppingCart, ShoppingBag, Package, Pill, Coffee,
  Star, Clock, Bike, TrendingUp, Tag, Wrench, Home as HomeIcon,
} from 'lucide-react';
import { fetchMerchants, type Merchant } from '@/lib/merchants';

type Props = {
  onOpenMerchant: (m: Merchant) => void;
  onBrowseAll: () => void;
};

const REGIONS = ['All Regions', 'NCR', 'Bulacan', 'Calabarzon', 'Dagupan', 'Region 3'];

const SERVICE_ICONS = [
  { id: 'Food', label: 'Food', icon: <Utensils size={20} /> },
  { id: 'Grocery', label: 'Grocery', icon: <ShoppingCart size={20} /> },
  { id: 'Retail', label: 'Retail', icon: <ShoppingBag size={20} /> },
  { id: 'Parcel', label: 'Parcel', icon: <Package size={20} /> },
  { id: 'Pharmacy', label: 'Pharmacy', icon: <Pill size={20} /> },
];

const PROMO_BANNERS = [
  { id: 'b1', title: '20% OFF Your First Order', subtitle: 'Use code NEXU20 at checkout', bg: 'bg-gradient-to-r from-[#10B981] to-[#059669]' },
  { id: 'b2', title: 'Free Delivery Sundays', subtitle: 'On orders above ₱500', bg: 'bg-gradient-to-r from-[#0F172A] to-slate-700' },
  { id: 'b3', title: 'Earn While You Shop', subtitle: 'Become a NeXu Rider today', bg: 'bg-gradient-to-r from-amber-500 to-orange-500' },
];

function merchantDisplayCategory(m: Merchant): string {
  const retailNames = ['IKEA', 'Ace Hardware', 'Wilcon'];
  if (retailNames.some(n => m.name.includes(n))) return 'Retail';
  if (m.category === 'Restaurant') return 'Food';
  return m.category;
}

export default function CustomerHome({ onOpenMerchant, onBrowseAll }: Props) {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('All Regions');
  const [activeService, setActiveService] = useState<string | null>(null);
  const [regionOpen, setRegionOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      setMerchants(await fetchMerchants());
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    return merchants.filter(m => {
      if (!m.is_active) return false;
      if (region !== 'All Regions' && m.region !== region) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!m.name.toLowerCase().includes(q) && !(m.mall_name?.toLowerCase().includes(q) ?? false)) return false;
      }
      if (activeService) {
        const dispCat = merchantDisplayCategory(m);
        if (activeService === 'Food' && dispCat !== 'Food') return false;
        if (activeService === 'Grocery' && dispCat !== 'Grocery') return false;
        if (activeService === 'Retail' && dispCat !== 'Retail') return false;
        if (activeService === 'Pharmacy' && m.category !== 'Pharmacy') return false;
        if (activeService === 'Parcel') return false;
      }
      return true;
    });
  }, [merchants, region, search, activeService]);

  const featured = filtered.slice(0, 4);

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4 flex-shrink-0 border-b border-gray-100">
        {/* Deliver to */}
        <div className="flex items-center gap-1.5 mb-3">
          <MapPin size={14} className="text-[#10B981]" />
          <p className="text-gray-500 text-xs">Deliver to:</p>
          <p className="text-[#0F172A] text-sm font-bold">Current Location</p>
        </div>

        {/* Search bar */}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search stores, restaurants, pharmacies..."
            className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-9 pr-9 py-3 text-sm text-[#0F172A] placeholder-gray-400 focus:outline-none focus:border-[#10B981]"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 min-h-[44px] flex items-center">
              <X size={16} className="text-gray-500" />
            </button>
          )}
        </div>

        {/* Region filter */}
        <div className="relative mb-3">
          <button
            onClick={() => setRegionOpen(v => !v)}
            className="w-full min-h-[44px] flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-sm text-[#0F172A] font-medium"
          >
            <span>{region}</span>
            <ChevronRight size={14} className={`text-gray-500 transition-transform ${regionOpen ? 'rotate-90' : ''}`} />
          </button>
          {regionOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setRegionOpen(false)} />
              <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden">
                {REGIONS.map(r => (
                  <button key={r} onClick={() => { setRegion(r); setRegionOpen(false); }}
                    className={`w-full min-h-[44px] text-left px-4 py-3 text-sm font-medium hover:bg-gray-50 ${r === region ? 'text-[#10B981]' : 'text-gray-700'}`}>
                    {r}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Service category icons */}
        <div className="flex justify-between gap-2">
          {SERVICE_ICONS.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveService(prev => prev === s.id ? null : s.id)}
              className="flex flex-col items-center gap-1.5 flex-1 min-h-[44px] justify-center"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                activeService === s.id ? 'bg-[#10B981] text-white' : 'bg-gray-50 text-[#0F172A]'
              }`}>
                {s.icon}
              </div>
              <span className={`text-[10px] font-medium ${activeService === s.id ? 'text-[#10B981]' : 'text-gray-600'}`}>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Loading state */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 size={28} className="text-[#10B981] animate-spin" />
            <p className="text-gray-500 text-sm">Loading stores near you...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center">
              <AlertCircle size={26} className="text-red-400" />
            </div>
            <p className="text-red-500 font-medium text-sm">Couldn't load stores</p>
            <p className="text-gray-500 text-xs">{error}</p>
            <button onClick={load} className="text-[#10B981] text-sm font-medium min-h-[44px] px-4">Retry</button>
          </div>
        ) : (
          <>
            {/* Promo banners */}
            <div className="px-4 pt-4 pb-2">
              <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-1 px-1">
                {PROMO_BANNERS.map(b => (
                  <div key={b.id} className={`${b.bg} rounded-2xl px-5 py-4 flex-shrink-0 w-[280px] flex flex-col gap-1`}>
                    <p className="text-white font-bold text-sm">{b.title}</p>
                    <p className="text-white/80 text-xs">{b.subtitle}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured section */}
            {featured.length > 0 && (
              <div className="px-4 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-[#0F172A] text-sm font-bold">Featured Stores</h2>
                  <button onClick={onBrowseAll} className="text-[#10B981] text-xs font-bold flex items-center gap-0.5 min-h-[44px]">
                    See All <ChevronRight size={14} />
                  </button>
                </div>
                <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-1 px-1 pb-2">
                  {featured.map(m => {
                    const dispCat = merchantDisplayCategory(m);
                    const catIcon = dispCat === 'Food' ? <Utensils size={20} /> : dispCat === 'Retail' ? <Wrench size={20} /> : dispCat === 'Mall' ? <HomeIcon size={20} /> : <ShoppingCart size={20} />;
                    return (
                      <button
                        key={m.id}
                        onClick={() => onOpenMerchant(m)}
                        className="flex-shrink-0 w-[160px] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden active:scale-[0.98] transition-transform text-left"
                      >
                        <div className="relative h-20 w-full overflow-hidden">
                          <img src={m.banner_url ?? ''} alt={m.name} loading="lazy" className="w-full h-full object-cover" />
                          <span className="absolute top-2 right-2 bg-[#F59E0B] text-[#0F172A] text-[10px] font-bold px-2 py-0.5 rounded-full">20% OFF</span>
                        </div>
                        <div className="p-3">
                          <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-[#0F172A] -mt-7 mb-1.5 border-2 border-white shadow-sm relative z-10">
                            {catIcon}
                          </div>
                          <p className="text-[#0F172A] font-bold text-xs truncate">{m.name}</p>
                          <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500">
                            <Star size={10} className="fill-amber-500 text-amber-500" /> 4.8
                            <span className="text-gray-300">·</span>
                            <Clock size={10} /> 25m
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All stores */}
            <div className="px-4 pt-4 pb-4">
              <h2 className="text-[#0F172A] text-sm font-bold mb-3">All Stores</h2>
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Store size={28} className="text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">No stores available in this area</p>
                  <p className="text-gray-500 text-sm">Try a different region or search term</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map(m => {
                    const dispCat = merchantDisplayCategory(m);
                    const catIcon = dispCat === 'Food' ? <Utensils size={20} /> : dispCat === 'Retail' ? <Wrench size={20} /> : dispCat === 'Mall' ? <HomeIcon size={20} /> : <ShoppingCart size={20} />;
                    return (
                      <button
                        key={m.id}
                        onClick={() => onOpenMerchant(m)}
                        className="w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-[0.98] transition-transform overflow-hidden min-h-[44px]"
                      >
                        <div className="relative h-28 w-full overflow-hidden">
                          <img src={m.banner_url ?? ''} alt={m.name} loading="lazy" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                          <span className="absolute top-3 right-3 bg-[#F59E0B] text-[#0F172A] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
                            20% OFF
                          </span>
                        </div>
                        <div className="relative px-4">
                          <div className="w-11 h-11 rounded-xl bg-white border-2 border-white shadow-md flex items-center justify-center flex-shrink-0 text-[#0F172A] -mt-5 relative z-10">
                            {catIcon}
                          </div>
                          <div className="mt-2 pb-3">
                            <p className="text-[#0F172A] font-bold text-sm truncate">{m.name}</p>
                            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-gray-500">
                              <span className="flex items-center gap-0.5 font-semibold text-amber-500">
                                <Star size={12} className="fill-amber-500" /> 4.8
                              </span>
                              <span className="text-gray-300">·</span>
                              <span className="flex items-center gap-0.5">
                                <Clock size={12} /> 25 mins
                              </span>
                              <span className="text-gray-300">·</span>
                              <span className="flex items-center gap-0.5">
                                <Bike size={12} /> ₱49 Delivery
                              </span>
                            </div>
                            {m.is_mall_tenant && m.mall_name ? (
                              <span className="text-[10px] font-medium text-gray-500 flex items-center gap-0.5 mt-1.5">
                                <MapPin size={9} /> Inside {m.mall_name}
                              </span>
                            ) : m.region ? (
                              <span className="text-[10px] font-medium text-gray-500 flex items-center gap-0.5 mt-1.5">
                                <MapPin size={9} /> {m.region}{m.mall_name ? ` · ${m.mall_name}` : ''}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
