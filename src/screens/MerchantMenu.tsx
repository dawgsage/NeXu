import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  ArrowLeft, Store, Loader2, AlertCircle, Package, Utensils, ShoppingCart,
  Pill, Coffee, TrendingUp, Tag, ChevronRight, Search, MapPin, X,
  ShoppingBag, Wrench, Home as HomeIcon, Plus, Check, AlertTriangle,
} from 'lucide-react';
import { fetchMerchants, type Merchant } from '@/lib/merchants';
import { fetchMenuByMerchant, fetchGroceryComparisons, type MenuItem, type PriceComparison } from '@/lib/menu';
import { useCart } from '@/lib/cart';

type Props = {
  onBack: () => void;
};

const REGIONS = ['All Regions', 'NCR', 'Bulacan', 'Calabarzon', 'Dagupan', 'Region 3'];

const SERVICE_ICONS = [
  { id: 'Food', label: 'Food', icon: <Utensils size={20} /> },
  { id: 'Grocery', label: 'Grocery', icon: <ShoppingCart size={20} /> },
  { id: 'Retail', label: 'Retail', icon: <ShoppingBag size={20} /> },
  { id: 'Parcel', label: 'Parcel', icon: <Package size={20} /> },
  { id: 'Pabili', label: 'Pabili', icon: <Store size={20} /> },
];

function categoryMatchesMerchant(merchantCat: string, serviceId: string): boolean {
  if (serviceId === 'Food') return merchantCat === 'Restaurant';
  if (serviceId === 'Grocery') return merchantCat === 'Grocery';
  if (serviceId === 'Retail') return merchantCat === 'Grocery'; // hardware/ikea are grocery category
  return true;
}

function merchantDisplayCategory(m: Merchant): string {
  const retailNames = ['IKEA', 'Ace Hardware', 'Wilcon'];
  if (retailNames.some(n => m.name.includes(n))) return 'Retail';
  if (m.category === 'Restaurant') return 'Food';
  return m.category;
}

