import { supabase } from '@/lib/supabase';

export type MenuItem = {
  id: string;
  merchant_id: string;
  item_name: string;
  price: number;
  price_high: number | null;
  manufacturer: string;
  brand: string | null;
  category: string;
  created_at: string;
  image_url: string | null;
};

export type MerchantWithItems = {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  is_active: boolean;
  items: MenuItem[];
};

export async function fetchMenuByMerchant(merchantId: string): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('merchant_id', merchantId)
    .order('category', { ascending: true });
  if (error) throw error;
  return (data as MenuItem[]) ?? [];
}

export async function fetchAllMenuItems(): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('item_name', { ascending: true });
  if (error) throw error;
  return (data as MenuItem[]) ?? [];
}

export type PriceComparison = {
  item_name: string;
  manufacturer: string;
  brand: string | null;
  category: string;
  stores: { store_id: string; store_name: string; price: number; price_high: number | null }[];
};

export async function fetchGroceryComparisons(): Promise<PriceComparison[]> {
  const { data: items, error } = await supabase
    .from('menu_items')
    .select('*, merchants(name)')
    .eq('category', 'Grocery')
    .order('item_name', { ascending: true });
  if (error) throw error;

  const raw = items as any[];
  const groups: Record<string, PriceComparison> = {};
  for (const row of raw) {
    if (!groups[row.item_name]) {
      groups[row.item_name] = {
        item_name: row.item_name,
        manufacturer: row.manufacturer,
        brand: row.brand,
        category: row.category,
        stores: [],
      };
    }
    groups[row.item_name].stores.push({
      store_id: row.merchant_id,
      store_name: row.merchants?.name ?? 'Unknown',
      price: Number(row.price),
      price_high: row.price_high ? Number(row.price_high) : null,
    });
  }
  return Object.values(groups);
}
