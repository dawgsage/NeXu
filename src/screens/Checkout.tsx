import { useState } from 'react';
import { ArrowLeft, MapPin, CreditCard, Banknote, Smartphone, CheckCircle2, Loader2, AlertCircle, Store } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/lib/cart';

const DELIVERY_FEE = 49;

type Props = {
  onBack: () => void;
  onSuccess: () => void;
};

type PaymentMethod = 'Cash' | 'GCash' | 'Card';

const paymentOptions: { id: PaymentMethod; icon: React.ReactNode; cls: string }[] = [
  { id: 'Cash', icon: <Banknote size={16} />, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'GCash', icon: <Smartphone size={16} />, cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'Card', icon: <CreditCard size={16} />, cls: 'bg-slate-50 text-slate-700 border-slate-200' },
];

export default function Checkout({ onBack, onSuccess }: Props) {
  const { lines, merchantName, subtotal, clearCart } = useCart();
  const [address, setAddress] = useState('');
  const [payment, setPayment] = useState<PaymentMethod>('Cash');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = subtotal + DELIVERY_FEE;

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      setError('Please enter a delivery address.');
      return;
    }
    setPlacing(true);
    setError(null);
    try {
      const note = lines.map(l => `${l.quantity}x ${l.item.item_name}`).join(', ');
      const { error: insertError } = await supabase.from('orders').insert({
        pickup: merchantName ?? 'Unknown Merchant',
        dropoff: address.trim(),
        fare: total,
        distance: 5,
        vehicle_type: 'Motorcycle',
        note,
        status: 'Available',
        category: 'Food',
        toll_fee: 0,
        multi_store: false,
        payment_methods: [payment],
      });
      if (insertError) throw insertError;
      clearCart();
      onSuccess();
    } catch (e) {
      setError((e as Error).message);
    }
    setPlacing(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      <div className="bg-white px-5 pt-12 pb-5 flex-shrink-0 border-b border-gray-100">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 mb-3 active:opacity-70">
          <ArrowLeft size={18} /><span className="text-sm font-medium">Back to Cart</span>
        </button>
        <h1 className="text-[#0F172A] text-2xl font-bold">Checkout</h1>
        <p className="text-gray-400 text-sm mt-0.5">Review and place your order</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Store size={15} className="text-[#10B981]" />
            <h3 className="text-[#0F172A] text-sm font-bold">Order From</h3>
          </div>
          <p className="text-gray-600 text-sm">{merchantName}</p>
          <div className="mt-3 space-y-1.5">
            {lines.map(line => (
              <div key={line.key} className="flex justify-between text-xs">
                <span className="text-gray-500">{line.quantity}x {line.item.item_name}</span>
                <span className="text-gray-700 font-medium">₱{(line.quantity * Number(line.item.price)).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={15} className="text-[#10B981]" />
            <h3 className="text-[#0F172A] text-sm font-bold">Delivery Address</h3>
          </div>
          <textarea
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Street, barangay, city (e.g. 123 Rizal St, Poblacion, Makati)"
            rows={3}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-[#0F172A] placeholder-gray-400 focus:outline-none focus:border-[#10B981] resize-none"
          />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-[#0F172A] text-sm font-bold mb-3">Payment Method</h3>
          <div className="space-y-2">
            {paymentOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => setPayment(opt.id)}
                className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                  payment === opt.id ? `${opt.cls} border-current` : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}
              >
                {opt.icon}
                <span className="text-sm font-semibold flex-1 text-left">{opt.id}</span>
                {payment === opt.id && <CheckCircle2 size={16} />}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2.5">
          <div className="flex justify-between">
            <span className="text-gray-500 text-sm">Subtotal</span>
            <span className="text-[#0F172A] font-semibold text-sm">₱{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 text-sm">Delivery Fee</span>
            <span className="text-[#0F172A] font-semibold text-sm">₱{DELIVERY_FEE}</span>
          </div>
          <div className="border-t border-gray-100 pt-2.5 flex justify-between">
            <span className="text-[#0F172A] font-bold">Total</span>
            <span className="text-[#10B981] font-black text-lg">₱{total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-gray-100 px-4 py-4 flex-shrink-0">
        <button
          onClick={handlePlaceOrder}
          disabled={placing || lines.length === 0}
          className="w-full bg-gradient-to-r from-[#10B981] to-[#059669] hover:scale-[1.02] active:scale-95 disabled:opacity-60 text-white font-bold tracking-wide text-lg py-4 rounded-full shadow-lg shadow-[#10B981]/30 flex items-center justify-center gap-2 transition-all duration-200"
        >
          {placing ? (
            <><Loader2 size={20} className="animate-spin" />Placing Order...</>
          ) : (
            <><CheckCircle2 size={20} />Place Order</>
          )}
        </button>
        <p className="text-center text-gray-400 text-xs mt-2">By placing this order, a driver will be notified</p>
      </div>
    </div>
  );
}