export default function MerchantMenu({ onBack }: Props) {
  const { addItem, merchantId: cartMerchantId, merchantName: cartMerchantName, lines } = useCart();
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [comparisons, setComparisons] = useState<PriceComparison[]>([]);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('All Regions');
  const [activeService, setActiveService] = useState<string | null>(null);
  const [regionOpen, setRegionOpen] = useState(false);
  const [pendingItem, setPendingItem] = useState<{ item: MenuItem; merchant: Merchant } | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<string>('All');

  const load = useCallback(async () => {
    try {
      setMerchants(await fetchMerchants());
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const loadComparisons = useCallback(async () => {
    setItemsLoading(true);
    try {
      setComparisons(await fetchGroceryComparisons());
    } catch (e) {
      setError((e as Error).message);
    }
    setItemsLoading(false);
  }, []);

  const openMerchant = async (m: Merchant) => {
    setSelectedMerchant(m);
    setItemsLoading(true);
    try {
      setItems(await fetchMenuByMerchant(m.id));
    } catch (e) {
      setError((e as Error).message);
    }
    setItemsLoading(false);
  };

  const filtered = useMemo(() => {
    return merchants.filter(m => {
      if (!m.is_active) return false;
      if (region !== 'All Regions' && m.region !== region) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!m.name.toLowerCase().includes(q) && !(m.mall_name?.toLowerCase().includes(q) ?? false)) return false;
      }
      if (activeService) {
        const dispCat = merchantDisplayCategory(m);
        if (activeService === 'Food' && dispCat !== 'Food') return false;
        if (activeService === 'Grocery' && dispCat !== 'Grocery') return false;
        if (activeService === 'Retail' && dispCat !== 'Retail') return false;
        if (activeService === 'Parcel' || activeService === 'Pabili') return false;
      }
      return true;
    });
  }, [merchants, region, search, activeService]);

  const categoryIcon = (cat: string) => {
    if (cat === 'Food') return <Utensils size={13} />;
    if (cat === 'Drink') return <Coffee size={13} />;
    if (cat === 'Grocery') return <ShoppingCart size={13} />;
    if (cat === 'Pharmacy') return <Pill size={13} />;
    if (cat === 'Retail') return <ShoppingBag size={13} />;
    if (cat === 'Snacks') return <Package size={13} />;
    if (cat === 'Cafe') return <Coffee size={13} />;
    return <Package size={13} />;
  };

  const formatPrice = (item: MenuItem) => {
    if (item.price_high && item.price_high > item.price) return `₱${item.price} – ₱${item.price_high}`;
    return `₱${item.price}`;
  };

  const handleAddItem = (item: MenuItem, merchant: Merchant) => {
    if (cartMerchantId && cartMerchantId !== merchant.id && lines.length > 0) {
      setPendingItem({ item, merchant });
      return;
    }
    doAddItem(item, merchant);
  };

  const doAddItem = (item: MenuItem, merchant: Merchant) => {
    addItem(item, merchant.id, merchant.name);
    setAddedIds(prev => { const s = new Set(prev); s.add(item.id); return s; });
    setTimeout(() => {
      setAddedIds(prev => { const s = new Set(prev); s.delete(item.id); return s; });
    }, 1500);
  };

  // ===== COMPARE PRICES VIEW =====
  if (compareMode) {
    return (
      <div className="flex flex-col h-full bg-[#F8F9FA]">
        <div className="bg-white px-5 pt-12 pb-4 flex-shrink-0 border-b border-gray-100">
          <button onClick={() => setCompareMode(false)} className="flex items-center gap-2 text-gray-500 mb-3 active:opacity-70">
            <ArrowLeft size={18} /><span className="text-sm font-medium">Back to Merchants</span>
          </button>
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-[#2ECC71]" />
            <h1 className="text-[#2C3E50] text-xl font-bold">Compare Grocery Prices</h1>
          </div>
          <p className="text-gray-400 text-xs mt-1">See price differences across Puregold, SM & Robinsons</p>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {itemsLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 size={26} className="text-[#2ECC71] animate-spin" /></div>
          ) : error ? (
            <div className="flex flex-col items-center gap-2 py-12"><AlertCircle size={28} className="text-red-400" /><p className="text-red-500 text-sm font-medium">{error}</p></div>
          ) : (
            comparisons.map(comp => {
              const minPrice = Math.min(...comp.stores.map(s => s.price));
              const maxPrice = Math.max(...comp.stores.map(s => s.price_high ?? s.price));
              return (
                <div key={comp.item_name} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-[#2C3E50] font-bold text-sm">{comp.item_name}</p>
                    <span className="text-[#2ECC71] text-xs font-bold whitespace-nowrap">₱{minPrice} – ₱{maxPrice}</span>
                  </div>
                  <p className="text-gray-400 text-xs mb-3">{comp.manufacturer}{comp.brand && ` · ${comp.brand}`}</p>
                  <div className="space-y-1.5">
                    {comp.stores.map(s => {
                      const isCheapest = s.price === minPrice;
                      return (
                        <div key={s.store_id} className={`flex items-center justify-between rounded-lg px-3 py-2 ${isCheapest ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50'}`}>
                          <div className="flex items-center gap-1.5">
                            <Store size={12} className={isCheapest ? 'text-[#2ECC71]' : 'text-gray-400'} />
                            <span className="text-xs font-medium text-gray-700">{s.store_name}</span>
                            {isCheapest && <span className="text-[10px] font-bold text-[#2ECC71] bg-emerald-100 px-1.5 py-0.5 rounded-full">Best Price</span>}
                          </div>
                          <span className={`text-sm font-bold ${isCheapest ? 'text-[#2ECC71]' : 'text-gray-600'}`}>
                            {s.price_high ? `₱${s.price} – ₱${s.price_high}` : `₱${s.price}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // ===== SINGLE MERCHANT MENU VIEW =====
  if (selectedMerchant) {
    const grouped = items.reduce<Record<string, MenuItem[]>>((acc, item) => {
      (acc[item.category] ??= []).push(item);
      return acc;
    }, {});
    const catOrder = ['Food', 'Drink', 'Snacks', 'Grocery', 'Pharmacy', 'Retail'];
    const tabCats = ['All', 'Food', 'Drink', 'Snacks', 'Grocery'];
    const filteredItems = activeTab === 'All' ? items : items.filter(i => i.category === activeTab);
    const filteredGrouped = filteredItems.reduce<Record<string, MenuItem[]>>((acc, item) => {
      (acc[item.category] ??= []).push(item);
      return acc;
    }, {});

    return (
      <div className="flex flex-col h-full bg-[#F8F9FA]">
        <div className="bg-white px-5 pt-12 pb-4 flex-shrink-0 border-b border-gray-100">
          <button onClick={() => { setSelectedMerchant(null); setActiveTab('All'); }} className="flex items-center gap-2 text-gray-500 mb-3 active:opacity-70">
            <ArrowLeft size={18} /><span className="text-sm font-medium">Back to Merchants</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#2ECC71]/10 flex items-center justify-center">
              <Store size={22} className="text-[#2ECC71]" />
            </div>
            <div>
              <h1 className="text-[#2C3E50] text-xl font-bold">{selectedMerchant.name}</h1>
              {selectedMerchant.is_mall_tenant && selectedMerchant.mall_name ? (
                <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1"><MapPin size={10} /> Inside {selectedMerchant.mall_name}</p>
              ) : selectedMerchant.region ? (
                <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1"><MapPin size={10} /> {selectedMerchant.region}{selectedMerchant.mall_name ? ` · ${selectedMerchant.mall_name}` : ''}</p>
              ) : null}
            </div>
          </div>
        </div>
        {/* Category tab bar */}
        <div className="bg-white px-4 pb-3 flex-shrink-0 border-b border-gray-100">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {tabCats.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                  activeTab === tab
                    ? 'bg-[#2ECC71] text-white shadow-sm'
                    : 'bg-gray-50 text-gray-500 active:bg-gray-100'
                }`}
              >
                {tab === 'All' ? <Package size={12} /> : categoryIcon(tab)}
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {itemsLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 size={26} className="text-[#2ECC71] animate-spin" /></div>
          ) : error ? (
            <div className="flex flex-col items-center gap-2 py-12"><AlertCircle size={28} className="text-red-400" /><p className="text-red-500 text-sm font-medium">{error}</p></div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center"><Package size={32} className="text-gray-300" /><p className="text-gray-500 font-medium">No items in this category</p></div>
          ) : (
            catOrder.filter(c => filteredGrouped[c]).map(cat => (
              <div key={cat}>
                <div className="flex items-center gap-1.5 mb-2 px-1">
                  {categoryIcon(cat)}
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wide">{cat}</p>
                </div>
                <div className="space-y-2">
                  {filteredGrouped[cat].map(item => (
                    <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.item_name} loading="lazy" className="w-[60px] h-[60px] rounded-lg object-cover flex-shrink-0 border border-gray-100" />
                          ) : null}
                          <div className="flex-1 min-w-0">
                            <p className="text-[#2C3E50] font-semibold text-sm">{item.item_name}</p>
                            <p className="text-gray-400 text-xs mt-0.5">{item.manufacturer}</p>
                            {item.brand && (
                              <span className="inline-flex items-center gap-0.5 mt-1 text-[10px] font-medium text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">
                                <Tag size={9} />{item.brand}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <span className="text-[#2ECC71] font-bold text-sm whitespace-nowrap">{formatPrice(item)}</span>
                          <button
                            onClick={() => handleAddItem(item, selectedMerchant)}
                            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                              addedIds.has(item.id)
                                ? 'bg-[#2ECC71] text-white'
                                : 'bg-[#2ECC71]/10 text-[#2ECC71] active:bg-[#2ECC71]/20'
                            }`}
                          >
                            {addedIds.has(item.id) ? <Check size={13} /> : <Plus size={13} />}
                            {addedIds.has(item.id) ? 'Added' : 'Add'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // ===== CROSS-MERCHANT CONFIRM MODAL =====
  if (pendingItem) {
    return (
      <>
        <div className="flex flex-col h-full bg-[#F8F9FA]">
          <div className="bg-white px-5 pt-12 pb-4 flex-shrink-0 border-b border-gray-100">
            <button onClick={() => setSelectedMerchant(null)} className="flex items-center gap-2 text-gray-500 mb-3 active:opacity-70">
              <ArrowLeft size={18} /><span className="text-sm font-medium">Back to Merchants</span>
            </button>
          </div>
        </div>
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-6">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} className="text-amber-500" />
            </div>
            <h3 className="text-[#2C3E50] font-bold text-lg text-center mb-2">Replace cart items?</h3>
            <p className="text-gray-500 text-sm text-center mb-5">
              Your cart has items from <span className="font-semibold text-[#2C3E50]">{cartMerchantName}</span>.
              Adding from <span className="font-semibold text-[#2C3E50]">{pendingItem.merchant.name}</span> will clear your current cart.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPendingItem(null)}
                className="flex-1 bg-gray-100 text-gray-600 font-semibold py-3 rounded-xl text-sm active:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => { doAddItem(pendingItem.item, pendingItem.merchant); setPendingItem(null); }}
                className="flex-1 bg-[#2ECC71] text-white font-bold py-3 rounded-xl text-sm active:bg-emerald-600"
              >
                Replace & Add
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ===== MERCHANT LIST / CUSTOMER HOME =====
  return (
    <div className="flex flex-col h-full bg-[#F8F9FA]">
      {/* Light header */}
      <div className="bg-white px-5 pt-12 pb-4 flex-shrink-0 border-b border-gray-100">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 mb-3 active:opacity-70">
          <ArrowLeft size={18} /><span className="text-sm font-medium">Back</span>
        </button>

        {/* Deliver to */}
        <div className="flex items-center gap-1.5 mb-3">
          <MapPin size={14} className="text-[#2ECC71]" />
          <p className="text-gray-400 text-xs">Deliver to:</p>
          <p className="text-[#2C3E50] text-sm font-bold">Current Location</p>
        </div>

        {/* Search bar */}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search malls, cafes, hardware..."
            className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-9 pr-9 py-2.5 text-sm text-[#2C3E50] placeholder-gray-400 focus:outline-none focus:border-[#2ECC71]"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X size={14} className="text-gray-400" />
            </button>
          )}
        </div>

        {/* Region filter */}
        <div className="relative mb-3">
          <button
            onClick={() => setRegionOpen(v => !v)}
            className="w-full flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-sm text-[#2C3E50] font-medium"
          >
            <span>{region}</span>
            <ChevronRight size={14} className={`text-gray-400 transition-transform ${regionOpen ? 'rotate-90' : ''}`} />
          </button>
          {regionOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setRegionOpen(false)} />
              <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden">
                {REGIONS.map(r => (
                  <button key={r} onClick={() => { setRegion(r); setRegionOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-gray-50 ${r === region ? 'text-[#2ECC71]' : 'text-gray-700'}`}>
                    {r}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Service icons */}
        <div className="flex justify-between gap-2">
          {SERVICE_ICONS.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveService(prev => prev === s.id ? null : s.id)}
              className="flex flex-col items-center gap-1.5 flex-1"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                activeService === s.id ? 'bg-[#2ECC71] text-white' : 'bg-gray-50 text-[#2C3E50]'
              }`}>
                {s.icon}
              </div>
              <span className={`text-[10px] font-medium ${activeService === s.id ? 'text-[#2ECC71]' : 'text-gray-500'}`}>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Compare prices button */}
      <div className="px-4 pt-3 pb-1 flex-shrink-0">
        <button
          onClick={() => { setCompareMode(true); loadComparisons(); }}
          className="w-full bg-[#2ECC71]/10 border border-[#2ECC71]/20 rounded-xl px-4 py-2.5 flex items-center justify-between active:opacity-70"
        >
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-[#2ECC71]" />
            <p className="text-[#2C3E50] text-sm font-bold">Compare Grocery Prices</p>
          </div>
          <ChevronRight size={16} className="text-[#2ECC71]" />
        </button>
      </div>

      {/* Merchant cards */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 size={26} className="text-[#2ECC71] animate-spin" /></div>
        ) : error ? (
          <div className="flex flex-col items-center gap-2 py-8"><AlertCircle size={28} className="text-red-400" /><p className="text-red-500 text-sm font-medium">{error}</p><button onClick={load} className="text-[#2ECC71] text-sm font-medium">Retry</button></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center"><Store size={32} className="text-gray-300" /><p className="text-gray-500 font-medium">No merchants found</p><p className="text-gray-400 text-sm">Try a different region or search</p></div>
        ) : (
          filtered.map(m => {
            const dispCat = merchantDisplayCategory(m);
            const catIcon = dispCat === 'Food' ? <Utensils size={20} /> : dispCat === 'Retail' ? <Wrench size={20} /> : dispCat === 'Mall' ? <HomeIcon size={20} /> : <ShoppingCart size={20} />;
            return (
              <button
                key={m.id}
                onClick={() => openMerchant(m)}
                className="w-full text-left bg-white rounded-xl border border-gray-100 shadow-sm p-4 active:scale-[0.98] transition-transform hover:shadow-md flex items-center gap-3"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 text-[#2C3E50]">
                  {catIcon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#2C3E50] font-bold text-sm truncate">{m.name}</p>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="text-[10px] font-semibold text-gray-500 bg-gray-50 px-2 py-0.5 rounded">{dispCat}</span>
                    {m.is_mall_tenant && m.mall_name ? (
                      <span className="text-[10px] font-medium text-gray-400 flex items-center gap-0.5">
                        <MapPin size={9} /> Inside {m.mall_name}
                      </span>
                    ) : m.mall_name ? (
                      <span className="text-[10px] font-medium text-gray-400 flex items-center gap-0.5">
                        <MapPin size={9} /> {m.mall_name}
                      </span>
                    ) : m.region ? (
                      <span className="text-[10px] font-medium text-gray-400 flex items-center gap-0.5">
                        <MapPin size={9} /> {m.region}
                      </span>
                    ) : null}
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-300 flex-shrink-0" />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
