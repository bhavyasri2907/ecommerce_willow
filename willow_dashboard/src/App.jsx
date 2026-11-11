import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import AppLayout from './layout/AppLayout.jsx';
import { Card } from './components/ui/Card.jsx';
import { SkeletonRows } from './components/ui/States.jsx';

// Each page is its own chunk; the shell (sidebar, topbar, live connection) loads once.
const Overview = lazy(() => import('./pages/Overview.jsx'));
const Products = lazy(() => import('./pages/Products.jsx'));
const ProductForm = lazy(() => import('./pages/ProductForm.jsx'));
const CuratedPicks = lazy(() => import('./pages/CuratedPicks.jsx'));
const Inventory = lazy(() => import('./pages/Inventory.jsx'));
const Orders = lazy(() => import('./pages/Orders.jsx'));
const Analytics = lazy(() => import('./pages/Analytics.jsx'));
const StoreProfile = lazy(() => import('./pages/StoreProfile.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

function PageFallback() {
  return (
    <Card>
      <SkeletonRows rows={6} columns={4} />
    </Card>
  );
}

const page = (Component) => (
  <Suspense fallback={<PageFallback />}>
    <Component />
  </Suspense>
);

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={page(Overview)} />
        <Route path="products" element={page(Products)} />
        <Route path="products/new" element={page(ProductForm)} />
        <Route path="products/:id/edit" element={page(ProductForm)} />
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
