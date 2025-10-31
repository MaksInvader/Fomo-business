# FOMO Sandwich 🍞

FOMO Sandwich is a kawaii online ordering experience for a boutique sandwich cart. Customers can explore the menu, place orders with QRIS or Cash-on-Delivery, track/cancel existing orders, and reach out to the business through a responsive, accessibility-minded interface.

## Features

- **Delicious menu showcase** with playful branding, flexible badges, and deep links to the order form.
- **Robust order form** powered by React Hook Form + Zod, including delivery scheduling, payment selection, and dynamic price summaries.
- **QRIS payment flow** that generates a scannable QR payload and provides a live countdown for payment completion.
- **Order tracking & cancellation** via unique AA999 order IDs stored in Firebase Firestore.
- **Contact hub** with WhatsApp, phone, email, social links, operating hours, and Google Maps embed.
- **Firebase-ready data layer** with reusable Firestore helpers, unique ID generator, and cancellation safeguards.
- **Responsive Tailwind styling** aligned with the provided color palette, plus accessibility extras (skip links, ARIA copy, alt text).

## Tech Stack

- React 19 + TypeScript + Vite 7
- Tailwind CSS with custom theme extensions and @tailwindcss/forms
- React Router 7 for client-side navigation
- Firebase SDK (Firestore) for backend storage
- React Hook Form + Zod for validation
- React QR Code for QRIS rendering
- Day.js for date/time utilities
- Vitest for unit testing utilities

## Getting Started

1. **Install dependencies**
   ```powershell
   npm install
   ```

2. **Configure Firebase**: create a `.env.local` file at the project root with your Firebase credentials.
   ```env
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   # Optional Analytics / Measurement
   VITE_FIREBASE_MEASUREMENT_ID=...
   ```

3. **Run the dev server**
   ```powershell
   npm run dev
   ```

4. **Build for production**
   ```powershell
   npm run build
   ```

5. **Run tests**
   ```powershell
   npm test
   ```

## Project Structure Highlights

- `src/pages` — Route-level pages (Home, Order, Track, Contact, NotFound)
- `src/components` — Layout pieces (Header, Footer, Layout shell, MenuCard)
- `src/constants` — Menu metadata & business contact details
- `src/lib` — Firebase initialization and Firestore order service helpers
- `src/utils` — Formatting helpers + accompanying Vitest specs
- `public` — Static assets including the provided FOMO logo and menu illustrations

## Firebase Notes

- Orders are stored in a Firestore collection named `orders` with unique `AA999` IDs.
- Cancelling orders is guarded (only allowed while status is `Pending`).
- When Firebase isn’t configured, the UI surfaces helpful error messaging instead of failing silently.

## Accessibility & Responsiveness

- Skip-to-content link for keyboard users
- High-contrast palette and ARIA-friendly copy on interactive elements
- Mobile-first layouts that scale up to tablet/desktop gracefully
- Alt text provided for all decorative and brand imagery

## Future Enhancements

- Admin dashboard for managing orders
- Automated notifications via WhatsApp/email
- Promo code handling and personalized recommendations
- Delivery route optimization and scheduling

Enjoy building and shipping the FOMO Sandwich experience! 🥪
