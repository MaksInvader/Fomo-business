import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center bg-brand-cream px-6 py-24 text-center">
    <img
      src="/fomo-logo.jpeg"
      alt="FOMO Sandwich logo"
      className="mb-6 h-32 w-32 rounded-[2rem] border-4 border-brand-yellow object-cover shadow-lg"
    />
    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-strawberry">404</p>
    <h1 className="mt-4 font-display text-4xl text-brand-charcoal">Oops! That page is sold out.</h1>
    <p className="mt-4 max-w-md text-sm text-brand-charcoal/80">
      The sandwich you are craving isn’t on this menu. Let’s head back to the homepage and grab something tasty.
    </p>
    <div className="mt-6 flex flex-wrap justify-center gap-3">
      <Link
        to="/"
        className="rounded-full bg-brand-strawberry px-5 py-2 font-semibold text-white shadow-md transition hover:bg-brand-yellow hover:text-brand-charcoal"
      >
        Return home
      </Link>
      <Link
        to="/order"
        className="rounded-full border border-brand-strawberry px-5 py-2 font-semibold text-brand-strawberry transition hover:bg-brand-strawberry hover:text-white"
      >
        Place an order
      </Link>
    </div>
  </div>
);

export default NotFoundPage;
