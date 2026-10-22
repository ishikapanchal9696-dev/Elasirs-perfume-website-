import { createClient } from '@supabase/supabase-js';
import { Order } from '../types';

export const SUPABASE_PROJECT_ID = 'qqdeyoeizckirrycjtdj';
export const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://qqdeyoeizckirrycjtdj.supabase.co';
export const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_90Pz9MWXwOk-Z59l35K5SQ_cyUWgqhH';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Client-side order saving helper directly to Supabase
 */
export async function saveOrderToSupabaseClient(order: Order): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = {
      id: order.id,
      order_number: order.orderNumber,
      user_id: order.userId || null,
      customer_name: order.customerName,
      email: order.email,
      phone: order.phone || null,
      shipping_address: order.shippingAddress,
      items: order.items,
      subtotal: order.subtotal,
      discount: order.discount || 0,
      shipping_cost: order.shippingCost || 0,
      taxes: order.taxes || 0,
      total: order.total,
      payment_method: order.paymentMethod,
      payment_status: order.paymentStatus,
      payment_id: order.paymentId || null,
      status: order.status,
      tracking_number: order.trackingNumber || null,
      courier_provider: order.courierProvider || 'Blue Dart Air Express (Insured)',
      estimated_delivery: order.estimatedDelivery || null,
      created_at: order.createdAt || new Date().toISOString(),
    };

    const { error } = await supabase
      .from('orders')
      .upsert([payload], { onConflict: 'order_number' });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save to Supabase' };
  }
}
