import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

export const formatDateDisplay = (value: string) =>
  dayjs(value).format('DD MMMM YYYY');

export const formatTimeDisplay = (value?: string | null) =>
  value ? dayjs(value, 'HH:mm').format('HH:mm') : '—';
