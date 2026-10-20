import { supabase } from '@/lib/supabase';

export type Merchant = {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  is_active: boolean;
  created_at: string;
  region: string | null;
  mall_name: string | null;
  latitude: number | null;
  longitude: number | null;
  is_mall_tenant: boolean;
};

export async function fetchMerchants(): Promise<Merchant[]> {
  const { data, error } = await supabase
    .from('merchants')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Merchant[]) ?? [];
}

export async function toggleMerchantActive(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from('merchants')
    .update({ is_active: isActive })
    .eq('id', id);
  if (error) throw error;
}
