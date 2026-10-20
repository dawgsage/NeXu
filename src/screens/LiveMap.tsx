import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { supabase, type Order, formatPeso, totalPayable } from '@/lib/supabase';
import { fetchMerchants, type Merchant } from '@/lib/merchants';

const orderIcon = L.divIcon({
  html: '<div style="width:24px;height:24px;border-radius:50%;background:#2ECC71;border:3px solid #001F3F;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const merchantIcon = L.divIcon({
  html: '<div style="width:22px;height:22px;border-radius:6px;background:#001F3F;border:2px solid #2ECC71;display:flex;align-items:center;justify-content:center;color:#2ECC71;font-size:12px;font-weight:bold">M</div>',
  className: '',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

export default function LiveMap() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [orderData, merchantData] = await Promise.all([
          supabase.from('orders').select('*').eq('status', 'Available'),
          fetchMerchants(),
        ]);
        if (orderData.error) throw orderData.error;
        setOrders((orderData.data as Order[]) ?? []);
        setMerchants(merchantData);
        setError(null);
      } catch (e) {
        setError((e as Error).message);
      }
      setLoading(false);
    };
    load();

    const channel = supabase.channel('admin-map').on(
      'postgres_changes', { event: '*', schema: 'public', table: 'orders' }, load
    ).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Center on Luzon (midpoint of all coverage regions)
  const center: [number, number] = [15.0, 120.8];

  // Auto-fit map bounds to all merchant markers once loaded
  useEffect(() => {
    if (!mapRef.current || loading || merchants.length === 0) return;
    const activeMerchants = merchants.filter(m => m.is_active);
    if (activeMerchants.length === 0) return;
    const bounds = L.latLngBounds(activeMerchants.map(m => [m.lat, m.lng] as [number, number]));
    mapRef.current.fitBounds(bounds, { padding: [40, 40] });
  }, [loading, merchants]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-[#2C3E50] text-2xl font-bold">Live Map</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {orders.length} available orders · {merchants.filter(m => m.is_active).length} active merchants
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4 flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={{ height: '70vh', minHeight: '400px' }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <RefreshCw size={28} className="text-[#2ECC71] animate-spin" />
          </div>
        ) : (
          <MapContainer
            center={center}
            zoom={8}
            style={{ height: '100%', width: '100%' }}
            ref={(m) => { if (m) mapRef.current = m; }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />

            {/* Order markers */}
            {orders.filter(o => o.dropoff_lat && o.dropoff_lng).map(order => (
              <Marker
                key={order.id}
                position={[order.dropoff_lat!, order.dropoff_lng!]}
                icon={orderIcon}
              >
                <Popup>
                  <div style={{ minWidth: '180px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                      <strong style={{ color: '#001F3F', fontSize: '13px' }}>{order.pickup}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#666', fontSize: '12px', marginBottom: '6px' }}>
                      → {order.dropoff}
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2ECC71' }}>
                      {formatPeso(totalPayable(order))}
                    </div>
                    <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                      {order.vehicle_type} · {order.distance}km · {order.category}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Merchant markers */}
            {merchants.filter(m => m.is_active).map(merchant => (
              <Marker
                key={merchant.id}
                position={[merchant.lat, merchant.lng]}
                icon={merchantIcon}
              >
                <Popup>
                  <div style={{ minWidth: '150px' }}>
                    <strong style={{ color: '#001F3F', fontSize: '13px' }}>{merchant.name}</strong>
                    <div style={{ fontSize: '11px', color: '#2ECC71', marginTop: '4px', fontWeight: '600' }}>
                      {merchant.category}
                    </div>
                    <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                      {merchant.lat}, {merchant.lng}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#2ECC71] border-2 border-[#001F3F]" />
          Available Order
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#001F3F] border border-[#2ECC71]" />
          Active Merchant
        </div>
      </div>
    </div>
  );
}
