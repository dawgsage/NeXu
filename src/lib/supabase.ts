import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

export type Order = {
  id: string;
  pickup: string;
  dropoff: string;
  fare: number;
  distance: number;
  vehicle_type: string;
  note: string;
  status: string;
  created_at: string;
  pickup_lat: number | null;
  pickup_lng: number | null;
  dropoff_lat: number | null;
  dropoff_lng: number | null;
  toll_fee: number;
  category: string;
  multi_store: boolean;
  payment_methods: string[];
  scheduled_time: string | null;
  customer_name: string;
};

export type Category = 'All' | 'Food' | 'Grocery' | 'Pabili' | 'Parcel';

export const VEHICLE_TYPES = ['All', 'Motorcycle', 'Car', 'Tricycle', 'Van'] as const;
export const CATEGORIES: Category[] = ['All', 'Food', 'Grocery', 'Pabili', 'Parcel'];

export const totalPayable = (o: { fare: number; toll_fee: number }) => o.fare + o.toll_fee;

export const formatPeso = (n: number) => `₱${n.toLocaleString()}`;
