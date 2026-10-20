import { useEffect, useState, useRef, useCallback } from 'react';
import {
  ArrowLeft, Package, ScanLine, Camera, CheckCircle2, Loader2,
  AlertCircle, MapPin, Navigation, X, ShoppingCart,
} from 'lucide-react';
import { type Order, formatPeso, totalPayable } from '@/lib/supabase';
import {
  fetchShoppingItems, markItemScanned, markItemWithProof,
  uploadProofPhoto, fetchOpenFoodFacts, type ShoppingItem,
} from '@/lib/shopping';
import BarcodeScanner from '@/components/BarcodeScanner';
import Toast from '@/components/Toast';

type Props = {
  order: Order;
  onComplete: () => void;
  onBack: () => void;
};

export default function ShoppingList({ order, onComplete, onBack }: Props) {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scannerItem, setScannerItem] = useState<ShoppingItem | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [productInfo, setProductInfo] = useState<Record<string, { name: string; brand: string }>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const photoItemRef = useRef<ShoppingItem | null>(null);

  const load = useCallback(async () => {
    try {
      setItems(await fetchShoppingItems(order.id));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
    setLoading(false);
  }, [order.id]);

  useEffect(() => { load(); }, [load]);

  const handleBarcodeScan = async (barcode: string) => {
    if (!scannerItem) return;
    setVerifying(true);
    setScannerItem(null);
    try {
      const info = await fetchOpenFoodFacts(barcode);
      if (info) {
        setProductInfo(prev => ({ ...prev, [scannerItem.id]: info }));
      }
      await markItemScanned(scannerItem.id);
      setItems(prev => prev.map(it => it.id === scannerItem.id ? { ...it, is_scanned: true, barcode } : it));
      setToast('Item verified!');
    } catch {
      setError('Failed to verify barcode. Try again.');
    }
    setVerifying(false);
  };

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !photoItemRef.current) return;
    const item = photoItemRef.current;
    photoItemRef.current = null;
    setVerifying(true);
    try {
      const url = await uploadProofPhoto(order.id, file);
      await markItemWithProof(item.id, url);
      setItems(prev => prev.map(it => it.id === item.id ? { ...it, is_scanned: true, proof_image_url: url } : it));
      setToast('Photo proof uploaded!');
    } catch (err) {
      setError((err as Error).message);
    }
    setVerifying(false);
    e.target.value = '';
  };

  const allScanned = items.length > 0 && items.every(i => i.is_scanned);

  return (
    <div className="flex flex-col h-full bg-[#F8F9FA]">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-5 flex-shrink-0 border-b border-gray-100">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 mb-4 active:opacity-70">
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="flex items-center gap-2 mb-3">
          <ShoppingCart size={20} className="text-[#2ECC71]" />
          <h1 className="text-[#2C3E50] text-xl font-bold">Shop & Deliver</h1>
        </div>
        <div className="bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100">
          <div className="flex items-center gap-1.5 mb-1">
            <MapPin size={11} className="text-[#2ECC71]" />
            <p className="text-[#2C3E50] text-sm font-semibold truncate">{order.pickup}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <Navigation size={11} className="text-gray-400" />
            <p className="text-gray-500 text-sm truncate">{order.dropoff}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-gray-400 text-xs">
            {items.filter(i => i.is_scanned).length} / {items.length} items scanned
          </span>
          <span className="text-[#2ECC71] text-sm font-bold">{formatPeso(totalPayable(order))}</span>
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <Loader2 size={26} className="text-[#2ECC71] animate-spin" />
            <p className="text-gray-400 text-sm">Loading shopping list...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-center">
            <AlertCircle size={28} className="text-red-400" />
            <p className="text-red-500 font-medium text-sm">{error}</p>
            <button onClick={load} className="text-[#2ECC71] text-sm font-medium">Retry</button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Package size={26} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No items to shop</p>
            <p className="text-gray-400 text-sm">This order has no shopping list</p>
          </div>
        ) : (
          items.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              product={productInfo[item.id]}
              onScan={() => setScannerItem(item)}
              onPhoto={() => { photoItemRef.current = item; fileInputRef.current?.click(); }}
            />
          ))
        )}
      </div>

      {/* Complete button */}
      {allScanned && !loading && (
        <div className="bg-white border-t border-gray-100 px-4 py-4 flex-shrink-0">
          <button
            onClick={onComplete}
            className="w-full bg-[#2ECC71] active:bg-emerald-600 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition-all"
          >
            <CheckCircle2 size={20} />
            All Items Scanned — Continue
          </button>
        </div>
      )}

      {verifying && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl px-6 py-5 flex items-center gap-3">
            <Loader2 size={22} className="text-[#2ECC71] animate-spin" />
            <span className="text-[#2C3E50] font-medium text-sm">Verifying...</span>
          </div>
        </div>
      )}

      {scannerItem && (
        <BarcodeScanner
          expectedBarcode={scannerItem.barcode}
          onScan={handleBarcodeScan}
          onClose={() => setScannerItem(null)}
        />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handlePhotoCapture}
      />

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}

function ItemCard({
  item, product, onScan, onPhoto,
}: {
  item: ShoppingItem;
  product?: { name: string; brand: string };
  onScan: () => void;
  onPhoto: () => void;
}) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border overflow-hidden p-4 ${
      item.is_scanned ? 'border-emerald-200' : 'border-gray-100'
    }`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {item.is_scanned ? (
              <CheckCircle2 size={16} className="text-[#2ECC71] flex-shrink-0" />
            ) : (
              <Package size={16} className="text-gray-400 flex-shrink-0" />
            )}
            <p className={`font-semibold text-sm truncate ${item.is_scanned ? 'text-[#2C3E50]' : 'text-gray-700'}`}>
              {item.item_name}
            </p>
          </div>
          {item.barcode && (
            <p className="text-gray-400 text-xs ml-6">Barcode: {item.barcode}</p>
          )}
          {product && (
            <div className="ml-6 mt-1.5 flex items-center gap-1.5">
              <span className="text-[#2ECC71] text-xs font-medium">{product.name}</span>
              {product.brand && <span className="text-gray-400 text-xs">· {product.brand}</span>}
            </div>
          )}
          {item.proof_image_url && (
            <div className="ml-6 mt-2">
              <img src={item.proof_image_url} alt="Proof" className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
            </div>
          )}
        </div>
        {item.is_scanned ? (
          <span className="bg-emerald-50 text-[#2ECC71] text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200 flex-shrink-0">
            Done
          </span>
        ) : (
          <span className="bg-amber-50 text-amber-600 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200 flex-shrink-0">
            Pending
          </span>
        )}
      </div>

      {!item.is_scanned && (
        <div className="flex gap-2">
          <button
            onClick={onScan}
            className="flex-1 bg-[#2C3E50] active:bg-slate-700 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5"
          >
            <ScanLine size={14} /> Scan Barcode
          </button>
          <button
            onClick={onPhoto}
            className="flex-1 bg-white border border-gray-200 active:bg-gray-50 text-[#2C3E50] text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5"
          >
            <Camera size={14} /> Take Photo
          </button>
        </div>
      )}
    </div>
  );
}
