import { useState, useEffect } from 'react';
import {
  MapPin, Navigation, Package, Loader2, CheckCircle2, Map,
  AlertTriangle, X, ExternalLink, Navigation2, Camera, Store,
  ShoppingCart, Bike,
} from 'lucide-react';
import { supabase, type Order, formatPeso, totalPayable } from '@/lib/supabase';
import { fetchShoppingItems, type ShoppingItem } from '@/lib/shopping';

type Props = {
  order: Order;
  onDelivered: () => void;
};

type Step = 1 | 2 | 3;

type TripStatus = 'Accepted' | 'At Store' | 'Picked Up' | 'Delivered';

const statusForStep = (step: Step): TripStatus => {
  if (step === 1) return 'Accepted';
  if (step === 2) return 'At Store';
  return 'Picked Up';
};

export default function ActiveTrip({ order, onDelivered }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [delivering, setDelivering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNav, setShowNav] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);

  useEffect(() => {
    fetchShoppingItems(order.id)
      .then(items => setShoppingItems(items))
      .catch(() => {});
  }, [order.id]);

  const hasShoppingList = shoppingItems.length > 0;
  const proofPhotos = shoppingItems.filter(i => i.is_scanned && i.proof_image_url);

  const advanceStep = async (nextStep: Step) => {
    const newStatus = statusForStep(nextStep);
    const { error: updError } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', order.id);
    if (updError) {
      setError(updError.message);
      return;
    }
    setError(null);
    setStep(nextStep);
  };

  const handleDeliver = async () => {
    setDelivering(true);
    setError(null);
    const { error } = await supabase
      .from('orders')
      .update({ status: 'Delivered' })
      .eq('id', order.id);
    if (error) {
      setError(error.message);
      setDelivering(false);
    } else {
      onDelivered();
    }
  };

  const destLat = order.dropoff_lat;
  const destLng = order.dropoff_lng;
  const hasCoords = destLat != null && destLng != null;

  const openGoogleMaps = () => {
    if (!hasCoords) return;
    const target = step <= 2 ? order.pickup_lat : destLat;
    const targetLng = step <= 2 ? order.pickup_lng : destLng;
    if (target != null && targetLng != null) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${target},${targetLng}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`, '_blank');
    }
    setShowNav(false);
  };
  const openWaze = () => {
    if (!hasCoords) return;
    window.open(`https://waze.com/ul?ll=${destLat},${destLng}&navigate=yes`, '_blank');
    setShowNav(false);
  };

  const steps = [
    { num: 1, label: 'Heading to Store', icon: <Store size={18} />, desc: order.pickup },
    { num: 2, label: 'Shopping / Pickup', icon: <ShoppingCart size={18} />, desc: hasShoppingList ? `${shoppingItems.length} items to pick` : 'Collect items' },
    { num: 3, label: 'On the Way to Customer', icon: <Navigation2 size={18} />, desc: order.dropoff },
  ];

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      {/* Light header */}
      <div className="bg-white px-5 pt-12 pb-4 flex-shrink-0 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
            <div>
              <p className="text-gray-400 text-[10px] font-medium tracking-widest uppercase">Active Delivery</p>
              <h2 className="text-[#0F172A] text-xl font-bold">Step {step} of 3</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-[#10B981]/10 text-[#10B981] text-xs font-bold px-3 py-1.5 rounded-full">
              {formatPeso(totalPayable(order))}
            </span>
            <button
              onClick={() => setShowReport(true)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 flex items-center gap-1.5"
            >
              <AlertTriangle size={14} className="text-amber-500" />
              <span className="text-gray-600 text-xs font-medium">Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delivery Timeline */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Timeline steps */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
          <div className="space-y-0">
            {steps.map((s, idx) => {
              const isDone = step > s.num;
              const isCurrent = step === s.num;
              const isLast = idx === steps.length - 1;
              return (
                <div key={s.num} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      isDone ? 'bg-[#10B981] text-white' : isCurrent ? 'bg-[#10B981] text-white ring-4 ring-[#10B981]/15' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {isDone ? <CheckCircle2 size={18} /> : s.icon}
                    </div>
                    {!isLast && <div className={`w-0.5 h-8 ${isDone ? 'bg-[#10B981]' : 'bg-gray-200'}`} />}
                  </div>
                  <div className="flex-1 pb-2">
                    <p className={`text-sm font-bold ${isCurrent ? 'text-[#0F172A]' : isDone ? 'text-[#10B981]' : 'text-gray-400'}`}>
                      {s.label}
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">{s.desc}</p>
                    {isCurrent && s.num === 2 && hasShoppingList && (
                      <div className="mt-2 bg-gray-50 rounded-lg p-3 space-y-1.5">
                        {shoppingItems.map(item => (
                          <div key={item.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              {item.is_scanned ? <CheckCircle2 size={13} className="text-[#10B981]" /> : <Package size={13} className="text-gray-300" />}
                              <span className={`text-xs ${item.is_scanned ? 'text-gray-500' : 'text-gray-700 font-medium'}`}>{item.item_name}</span>
                            </div>
                            {item.proof_image_url && <img src={item.proof_image_url} alt={item.item_name} className="w-8 h-8 rounded object-cover" />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Route info */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
          <div className="space-y-2.5">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0">
                <Store size={13} className="text-[#10B981]" />
              </div>
              <div>
                <p className="text-gray-400 text-xs font-medium">Pickup</p>
                <p className="text-[#0F172A] text-sm font-semibold">{order.pickup}</p>
              </div>
            </div>
            <div className="ml-3.5 w-px h-3 bg-gray-200" />
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0">
                <MapPin size={13} className="text-gray-500" />
              </div>
              <div>
                <p className="text-gray-400 text-xs font-medium">Dropoff</p>
                <p className="text-[#0F172A] text-sm font-semibold">{order.dropoff}</p>
              </div>
            </div>
          </div>
        </div>

        {order.note && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 mb-4">
            <p className="text-amber-700 text-xs font-medium">Note: <span className="text-amber-900">{order.note}</span></p>
          </div>
        )}

        {proofPhotos.length > 0 && step >= 2 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-3 mb-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Camera size={14} className="text-[#10B981]" />
              <p className="text-[#10B981] text-xs font-bold uppercase tracking-wide">Proof Photos</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {proofPhotos.map(item => (
                <div key={item.id}>
                  <img src={item.proof_image_url!} alt={item.item_name} className="w-16 h-16 rounded-lg object-cover border border-emerald-200" />
                  <p className="text-[10px] text-emerald-700 font-medium mt-1 text-center truncate w-16">{item.item_name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 mb-4 text-red-600 text-sm">{error}</div>
        )}

        {/* Step action buttons */}
        <div className="space-y-2.5">
          {step === 1 && (
            <button
              onClick={() => advanceStep(2)}
              className="w-full bg-gradient-to-r from-[#10B981] to-[#059669] hover:scale-[1.02] active:scale-95 text-white font-bold tracking-wide text-base py-4 rounded-full shadow-lg shadow-[#10B981]/30 flex items-center justify-center gap-2 transition-all duration-200"
            >
              <Store size={20} /> Arrived at Store
            </button>
          )}

          {step === 2 && (
            <button
              onClick={() => advanceStep(3)}
              className="w-full bg-gradient-to-r from-[#10B981] to-[#059669] hover:scale-[1.02] active:scale-95 text-white font-bold tracking-wide text-base py-4 rounded-full shadow-lg shadow-[#10B981]/30 flex items-center justify-center gap-2 transition-all duration-200"
            >
              <CheckCircle2 size={20} /> Items Picked Up
            </button>
          )}

          {step === 3 && (
            <>
              <button
                onClick={() => hasCoords ? setShowNav(true) : setError('No coordinates available for this order')}
                className="w-full bg-white border border-gray-200 active:bg-gray-50 text-[#0F172A] font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all"
              >
                <Navigation2 size={18} /> Navigate to Customer
              </button>
              <button
                onClick={handleDeliver}
                disabled={delivering}
                className="w-full bg-gradient-to-r from-[#10B981] to-[#059669] hover:scale-[1.02] active:scale-95 disabled:opacity-60 text-white font-bold tracking-wide text-lg py-4 rounded-full shadow-lg shadow-[#10B981]/30 flex items-center justify-center gap-2 transition-all duration-200"
              >
                {delivering ? (
                  <><Loader2 size={20} className="animate-spin" />Confirming...</>
                ) : (
                  <><CheckCircle2 size={20} /> Mark as Delivered</>
                )}
              </button>
              <p className="text-center text-gray-400 text-xs">Confirm only upon successful handoff</p>
            </>
          )}
        </div>
      </div>

      {/* Navigation chooser */}
      {showNav && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowNav(false)}>
          <div className="bg-white w-full rounded-t-3xl p-5 pb-8 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <h3 className="text-[#0F172A] font-bold text-lg mb-1">Open in navigation app</h3>
            <p className="text-gray-400 text-sm mb-4">Choose your preferred map app</p>
            <button onClick={openGoogleMaps} className="w-full flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 mb-2 active:bg-gray-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><Map size={20} className="text-blue-600" /></div>
              <div className="flex-1 text-left"><p className="text-[#0F172A] font-semibold text-sm">Google Maps</p><p className="text-gray-400 text-xs">Turn-by-turn navigation</p></div>
              <ExternalLink size={16} className="text-gray-400" />
            </button>
            <button onClick={openWaze} className="w-full flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 mb-4 active:bg-gray-100">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center"><Navigation2 size={20} className="text-cyan-600" /></div>
              <div className="flex-1 text-left"><p className="text-[#0F172A] font-semibold text-sm">Waze</p><p className="text-gray-400 text-xs">Real-time traffic routing</p></div>
              <ExternalLink size={16} className="text-gray-400" />
            </button>
            <button onClick={() => setShowNav(false)} className="w-full text-gray-500 font-medium py-2">Cancel</button>
          </div>
        </div>
      )}

      {showReport && <ReportSheet order={order} onClose={() => setShowReport(false)} />}
    </div>
  );
}

function ReportSheet({ order, onClose }: { order: Order; onClose: () => void }) {
  const [sent, setSent] = useState(false);
  const [reason, setReason] = useState('');
  const reasons = ['Customer not responding', 'Cannot find pickup location', 'Item damaged on pickup', 'Traffic / road closure', 'Other issue'];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={onClose}>
      <div className="bg-white w-full rounded-t-3xl p-5 pb-8" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
        {sent ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3"><CheckCircle2 size={28} className="text-[#10B981]" /></div>
            <h3 className="text-[#0F172A] font-bold text-lg">Report Submitted</h3>
            <p className="text-gray-400 text-sm mt-1">Support will contact you shortly.</p>
            <button onClick={onClose} className="mt-5 bg-gradient-to-r from-[#10B981] to-[#059669] hover:scale-[1.02] active:scale-95 text-white font-bold tracking-wide px-6 py-2.5 rounded-full shadow-lg shadow-[#10B981]/30 transition-all duration-200">Close</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[#0F172A] font-bold text-lg flex items-center gap-2"><AlertTriangle size={18} className="text-amber-500" />Report an Issue</h3>
              <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
            </div>
            <p className="text-gray-400 text-sm mb-4">Order: {order.pickup} → {order.dropoff}</p>
            <div className="space-y-2 mb-4">
              {reasons.map(r => (
                <button key={r} onClick={() => setReason(r)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${reason === r ? 'bg-[#10B981] text-white border-[#10B981]' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                  {r}
                </button>
              ))}
            </div>
            <button onClick={() => reason && setSent(true)} disabled={!reason}
              className="w-full bg-gradient-to-r from-[#10B981] to-[#059669] hover:scale-[1.02] active:scale-95 disabled:opacity-40 text-white font-bold tracking-wide py-3.5 rounded-full shadow-lg shadow-[#10B981]/30 transition-all duration-200">
              Submit Report
            </button>
          </>
        )}
      </div>
    </div>
  );
}
