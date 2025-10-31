import type { MenuSlug } from './menu';

export type DeliveryMethod = 'Delivery' | 'Pickup';

export type PaymentMethod = 'QRIS' | 'COD';

export type OrderStatus = 'Pending' | 'Preparing' | 'Out for Delivery' | 'Completed' | 'Cancelled';

export interface OrderItemRequest {
  itemId: MenuSlug;
  quantity: number;
}

export interface OrderItem {
  itemId: MenuSlug;
  itemName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderInput {
  name: string;
  phone: string;
  items: OrderItemRequest[];
  deliveryMethod: DeliveryMethod;
  deliveryDate: string; // YYYY-MM-DD
  deliveryTime?: string; // HH:mm (optional)
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface OrderRecord {
  orderId: string;
  name: string;
  phone: string;
  items: OrderItem[];
  deliveryMethod: DeliveryMethod;
  deliveryDate: string;
  deliveryTime?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  qrPayload?: string;
  cancelledAt?: string;
}
