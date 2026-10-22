import { createClient } from '@supabase/supabase-js';
import { Order } from '../types';

export const SUPABASE_PROJECT_ID = 'qqdeyoeizckirrycjtdj';
export const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qqdeyoeizckirrycjtdj.supabase.co';
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_90Pz9MWXwOk-Z59l35K5SQ_cyUWgqhH';

export const supabaseServer = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export interface SupabaseHealthResult {
  connected: boolean;
  tableExists: boolean;
  projectId: string;
  url: string;
  error?: string;
  message: string;
  orderCount?: number;
}

/**
 * Checks connection to Supabase and verifies whether the orders table exists
 */
export async function checkSupabaseHealth(): Promise<SupabaseHealthResult> {
  try {
    const { count, error } = await supabaseServer
      .from('orders')
      .select('id', { count: 'exact' })
      .limit(1);

    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        return {
          connected: true,
          tableExists: false,
          projectId: SUPABASE_PROJECT_ID,
          url: SUPABASE_URL,
          error: error.message,
          message: "Connected to Supabase, but the 'orders' table has not been created yet in the SQL editor.",
        };
      }
      return {
        connected: false,
        tableExists: false,
        projectId: SUPABASE_PROJECT_ID,
        url: SUPABASE_URL,
        error: error.message,
        message: `Supabase error: ${error.message}`,
      };
    }

    return {
      connected: true,
      tableExists: true,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      orderCount: count || 0,
      message: "Successfully connected to Supabase and 'orders' table is ready.",
    };
  } catch (err: any) {
    return {
      connected: false,
      tableExists: false,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      error: err?.message || 'Unknown network error',
      message: 'Failed to reach Supabase backend.',
    };
  }
}

/**
 * Inserts a customer order into the Supabase orders table
 */
export async function insertOrderToSupabase(order: Order): Promise<{ success: boolean; error?: string; data?: any }> {
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

    const { data, error } = await supabaseServer
      .from('orders')
      .upsert([payload], { onConflict: 'order_number' })
      .select();

    if (error) {
      console.warn(`[Supabase] Could not insert order into 'orders' table (${error.code}):`, error.message);
      return { success: false, error: error.message };
    }

    console.log(`[Supabase] Order ${order.orderNumber} successfully saved to Supabase!`);
    return { success: true, data };
  } catch (err: any) {
    console.error('[Supabase] Exception while inserting order:', err);
    return { success: false, error: err?.message || 'Network exception' };
  }
}

/**
 * Fetches recent orders stored in Supabase
 */
export async function fetchOrdersFromSupabase(): Promise<Order[]> {
  try {
    const { data, error } = await supabaseServer
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !data) {
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      orderNumber: row.order_number,
      userId: row.user_id,
      customerName: row.customer_name,
      email: row.email,
      phone: row.phone,
      shippingAddress: row.shipping_address,
      items: row.items || [],
      subtotal: Number(row.subtotal),
      discount: Number(row.discount || 0),
      shippingCost: Number(row.shipping_cost || 0),
      taxes: Number(row.taxes || 0),
      total: Number(row.total),
      paymentMethod: row.payment_method,
      paymentStatus: row.payment_status,
      paymentId: row.payment_id,
      status: row.status,
      trackingNumber: row.tracking_number,
      courierProvider: row.courier_provider,
      estimatedDelivery: row.estimated_delivery,
      createdAt: row.created_at,
    }));
  } catch {
    return [];
  }
}
