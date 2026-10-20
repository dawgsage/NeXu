import { useEffect, useState, useCallback } from 'react';
import {
  MapPin, Bike, Car, Truck, Navigation, ChevronDown, Wallet, RefreshCw,
  Clock, Store, Package, Utensils, ShoppingCart, ShoppingBag, AlertCircle,
} from 'lucide-react';
import { supabase, type Order, type Category, VEHICLE_TYPES, CATEGORIES, formatPeso } from '@/lib/supabase';
import { useLang, type Lang } from '@/lib/i18n';
import NexuLogo from '@/components/NexuLogo';

const vehicleIcon = (type: string) => {
  if (type === 'Motorcycle') return <Bike size={13} />;
  if (type === 'Car') return <Car size={13} />;
  if (type === 'Van') return <Truck size={13} />;
  return <Navigation size={13} />;
};

const vehicleColor = (type: string) => {
  const map: Record<string, string> = {
    Motorcycle: 'bg-amber-50 text-amber-700 border-amber-200',
    Car: 'bg-sky-50 text-sky-700 border-sky-200',
    Van: 'bg-violet-50 text-violet-700 border-violet-200',
    Tricycle: 'bg-orange-50 text-orange-700 border-orange-200',
  };
  return map[type] ?? 'bg-gray-50 text-gray-700 border-gray-200';
};

