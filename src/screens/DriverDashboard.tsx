import { useState, useEffect, useCallback } from 'react';
import {
  Wallet, TrendingUp, Package, Bike, Power, ChevronRight, Clock,
  AlertTriangle, X,
} from 'lucide-react';
import { supabase, formatPeso } from '@/lib/supabase';
import NexuLogo from '@/components/NexuLogo';

type Props = {
  isOnline: boolean;
  onToggleOnline: () => void;
  onGoToJobs: () => void;
};

export default function DriverDashboard({ isOnline, onToggleOnline, onGoToJobs }: Props) {
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [completedJobs, setCompletedJobs] = useState(0);
  const [activeJobs, setActiveJobs] = useState(0);
  const [showOfflineConfirm, setShowOfflineConfirm] = useState(false);

  const loadStats = useCallback(async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: delivered } = await supabase
      .from('orders')
      .select('fare, status, created_at')
      .eq('status', 'Delivered')
      .gte('created_at', today.toISOString());

    const deliveredToday = delivered ?? [];
    setTodayEarnings(deliveredToday.reduce((sum, o) => sum + (o.fare ?? 0), 0));
    setCompletedJobs(deliveredToday.length);

    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Accepted');

    setActiveJobs(count ?? 0);
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      <div className="bg-white px-5 pt-12 pb-5 flex-shrink-0 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <NexuLogo size={32} />
            <div>
              <p className="text-gray-400 text-[10px] font-medium tracking-widest uppercase">Welcome back</p>
              <h1 className="text-[#0F172A] text-xl font-bold tracking-tight">Driver Dashboard</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Online/Offline toggle */}
        <button
          onClick={() => isOnline ? setShowOfflineConfirm(true) : onToggleOnline()}
          className={`w-full rounded-2xl p-5 flex items-center justify-between transition-all duration-200 ${
            isOnline
              ? 'bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-lg shadow-[#10B981]/30'
              : 'bg-white border border-gray-100 shadow-sm text-gray-500'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isOnline ? 'bg-white/20' : 'bg-gray-100'
            }`}>
              <Power size={24} className={isOnline ? 'text-white' : 'text-gray-400'} />
            </div>
            <div className="text-left">
              <p className={`font-bold text-base ${isOnline ? 'text-white' : 'text-gray-500'}`}>
                {isOnline ? 'You are Online' : 'You are Offline'}
              </p>
              <p className={`text-xs ${isOnline ? 'text-white/80' : 'text-gray-400'}`}>
                {isOnline ? 'Receiving delivery offers' : 'Tap to start receiving offers'}
              </p>
            </div>
          </div>
          <div className={`w-14 h-8 rounded-full flex items-center p-1 transition-all ${
            isOnline ? 'bg-white/25' : 'bg-gray-200'
          }`}>
            <div className={`w-6 h-6 rounded-full bg-white shadow transition-transform ${
              isOnline ? 'translate-x-6' : ''
            }`} />
          </div>
        </button>

        {/* Daily overview card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-[#10B981]" />
            <h2 className="text-[#0F172A] text-sm font-bold uppercase tracking-wide">Daily Overview</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-2">
                <Wallet size={18} className="text-[#10B981]" />
              </div>
              <p className="text-[#10B981] text-lg font-black">{formatPeso(todayEarnings)}</p>
              <p className="text-gray-400 text-[10px] font-medium mt-0.5">Today's Earnings</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-2">
                <Package size={18} className="text-blue-500" />
              </div>
              <p className="text-[#0F172A] text-lg font-black">{completedJobs}</p>
              <p className="text-gray-400 text-[10px] font-medium mt-0.5">Completed</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mx-auto mb-2">
                <Bike size={18} className="text-amber-500" />
              </div>
              <p className="text-[#0F172A] text-lg font-black">{activeJobs}</p>
              <p className="text-gray-400 text-[10px] font-medium mt-0.5">Active Job</p>
            </div>
          </div>
        </div>

        {/* Jobs feed or offline message */}
        {isOnline ? (
          <button
            onClick={onGoToJobs}
            className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center">
                <Package size={18} className="text-[#10B981]" />
              </div>
              <div className="text-left">
                <p className="text-[#0F172A] font-semibold text-sm">View Available Jobs</p>
                <p className="text-gray-400 text-xs">Browse and accept delivery offers</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </button>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <Clock size={26} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-semibold text-sm">You are offline</p>
            <p className="text-gray-400 text-xs mt-1">Go online to see offers</p>
          </div>
        )}
      </div>

      {showOfflineConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-6">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} className="text-amber-500" />
            </div>
            <h3 className="text-[#0F172A] font-bold text-lg text-center mb-2">Go Offline?</h3>
            <p className="text-gray-500 text-sm text-center mb-5">
              You won't receive orders while offline. You can go back online anytime.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowOfflineConfirm(false)}
                className="flex-1 bg-gray-100 text-gray-700 font-bold tracking-wide py-3 rounded-full text-sm active:bg-gray-200 transition-all duration-200 min-h-[44px]"
              >
                Stay Online
              </button>
              <button
                onClick={() => { setShowOfflineConfirm(false); onToggleOnline(); }}
                className="flex-1 bg-gradient-to-r from-[#10B981] to-[#059669] hover:scale-[1.02] active:scale-95 text-white font-bold tracking-wide py-3 rounded-full text-sm shadow-lg shadow-[#10B981]/30 transition-all duration-200 min-h-[44px]"
              >
                Go Offline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
