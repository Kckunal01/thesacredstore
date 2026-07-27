import { supabase } from '../lib/supabase';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const COLUMNS =
  'id, order_id, created_at, status, payment_status, amount, tracking_id';

async function queryColumn(column, value) {
  const { data, error, status } = await supabase
    .from('orders')
    .select(COLUMNS)
    .eq(column, value)
    .limit(1);

  if (error) {
    throw { column, value, status, error };
  }
  return data && data.length > 0 ? data[0] : null;
}

export async function getOrder(identifier) {
  const id = (identifier || '').trim();

  if (!id) {
    return { success: false, code: 'EMPTY_INPUT', error: 'Identifier is empty.' };
  }

  try {
    // 1. Search by order_id
    const byOrderId = await queryColumn('order_id', id);
    if (byOrderId) return { success: true, order: byOrderId };

    // 2. Search by tracking_id
    const byTrackingId = await queryColumn('tracking_id', id);
    if (byTrackingId) return { success: true, order: byTrackingId };

    // 3. Search by UUID primary key ONLY if input is a valid UUID
    if (UUID_REGEX.test(id)) {
      const byId = await queryColumn('id', id);
      if (byId) return { success: true, order: byId };
    }

    return { success: true, order: null };
  } catch (thrown) {
    console.error('[orderTrackingService] query failed:', thrown);
    return { success: false, code: 'DATABASE_ERROR', error: thrown };
  }
}
