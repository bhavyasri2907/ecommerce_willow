# Willow Backend

Spring Boot 3 REST API for the Willow storefront (`willow_fe`) and seller panel (`willow_dashboard`).

## Run

```bash
mvn spring-boot:run
```

Or run `com.willow.WillowApplication` from your IDE. The API starts on http://localhost:8080.

Data lives in the PostgreSQL database named in `application.properties` (`willow_local` by default).
Create the tables by running the scripts in `src/main/resources/db/` in order (`01_...` to `06_...`);
Hibernate only checks that the tables match the entities.

## Marketplace model

Willow is a marketplace. A seller signs up and gets their own **store**; products, stock, orders,
settings and analytics all belong to a store, and a seller can only reach their own. The storefront
lists live products from every store, each labelled with the store that sells it. A shopper's bag
with items from several stores becomes one order per store, each priced with that store's shipping rules.

## Structure

```
src/main/java/com/willow/
  WillowApplication.java
  controller/    REST endpoints (storefront: Product, Order, Ai, Recommendation;
                 seller panel: SellerProduct, SellerOrder, Inventory, Analytics, Curation, Store, LiveEvents)
  service/       Business logic and transactions
  repository/    Spring Data JPA repositories
  entity/        JPA entities and their enums
  dto/
    request/     Request bodies (validated)
    response/    Response bodies
  mapper/        Entity -> DTO mapping
  config/        CORS
  exception/     NotFoundException, GlobalExceptionHandler
  event/         Live events pushed to the seller panel over Server-Sent Events
  security/      Password hashing, session tokens, and the guard on /api/seller endpoints
  util/          Helpers
src/main/resources/
  application.properties
```

## API

| Area | Endpoints |
|------|-----------|
| Storefront | `GET /api/products?type=&storeId=`, `GET /api/products/{id}` (live products only), `GET /api/stores/{id}` (name, tagline, description, logo), `GET /api/stores/policies?ids=` (shipping and returns per store), `GET /api/ai/recommendations/{topId}`, `POST /api/orders` (returns one order per store) |
| Accounts | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout` (send `Authorization: Bearer <token>`) |
| Seller: sign-in | `POST /api/seller/auth/register` (opens a new store), `POST /api/seller/auth/login`, `GET /api/seller/auth/me`, `POST /api/seller/auth/logout` |
| Seller: pairings | `POST /api/seller/recommendations`, `DELETE /api/seller/recommendations?topId=&pantsId=` |
| Seller: products | `GET/POST /api/seller/products`, `GET/PUT/DELETE /api/seller/products/{id}`, `PATCH .../{id}/status`, `POST .../bulk`, `GET .../summary` |
| Seller: photos | `POST /api/seller/uploads` (multipart `file`; JPG, PNG or WebP up to 5 MB) returns `{ url }`; files are served at `/uploads/<file>` |
| Seller: orders | `GET /api/seller/orders`, `GET .../counts`, `GET .../{id}`, `PATCH .../{id}/status` |
| Seller: inventory | `GET /api/seller/inventory`, `GET .../summary`, `POST .../{productId}/adjust`, `GET .../movements` |
| Seller: other | `GET /api/seller/analytics?range=`, `GET /api/seller/curations`, `GET/PUT /api/seller/store`, `GET/PUT /api/seller/settings`, `GET /api/seller/events` (SSE) |

Every other `/api/seller/...` endpoint needs a signed-in seller: send `Authorization: Bearer <token>`
(the events stream also accepts `?token=`). Without one the API answers 401. The store a request works
on always comes from that seller's session, never from the request, so another store's product or
order simply answers 404.

Errors are returned as `{ "error": "...", "fields": { "name": "message" } }`.

## Configuration

| Property | Purpose |
|----------|---------|
| `willow.cors.allowed-origins` | Origins allowed to call the API (storefront 5173, seller panel 5174) |
| `willow.uploads.dir` | Folder where uploaded product photos are stored (default `uploads/`, not committed) |
| `willow.timezone` | Time zone used to group analytics by day |
