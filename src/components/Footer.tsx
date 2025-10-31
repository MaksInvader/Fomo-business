import { Link } from 'react-router-dom';
import { CONTACT_INFO } from '../constants/contact';
import { NAV_LINKS } from './navLinks';

const Footer = () => (
  <footer className="mt-16 bg-white/90 shadow-inner">
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12 md:flex-row md:justify-between">
      <div className="max-w-sm space-y-4">
        <div className="flex items-center gap-3">
          <img
            src="/fomo-logo.jpeg"
            alt="FOMO Sandwich logo"
            className="h-14 w-14 rounded-2xl border-2 border-brand-yellow object-cover shadow-lg"
          />
          <div>
            <p className="font-display text-2xl text-brand-strawberry">FOMO Sandwich</p>
            <p className="text-sm text-brand-charcoal/70">Kawaii sandwich cart straight to your cravings.</p>
          </div>
        </div>
        <p className="text-sm leading-6 text-brand-charcoal/80">
          Crafted with love in Jakarta. Every sandwich is made-to-order with locally sourced ingredients
          so you never miss out on the tastiest bite.
        </p>
      </div>

      <div>
        <h3 className="font-display text-lg text-brand-strawberry">Quick Links</h3>
        <ul className="mt-4 space-y-2 text-sm font-semibold text-brand-charcoal/80">
          {NAV_LINKS.map(({ label, to }) => (
            <li key={to}>
              <Link className="transition hover:text-brand-strawberry" to={to}>
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-display text-lg text-brand-strawberry">Get in touch</h3>
        <ul className="mt-4 space-y-3 text-sm text-brand-charcoal/80">
          <li>
            <a
              href={`https://wa.me/${CONTACT_INFO.whatsapp}`}
              className="flex items-center gap-2 transition hover:text-brand-strawberry"
            >
              <span aria-hidden>💬</span>
              WhatsApp us
            </a>
          </li>
          <li>
            <a href={`tel:${CONTACT_INFO.phone.replace(/[^+0-9]/g, '')}`} className="flex items-center gap-2">
              <span aria-hidden>📞</span>
              {CONTACT_INFO.phone}
            </a>
          </li>
          <li>
            <a href={`mailto:${CONTACT_INFO.email}`} className="flex items-center gap-2">
              <span aria-hidden>📧</span>
              {CONTACT_INFO.email}
            </a>
          </li>
          <li>
            <a
              href={CONTACT_INFO.instagram}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2"
            >
              <span aria-hidden>📸</span>
              Instagram
            </a>
          </li>
          <li>
            <a
              href={CONTACT_INFO.tiktok}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2"
            >
              <span aria-hidden>🎵</span>
              TikTok
            </a>
          </li>
        </ul>
      </div>
    </div>
    <div className="border-t border-brand-yellow/40 bg-brand-yellow/20 py-4 text-center text-xs text-brand-charcoal/60">
      © {new Date().getFullYear()} FOMO Sandwich. All rights reserved.
    </div>
  </footer>
);

export default Footer;
