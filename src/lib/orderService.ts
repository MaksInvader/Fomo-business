import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import dayjs from 'dayjs';
import { MENU_LOOKUP } from '../constants/menu';
import type { MenuSlug } from '../types/menu';
import type { OrderInput, OrderRecord, OrderStatus } from '../types/order';
import { getDb, isFirebaseConfigured } from './firebase';

const ORDERS_COLLECTION = 'orders';
const MAX_ID_ATTEMPTS = 10;

const randomLetter = () => String.fromCharCode(65 + Math.floor(Math.random() * 26));
const randomThreeDigits = () => Math.floor(Math.random() * 1000)
  .toString()
  .padStart(3, '0');

const buildOrderId = () => `${randomLetter()}${randomLetter()}${randomThreeDigits()}`;

const buildQrPayload = (order: { orderId: string; totalPrice: number; name: string }) =>
  `000201FOMOSANDWICH|ORDER:${order.orderId}|NAME:${order.name}|TOTAL:${order.totalPrice}`;

const ensureFirebase = () => {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Firebase environment variables are missing. Please configure them in a .env file.',
    );
  }
};

const ordersDocRef = (orderId: string) => doc(getDb(), ORDERS_COLLECTION, orderId);

export const generateUniqueOrderId = async (): Promise<string> => {
  ensureFirebase();

  for (let attempt = 0; attempt < MAX_ID_ATTEMPTS; attempt += 1) {
    const candidate = buildOrderId();
    const existing = await getDoc(ordersDocRef(candidate));
    if (!existing.exists()) {
      return candidate;
    }
  }

  throw new Error('Unable to generate a unique order number. Please try again.');
};

export const createOrder = async (input: OrderInput): Promise<OrderRecord> => {
  ensureFirebase();

  if (!input.items.length) {
    throw new Error('Please select at least one sandwich to order.');
  }

  const detailedItems = input.items.map((item) => {
    const menuItem = MENU_LOOKUP[item.itemId];
    if (!menuItem) {
      throw new Error('Menu item not found.');
    }

    const quantity = item.quantity;
    const unitPrice = menuItem.price;
    const lineTotal = unitPrice * quantity;

    return {
      itemId: item.itemId,
      itemName: menuItem.name,
      quantity,
      unitPrice,
      lineTotal,
    };
  });

  const totalPrice = detailedItems.reduce((sum, current) => sum + current.lineTotal, 0);
  const orderId = await generateUniqueOrderId();

  const record: OrderRecord = {
    orderId,
    name: input.name,
    phone: input.phone,
    items: detailedItems,
    deliveryMethod: input.deliveryMethod,
    deliveryDate: input.deliveryDate,
    deliveryTime: input.deliveryTime,
    paymentMethod: input.paymentMethod,
    notes: input.notes,
    totalPrice,
    status: 'Pending',
    createdAt: dayjs().toISOString(),
    qrPayload:
      input.paymentMethod === 'QRIS'
        ? buildQrPayload({ orderId, totalPrice, name: input.name })
        : undefined,
  };

  await setDoc(ordersDocRef(orderId), record);

  return record;
};

export const getOrderById = async (orderId: string): Promise<OrderRecord | null> => {
  ensureFirebase();
  const snapshot = await getDoc(ordersDocRef(orderId));
  return snapshot.exists() ? (snapshot.data() as OrderRecord) : null;
};

export const cancelOrder = async (orderId: string): Promise<OrderRecord> => {
  ensureFirebase();
  const snapshot = await getDoc(ordersDocRef(orderId));

  if (!snapshot.exists()) {
    throw new Error('Order not found.');
  }

  const order = snapshot.data() as OrderRecord;

  if (order.status !== 'Pending') {
    throw new Error('Order can only be cancelled while status is Pending.');
  }

  const cancelledAt = dayjs().toISOString();
  const updated: OrderRecord = {
    ...order,
    status: 'Cancelled',
    createdAt: order.createdAt,
    cancelledAt,
  };

  await updateDoc(ordersDocRef(orderId), {
    status: 'Cancelled',
    cancelledAt,
  });

  return updated;
};

export const statusLabel = (status: OrderStatus): string => {
  const labels: Record<OrderStatus, string> = {
    Pending: 'Pending',
    Preparing: 'Preparing',
    'Out for Delivery': 'Out for Delivery',
    Completed: 'Completed',
    Cancelled: 'Cancelled',
  };

  return labels[status];
};

export const sanitizeOrderId = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, '');

export const isMenuSlug = (value: string): value is MenuSlug =>
  ['chicken-sandwich', 'fruity-sandwich', 'spicy-egg-sandwich'].includes(value);
