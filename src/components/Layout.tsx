import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import Header from './Header';

const Layout = () => (
  <div className="min-h-screen bg-brand-cream text-brand-charcoal flex flex-col">
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-4 focus:rounded-full focus:bg-brand-strawberry focus:px-4 focus:py-2 focus:text-white"
    >
      Skip to content
    </a>
    <Header />
    <main id="main-content" className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default Layout;
