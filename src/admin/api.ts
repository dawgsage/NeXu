import { supabase, type Order, VEHICLE_TYPES, CATEGORIES } from '@/lib/supabase';

export type DriverProfile = {
  id: string;
  vehicle: string;
  status: string;
  created_at: string;
};

export const ORDER_STATUSES = ['Available', 'Accepted', 'Delivered', 'Cancelled'] as const;

export async function fetchAllOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Order[]) ?? [];
}

export async function updateOrderStatus(id: string, status: string): Promise<void> {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function createOrder(input: {
  pickup: string;
  dropoff: string;
  fare: number;
  distance: number;
  vehicle_type: string;
  category: string;
  note?: string;
}): Promise<void> {
  const { error } = await supabase.from('orders').insert({
    pickup: input.pickup,
    dropoff: input.dropoff,
    fare: input.fare,
    distance: input.distance,
    vehicle_type: input.vehicle_type,
    category: input.category,
    note: input.note ?? '',
    status: 'Available',
    toll_fee: 0,
    multi_store: false,
    payment_methods: ['Cash'],
  });
  if (error) throw error;
}

export async function fetchDrivers(): Promise<DriverProfile[]> {
  const { data, error } = await supabase
    .from('driver_profile')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as DriverProfile[]) ?? [];
}

export { VEHICLE_TYPES, CATEGORIES };
