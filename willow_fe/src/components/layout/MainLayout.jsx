import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar.jsx';
import Footer from '../common/Footer.jsx';
import CartDrawer from '../../features/cart/components/CartDrawer.jsx';

/** Storefront shell: navbar, page content, footer and the slide-in cart. */
export default function MainLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
