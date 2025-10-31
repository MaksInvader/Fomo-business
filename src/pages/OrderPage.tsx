import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import weekday from 'dayjs/plugin/weekday';
import { useEffect, useMemo, useState } from 'react';
import QRCode from 'react-qr-code';
import { useFieldArray, useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { MENU_ITEMS, MENU_LOOKUP } from '../constants/menu';
import { createOrder, isMenuSlug } from '../lib/orderService';
import type { OrderInput, OrderRecord, PaymentMethod } from '../types/order';
import { formatCurrency, formatDateDisplay, formatTimeDisplay } from '../utils/format';

dayjs.extend(customParseFormat);
dayjs.extend(weekday);

const menuIds = ['chicken-sandwich', 'fruity-sandwich', 'spicy-egg-sandwich'] as const;

const orderItemSchema = z.object({
  itemId: z.enum(menuIds),
  quantity: z
    .number()
    .refine((value) => Number.isFinite(value), 'Enter a valid quantity')
    .int('Quantity must be a whole number')
    .min(1, 'Minimum 1 sandwich')
    .max(20, 'Maximum 20 sandwiches per line item'),
});

const orderSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z
    .string()
    .min(8, 'Enter a valid WhatsApp number')
    .regex(/^[0-9+\s-]+$/, 'Only digits, spaces, dash, or + allowed')
    .transform((value) => value.replace(/\s+/g, ' ').trim()),
  items: z
    .array(orderItemSchema)
    .min(1, 'Pick at least one sandwich')
    .max(10, 'For larger events, contact us directly for catering.'),
  deliveryMethod: z.enum(['Delivery', 'Pickup']),
  deliveryDate: z
    .string()
    .refine((value) => dayjs(value, 'YYYY-MM-DD', true).isValid(), 'Choose a valid date')
    .refine(
      (value) =>
        dayjs(value).startOf('day').isSame(dayjs().startOf('day')) ||
        dayjs(value).startOf('day').isAfter(dayjs().startOf('day')),
      'Delivery date cannot be in the past',
    ),
  deliveryTime: z
    .string()
    .transform((value) => (value && value.trim() ? value : undefined))
    .refine((value) => !value || dayjs(value, 'HH:mm', true).isValid(), 'Provide a valid time'),
  paymentMethod: z.enum(['QRIS', 'COD']),
  notes: z
    .string()
    .max(300, 'Notes must stay under 300 characters')
    .transform((value) => (value.trim() ? value.trim() : undefined)),
});

type OrderFormFields = z.input<typeof orderSchema>;
type OrderFormValues = z.output<typeof orderSchema>;

const minDate = dayjs().format('YYYY-MM-DD');
const qrLifetimeSeconds = 10 * 60;

const paymentCopy: Record<PaymentMethod, { title: string; description: string }> = {
  QRIS: {
    title: 'Instant QRIS payment',
    description: 'Scan the smart QR code and complete payment within 10 minutes to secure your slot.',
  },
  COD: {
    title: 'Cash on Delivery',
    description: 'Pay in cash with the rider. Please prepare the exact amount if possible.',
  },
};

