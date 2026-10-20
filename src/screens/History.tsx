import { useEffect, useState, useCallback } from 'react';
import { History, CheckCircle2, MapPin, Navigation, AlertTriangle, X, RefreshCw, Wallet } from 'lucide-react';
import { supabase, type Order, formatPeso, totalPayable } from '@/lib/supabase';

export default function HistoryScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportOrder, setReportOrder] = useState<Order | null>(null);
  const [earnings, setEarnings] = useState(0);

  const fetchHistory = useCallback(async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'Delivered')
      .order('created_at', { ascending: false });
    if (error) {
      setError(error.message);
    } else {
      const rows = (data as Order[]) ?? [];
      setOrders(rows);
      setEarnings(rows.reduce((s, o) => s + totalPayable(o), 0));
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchHistory();
    const channel = supabase
      .channel('orders-history')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchHistory)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchHistory]);

  return (
    <div className="flex flex-col h-full bg-[#F8F9FA]">
      <div className="bg-white px-5 pt-12 pb-5 flex-shrink-0 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <History size={20} className="text-[#2ECC71]" />
          <h1 className="text-[#2C3E50] text-2xl font-bold">Delivery History</h1>
        </div>
        <div className="bg-gray-50 rounded-2xl px-4 py-3 flex items-center justify-between border border-gray-100">
          <div className="flex items-center gap-2">
            <Wallet size={16} className="text-[#2ECC71]" />
            <span className="text-gray-500 text-sm">Total Earnings</span>
          </div>
          <span className="text-[#2ECC71] text-xl font-bold">{formatPeso(earnings)}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <RefreshCw size={24} className="text-[#2ECC71] animate-spin" />
            <p className="text-gray-400 text-sm">Loading history...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-center">
            <p className="text-red-500 font-medium text-sm">Couldn't load history</p>
            <p className="text-gray-400 text-xs">{error}</p>
            <button onClick={fetchHistory} className="text-[#2ECC71] text-sm font-medium">Retry</button>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <History size={26} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No completed deliveries yet</p>
            <p className="text-gray-400 text-sm">Your delivered trips will appear here</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <CheckCircle2 size={14} className="text-[#2ECC71]" />
                    <span className="text-[#2ECC71] text-xs font-bold uppercase tracking-wide">Delivered</span>
                    <span className="text-gray-300 text-xs">·</span>
                    <span className="text-gray-400 text-xs">{order.category}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <MapPin size={11} className="text-[#2ECC71] flex-shrink-0" />
                    <p className="text-gray-700 text-sm font-semibold truncate">{order.pickup}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Navigation size={11} className="text-[#2C3E50] flex-shrink-0" />
                    <p className="text-gray-500 text-sm truncate">{order.dropoff}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[#2ECC71] text-xl font-black">{formatPeso(totalPayable(order))}</p>
                  <p className="text-gray-400 text-xs">{order.distance} km</p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-2.5 mt-2">
                <p className="text-gray-400 text-xs">
                  {new Date(order.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                <button
                  onClick={() => setReportOrder(order)}
                  className="flex items-center gap-1 text-amber-600 text-xs font-medium active:opacity-70"
                >
                  <AlertTriangle size={12} />
                  Report Issue
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {reportOrder && <HistoryReportSheet order={reportOrder} onClose={() => setReportOrder(null)} />}
    </div>
  );
}

function HistoryReportSheet({ order, onClose }: { order: Order; onClose: () => void }) {
  const [sent, setSent] = useState(false);
  const [reason, setReason] = useState('');
  const reasons = ['Payment not received', 'Customer complaint', 'Wrong item delivered', 'App issue', 'Other'];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={onClose}>
      <div className="bg-white w-full rounded-t-3xl p-5 pb-8" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
        {sent ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={28} className="text-[#2ECC71]" />
            </div>
            <h3 className="text-[#2C3E50] font-bold text-lg">Report Submitted</h3>
            <p className="text-gray-400 text-sm mt-1">Support will contact you shortly.</p>
            <button onClick={onClose} className="mt-5 bg-[#2ECC71] text-white font-medium px-6 py-2.5 rounded-xl">Close</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[#2C3E50] font-bold text-lg flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-500" />
                Report an Issue
              </h3>
              <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
            </div>
            <p className="text-gray-400 text-sm mb-4">Order: {order.pickup} → {order.dropoff}</p>
            <div className="space-y-2 mb-4">
              {reasons.map(r => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                    reason === r ? 'bg-[#2ECC71] text-white border-[#2ECC71]' : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <button
              onClick={() => reason && setSent(true)}
              disabled={!reason}
              className="w-full bg-[#2ECC71] disabled:opacity-40 text-white font-bold py-3.5 rounded-2xl"
            >
              Submit Report
            </button>
          </>
        )}
      </div>
    </div>
  );
}
