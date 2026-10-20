import { useState, useEffect, useCallback } from 'react';
import {
  Wallet, TrendingUp, Package, ChevronRight, Download, Calendar,
  Smartphone, ArrowDownToLine,
} from 'lucide-react';
import { supabase, type Order, formatPeso, totalPayable } from '@/lib/supabase';
import Toast from '@/components/Toast';

const PLATFORM_FEE_RATE = 0.15;

type PayoutRecord = {
  id: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending';
};

const demoPayouts: PayoutRecord[] = [
  { id: '1', date: 'Oct 19, 2026', amount: 2450, status: 'Paid' },
  { id: '2', date: 'Oct 18, 2026', amount: 1850, status: 'Paid' },
  { id: '3', date: 'Oct 17, 2026', amount: 3200, status: 'Paid' },
  { id: '4', date: 'Oct 16, 2026', amount: 950, status: 'Paid' },
  { id: '5', date: 'Oct 15, 2026', amount: 2750, status: 'Pending' },
];

export default function Earnings() {
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [weeklyEarnings, setWeeklyEarnings] = useState(0);
  const [completedDeliveries, setCompletedDeliveries] = useState(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);

    const { data: todayData } = await supabase
      .from('orders')
      .select('fare, toll_fee, created_at')
      .eq('status', 'Delivered')
      .gte('created_at', todayStart.toISOString());

    const today = todayData ?? [];
    setTodayEarnings(today.reduce((sum, o) => sum + (o.fare ?? 0), 0));

    const { data: weekData } = await supabase
      .from('orders')
      .select('fare, toll_fee, created_at')
      .eq('status', 'Delivered')
      .gte('created_at', weekStart.toISOString());

    const week = weekData ?? [];
    setWeeklyEarnings(week.reduce((sum, o) => sum + (o.fare ?? 0), 0));
    setCompletedDeliveries(week.length);

    const { data: recent } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'Delivered')
      .order('created_at', { ascending: false })
      .limit(10);

    setRecentOrders((recent as Order[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      <div className="bg-white px-5 pt-12 pb-5 flex-shrink-0 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[#0F172A] text-2xl font-bold">Earnings</h1>
            <p className="text-gray-400 text-sm mt-0.5">Track your delivery income</p>
          </div>
          <button
            onClick={() => setToastMsg(`₱${weeklyEarnings.toLocaleString()} transferred to your linked account!`)}
            className="flex items-center gap-2 bg-gradient-to-r from-[#10B981] to-[#059669] hover:scale-[1.02] active:scale-95 text-white font-bold tracking-wide text-sm px-4 py-2.5 rounded-full shadow-lg shadow-[#10B981]/30 transition-all duration-200"
          >
            <ArrowDownToLine size={16} />
            Cash Out
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-2">
              <Wallet size={18} className="text-[#10B981]" />
            </div>
            <p className="text-gray-400 text-xs font-medium">Today</p>
            <p className="text-[#10B981] text-2xl font-black">{formatPeso(todayEarnings)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-2">
              <TrendingUp size={18} className="text-blue-500" />
            </div>
            <p className="text-gray-400 text-xs font-medium">This Week</p>
            <p className="text-[#0F172A] text-2xl font-black">{formatPeso(weeklyEarnings)}</p>
          </div>
        </div>

        {/* Completed deliveries count */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Package size={18} className="text-amber-500" />
            </div>
            <div>
              <p className="text-[#0F172A] font-semibold text-sm">Completed Deliveries</p>
              <p className="text-gray-400 text-xs">Last 7 days</p>
            </div>
          </div>
          <p className="text-[#0F172A] text-xl font-black">{completedDeliveries}</p>
        </div>

        {/* Recent deliveries breakdown */}
        <div>
          <h2 className="text-[#0F172A] text-sm font-bold uppercase tracking-wide mb-3">Recent Deliveries</h2>
          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
              <p className="text-gray-400 text-sm">Loading...</p>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
              <p className="text-gray-400 text-sm">No completed deliveries yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentOrders.map(order => {
                const gross = totalPayable(order);
                const fee = Math.round(gross * PLATFORM_FEE_RATE);
                const net = gross - fee;
                return (
                  <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-[#0F172A] font-semibold text-sm truncate">{order.pickup}</p>
                        <p className="text-gray-400 text-xs truncate">→ {order.dropoff}</p>
                      </div>
                      <span className="text-gray-400 text-xs whitespace-nowrap ml-2">
                        {new Date(order.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Gross Fare</span>
                        <span className="text-[#0F172A] font-semibold">{formatPeso(gross)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Platform Fee (15%)</span>
                        <span className="text-red-500 font-semibold">−{formatPeso(fee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tips</span>
                        <span className="text-gray-400">₱0</span>
                      </div>
                      <div className="border-t border-gray-100 pt-1.5 flex justify-between">
                        <span className="text-[#0F172A] font-bold">Net Earnings</span>
                        <span className="text-[#10B981] font-black text-sm">{formatPeso(net)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Payout history */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={16} className="text-[#10B981]" />
            <h2 className="text-[#0F172A] text-sm font-bold uppercase tracking-wide">Payout History</h2>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {demoPayouts.map((payout, idx) => (
              <div
                key={payout.id}
                className={`flex items-center justify-between px-4 py-3.5 ${
                  idx !== demoPayouts.length - 1 ? 'border-b border-gray-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
                    <Download size={15} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[#0F172A] font-semibold text-sm">{payout.date}</p>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                      payout.status === 'Paid'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}>
                      {payout.status}
                    </span>
                  </div>
                </div>
                <p className={`font-bold text-sm ${payout.status === 'Paid' ? 'text-[#10B981]' : 'text-gray-500'}`}>
                  {formatPeso(payout.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {toastMsg && <Toast message={toastMsg} onDone={() => setToastMsg(null)} />}
    </div>
  );
}