const OrderPage = () => {
  const [searchParams] = useSearchParams();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<OrderRecord | null>(null);
  const [countdown, setCountdown] = useState(qrLifetimeSeconds);
  const [copied, setCopied] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<OrderFormFields, undefined, OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      name: '',
      phone: '',
      items: [{ itemId: 'chicken-sandwich', quantity: 1 }],
      deliveryMethod: 'Delivery',
      deliveryDate: minDate,
      deliveryTime: '',
      paymentMethod: 'QRIS',
      notes: '',
    },
  });

  const { fields: itemFields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedItems = watch('items');
  const deliveryMethod = watch('deliveryMethod');
  const deliveryDateValue = watch('deliveryDate');
  const deliveryTimeValue = watch('deliveryTime');
  const paymentMethod = watch('paymentMethod');

  type ComputedItem = {
    key: string;
    slug: (typeof menuIds)[number];
    name: string;
    image: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  };

  const computedItems = useMemo<ComputedItem[]>(() => {
    if (!watchedItems || !Array.isArray(watchedItems)) {
      return [];
    }

    return watchedItems
      .map((item, index) => {
        const menuItem = MENU_LOOKUP[item.itemId];
        if (!menuItem) {
          return null;
        }

        const rawQuantity = Number(item?.quantity ?? 0);
        const safeQuantity = Number.isFinite(rawQuantity) ? Math.max(rawQuantity, 0) : 0;

        return {
          key: `${item.itemId}-${index}`,
          slug: item.itemId,
          name: menuItem.name,
          image: menuItem.image,
          unitPrice: menuItem.price,
          quantity: safeQuantity,
          lineTotal: menuItem.price * safeQuantity,
        };
      })
      .filter((value): value is ComputedItem => Boolean(value));
  }, [watchedItems]);

  const totalPrice = computedItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const primaryItem = computedItems[0];
  const formattedDate =
    deliveryDateValue && dayjs(deliveryDateValue, 'YYYY-MM-DD', true).isValid()
      ? formatDateDisplay(deliveryDateValue)
      : '—';
  const formattedTime = formatTimeDisplay(deliveryTimeValue);
  const summaryMeta = [
    { label: 'Delivery Method', value: deliveryMethod },
    { label: 'Preferred Date', value: formattedDate },
    { label: 'Preferred Time', value: formattedTime },
    { label: 'Payment Method', value: paymentMethod },
    { label: 'Total Price', value: formatCurrency(totalPrice) },
  ];
  const canAddMoreItems = itemFields.length < 10;

  useEffect(() => {
    const itemParam = searchParams.get('item');
    if (itemParam && isMenuSlug(itemParam)) {
      setValue('items.0.itemId', itemParam);
    }
  }, [searchParams, setValue]);

  useEffect(() => {
    if (!submittedOrder || submittedOrder.paymentMethod !== 'QRIS') {
      return undefined;
    }

    setCountdown(qrLifetimeSeconds);
    const interval = window.setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [submittedOrder]);

  const onSubmit: SubmitHandler<OrderFormValues> = async (values) => {
    setSubmitError(null);
    setIsSubmitting(true);
    setCopied(false);
    try {
      const payload: OrderInput = {
        name: values.name,
        phone: values.phone,
        items: values.items.map((item) => ({
          itemId: item.itemId,
          quantity: item.quantity,
        })),
        deliveryMethod: values.deliveryMethod,
        deliveryDate: values.deliveryDate,
        deliveryTime: values.deliveryTime,
        paymentMethod: values.paymentMethod,
        notes: values.notes,
      };

      const order = await createOrder(payload);
      setSubmittedOrder(order);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Something went wrong while placing your order. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  const resetForm = () => {
    reset();
    setSubmittedOrder(null);
    setCountdown(qrLifetimeSeconds);
    setCopied(false);
  };

  const countdownLabel = `${String(Math.floor(countdown / 60)).padStart(2, '0')}:${String(countdown % 60).padStart(2, '0')}`;

  const copyOrderId = async () => {
    if (!submittedOrder) return;
    try {
      await navigator.clipboard.writeText(submittedOrder.orderId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="bg-white/70 pb-24">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-strawberry">Order form</p>
            <h1 className="font-display text-3xl text-brand-charcoal md:text-4xl">
              Build your FOMO sandwich order
            </h1>
          </div>
          <p className="max-w-lg text-sm leading-6 text-brand-charcoal/80">
            Fill in the details below. A unique order number (format AA999) will be issued instantly together with
            payment instructions. You may cancel while status is <strong>Pending</strong>.
          </p>
        </div>

        {submittedOrder ? (
          <section
            aria-live="polite"
            className="mt-10 grid gap-8 rounded-[2.5rem] border-2 border-brand-strawberry/30 bg-white p-8 shadow-xl shadow-brand-strawberry/20 lg:grid-cols-[1.1fr_0.9fr]"
          >
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <header>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-strawberry">Order ID</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="font-display text-4xl text-brand-charcoal">{submittedOrder.orderId}</span>
                    <button
                      type="button"
                      onClick={copyOrderId}
                      className="rounded-full border border-brand-strawberry px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-strawberry transition hover:bg-brand-strawberry hover:text-white"
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </header>
                <div className="rounded-full bg-brand-yellow/70 px-4 py-2 text-sm font-semibold text-brand-charcoal">
                  Status: {submittedOrder.status}
                </div>
              </div>
              <dl className="grid gap-4 text-sm text-brand-charcoal/80 sm:grid-cols-2">
                <div>
                  <dt className="font-semibold text-brand-charcoal">Name</dt>
                  <dd>{submittedOrder.name}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-brand-charcoal">WhatsApp</dt>
                  <dd>{submittedOrder.phone}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="font-semibold text-brand-charcoal">Sandwiches</dt>
                  <dd>
                    <ul className="mt-2 space-y-2 rounded-2xl bg-brand-cream/60 p-3 text-sm">
                      {submittedOrder.items.map((item, index) => (
                        <li key={`${item.itemId}-${index}`} className="flex items-center justify-between gap-3">
                          <span>{item.itemName}</span>
                          <span className="text-xs uppercase tracking-[0.2em] text-brand-charcoal/70">
                            {item.quantity} pcs · {formatCurrency(item.lineTotal)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-brand-charcoal">Delivery Method</dt>
                  <dd>{submittedOrder.deliveryMethod}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-brand-charcoal">Preferred Date</dt>
                  <dd>{formatDateDisplay(submittedOrder.deliveryDate)}</dd>
                </div>
                {submittedOrder.deliveryTime ? (
                  <div>
                    <dt className="font-semibold text-brand-charcoal">Preferred Time</dt>
                    <dd>{formatTimeDisplay(submittedOrder.deliveryTime)}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="font-semibold text-brand-charcoal">Payment Method</dt>
                  <dd>{submittedOrder.paymentMethod}</dd>
                </div>
              </dl>
              <div className="rounded-[1.5rem] bg-brand-cream/80 p-5 shadow-inner">
                <p className="text-sm font-semibold text-brand-charcoal/70">Total due</p>
                <p className="mt-2 font-display text-3xl text-brand-strawberry">{formatCurrency(submittedOrder.totalPrice)}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-brand-strawberry px-4 py-2 text-sm font-semibold text-brand-strawberry transition hover:bg-brand-strawberry hover:text-white"
                >
                  Place another order
                </button>
                <a
                  href="/track"
                  className="rounded-full bg-brand-leaf px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-brand-strawberry"
                >
                  Track this order
                </a>
              </div>
            </div>

            <div className="space-y-6">
              {submittedOrder.paymentMethod === 'QRIS' ? (
                <div className="rounded-[2rem] border border-brand-charcoal/10 bg-white p-6 text-center shadow-lg">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-strawberry">QRIS payment</p>
                  <p className="mt-2 text-sm text-brand-charcoal/80">
                    Scan this QR with your preferred banking app. This code expires in{' '}
                    <span className="font-semibold text-brand-charcoal">{countdownLabel}</span>.
                  </p>
                  <div className="mt-6 flex justify-center">
                    <div className="rounded-3xl border-8 border-white bg-white shadow-[0_20px_50px_-20px_rgba(71,184,129,0.45)]">
                      <QRCode value={submittedOrder.qrPayload ?? submittedOrder.orderId} size={200} />
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-brand-charcoal/60">
                    Reference: {submittedOrder.orderId} · Total: {formatCurrency(submittedOrder.totalPrice)}
                  </p>
                </div>
              ) : (
                <div className="rounded-[2rem] border border-brand-charcoal/10 bg-brand-yellow/40 p-6 shadow-inner">
                  <p className="font-display text-xl text-brand-charcoal">Cash on Delivery selected</p>
                  <p className="mt-2 text-sm leading-6 text-brand-charcoal/80">
                    Prepare exact change of <strong>{formatCurrency(submittedOrder.totalPrice)}</strong>. Our rider will
                    re-confirm via WhatsApp before heading out.
                  </p>
                </div>
              )}

              <div className="rounded-[2rem] border border-brand-yellow/40 bg-brand-cream/80 p-5 text-sm text-brand-charcoal/80">
                <p className="font-semibold text-brand-charcoal">Next steps</p>
                <ol className="mt-3 list-decimal space-y-2 pl-5">
                  <li>Save your order ID for tracking or cancellation.</li>
                  <li>We will message you on WhatsApp to confirm the delivery window.</li>
                  <li>If plans change, cancel the order from the tracking page before we start preparing.</li>
                </ol>
              </div>
            </div>
          </section>
        ) : null}

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 rounded-[2.5rem] border border-brand-yellow/50 bg-white/95 p-8 shadow-lg shadow-brand-yellow/30"
            noValidate
            aria-describedby={submitError ? 'submit-error' : undefined}
          >
            <fieldset className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-brand-charcoal" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  {...register('name')}
                  className="mt-2 w-full rounded-2xl border border-brand-yellow/60 bg-white px-4 py-3 text-sm shadow-sm focus:border-brand-strawberry focus:outline-none focus:ring-2 focus:ring-brand-strawberry/40"
                  placeholder="Your name"
                  required
                />
                {errors.name ? <p className="mt-2 text-xs text-brand-strawberry">{errors.name.message}</p> : null}
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-charcoal" htmlFor="phone">
                  WhatsApp number
                </label>
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  {...register('phone')}
                  className="mt-2 w-full rounded-2xl border border-brand-yellow/60 bg-white px-4 py-3 text-sm shadow-sm focus:border-brand-strawberry focus:outline-none focus:ring-2 focus:ring-brand-strawberry/40"
                  placeholder="e.g. 0812 3456 7890"
                  required
                />
                {errors.phone ? <p className="mt-2 text-xs text-brand-strawberry">{errors.phone.message}</p> : null}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-semibold text-brand-charcoal">Sandwich selection</legend>
              <p className="mt-2 text-xs text-brand-charcoal/70">
                Add each sandwich type you want and set the quantity per line. You can remove lines or add more as
                needed.
              </p>
              <div className="mt-4 space-y-4">
                {itemFields.map((field, index) => {
                  const itemSummary = computedItems[index];
                  const itemFieldError = (Array.isArray(errors.items) ? errors.items[index] : undefined) as
                    | { itemId?: { message?: string }; quantity?: { message?: string } }
                    | undefined;
                  const lineId = `items-${index}`;
                  const quantityId = `items-${index}-quantity`;
                  return (
                    <div
                      key={field.id}
                      className="rounded-[2rem] border border-brand-yellow/60 bg-white px-4 py-4 shadow-sm shadow-brand-yellow/20"
                    >
                      <div className="grid gap-4 md:grid-cols-[1.6fr_1fr_auto] md:items-end">
                        <div>
                          <label className="block text-sm font-semibold text-brand-charcoal" htmlFor={`${lineId}-item`}>
                            Sandwich #{index + 1}
                          </label>
                          <select
                            id={`${lineId}-item`}
                            {...register(`items.${index}.itemId` as const)}
                            className="mt-2 w-full rounded-2xl border border-brand-yellow/60 bg-white px-4 py-3 text-sm shadow-sm focus:border-brand-strawberry focus:outline-none focus:ring-2 focus:ring-brand-strawberry/40"
                          >
                            {MENU_ITEMS.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name} — {formatCurrency(item.price)}
                              </option>
                            ))}
                          </select>
                          {itemFieldError?.itemId?.message ? (
                            <p className="mt-2 text-xs text-brand-strawberry">{itemFieldError.itemId.message}</p>
                          ) : null}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-brand-charcoal" htmlFor={quantityId}>
                            Quantity
                          </label>
                          <input
                            id={quantityId}
                            type="number"
                            min={1}
                            max={20}
                            step={1}
                            {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                            className="mt-2 w-full rounded-2xl border border-brand-yellow/60 bg-white px-4 py-3 text-sm shadow-sm focus:border-brand-strawberry focus:outline-none focus:ring-2 focus:ring-brand-strawberry/40"
                            required
                          />
                          <p className="mt-2 text-xs text-brand-charcoal/70">
                            {itemSummary && itemSummary.quantity > 0
                              ? `Subtotal ${formatCurrency(itemSummary.lineTotal)}`
                              : 'Subtotal appears once quantity is set.'}
                          </p>
                          {itemFieldError?.quantity?.message ? (
                            <p className="mt-1 text-xs text-brand-strawberry">{itemFieldError.quantity.message}</p>
                          ) : null}
                        </div>
                        <div className="flex items-end justify-end">
                          {itemFields.length > 1 ? (
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="h-10 rounded-full border border-brand-strawberry px-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand-strawberry transition hover:bg-brand-strawberry hover:text-white"
                            >
                              Remove
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {(() => {
                const errorMessage =
                  errors.items && !Array.isArray(errors.items) && typeof (errors.items as { message?: string }).message === 'string'
                    ? (errors.items as { message: string }).message
                    : undefined;
                return errorMessage ? (
                  <p className="mt-2 text-xs text-brand-strawberry">{errorMessage}</p>
                ) : null;
              })()}
              <button
                type="button"
                onClick={() => append({ itemId: 'chicken-sandwich', quantity: 1 })}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-brand-leaf px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-leaf transition hover:bg-brand-leaf hover:text-white disabled:cursor-not-allowed disabled:border-brand-charcoal/20 disabled:text-brand-charcoal/40"
                disabled={!canAddMoreItems}
              >
                Add another sandwich
              </button>
            </fieldset>

            <fieldset className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-brand-charcoal" htmlFor="deliveryMethod">
                  Delivery method
                </label>
                <select
                  id="deliveryMethod"
                  {...register('deliveryMethod')}
                  className="mt-2 w-full rounded-2xl border border-brand-yellow/60 bg-white px-4 py-3 text-sm shadow-sm focus:border-brand-strawberry focus:outline-none focus:ring-2 focus:ring-brand-strawberry/40"
                >
                  <option value="Delivery">Delivery</option>
                  <option value="Pickup">Pickup</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-charcoal" htmlFor="deliveryDate">
                  Delivery date
                </label>
                <input
                  id="deliveryDate"
                  type="date"
                  min={minDate}
                  {...register('deliveryDate')}
                  className="mt-2 w-full rounded-2xl border border-brand-yellow/60 bg-white px-4 py-3 text-sm shadow-sm focus:border-brand-strawberry focus:outline-none focus:ring-2 focus:ring-brand-strawberry/40"
                  required
                />
                {errors.deliveryDate ? (
                  <p className="mt-2 text-xs text-brand-strawberry">{errors.deliveryDate.message}</p>
                ) : null}
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-charcoal" htmlFor="deliveryTime">
                  Delivery time (optional)
                </label>
                <input
                  id="deliveryTime"
                  type="time"
                  {...register('deliveryTime')}
                  className="mt-2 w-full rounded-2xl border border-brand-yellow/60 bg-white px-4 py-3 text-sm shadow-sm focus:border-brand-strawberry focus:outline-none focus:ring-2 focus:ring-brand-strawberry/40"
                />
                {errors.deliveryTime ? (
                  <p className="mt-2 text-xs text-brand-strawberry">{errors.deliveryTime.message}</p>
                ) : null}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-semibold text-brand-charcoal">Payment method</legend>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                {(['QRIS', 'COD'] as PaymentMethod[]).map((method) => (
                  <label
                    key={method}
                    className={
                      method === paymentMethod
                        ? 'flex cursor-pointer flex-col gap-2 rounded-[2rem] border-2 border-brand-strawberry bg-brand-cream/80 p-5 shadow-lg shadow-brand-strawberry/30'
                        : 'flex cursor-pointer flex-col gap-2 rounded-[2rem] border border-brand-yellow/60 bg-white p-5 shadow-sm'
                    }
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={paymentMethod === method}
                        value={method}
                        {...register('paymentMethod')}
                        className="size-4"
                        aria-describedby={`payment-${method}`}
                      />
                      <span className="font-display text-xl text-brand-charcoal">{paymentCopy[method].title}</span>
                    </div>
                    <p id={`payment-${method}`} className="pl-7 text-sm leading-6 text-brand-charcoal/80">
                      {paymentCopy[method].description}
                    </p>
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label className="block text-sm font-semibold text-brand-charcoal" htmlFor="notes">
                Notes (optional)
              </label>
              <textarea
                id="notes"
                rows={3}
                {...register('notes')}
                className="mt-2 w-full rounded-2xl border border-brand-yellow/60 bg-white px-4 py-3 text-sm shadow-sm focus:border-brand-strawberry focus:outline-none focus:ring-2 focus:ring-brand-strawberry/40"
                placeholder="Extra sauce? Allergies? Let us know."
              />
              {errors.notes ? <p className="mt-2 text-xs text-brand-strawberry">{errors.notes.message}</p> : null}
            </div>

            {submitError ? (
              <div
                id="submit-error"
                role="alert"
                className="rounded-2xl border border-brand-strawberry/40 bg-brand-strawberry/10 px-4 py-3 text-sm text-brand-strawberry"
              >
                {submitError}
              </div>
            ) : null}

            <button
              type="submit"
              className="w-full rounded-full bg-brand-strawberry px-6 py-3 font-display text-xl text-white shadow-lg shadow-brand-strawberry/40 transition hover:bg-brand-yellow hover:text-brand-charcoal disabled:cursor-not-allowed disabled:bg-brand-strawberry/60"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting…' : `Place order — ${formatCurrency(totalPrice)}`}
            </button>
          </form>

          <aside className="space-y-6">
            <div className="rounded-[2.5rem] border border-brand-yellow/50 bg-white/95 p-6 shadow-lg">
              <h2 className="font-display text-2xl text-brand-charcoal">Order summary</h2>
              <ul className="mt-4 space-y-3 text-sm text-brand-charcoal/80">
                {computedItems.length > 0 ? (
                  computedItems.map((item) => (
                    <li key={item.key} className="flex items-center justify-between">
                      <span className="font-semibold">{item.name}</span>
                      <span className="text-xs uppercase tracking-[0.2em] text-brand-charcoal/60">
                        {item.quantity} pcs · {formatCurrency(item.lineTotal)}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-brand-charcoal/60">
                    Add sandwiches to see your per-item breakdown.
                  </li>
                )}
              </ul>
              {primaryItem ? (
                <img
                  src={primaryItem.image}
                  alt={`${primaryItem.name} illustration`}
                  className="mt-6 w-full rounded-3xl bg-brand-cream object-contain p-4"
                />
              ) : (
                <div className="mt-6 rounded-3xl bg-brand-cream/60 p-5 text-xs text-brand-charcoal/60">
                  Your selection preview will appear here once you choose a sandwich.
                </div>
              )}
              <dl className="mt-6 space-y-2 text-sm text-brand-charcoal/80">
                {summaryMeta.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <dt className="font-semibold">{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-[2.5rem] border border-brand-strawberry/50 bg-brand-strawberry/10 p-6 text-sm text-brand-charcoal/80">
              <h3 className="font-display text-xl text-brand-strawberry">Need help?</h3>
              <p className="mt-2 leading-6">
                Message us on WhatsApp with your order number for modifications. Cancellations are possible while your
                status stays in <strong>Pending</strong>.
              </p>
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-leaf px-4 py-2 font-semibold text-white shadow-md transition hover:bg-brand-strawberry"
              >
                <span aria-hidden>💬</span>
                Chat on WhatsApp
              </a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
