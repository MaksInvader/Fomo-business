import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ContactPage from './pages/ContactPage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import OrderPage from './pages/OrderPage';
import TrackPage from './pages/TrackPage';

const App = () => (
  <Routes>
    <Route path="/" element={<Layout />}>
      <Route index element={<HomePage />} />
      <Route path="order" element={<OrderPage />} />
      <Route path="track" element={<TrackPage />} />
      <Route path="contact" element={<ContactPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
);

export default App;
