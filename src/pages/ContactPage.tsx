import { CONTACT_INFO } from '../constants/contact';

const ContactPage = () => (
  <div className="bg-white/70 pb-24">
    <div className="mx-auto max-w-5xl px-6 py-16">
      <header className="space-y-3 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-strawberry">Contact</p>
        <h1 className="font-display text-3xl text-brand-charcoal md:text-4xl">Say hello to FOMO Sandwich</h1>
        <p className="text-sm text-brand-charcoal/80">
          We love hearing from you! Reach out via WhatsApp, call, or email for custom orders, collaborations, or press.
        </p>
      </header>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <div className="rounded-[2.5rem] border border-brand-yellow/50 bg-white/95 p-6 shadow-lg">
            <h2 className="font-display text-2xl text-brand-charcoal">Chat & call</h2>
            <ul className="mt-4 space-y-4 text-sm text-brand-charcoal/85">
              <li>
                <a
                  href={`https://wa.me/${CONTACT_INFO.whatsapp}`}
                  className="flex items-center gap-3 rounded-2xl bg-brand-leaf/15 px-4 py-3 font-semibold text-brand-leaf transition hover:bg-brand-leaf/25"
                >
                  <span aria-hidden>💬</span>
                  WhatsApp {CONTACT_INFO.whatsapp}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${CONTACT_INFO.phone.replace(/[^+0-9]/g, '')}`}
                  className="flex items-center gap-3 rounded-2xl bg-brand-yellow/30 px-4 py-3 font-semibold text-brand-charcoal transition hover:bg-brand-yellow/50"
                >
                  <span aria-hidden>📞</span>
                  {CONTACT_INFO.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="flex items-center gap-3 rounded-2xl bg-brand-strawberry/15 px-4 py-3 font-semibold text-brand-strawberry transition hover:bg-brand-strawberry/25"
                >
                  <span aria-hidden>📧</span>
                  {CONTACT_INFO.email}
                </a>
              </li>
            </ul>
          </div>

          <div className="rounded-[2.5rem] border border-brand-yellow/50 bg-white/95 p-6 shadow-lg">
            <h2 className="font-display text-2xl text-brand-charcoal">Follow our kawaii journey</h2>
            <ul className="mt-4 space-y-4 text-sm text-brand-charcoal/80">
              <li>
                <a href={CONTACT_INFO.instagram} target="_blank" rel="noreferrer" className="group flex items-center gap-3">
                  <span
                    aria-hidden
                    className="flex size-9 items-center justify-center rounded-full bg-brand-strawberry/15 text-lg transition group-hover:bg-brand-strawberry group-hover:text-white"
                  >
                    📸
                  </span>
                  <div>
                    <p className="font-semibold text-brand-charcoal">Instagram</p>
                    <p className="text-xs text-brand-charcoal/60">Behind-the-scenes prep & daily drops</p>
                  </div>
                </a>
              </li>
              <li>
                <a href={CONTACT_INFO.tiktok} target="_blank" rel="noreferrer" className="group flex items-center gap-3">
                  <span
                    aria-hidden
                    className="flex size-9 items-center justify-center rounded-full bg-brand-yellow/40 text-lg transition group-hover:bg-brand-yellow group-hover:text-brand-charcoal"
                  >
                    🎵
                  </span>
                  <div>
                    <p className="font-semibold text-brand-charcoal">TikTok</p>
                    <p className="text-xs text-brand-charcoal/60">Watch the sandwich glow-up in 15 seconds</p>
                  </div>
                </a>
              </li>
            </ul>
          </div>

          <div className="rounded-[2.5rem] border border-brand-yellow/50 bg-brand-cream/90 p-6 shadow-inner">
            <h2 className="font-display text-2xl text-brand-charcoal">Operating hours</h2>
            <ul className="mt-4 space-y-2 text-sm text-brand-charcoal/80">
              {CONTACT_INFO.operatingHours.map((slot) => (
                <li key={slot.days} className="flex items-center justify-between rounded-2xl px-4 py-3 transition hover:bg-brand-yellow/40">
                  <span className="font-semibold">{slot.days}</span>
                  <span>{slot.hours}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-brand-charcoal/60">
              Need catering or pre-orders outside these slots? Drop us a message—FOMO loves special events!
            </p>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-[2.5rem] border border-brand-yellow/50 bg-white/95 p-6 shadow-lg">
            <h2 className="font-display text-2xl text-brand-charcoal">Visit our prep kitchen</h2>
            <p className="mt-2 text-sm text-brand-charcoal/80">{CONTACT_INFO.locationLabel}</p>
            <div className="mt-4 overflow-hidden rounded-[2rem] border border-brand-yellow/40 shadow-inner">
              <iframe
                title="FOMO Sandwich map"
                src={CONTACT_INFO.googleMapsEmbed}
                width="100%"
                height="320"
                loading="lazy"
                className="w-full border-0"
                allowFullScreen
              />
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-brand-strawberry/40 bg-brand-strawberry/10 p-6 text-sm text-brand-charcoal/80">
            <h3 className="font-display text-xl text-brand-strawberry">Collabs & wholesale</h3>
            <p className="mt-2 leading-6">
              Want FOMO Sandwich at your pop-up or office pantry? We offer weekly drops, gifting boxes, and brand
              collaborations. Email us with the event date and quantity you have in mind.
            </p>
          </div>
        </aside>
      </div>
    </div>
  </div>
);

export default ContactPage;
