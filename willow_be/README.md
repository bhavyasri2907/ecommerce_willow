# Willow Backend

Spring Boot 3 REST API for the Willow storefront (`willow_fe`) and seller panel (`willow_dashboard`).

## Run

```bash
mvn spring-boot:run
```

Or run `com.willow.WillowApplication` from your IDE. The API starts on http://localhost:8080.

The default database is in-memory H2 and starts empty; all data is created through the API and
is lost on restart. To persist data, switch to the PostgreSQL block in `application.properties`.

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
  security/      Password hashing and session tokens for storefront sign-in
  util/          Helpers
src/main/resources/
  application.properties
```

## API

| Area | Endpoints |
|------|-----------|
| Storefront | `GET /api/products`, `GET /api/products/{id}`, `GET /api/ai/recommendations/{topId}`, `POST /api/orders` |
| Accounts | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout` (send `Authorization: Bearer <token>`) |
| Pairings | `POST /api/recommendations`, `DELETE /api/recommendations?topId=&pantsId=` |
| Seller: products | `GET/POST /api/seller/products`, `GET/PUT/DELETE /api/seller/products/{id}`, `PATCH .../{id}/status`, `POST .../bulk`, `GET .../summary` |
| Seller: orders | `GET /api/seller/orders`, `GET .../counts`, `GET .../{id}`, `PATCH .../{id}/status` |
| Seller: inventory | `GET /api/seller/inventory`, `GET .../summary`, `POST .../{productId}/adjust`, `GET .../movements` |
| Seller: other | `GET /api/seller/analytics?range=`, `GET /api/seller/curations`, `GET/PUT /api/seller/store`, `GET/PUT /api/seller/settings`, `GET /api/seller/events` (SSE) |

Errors are returned as `{ "error": "...", "fields": { "name": "message" } }`.

## Configuration

| Property | Purpose |
|----------|---------|
| `willow.cors.allowed-origins` | Origins allowed to call the API (storefront 5173, seller panel 5174) |
| `willow.timezone` | Time zone used to group analytics by day |
