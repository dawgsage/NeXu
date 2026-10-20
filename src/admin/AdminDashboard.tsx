import { useEffect, useState, useCallback } from 'react';
import {
  Plus, RefreshCw, Users, Package, ChevronDown,
  AlertCircle, Check, X, Bike, Car, Truck, Navigation, Store, Map,
  ToggleLeft, ToggleRight,
} from 'lucide-react';
import {
  fetchAllOrders, updateOrderStatus, createOrder, fetchDrivers,
  ORDER_STATUSES, VEHICLE_TYPES, CATEGORIES, type DriverProfile,
} from '@/admin/api';
import { supabase, type Order, formatPeso } from '@/lib/supabase';
import { fetchMerchants, toggleMerchantActive, type Merchant } from '@/lib/merchants';
import SidebarLayout, { type NavItem } from '@/components/SidebarLayout';
import LiveMap from '@/screens/LiveMap';

type Props = {
  onLogout: () => void;
};

type Tab = 'orders' | 'create' | 'drivers' | 'merchants' | 'map';

const navItems: NavItem[] = [
  { id: 'orders', labelKey: 'liveOrders', icon: <Package size={17} /> },
  { id: 'create', labelKey: 'createOrder', icon: <Plus size={17} /> },
  { id: 'drivers', labelKey: 'drivers', icon: <Users size={17} /> },
  { id: 'merchants', labelKey: 'merchants', icon: <Store size={17} /> },
  { id: 'map', labelKey: 'liveMap', icon: <Map size={17} /> },
];

const statusColor = (s: string) => {
  const map: Record<string, string> = {
    Available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Accepted: 'bg-blue-50 text-blue-700 border-blue-200',
    Delivered: 'bg-slate-100 text-slate-600 border-slate-200',
    Cancelled: 'bg-red-50 text-red-700 border-red-200',
  };
  return map[s] ?? 'bg-gray-50 text-gray-600 border-gray-200';
};

const vehicleIcon = (v: string) => {
  if (v === 'Motorcycle') return <Bike size={14} />;
  if (v === 'Car') return <Car size={14} />;
  if (v === 'Van') return <Truck size={14} />;
  return <Navigation size={14} />;
};

