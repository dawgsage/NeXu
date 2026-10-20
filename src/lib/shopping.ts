import { supabase } from '@/lib/supabase';

export type ShoppingItem = {
  id: string;
  order_id: string;
  item_name: string;
  barcode: string | null;
  is_scanned: boolean;
  proof_image_url: string | null;
  created_at: string;
};

export async function fetchShoppingItems(orderId: string): Promise<ShoppingItem[]> {
  const { data, error } = await supabase
    .from('shopping_list')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data as ShoppingItem[]) ?? [];
}

export async function markItemScanned(itemId: string): Promise<void> {
  const { error } = await supabase
    .from('shopping_list')
    .update({ is_scanned: true })
    .eq('id', itemId);
  if (error) throw error;
}

export async function markItemDemoScanned(itemId: string, currentName: string): Promise<void> {
  const { error } = await supabase
    .from('shopping_list')
    .update({ is_scanned: true, item_name: `${currentName} [Verified via Demo]` })
    .eq('id', itemId);
  if (error) throw error;
}

export async function markItemWithProof(itemId: string, imageUrl: string): Promise<void> {
  const { error } = await supabase
    .from('shopping_list')
    .update({ is_scanned: true, proof_image_url: imageUrl })
    .eq('id', itemId);
  if (error) throw error;
}

export async function uploadProofPhoto(orderId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${orderId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from('product_photos')
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;

  const { data } = supabase.storage
    .from('product_photos')
    .getPublicUrl(path);
  return data.publicUrl;
}

export async function fetchOpenFoodFacts(barcode: string): Promise<{ name: string; brand: string } | null> {
  const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
  if (!res.ok) return null;
  const json = await res.json();
  if (json.status !== 1 || !json.product) return null;
  return {
    name: json.product.product_name ?? json.product.generic_name ?? 'Unknown product',
    brand: json.product.brands ?? '',
  };
}
