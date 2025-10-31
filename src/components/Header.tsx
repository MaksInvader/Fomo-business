import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { NAV_LINKS } from './navLinks';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggle = () => setIsOpen((prev) => !prev);
  const close = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-brand-yellow/40 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3" aria-label="FOMO Sandwich home">
          <img
            src="/fomo-logo.jpeg"
            alt="FOMO Sandwich logo"
            className="h-12 w-12 rounded-full border-2 border-brand-yellow object-cover shadow-md"
          />
          <div className="flex flex-col leading-none">
            <span className="font-display text-2xl text-brand-strawberry">FOMO</span>
            <span className="font-semibold uppercase tracking-[0.2em] text-xs text-brand-charcoal/80">
              Sandwich Cart
            </span>
          </div>
        </Link>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-strawberry/40 text-brand-strawberry transition hover:bg-brand-strawberry hover:text-white md:hidden"
          onClick={toggle}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
        >
          <span className="sr-only">Toggle navigation</span>
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {isOpen ? (
              <path d="M18 6 6 18M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary navigation">
          {NAV_LINKS.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                clsx(
                  'font-semibold transition hover:text-brand-strawberry',
                  isActive && 'text-brand-strawberry',
                )
              }
            >
              {label}
            </NavLink>
          ))}
          <Link
            to="/order"
            className="rounded-full bg-brand-strawberry px-5 py-2 font-display text-lg text-white shadow-lg shadow-brand-strawberry/40 transition hover:bg-brand-yellow hover:text-brand-charcoal"
          >
            Order Now
          </Link>
        </nav>
      </div>

      <div
        id="mobile-menu"
        className={clsx(
          'border-t border-brand-yellow/40 bg-white/95 px-6 pb-6 pt-2 shadow-inner md:hidden',
          isOpen ? 'block' : 'hidden',
        )}
      >
        <nav className="flex flex-col gap-3" aria-label="Mobile navigation">
          {NAV_LINKS.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={close}
              className={({ isActive }) =>
                clsx(
                  'rounded-full px-4 py-2 text-sm font-semibold transition',
                  isActive || location.pathname === to
                    ? 'bg-brand-yellow/60 text-brand-charcoal'
                    : 'bg-white text-brand-charcoal hover:bg-brand-yellow/30',
                )
              }
            >
              {label}
            </NavLink>
          ))}
          <Link
            to="/order"
            onClick={close}
            className="mt-2 rounded-full bg-brand-strawberry px-4 py-2 text-center font-display text-lg text-white shadow-lg shadow-brand-strawberry/40 transition hover:bg-brand-yellow hover:text-brand-charcoal"
          >
            Order Now
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