export default function AdminDashboard({ onLogout }: Props) {
  const [tab, setTab] = useState<Tab>('orders');

  return (
    <SidebarLayout
      role="admin"
      navItems={navItems}
      activeId={tab}
      onNavigate={(id) => setTab(id as Tab)}
      onLogout={onLogout}
    >
      {tab === 'orders' && <OrdersTab />}
      {tab === 'create' && <CreateOrderTab onCreated={() => setTab('orders')} />}
      {tab === 'drivers' && <DriversTab />}
      {tab === 'merchants' && <MerchantsTab />}
      {tab === 'map' && <LiveMap />}
    </SidebarLayout>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setOrders(await fetchAllOrders());
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const channel = supabase.channel('admin-orders').on(
      'postgres_changes', { event: '*', schema: 'public', table: 'orders' }, load
    ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const handleStatusChange = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await updateOrderStatus(id, status);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    } catch (e) {
      setError((e as Error).message);
    }
    setUpdatingId(null);
  };

  if (loading) return <LoadingState />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[#0F172A] text-2xl font-bold">Live Orders</h1>
          <p className="text-gray-400 text-sm mt-0.5">{orders.length} total orders · real-time synced</p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 text-[#0F172A] text-sm font-medium bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 font-semibold">Route</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Vehicle</th>
                <th className="px-4 py-3 font-semibold text-right">Fare</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <p className="text-[#0F172A] font-medium truncate max-w-[200px]">{order.pickup}</p>
                    <p className="text-gray-400 text-xs truncate max-w-[200px]">→ {order.dropoff}</p>
                  </td>
                  <td className="px-4 py-3"><span className="text-xs font-medium text-gray-600">{order.category}</span></td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-xs text-gray-600">{vehicleIcon(order.vehicle_type)} {order.vehicle_type}</span>
                  </td>
                  <td className="px-4 py-3 text-right"><span className="text-[#10B981] font-bold">{formatPeso(order.fare)}</span></td>
                  <td className="px-4 py-3">
                    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColor(order.status)}`}>{order.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusDropdown current={order.status} updating={updatingId === order.id} onChange={s => handleStatusChange(order.id, s)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusDropdown({ current, updating, onChange }: { current: string; updating: boolean; onChange: (s: string) => void }) {
  const [open, setOpen] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const handleSelect = (s: string) => {
    if (s === 'Cancelled') {
      setConfirmCancel(true);
      return;
    }
    onChange(s);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)} disabled={updating}
        className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50 min-h-[36px]">
        {updating ? 'Updating...' : 'Change'}
        {!updating && <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden min-w-[140px]">
            {ORDER_STATUSES.map(s => (
              <button key={s} onClick={() => handleSelect(s)}
                className={`w-full text-left px-3 py-2.5 text-xs font-medium flex items-center justify-between hover:bg-gray-50 ${s === current ? 'text-[#10B981]' : 'text-gray-700'}`}>
                {s}{s === current && <Check size={12} />}
              </button>
            ))}
          </div>
        </>
      )}
      {confirmCancel && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center px-6">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={24} className="text-red-500" />
            </div>
            <h3 className="text-[#0F172A] font-bold text-lg text-center mb-2">Cancel this order?</h3>
            <p className="text-gray-500 text-sm text-center mb-5">
              This action cannot be undone. The driver will be notified that the order is cancelled.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmCancel(false)}
                className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl text-sm active:bg-gray-200 min-h-[44px]"
              >
                Keep Order
              </button>
              <button
                onClick={() => { onChange('Cancelled'); setConfirmCancel(false); setOpen(false); }}
                className="flex-1 bg-red-500 active:bg-red-600 text-white font-bold py-3 rounded-xl text-sm min-h-[44px]"
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CreateOrderTab({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({ pickup: '', dropoff: '', fare: '', distance: '', vehicle_type: 'Motorcycle', category: 'Parcel', note: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      await createOrder({ pickup: form.pickup, dropoff: form.dropoff, fare: parseFloat(form.fare) || 0, distance: parseFloat(form.distance) || 0, vehicle_type: form.vehicle_type, category: form.category, note: form.note });
      setSuccess(true); setTimeout(onCreated, 1200);
    } catch (err) { setError((err as Error).message); }
    setSaving(false);
  };

  const field = "w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:border-[#10B981]";

  return (
    <div className="max-w-2xl">
      <h1 className="text-[#0F172A] text-2xl font-bold mb-1">Create Order</h1>
      <p className="text-gray-400 text-sm mb-6">Manually add a new delivery order to the database</p>
      {success && <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-2 text-emerald-700 text-sm font-medium"><Check size={16} /> Order created successfully! Redirecting...</div>}
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="block text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1.5">Pickup</label><input value={form.pickup} onChange={e => setForm(f => ({ ...f, pickup: e.target.value }))} required className={field} placeholder="e.g. BGC, Taguig" /></div>
          <div><label className="block text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1.5">Dropoff</label><input value={form.dropoff} onChange={e => setForm(f => ({ ...f, dropoff: e.target.value }))} required className={field} placeholder="e.g. Makati CBD" /></div>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div><label className="block text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1.5">Fare (₱)</label><input type="number" value={form.fare} onChange={e => setForm(f => ({ ...f, fare: e.target.value }))} required min="0" className={field} placeholder="150" /></div>
          <div><label className="block text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1.5">Distance (km)</label><input type="number" value={form.distance} onChange={e => setForm(f => ({ ...f, distance: e.target.value }))} required min="0" className={field} placeholder="5" /></div>
          <div><label className="block text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1.5">Vehicle Type</label><select value={form.vehicle_type} onChange={e => setForm(f => ({ ...f, vehicle_type: e.target.value }))} className={field}>{VEHICLE_TYPES.filter(v => v !== 'All').map(v => <option key={v} value={v}>{v}</option>)}</select></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="block text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1.5">Category</label><select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={field}>{CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div><label className="block text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1.5">Note (optional)</label><input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} className={field} placeholder="Special instructions" /></div>
        </div>
        <button type="submit" disabled={saving} className="w-full sm:w-auto bg-[#10B981] active:bg-emerald-600 disabled:opacity-60 text-white font-bold px-8 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
          {saving ? 'Saving...' : <><Plus size={18} /> Create Order</>}
        </button>
      </form>
    </div>
  );
}

function DriversTab() {
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDrivers().then(d => { setDrivers(d); setError(null); }).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div>
      <h1 className="text-[#0F172A] text-2xl font-bold mb-1">Registered Drivers</h1>
      <p className="text-gray-400 text-sm mb-6">{drivers.length} driver{drivers.length !== 1 ? 's' : ''} on the platform</p>
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
      {drivers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3"><Users size={26} className="text-gray-300" /></div>
          <p className="text-gray-500 font-medium">No registered drivers yet</p>
          <p className="text-gray-400 text-sm mt-1">Driver profiles will appear here when created</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase tracking-wide"><th className="px-4 py-3 font-semibold">Driver ID</th><th className="px-4 py-3 font-semibold">Vehicle</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Joined</th></tr></thead>
            <tbody className="divide-y divide-gray-50">
              {drivers.map(d => (
                <tr key={d.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3"><span className="text-[#0F172A] font-mono text-xs">{d.id.slice(0, 8)}...</span></td>
                  <td className="px-4 py-3"><span className="inline-flex items-center gap-1 text-gray-600 text-xs">{vehicleIcon(d.vehicle)} {d.vehicle}</span></td>
                  <td className="px-4 py-3"><span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${d.status === 'Active' || d.status === 'Online' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{d.status || 'Unknown'}</span></td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(d.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function MerchantsTab() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setMerchants(await fetchMerchants());
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const channel = supabase.channel('admin-merchants').on(
      'postgres_changes', { event: '*', schema: 'public', table: 'merchants' }, load
    ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const handleToggle = async (id: string, current: boolean) => {
    setTogglingId(id);
    try {
      await toggleMerchantActive(id, !current);
      setMerchants(prev => prev.map(m => m.id === id ? { ...m, is_active: !current } : m));
    } catch (e) {
      setError((e as Error).message);
    }
    setTogglingId(null);
  };

  if (loading) return <LoadingState />;

  const categoryColor = (c: string) => {
    if (c === 'Restaurant') return 'bg-rose-50 text-rose-600 border-rose-200';
    if (c === 'Mall') return 'bg-blue-50 text-blue-600 border-blue-200';
    return 'bg-teal-50 text-teal-600 border-teal-200';
  };

  return (
    <div>
      <h1 className="text-[#0F172A] text-2xl font-bold mb-1">Merchants</h1>
      <p className="text-gray-400 text-sm mb-6">{merchants.filter(m => m.is_active).length} active · {merchants.length} total · real-time</p>
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
      {merchants.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3"><Store size={26} className="text-gray-300" /></div>
          <p className="text-gray-500 font-medium">No merchants yet</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {merchants.map(m => (
            <div key={m.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${m.is_active ? 'border-emerald-200' : 'border-gray-100 opacity-70'}`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${m.is_active ? 'bg-emerald-50' : 'bg-gray-100'}`}>
                    <Store size={20} className={m.is_active ? 'text-[#10B981]' : 'text-gray-400'} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[#0F172A] font-bold text-sm truncate">{m.name}</p>
                    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-1 ${categoryColor(m.category)}`}>{m.category}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                <div>
                  <p className="text-gray-400 text-xs">{m.lat}, {m.lng}</p>
                  <p className={`text-xs font-bold mt-0.5 ${m.is_active ? 'text-[#10B981]' : 'text-gray-400'}`}>
                    {m.is_active ? 'Available' : 'Paused'}
                  </p>
                </div>
                <button onClick={() => handleToggle(m.id, m.is_active)} disabled={togglingId === m.id}
                  className="flex items-center gap-1.5 active:opacity-70">
                  {m.is_active ? <ToggleRight size={36} className="text-[#10B981]" /> : <ToggleLeft size={36} className="text-gray-300" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center h-48 gap-3">
      <RefreshCw size={26} className="text-[#10B981] animate-spin" />
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  );
}

function ErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
      <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
      <p className="text-red-600 text-sm flex-1">{message}</p>
      <button onClick={onDismiss}><X size={15} className="text-red-400" /></button>
    </div>
  );
}
