# Willow Seller Panel

Real-time seller dashboard for Willow. A React + Vite app that talks to `willow_be` (Spring Boot).

## Run

```bash
# 1. Backend (from willow_be) - port 8080
mvn spring-boot:run          # or run WillowApplication from IntelliJ

# 2. Dashboard (from willow_dashboard) - port 5174
npm install
npm run dev
```

Open http://localhost:5174. The storefront (`willow_fe`) keeps running on 5173.

The panel needs a signed-in seller. The first visit shows **Set up your store** (store name, your name,
email, password), which creates the store's one seller account; after that it shows **Sign in**.

To point at a different API, copy `.env.example` to `.env` and set `VITE_API_URL`.

`npm run lint` checks the code with ESLint; `npm run build` makes a production build in `dist/`.

## Structure

```
willow_dashboard/
├── public/                 favicon.ico
├── src/
│   ├── main.jsx            entry: router + providers
│   ├── App.jsx             routes (each page is lazy-loaded)
│   ├── App.css             app shell styles: page grid, sidebar, topbar
│   ├── pages/              one file per route, kept thin: fetch data, compose components
│   │                       Overview, Products, AddProduct, EditProduct, CuratedPicks,
│   │                       Inventory, Orders, Analytics, StoreProfile, Settings, NotFound,
│   │                       Login (sign-in and store set-up)
│   ├── components/
│   │   ├── layout/         DashboardLayout, Sidebar, Topbar, LiveNotifications, RequireAuth
│   │   ├── overview/       StatCard, RevenueCard, NeedsAttention, RecentOrders,
│   │   │                   StockAlerts, TopProducts
│   │   ├── products/       ProductTable, ProductForm, ImageUploader, ProductFilters,
│   │   │                   ProductStatusBadge
│   │   ├── orders/         OrderTable, OrderDetailsDrawer, OrderTimeline, OrderStatusBadge
│   │   ├── inventory/      StockAdjustModal, StockMeter, StockBadge
│   │   ├── charts/         TimeSeriesChart (revenue, orders), BarList
│   │   └── common/         Button, Card, Input (form controls), Modal (Modal/Drawer/Confirm),
│   │                       Loader (skeletons), ErrorState, EmptyState, Badge, Tabs,
│   │                       Pagination, Menu, PageHeader, ProductThumb
│   ├── services/           api.js (fetch wrapper, session token, ApiError) + one service per
│   │                       backend area: authService, productService, orderService, inventoryService,
│   │                       dashboardService, curationService, storeService
│   ├── context/            AuthProvider (signed-in seller), LiveProvider (one shared SSE
│   │                       connection), ToastProvider
│   ├── hooks/              useFetch (fetch + silent refetch on live events),
│   │                       useDebounce, useCategories
│   ├── utils/              formatPrice, formatDate, formatNumber, validators
│   ├── constants/          navItems, orderStatus, productStatus, productOptions,
│   │                       stockStatus, config
│   ├── assets/             images/ (logo), icons/
│   └── styles/             index.css (global), variables.css (design tokens), auth.css
├── .env.example            copy to .env
├── eslint.config.js
└── vite.config.js
```

Where things go:

- A new screen is a file in `pages/` plus a route in `App.jsx` and an entry in `constants/navItems.js`.
- UI used by one feature lives in that feature's folder under `components/`; anything used by
  two or more features goes in `components/common/`.
- Pages and components never call `fetch` directly. Add the endpoint to the matching file in
  `services/` and call it through `useFetch`.

## How real-time works

1. `willow_be` publishes an event whenever data changes (`order.created`, `inventory.changed`,
   `product.updated`, ...). Events are sent only after the database transaction commits.
2. `LiveProvider` holds one `EventSource` on `GET /api/seller/events`.
3. Each `useFetch` call lists the event prefixes it cares about:

   ```js
   useFetch((signal) => orderService.listOrders(params, signal), [params], { live: ['order.'] });
   ```

   When a matching event arrives the query refetches in the background and the UI updates
   without a loading flash.

To see it without a storefront checkout, turn on **Settings → Developer tools → Simulate live
storefront orders**.

## API used

| Area       | Endpoints |
|------------|-----------|
| Products   | `GET/POST /api/seller/products`, `GET/PUT/DELETE /api/seller/products/{id}`, `PATCH .../{id}/status`, `POST .../bulk`, `GET .../summary` |
| Orders     | `GET /api/seller/orders`, `GET .../counts`, `GET .../{id}`, `PATCH .../{id}/status` |
| Inventory  | `GET /api/seller/inventory`, `GET .../summary`, `POST .../{productId}/adjust`, `GET .../movements` |
| Analytics  | `GET /api/seller/analytics?range=7|30|90` |
| Curation   | `GET /api/seller/curations`, `POST/DELETE /api/recommendations` |
| Store      | `GET/PUT /api/seller/store`, `GET/PUT /api/seller/settings` |
| Live       | `GET /api/seller/events` (SSE) |
| Storefront | `POST /api/orders` (checkout - creates the orders this panel manages) |

Errors come back as `{ "error": "...", "fields": { "name": "message" } }`; forms show `fields` inline.
