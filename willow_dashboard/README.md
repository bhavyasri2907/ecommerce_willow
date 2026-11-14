# Willow Seller Panel

Real-time seller dashboard for Willow. A React + Vite app that talks to `willow_be` (Spring Boot).

## Run

```bash
# 1. Backend (from willow_be) - port 8080
mvn spring-boot:run          # or run CaraApplication from IntelliJ

# 2. Dashboard (from willow_dashboard) - port 5174
npm install
npm run dev
```

Open http://localhost:5174. The storefront (`willow_fe`) keeps running on 5173.

To point at a different API, copy `.env.example` to `.env.local` and set `VITE_API_URL`.

## Structure

```
src/
  api/          client.js (fetch wrapper, ApiError) · seller.js (every endpoint in one place)
  live/         LiveProvider - one Server-Sent Events connection shared by the whole app
  hooks/        useQuery (fetch + silent refetch on live events) · useDebounce
  layout/       AppLayout, Sidebar, Topbar, LiveNotifications, navigation.js
  components/
    ui/         Button, Badge, Card, Tabs, Form, Overlay (Modal/Drawer/Confirm), Pagination, ...
    charts/     TimeSeriesChart (revenue, orders) · BarList
    toast/      ToastProvider
  pages/        Overview, Products, ProductForm, CuratedPicks, Inventory, Orders,
                Analytics, StoreProfile, Settings
  utils/        format.js (currency, dates) · constants.js (statuses, labels)
  styles/       index.css (design tokens at the top)
```

## How real-time works

1. `willow_be` publishes an event whenever data changes (`order.created`, `inventory.changed`,
   `product.updated`, ...). Events are sent only after the database transaction commits.
2. `LiveProvider` holds one `EventSource` on `GET /api/seller/events`.
3. Each `useQuery` call lists the event prefixes it cares about:

   ```js
   useQuery((signal) => sellerApi.listOrders(params, signal), [params], { live: ['order.'] });
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
