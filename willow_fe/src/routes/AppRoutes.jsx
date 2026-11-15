import { Route, Routes } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout.jsx';
import Home from '../pages/Home.jsx';
import Products from '../pages/Products.jsx';
import ProductDetails from '../pages/ProductDetails.jsx';
import Wishlist from '../pages/Wishlist.jsx';
import Account from '../pages/Account.jsx';
import AccountOverview from '../features/account/components/AccountOverview.jsx';
import AccountSection from '../features/account/components/AccountSection.jsx';
import SellerStudio from '../pages/SellerStudio.jsx';
import Checkout from '../pages/Checkout.jsx';
import { CATEGORY_PAGES } from '../utils/constants.js';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        {CATEGORY_PAGES.map(({ path, ...page }) => (
          <Route key={path} path={path} element={<Products {...page} />} />
        ))}
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/account" element={<Account />}>
          <Route index element={<AccountOverview />} />
          <Route path=":section" element={<AccountSection />} />
        </Route>
        <Route path="/studio" element={<SellerStudio />} />
        <Route path="/checkout" element={<Checkout />} />
      </Route>
    </Routes>
  );
}
