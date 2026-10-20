import { useState } from 'react';
import {
  ArrowLeft, MapPin, Navigation, Route, FileText, CheckCircle2, Loader2,
  Receipt, CreditCard, Banknote, Smartphone, Info, Store, Clock, Heart,
} from 'lucide-react';
import { supabase, type Order, formatPeso, totalPayable } from '@/lib/supabase';

type Props = {
  order: Order;
  onBack: () => void;
  onAccepted: (order: Order) => void;
};

const paymentIcon = (m: string) => {
  if (m === 'Cash') return <Banknote size={13} />;
  if (m === 'GCash') return <Smartphone size={13} />;
  if (m === 'Maya') return <Smartphone size={13} />;
  return <CreditCard size={13} />;
};

const paymentColor = (m: string) => {
  if (m === 'Cash') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (m === 'GCash') return 'bg-blue-50 text-blue-700 border-blue-200';
  if (m === 'Maya') return 'bg-violet-50 text-violet-700 border-violet-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
};

export default function OfferDetails({ order, onBack, onAccepted }: Props) {
  const [accepting, setAccepting] = useState(false);
  const [showNutrition, setShowNutrition] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    setAccepting(true);
    setError(null);
    const { data, error } = await supabase
      .from('orders')
      .update({ status: 'Accepted' })
      .eq('id', order.id)
      .eq('status', 'Available')
      .select();
    if (error) {
      setError(error.message);
      setAccepting(false);
    } else if (!data || data.length === 0) {
      setError('Sorry, this job was already taken by another driver.');
      setAccepting(false);
    } else {
      onAccepted({ ...order, status: 'Accepted' });
    }
  };

  const baseFare = order.fare;
  const toll = order.toll_fee;
  const total = totalPayable(order);
  const perKm = order.distance > 0 ? (total / order.distance).toFixed(0) : '0';
  const isFood = order.category === 'Food';
  const isScheduled = !!order.scheduled_time;

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      <div className="bg-white px-5 pt-12 pb-5 flex-shrink-0 border-b border-gray-100">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 mb-4 active:opacity-70">
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back to Offers</span>
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[#0F172A] text-xl font-bold">Offer Details</h2>
            <p className="text-gray-400 text-sm mt-0.5">Review before accepting</p>
          </div>
          {isScheduled && (
            <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5">
              <Clock size={13} className="text-blue-600" />
              <span className="text-blue-700 text-xs font-medium">Scheduled</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Fare hero */}
        <div className="bg-[#10B981]/5 border border-[#10B981]/20 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-medium tracking-wide uppercase mb-1">Total Estimated Payable</p>
            <p className="text-[#10B981] text-4xl font-black">{formatPeso(total)}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
          <Clock size={12} className="text-[#10B981]" />
          <span className="text-[#10B981] text-xs font-bold">Est. {Math.max(15, Math.round(order.distance * 4))} mins</span>
        </div>
        <p className="text-gray-400 text-xs mt-1">≈ ₱{perKm}/km</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl px-4 py-2 text-center">
            <p className="text-gray-400 text-xs font-medium">Total Distance</p>
            <p className="text-[#0F172A] text-2xl font-bold">{order.distance}</p>
            <p className="text-gray-400 text-xs">km</p>
            <div className="mt-1.5 pt-1.5 border-t border-gray-50 space-y-0.5">
              <p className="text-gray-500 text-[10px]">{(order.distance * 0.3).toFixed(1)} km → Store</p>
              <p className="text-gray-500 text-[10px]">{(order.distance * 0.7).toFixed(1)} km → Customer</p>
            </div>
          </div>
        </div>

        {/* Cost breakdown (F1) */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-[#0F172A] text-sm font-bold uppercase tracking-wide mb-3 flex items-center gap-2">
            <Receipt size={15} className="text-[#10B981]" />
            Cost Breakdown
          </h3>
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Base Fare</span>
              <span className="text-[#0F172A] font-semibold">{formatPeso(baseFare)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Toll / Skyway Fees</span>
              <span className="text-[#0F172A] font-semibold">{formatPeso(toll)}</span>
            </div>
            <div className="border-t border-gray-100 pt-2.5 flex justify-between items-center">
              <span className="text-[#0F172A] font-bold text-sm">Total Payable</span>
              <span className="text-[#10B981] font-black text-lg">{formatPeso(total)}</span>
            </div>
          </div>
        </div>

        {/* Route */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-[#0F172A] text-sm font-bold uppercase tracking-wide mb-4 flex items-center gap-2">
            <Route size={15} className="text-[#10B981]" />
            Route
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-50 border-2 border-[#10B981] flex items-center justify-center flex-shrink-0">
                <MapPin size={15} className="text-[#10B981]" />
              </div>
              <div className="flex-1 pt-1">
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">Pickup</p>
                <p className="text-[#0F172A] text-sm font-semibold">{order.pickup}</p>
                {order.pickup_lat && <p className="text-gray-400 text-xs mt-0.5">{order.pickup_lat}, {order.pickup_lng}</p>}
              </div>
            </div>
            <div className="ml-4 w-px h-6 bg-gray-200" />
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-50 border-2 border-[#0F172A] flex items-center justify-center flex-shrink-0">
                <Navigation size={15} className="text-[#0F172A]" />
              </div>
              <div className="flex-1 pt-1">
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">Dropoff</p>
                <p className="text-[#0F172A] text-sm font-semibold">{order.dropoff}</p>
                {order.dropoff_lat && <p className="text-gray-400 text-xs mt-0.5">{order.dropoff_lat}, {order.dropoff_lng}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle + tags */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-[#0F172A] text-sm font-bold uppercase tracking-wide mb-3 flex items-center gap-2">
            <CheckCircle2 size={15} className="text-[#10B981]" />
            Requirements
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
              <p className="text-gray-400 text-[10px]">Vehicle</p>
              <p className="text-[#0F172A] font-bold text-sm">{order.vehicle_type}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <p className="text-gray-400 text-[10px]">Category</p>
              <p className="text-[#0F172A] font-bold text-sm">{order.category}</p>
            </div>
            {order.multi_store && (
              <div className="bg-fuchsia-50 border border-fuchsia-200 rounded-xl px-3 py-2 flex items-center gap-1">
                <Store size={13} className="text-fuchsia-600" />
                <p className="text-fuchsia-700 font-bold text-sm">Multi-Store</p>
              </div>
            )}
            {isScheduled && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2">
                <p className="text-gray-400 text-[10px]">Scheduled</p>
                <p className="text-blue-700 font-bold text-sm">
                  {new Date(order.scheduled_time!).toLocaleString('en-PH', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Payment methods (F3) */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-[#0F172A] text-sm font-bold uppercase tracking-wide mb-3 flex items-center gap-2">
            <CreditCard size={15} className="text-[#10B981]" />
            Accepted Payment
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            {order.payment_methods.length > 0 ? order.payment_methods.map(m => (
              <span key={m} className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${paymentColor(m)}`}>
                {paymentIcon(m)}{m}
              </span>
            )) : (
              <span className="text-gray-400 text-sm">Cash on delivery</span>
            )}
          </div>
        </div>

        {/* Note */}
        {order.note && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-amber-800 text-sm font-bold uppercase tracking-wide mb-2 flex items-center gap-2">
              <FileText size={15} />
              Customer Note
            </h3>
            <p className="text-amber-900 text-sm leading-relaxed">"{order.note}"</p>
            {order.customer_name && (
              <p className="text-amber-700 text-xs mt-2 font-medium">— {order.customer_name}</p>
            )}
          </div>
        )}

        {/* Nutrition info (F8) */}
        {isFood && (
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 shadow-sm">
            <button
              onClick={() => setShowNutrition(v => !v)}
              className="w-full flex items-center justify-between text-left"
            >
              <span className="flex items-center gap-2 text-rose-700 text-sm font-bold">
                <Heart size={15} />
                Nutritional Info
              </span>
              <Info size={15} className="text-rose-400" />
            </button>
            {showNutrition && (
              <div className="mt-3 pt-3 border-t border-rose-100 text-xs text-rose-800 space-y-1">
                <p>Estimated calories: 450–650 kcal per serving</p>
                <p>Contains: rice, protein, vegetables</p>
                <p>Allergen info: may contain soy, gluten</p>
                <p className="text-rose-500 mt-1.5">Note: estimate only. Actual values depend on the merchant.</p>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-600 text-sm">
            {error}
          </div>
        )}
      </div>

      <div className="bg-white border-t border-gray-100 px-4 py-4 flex-shrink-0">
        <button
          onClick={handleAccept}
          disabled={accepting}
          className="w-full bg-gradient-to-r from-[#10B981] to-[#059669] hover:scale-[1.02] active:scale-95 disabled:opacity-60 text-white font-bold tracking-wide text-lg py-4 rounded-full shadow-lg shadow-[#10B981]/30 flex items-center justify-center gap-2 transition-all duration-200"
        >
          {accepting ? (
            <><Loader2 size={20} className="animate-spin" />Accepting...</>
          ) : (
            <><CheckCircle2 size={20} />Accept Offer</>
          )}
        </button>
        <p className="text-center text-gray-400 text-xs mt-2">By accepting, you commit to complete this delivery</p>
      </div>
    </div>
  );
}
