import { Route, Routes } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import Shop from './pages/Shop.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import SellerStudio from './pages/SellerStudio.jsx';
import Checkout from './pages/Checkout.jsx';
import Wishlist from './pages/Wishlist.jsx';
import Account from './pages/Account.jsx';

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Shop />} />
          <Route
            path="/new-in"
            element={
              <CategoryPage
                categoryKey="new-in"
                title="New In"
                subtitle="Discover our latest arrivals and newly curated top & bottom pairings."
                badge="JUST ARRIVED"
              />
            }
          />
          <Route
            path="/men"
            element={
              <CategoryPage
                categoryKey="men"
                title="Men's Collection"
                subtitle="Thoughtfully paired shirts, pants & smart casual sets for men."
                badge="MEN'S EDIT"
              />
            }
          />
          <Route
            path="/all"
            element={
              <CategoryPage
                categoryKey="all"
                title="All Collection"
                subtitle="Explore the complete Willow catalog of paired tops, bottoms & accessories."
                badge="FULL CATALOG"
              />
            }
          />
          <Route
            path="/women"
            element={
              <CategoryPage
                categoryKey="women"
                title="Women's Collection"
                subtitle="Elevated blouses, trousers & curated outfit pairs for women."
                badge="WOMEN'S EDIT"
              />
            }
          />
          <Route
            path="/bags"
            element={
              <CategoryPage
                categoryKey="bags"
                title="Bags & Leather Goods"
                subtitle="Handcrafted bags & leather accessories designed to complete every look."
                badge="HANDBAGS & TOTES"
              />
            }
          />
          <Route
            path="/shoes"
            element={
              <CategoryPage
                categoryKey="shoes"
                title="Shoes & Footwear"
                subtitle="Sneakers, loafers & heels styled to match your favorite pairs."
                badge="FOOTWEAR EDIT"
              />
            }
          />
          <Route
            path="/accessories"
            element={
              <CategoryPage
                categoryKey="accessories"
                title="Accessories"
                subtitle="Jewelry, belts & finishing touches curated by Willow stylists."
                badge="ACCENTS & JEWELRY"
              />
            }
          />
          <Route
            path="/sale"
            element={
              <CategoryPage
                categoryKey="sale"
                title="Special Sale"
                subtitle="Limited time offers & up to 40% off selected matched sets."
                badge="SEASONAL SALE"
                isSalePage={true}
              />
            }
          />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/account" element={<Account />} />
          <Route path="/studio" element={<SellerStudio />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
