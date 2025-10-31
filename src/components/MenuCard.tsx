import { Link } from 'react-router-dom';
import type { MenuItem } from '../types/menu';
import { formatCurrency } from '../utils/format';

interface MenuCardProps {
  item: MenuItem;
  to: string;
}

const MenuCard = ({ item, to }: MenuCardProps) => (
  <article className="group relative flex flex-col gap-4 rounded-[2rem] border border-brand-yellow/50 bg-white/80 p-6 shadow-lg shadow-brand-yellow/30 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-strawberry/30">
    <img
      src={item.image}
      alt={item.name}
      className="mt-2 h-40 w-full rounded-3xl bg-brand-cream object-contain shadow-inner transition group-hover:scale-[1.02]"
    />
    <div className="space-y-3">
      <h3 className="font-display text-2xl text-brand-strawberry">{item.name}</h3>
      <p className="text-sm leading-6 text-brand-charcoal/80">{item.description}</p>
      {item.badges && item.badges.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {item.badges.map((badge) => (
            <span
              key={badge}
              className="rounded-full bg-brand-yellow/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-charcoal"
            >
              {badge}
            </span>
          ))}
        </div>
      ) : null}
    </div>
    <div className="mt-auto flex items-center justify-between">
      <span className="font-display text-2xl text-brand-charcoal">{formatCurrency(item.price)}</span>
      <Link
        to={to}
        className="rounded-full bg-brand-leaf px-5 py-2 font-semibold text-white shadow-lg shadow-brand-leaf/40 transition hover:scale-[1.03] hover:bg-brand-strawberry"
      >
        Order Now
      </Link>
    </div>
  </article>
);

export default MenuCard;
