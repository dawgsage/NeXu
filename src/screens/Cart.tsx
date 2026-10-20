import { Minus, Plus, Trash2, ShoppingCart, ChevronRight, Store } from 'lucide-react';
import { useCart } from '@/lib/cart';

type Props = {
  onBack: () => void;
  onCheckout: () => void;
  onBrowse: () => void;
};

export default function Cart({ onBack, onCheckout, onBrowse }: Props) {
  const { lines, merchantName, count, subtotal, setQuantity, removeLine, clearCart } = useCart();

  return (
    <div className="flex flex-col h-full bg-[#F8F9FA]">
      <div className="bg-white px-5 pt-12 pb-5 flex-shrink-0 border-b border-gray-100">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 mb-3 active:opacity-70">
          <span className="text-sm font-medium">Back</span>
        </button>
        <h1 className="text-[#2C3E50] text-2xl font-bold">Your Cart</h1>
        <p className="text-gray-400 text-sm mt-0.5">
          {count > 0 ? `${count} item${count !== 1 ? 's' : ''} from ${merchantName}` : 'Review items before checkout'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {lines.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <ShoppingCart size={28} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">Your cart is empty</p>
            <p className="text-gray-400 text-sm">Browse merchants to add items</p>
            <button onClick={onBrowse} className="mt-2 bg-[#2ECC71] text-white font-medium px-5 py-2.5 rounded-xl text-sm">
              Browse Merchants
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-100 px-4 py-3">
              <Store size={15} className="text-[#2ECC71]" />
              <p className="text-[#2C3E50] text-sm font-semibold flex-1">{merchantName}</p>
              <button onClick={clearCart} className="text-gray-400 text-xs font-medium active:text-red-500">
                Clear all
              </button>
            </div>

            {lines.map(line => (
              <div key={line.key} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[#2C3E50] font-semibold text-sm">{line.item.item_name}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{line.item.manufacturer}</p>
                  </div>
                  <button onClick={() => removeLine(line.key)} className="text-gray-300 active:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(line.key, line.quantity - 1)}
                      className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center active:bg-gray-200"
                    >
                      <Minus size={14} className="text-gray-600" />
                    </button>
                    <span className="text-[#2C3E50] font-bold text-sm w-6 text-center">{line.quantity}</span>
                    <button
                      onClick={() => setQuantity(line.key, line.quantity + 1)}
                      className="w-8 h-8 rounded-lg bg-[#2ECC71]/10 flex items-center justify-center active:bg-[#2ECC71]/20"
                    >
                      <Plus size={14} className="text-[#2ECC71]" />
                    </button>
                  </div>
                  <p className="text-[#2ECC71] font-bold text-sm">
                    ₱{(line.quantity * Number(line.item.price)).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {lines.length > 0 && (
        <div className="bg-white border-t border-gray-100 px-4 py-4 flex-shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">Subtotal</span>
            <span className="text-[#2C3E50] font-bold text-lg">₱{subtotal.toLocaleString()}</span>
          </div>
          <button
            onClick={onCheckout}
            className="w-full bg-[#2ECC71] active:bg-emerald-600 text-white font-bold text-base py-3.5 rounded-2xl shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 transition-all"
          >
            Proceed to Checkout
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
