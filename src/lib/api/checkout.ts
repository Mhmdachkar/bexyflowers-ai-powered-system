/**
 * Checkout API
 * Saves customer info and order details to checkout_orders table.
 */

import { db } from './database-client';
import type { CartItem } from '@/types/cart';

export interface CheckoutOrderInput {
  fullName: string;
  phone: string;
  email: string;
  location: string;
  orderItems: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export interface CheckoutOrderRecord {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  location: string;
  order_items: CartItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  created_at: string;
}

export interface CheckoutOrderImportInput {
  fullName: string;
  phone: string;
  email: string;
  location: string;
  orderItems: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt?: string;
}

/**
 * Submit checkout order – saves customer info and order to database.
 */
export async function submitCheckoutOrder(input: CheckoutOrderInput): Promise<CheckoutOrderRecord> {
  const payload = {
    full_name: input.fullName.trim(),
    phone: input.phone.trim(),
    email: input.email.trim().toLowerCase(),
    location: input.location.trim(),
    order_items: input.orderItems,
    subtotal: Number(input.subtotal.toFixed(2)),
    delivery_fee: Number(input.deliveryFee.toFixed(2)),
    total: Number(input.total.toFixed(2)),
  };

  const result = await db.insert<CheckoutOrderRecord[]>('checkout_orders', payload, {
    select: 'id, full_name, phone, email, location, order_items, subtotal, delivery_fee, total, created_at',
  });

  const rows = Array.isArray(result) ? result : [result];
  if (!rows[0]) {
    throw new Error('Checkout order could not be saved');
  }
  return rows[0];
}

/**
 * Fetch all checkout orders (admin) – latest first.
 */
export async function getCheckoutOrders(): Promise<CheckoutOrderRecord[]> {
  const data = await db.select<CheckoutOrderRecord>('checkout_orders', {
    orderBy: { column: 'created_at', ascending: false },
    select: 'id, full_name, phone, email, location, order_items, subtotal, delivery_fee, total, created_at',
  });
  return Array.isArray(data) ? data : [];
}

/**
 * Bulk import checkout orders (admin) – inserts multiple rows.
 */
export async function importCheckoutOrders(
  rows: CheckoutOrderImportInput[]
): Promise<CheckoutOrderRecord[]> {
  if (!Array.isArray(rows) || rows.length === 0) return [];

  const payload = rows.map((row) => ({
    full_name: row.fullName.trim(),
    phone: row.phone.trim(),
    email: row.email.trim().toLowerCase(),
    location: row.location.trim(),
    order_items: Array.isArray(row.orderItems) ? row.orderItems : [],
    subtotal: Number(Number(row.subtotal || 0).toFixed(2)),
    delivery_fee: Number(Number(row.deliveryFee || 0).toFixed(2)),
    total: Number(Number(row.total || 0).toFixed(2)),
    ...(row.createdAt ? { created_at: row.createdAt } : {}),
  }));

  const result = await db.insert<CheckoutOrderRecord[]>('checkout_orders', payload, {
    select: 'id, full_name, phone, email, location, order_items, subtotal, delivery_fee, total, created_at',
  });

  const inserted = Array.isArray(result) ? result : [result];
  return inserted.filter(Boolean) as CheckoutOrderRecord[];
}
