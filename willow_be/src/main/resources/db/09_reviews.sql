-- ============================================================================
-- Willow - product reviews
-- Database: willow_local (PostgreSQL)
--
-- Changes: reviews (edit time, title, product listing index)
-- Run after 08_checkout.sql. The reviews table itself comes from 01_storefront.sql.
--
-- A shopper can review a product once they have a delivered order for it, and
-- can edit or delete their review later. Product pages list reviews newest first.
-- ============================================================================

BEGIN;

ALTER TABLE reviews ADD COLUMN title      VARCHAR(120);
ALTER TABLE reviews ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
UPDATE reviews SET updated_at = created_at;

-- Product pages list a product's reviews newest first and average their ratings.
CREATE INDEX idx_reviews_product ON reviews (product_id, created_at DESC);

COMMIT;