const categoryStyle = (cat: string) => {
  const map: Record<string, { icon: React.ReactNode; cls: string }> = {
    Food: { icon: <Utensils size={11} />, cls: 'bg-rose-50 text-rose-600 border-rose-200' },
    Grocery: { icon: <ShoppingCart size={11} />, cls: 'bg-teal-50 text-teal-600 border-teal-200' },
    Pabili: { icon: <ShoppingBag size={11} />, cls: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
    Parcel: { icon: <Package size={11} />, cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  };
  return map[cat] ?? map.Parcel;
};

type Props = {
  onSelectOrder: (order: Order) => void;
  onOpenMerchants: () => void;
};

export default function OfferFeed({ onSelectOrder, onOpenMerchants }: Props) {
  const { t, lang, setLang } = useLang();
  const [orders, setOrders] = useState<Order[]>([]);
  const [vehicleFilter, setVehicleFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<Category>('All');
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);

  const fetchOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'Available')
      .order('created_at', { ascending: false });
    if (error) {
      setError(error.message);
    } else {
      setOrders((data as Order[]) ?? []);
      setError(null);
    }
    setLoading(false);
  }, []);

  const fetchEarnings = useCallback(async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('fare')
      .eq('status', 'Delivered');
    if (!error && data) {
      setEarnings(data.reduce((sum, o) => sum + (o.fare ?? 0), 0));
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchEarnings();

    const channel = supabase
      .channel('orders-feed-v2')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
        fetchEarnings();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchOrders, fetchEarnings]);

  const filtered = orders.filter(o =>
    (vehicleFilter === 'All' || o.vehicle_type === vehicleFilter) &&
    (categoryFilter === 'All' || o.category === categoryFilter)
  );

  return (
    <div className="flex flex-col h-full bg-[#F8F9FA]">
      <div className="bg-white px-5 pt-12 pb-5 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <NexuLogo size={32} />
            <div>
              <p className="text-gray-400 text-[10px] font-medium tracking-widest uppercase">{t('welcome')}</p>
              <h1 className="text-[#2C3E50] text-xl font-bold tracking-tight">NeXu Driver</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5 bg-gray-100 rounded-lg p-0.5">
              {(['en', 'tl'] as Lang[]).map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`text-[10px] font-bold px-2 py-1 rounded ${lang === l ? 'bg-[#2ECC71] text-white' : 'text-gray-400'}`}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <button onClick={onOpenMerchants} className="bg-gray-50 border border-gray-200 rounded-xl p-2 active:opacity-70">
              <Store size={16} className="text-[#2ECC71]" />
            </button>
            <div className="bg-gray-50 rounded-2xl px-4 py-2 text-right">
              <div className="flex items-center gap-1.5 text-gray-400 text-[10px] mb-0.5">
                <Wallet size={11} />
                <span>{t('todayEarnings')}</span>
              </div>
              <p className="text-[#2ECC71] text-xl font-bold">{formatPeso(earnings)}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {/* Vehicle filter */}
          <div className="relative flex-1">
            <button
              onClick={() => { setVehicleOpen(v => !v); setCatOpen(false); }}
              className="w-full flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-[#2C3E50] text-xs font-medium"
            >
              <span className="truncate">{vehicleFilter === 'All' ? 'All Vehicles' : vehicleFilter}</span>
              <ChevronDown size={14} className={`text-gray-400 transition-transform flex-shrink-0 ${vehicleOpen ? 'rotate-180' : ''}`} />
            </button>
            {vehicleOpen && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-xl overflow-hidden z-20 border border-gray-100">
                {VEHICLE_TYPES.map(v => (
                  <button
                    key={v}
                    onClick={() => { setVehicleFilter(v); setVehicleOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${vehicleFilter === v ? 'bg-[#2ECC71] text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    {v === 'All' ? 'All Vehicles' : v}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category filter */}
          <div className="relative flex-1">
            <button
              onClick={() => { setCatOpen(v => !v); setVehicleOpen(false); }}
              className="w-full flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-[#2C3E50] text-xs font-medium"
            >
              <span className="truncate">{categoryFilter === 'All' ? 'All Categories' : categoryFilter}</span>
              <ChevronDown size={14} className={`text-gray-400 transition-transform flex-shrink-0 ${catOpen ? 'rotate-180' : ''}`} />
            </button>
            {catOpen && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-xl overflow-hidden z-20 border border-gray-100">
                {CATEGORIES.map(c => (
                  <button
                    key={c}
                    onClick={() => { setCategoryFilter(c); setCatOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${categoryFilter === c ? 'bg-[#2ECC71] text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    {c === 'All' ? 'All Categories' : c}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <RefreshCw size={26} className="text-[#2ECC71] animate-spin" />
            <p className="text-gray-400 text-sm">Loading offers...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-center px-6">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center">
              <AlertCircle size={26} className="text-red-400" />
            </div>
            <p className="text-red-500 font-medium text-sm">Couldn't load offers</p>
            <p className="text-gray-400 text-xs">{error}</p>
            <button onClick={fetchOrders} className="mt-1 text-[#2ECC71] text-sm font-medium">Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Navigation size={26} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No offers match your filters</p>
            <p className="text-gray-400 text-sm">Try a different vehicle or category</p>
          </div>
        ) : (
          filtered.map(order => {
            const cat = categoryStyle(order.category);
            const total = order.fare + order.toll_fee;
            return (
              <button
                key={order.id}
                onClick={() => onSelectOrder(order)}
                className="w-full text-left bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden active:scale-[0.98] transition-transform hover:shadow-md"
              >
                <div className="flex items-stretch">
                  <div className="w-1 bg-[#2ECC71] flex-shrink-0 rounded-l-2xl" />
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cat.cls}`}>
                            {cat.icon}{order.category}
                          </span>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${vehicleColor(order.vehicle_type)}`}>
                            {vehicleIcon(order.vehicle_type)}{order.vehicle_type}
                          </span>
                          {order.multi_store && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200">
                              <Store size={10} />Multi
                            </span>
                          )}
                          {order.scheduled_time && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-blue-50 text-blue-600 border-blue-200">
                              <Clock size={10} />Scheduled
                            </span>
                          )}
                        </div>
                        <div className="flex items-start gap-2 mb-1.5">
                          <div className="flex flex-col items-center gap-1 pt-0.5 flex-shrink-0">
                            <div className="w-2 h-2 rounded-full bg-[#2ECC71] border border-white shadow" />
                            <div className="w-px h-4 bg-gray-200" />
                            <div className="w-2 h-2 rounded-full bg-[#2C3E50] border border-white shadow" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-700 text-sm font-semibold truncate">{order.pickup}</p>
                            <p className="text-gray-500 text-sm truncate mt-0.5">{order.dropoff}</p>
                          </div>
                        </div>
                        <p className="text-gray-400 text-xs">{order.distance} km{order.toll_fee > 0 && ` · +${formatPeso(order.toll_fee)} toll`}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[#2C3E50] text-[10px] font-medium mb-0.5">Total Pay</p>
                        <p className="text-[#2ECC71] text-2xl font-black leading-none">{formatPeso(total)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      <div className="bg-white border-t border-gray-100 px-5 py-2.5 flex items-center justify-between flex-shrink-0">
        <p className="text-gray-400 text-xs">{filtered.length} offer{filtered.length !== 1 ? 's' : ''}</p>
        <div className="flex items-center gap-1 text-[#2ECC71] text-xs font-medium">
          <div className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] animate-pulse" />
          Live
        </div>
      </div>
    </div>
  );
}
