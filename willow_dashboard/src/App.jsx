import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout.jsx';
import RequireAuth from './components/layout/RequireAuth.jsx';
import { LiveProvider } from './context/LiveProvider.jsx';
import Loader from './components/common/Loader.jsx';
import './App.css';

// Each page is its own chunk; the shell (sidebar, topbar, live connection) loads once.
const Login = lazy(() => import('./pages/Login.jsx'));
const Overview = lazy(() => import('./pages/Overview.jsx'));
const Products = lazy(() => import('./pages/Products.jsx'));
const AddProduct = lazy(() => import('./pages/AddProduct.jsx'));
const EditProduct = lazy(() => import('./pages/EditProduct.jsx'));
const CuratedPicks = lazy(() => import('./pages/CuratedPicks.jsx'));
const Inventory = lazy(() => import('./pages/Inventory.jsx'));
const Orders = lazy(() => import('./pages/Orders.jsx'));
const Analytics = lazy(() => import('./pages/Analytics.jsx'));
const StoreProfile = lazy(() => import('./pages/StoreProfile.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

const page = (Component) => (
  <Suspense fallback={<Loader />}>
    <Component />
  </Suspense>
);

/** The panel itself: only for a signed-in seller, with the live connection opened once they are in. */
const panel = (
  <RequireAuth>
    <LiveProvider>
      <DashboardLayout />
    </LiveProvider>
  </RequireAuth>
);

const authPage = (mode) => (
  <Suspense fallback={<Loader />}>
    <Login key={mode} mode={mode} />
  </Suspense>
);

export default function App() {
  return (
    <Routes>
      <Route path="login" element={authPage('login')} />
      <Route path="signup" element={authPage('signup')} />
      <Route element={panel}>
        <Route index element={page(Overview)} />
        <Route path="products" element={page(Products)} />
        <Route path="products/new" element={page(AddProduct)} />
        <Route path="products/:id/edit" element={page(EditProduct)} />
        <Route path="curated" element={page(CuratedPicks)} />
        <Route path="inventory" element={page(Inventory)} />
        <Route path="orders" element={page(Orders)} />
        <Route path="analytics" element={page(Analytics)} />
        <Route path="store" element={page(StoreProfile)} />
        <Route path="settings" element={page(Settings)} />
        <Route path="*" element={page(NotFound)} />
      </Route>
    </Routes>
  );
}
