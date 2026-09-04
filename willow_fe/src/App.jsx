import { Route, Routes } from 'react-router-dom';
import Header from './components/Header.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import Shop from './pages/Shop.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import SellerStudio from './pages/SellerStudio.jsx';
import Checkout from './pages/Checkout.jsx';

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/studio" element={<SellerStudio />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </main>
      <CartDrawer />
    </>
  );
}
