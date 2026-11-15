import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout.jsx';
import Loader from './components/common/Loader.jsx';
import './App.css';

// Each page is its own chunk; the shell (sidebar, topbar, live connection) loads once.
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

export default function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
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
