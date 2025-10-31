import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { cancelOrder, getOrderById, sanitizeOrderId, statusLabel } from '../lib/orderService';
import type { OrderRecord } from '../types/order';
import { formatCurrency, formatDateDisplay, formatTimeDisplay } from '../utils/format';

dayjs.extend(relativeTime);

type ViewState = 'idle' | 'loading' | 'showing' | 'error';

const statusColor: Record<string, string> = {
  Pending: 'bg-brand-yellow/40 text-brand-charcoal',
  Preparing: 'bg-brand-strawberry/20 text-brand-strawberry',
  'Out for Delivery': 'bg-brand-leaf/20 text-brand-leaf',
  Completed: 'bg-brand-leaf/40 text-brand-charcoal',
  Cancelled: 'bg-brand-charcoal/10 text-brand-charcoal/80',
};

const TrackPage = () => {
  const [searchValue, setSearchValue] = useState('');
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [state, setState] = useState<ViewState>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = sanitizeOrderId(searchValue);
    if (!normalized) {
      setMessage('Enter your order number to track or cancel.');
      setOrder(null);
      setState('error');
      return;
    }

    setState('loading');
    setMessage(null);
    try {
      const record = await getOrderById(normalized);
      if (!record) {
        setOrder(null);
        setState('error');
        setMessage('We could not find an order with that ID. Double-check the code and try again.');
        return;
      }
      setOrder(record);
      setState('showing');
    } catch (error) {
      setOrder(null);
      setState('error');
      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to look up the order. Please check your connection and try again.',
      );
    }
  };

  const handleCancel = async () => {
    if (!order) return;
    setCancelLoading(true);
    setMessage(null);
    try {
      const updated = await cancelOrder(order.orderId);
      setOrder(updated);
      setMessage('Order cancelled successfully. We hope to serve you again soon!');
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Unable to cancel the order right now. Please try again later.',
      );
    } finally {
      setCancelLoading(false);
    }
  };

  const timeline = useMemo(() => {
    if (!order) return [];
    const checkpoints = [
      { label: 'Created', value: order.createdAt },
    ];
    if (order.cancelledAt) {
      checkpoints.push({ label: 'Cancelled', value: order.cancelledAt });
    }
    return checkpoints;
  }, [order]);

  const sandwiches = order?.items ?? [];
  const totalQuantity = sandwiches.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-white/70 pb-24">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <header className="space-y-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-strawberry">Track & cancel</p>
          <h1 className="font-display text-3xl text-brand-charcoal md:text-4xl">Check your sandwich status</h1>
          <p className="text-sm text-brand-charcoal/80">
            Enter the unique order number you received after placing your order. You can only cancel while the order
            is still marked as <strong>Pending</strong>.
          </p>
        </header>

        <form
          onSubmit={fetchOrder}
          className="mt-10 flex flex-col gap-3 rounded-[2.5rem] border border-brand-yellow/40 bg-white/90 p-6 shadow-lg md:flex-row md:items-center"
        >
          <label htmlFor="orderId" className="sr-only">
            Order number
          </label>
          <input
            id="orderId"
            name="orderId"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value.toUpperCase())}
            placeholder="e.g. FM173"
            className="flex-1 rounded-2xl border border-brand-yellow/60 bg-white px-4 py-3 text-sm shadow-sm focus:border-brand-strawberry focus:outline-none focus:ring-2 focus:ring-brand-strawberry/40"
            aria-describedby={message ? 'track-feedback' : undefined}
            required
          />
          <button
            type="submit"
            className="rounded-full bg-brand-strawberry px-6 py-3 font-display text-xl text-white shadow-lg shadow-brand-strawberry/40 transition hover:bg-brand-yellow hover:text-brand-charcoal disabled:cursor-not-allowed disabled:bg-brand-strawberry/60"
            disabled={state === 'loading'}
          >
            {state === 'loading' ? 'Checking…' : 'Track order'}
          </button>
        </form>

        {message ? (
          <p
            id="track-feedback"
            role="status"
            className={`mt-4 text-sm ${state === 'error' ? 'text-brand-strawberry' : 'text-brand-charcoal/70'}`}
          >
            {message}
          </p>
        ) : null}

        {order ? (
          <section className="mt-12 space-y-8 rounded-[2.5rem] border border-brand-yellow/50 bg-white/95 p-8 shadow-xl shadow-brand-yellow/30">
            <header className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-strawberry">Order ID</p>
                <p className="mt-2 font-display text-4xl text-brand-charcoal">{order.orderId}</p>
              </div>
              <span className={`rounded-full px-4 py-2 text-sm font-semibold ${statusColor[order.status] ?? ''}`}>
                {statusLabel(order.status)}
              </span>
            </header>

            <div className="grid gap-4 text-sm text-brand-charcoal/80 md:grid-cols-2">
              <div className="rounded-3xl bg-brand-cream/80 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-brand-charcoal/60">Sandwiches</p>
                {sandwiches.length > 0 ? (
                  <ul className="mt-3 space-y-2 text-sm text-brand-charcoal/80">
                    {sandwiches.map((item, index) => (
                      <li key={`${item.itemId}-${index}`} className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-brand-charcoal">{item.itemName}</span>
                        <span className="text-xs uppercase tracking-[0.2em] text-brand-charcoal/60">
                          {item.quantity} pcs
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-brand-charcoal/60">No sandwiches recorded for this order.</p>
                )}
                <p className="mt-3 text-xs text-brand-charcoal/60">Total {totalQuantity} pcs</p>
              </div>
              <div className="rounded-3xl bg-brand-yellow/30 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-brand-charcoal/60">Payment</p>
                <p className="mt-2 font-display text-2xl text-brand-charcoal">{order.paymentMethod}</p>
                <p className="mt-1 text-sm text-brand-charcoal/70">Total {formatCurrency(order.totalPrice)}</p>
              </div>
              <div className="rounded-3xl bg-white p-4 shadow-inner">
                <p className="text-xs uppercase tracking-[0.3em] text-brand-charcoal/60">Delivery</p>
                <p className="mt-2 font-semibold">{order.deliveryMethod}</p>
                <p className="text-sm text-brand-charcoal/70">{formatDateDisplay(order.deliveryDate)}</p>
                <p className="text-sm text-brand-charcoal/70">{formatTimeDisplay(order.deliveryTime)}</p>
              </div>
              <div className="rounded-3xl bg-white p-4 shadow-inner">
                <p className="text-xs uppercase tracking-[0.3em] text-brand-charcoal/60">Placed on</p>
                <p className="mt-2 text-sm text-brand-charcoal/80">{formatDateDisplay(order.createdAt)}</p>
                <p className="text-xs text-brand-charcoal/60">{dayjs(order.createdAt).fromNow()}</p>
              </div>
            </div>

            {order.status === 'Pending' ? (
              <div className="rounded-[2rem] border border-brand-strawberry/40 bg-brand-strawberry/10 p-6">
                <p className="font-display text-xl text-brand-strawberry">Need to cancel?</p>
                <p className="mt-2 text-sm leading-6 text-brand-charcoal/80">
                  You can cancel before we start preparing the sandwich. Refunds for QRIS payments are processed within
                  1 business day.
                </p>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="mt-4 rounded-full bg-brand-strawberry px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-brand-yellow hover:text-brand-charcoal disabled:cursor-not-allowed disabled:bg-brand-strawberry/60"
                  disabled={cancelLoading}
                >
                  {cancelLoading ? 'Cancelling…' : 'Cancel this order'}
                </button>
              </div>
            ) : null}

            <div className="rounded-[2rem] border border-brand-yellow/40 bg-brand-cream/70 p-6 text-sm text-brand-charcoal/80">
              <p className="font-semibold text-brand-charcoal">Timeline</p>
              <ul className="mt-4 space-y-3">
                {timeline.map((item) => (
                  <li key={item.label} className="flex items-center gap-3">
                    <span className="text-lg" aria-hidden>
                      {item.label === 'Cancelled' ? '❌' : '✅'}
                    </span>
                    <div>
                      <p className="font-semibold">{item.label}</p>
                      <p className="text-xs text-brand-charcoal/60">
                        {formatDateDisplay(item.value)} · {dayjs(item.value).format('HH:mm')}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
};

export default TrackPage;
