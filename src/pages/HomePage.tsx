import { Link } from 'react-router-dom';
import MenuCard from '../components/MenuCard';
import { MENU_ITEMS } from '../constants/menu';

const steps = [
  {
    title: 'Pick your fave sandwich',
    description: 'Choose from chicken, fruity, or spicy egg-mayo with kawaii visuals.',
    icon: '🥪',
  },
  {
    title: 'Select delivery & pay',
    description: 'Pick delivery or pickup, then choose QRIS or COD. We’ll prep it fresh.',
    icon: '💳',
  },
  {
    title: 'Track with your code',
    description: 'Get a unique order number to check status or cancel if plans change.',
    icon: '🚚',
  },
];

const HomePage = () => (
  <div className="space-y-24 pb-24">
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-yellow/60 via-white to-brand-cream">
      <div className="absolute -left-16 top-10 hidden h-40 w-40 rounded-full bg-brand-strawberry/20 blur-3xl md:block" />
      <div className="absolute -right-10 bottom-0 hidden h-48 w-48 rounded-full bg-brand-leaf/20 blur-3xl md:block" />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-[1.1fr_1fr] md:items-center">
        <div className="space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-strawberry shadow-md">
            Freshly made • Kawaii vibes
          </p>
          <h1 className="font-display text-4xl leading-tight text-brand-charcoal md:text-5xl">
            Sandwich cravings solved with <span className="text-brand-strawberry">FOMO flair</span>
          </h1>
          <p className="max-w-xl text-lg leading-8 text-brand-charcoal/80">
            Browse our limited drop menu, order with ease, and track every step from griddle to doorstep.
            Choose QRIS or COD—no more fear of missing out on your favorite sandwiches.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              to="/order"
              className="flex items-center justify-center gap-2 rounded-full bg-brand-strawberry px-6 py-3 font-display text-xl text-white shadow-xl shadow-brand-strawberry/40 transition hover:scale-[1.02] hover:bg-brand-yellow hover:text-brand-charcoal"
            >
              Start Order
              <span aria-hidden>→</span>
            </Link>
            <Link
              to="/track"
              className="flex items-center justify-center gap-2 rounded-full border border-brand-strawberry px-6 py-3 font-semibold text-brand-strawberry transition hover:bg-brand-strawberry hover:text-white"
            >
              Track Order
            </Link>
          </div>
          <div className="flex flex-col gap-4 rounded-[2rem] bg-white/80 p-6 shadow-lg shadow-brand-yellow/40 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-brand-charcoal/60">Delivery slots</p>
              <p className="font-display text-2xl text-brand-charcoal">Same-day for orders before 3 PM</p>
            </div>
            <div className="rounded-3xl bg-brand-yellow px-4 py-3 text-center font-semibold text-brand-charcoal">
              QRIS Ready · COD Friendly
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="relative rounded-[2.5rem] bg-white p-6 shadow-[0_30px_60px_-30px_rgba(255,107,107,0.45)]">
            <img
              src="/fomo-logo.jpeg"
              alt="FOMO Sandwich illustrated logo"
              className="mx-auto h-44 w-44 rounded-[2rem] border-4 border-brand-yellow object-cover"
            />
            <div className="mt-6 grid gap-4 text-center">
              <p className="rounded-full bg-brand-leaf/15 px-4 py-2 text-sm font-semibold text-brand-leaf">
                Over 500+ sandwiches served this month 🍳
              </p>
              <p className="rounded-full bg-brand-yellow/20 px-4 py-2 text-sm font-semibold text-brand-strawberry">
                Limited drop menu updated weekly
              </p>
              <p className="rounded-full bg-brand-strawberry/15 px-4 py-2 text-sm font-semibold text-brand-strawberry">
                Cancel anytime before we start prepping
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

  <section id="menu" className="mx-auto max-w-6xl px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-strawberry">Menu</p>
          <h2 className="font-display text-3xl text-brand-charcoal md:text-4xl">Choose your FOMO sandwich</h2>
        </div>
        <p className="max-w-lg text-sm leading-6 text-brand-charcoal/80">
          Three signature options, all freshly assembled with premium ingredients. Tap a sandwich to pre-fill the
          order form and lock your slot before it sells out.
        </p>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {MENU_ITEMS.map((item) => (
          <MenuCard key={item.id} item={item} to={`/order?item=${item.id}`} />
        ))}
      </div>
    </section>

    <section className="bg-white/80">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-strawberry">How it works</p>
          <h2 className="mt-2 font-display text-3xl text-brand-charcoal md:text-4xl">3-step sandwich joy</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.title}
              className="rounded-[2rem] border border-brand-yellow/40 bg-brand-cream/80 p-6 shadow-lg shadow-brand-yellow/30"
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-brand-strawberry text-2xl text-white">
                {step.icon}
              </div>
              <h3 className="mt-4 font-display text-xl text-brand-charcoal">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-brand-charcoal/75">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-6xl px-6">
      <div className="grid gap-8 rounded-[2.5rem] bg-brand-strawberry text-white shadow-lg shadow-brand-strawberry/40 p-10 md:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <h2 className="font-display text-3xl">QRIS & COD ready</h2>
          <p className="text-sm leading-7 text-white/90">
            Choose QRIS for instant payment with smart QR amount generation, or opt for COD if you’d rather pay on
            delivery. Every order receives a unique tracking code so you can see the progress anytime.
          </p>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <span aria-hidden>✅</span>
              <span>Automatic QR total based on your quantity</span>
            </li>
            <li className="flex items-start gap-3">
              <span aria-hidden>✅</span>
              <span>Cancel easily before we start preparing</span>
            </li>
            <li className="flex items-start gap-3">
              <span aria-hidden>✅</span>
              <span>SMS & WhatsApp friendly format for order IDs</span>
            </li>
          </ul>
          <div className="flex flex-wrap gap-3 pt-4">
            <Link
              to="/order"
              className="rounded-full bg-white px-5 py-2 text-brand-strawberry transition hover:bg-brand-yellow hover:text-brand-charcoal"
            >
              Try QR checkout
            </Link>
            <Link
              to="/track"
              className="rounded-full border border-white px-5 py-2 transition hover:bg-white hover:text-brand-strawberry"
            >
              Track order status
            </Link>
          </div>
        </div>
        <div className="rounded-[2rem] bg-white/15 p-6 backdrop-blur">
          <h3 className="font-display text-xl">Why customers love FOMO</h3>
          <ul className="mt-6 space-y-4 text-sm text-white/90">
            <li>✨ Kawaii packaging perfect for gifting friends.</li>
            <li>⏱️ Fast prep window updates keep you in the loop.</li>
            <li>🍞 Milk bread baked fresh each morning.</li>
            <li>🥗 Locally sourced produce with zero sogginess.</li>
          </ul>
          <p className="mt-6 rounded-3xl bg-white/20 px-4 py-3 text-center font-semibold">
            “Hands down the cutest sandwich drop in town!” — Yani, Jakarta
          </p>
        </div>
      </div>
    </section>
  </div>
);

export default HomePage;
