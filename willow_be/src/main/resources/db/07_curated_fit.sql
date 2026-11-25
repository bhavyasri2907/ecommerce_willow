-- ============================================================================
-- Willow - Curated Fit
-- Database: willow_local (PostgreSQL)
--
-- Changes: recommendations becomes curated_picks
-- Run after 06_marketplace.sql.
--
-- A seller can now attach "picks" to any of their products (not only tops), and
-- a pick may be any product on Willow, including another store's. Shoppers see
-- them on the product page as that seller's Curated Fit.
-- ============================================================================

BEGIN;

ALTER TABLE recommendations RENAME TO curated_picks;
ALTER TABLE curated_picks RENAME COLUMN top_id TO product_id;     -- the seller's own product
ALTER TABLE curated_picks RENAME COLUMN pants_id TO pick_id;      -- what they suggest wearing with it

ALTER INDEX recommendations_pkey RENAME TO pk_curated_picks;
ALTER INDEX idx_recommendations_pants RENAME TO idx_curated_picks_pick;
ALTER TABLE curated_picks RENAME CONSTRAINT uq_recommendations_pair TO uq_curated_picks_pair;
ALTER TABLE curated_picks RENAME CONSTRAINT ck_recommendations_pair TO ck_curated_picks_not_itself;
ALTER TABLE curated_picks RENAME CONSTRAINT fk_recommendations_top TO fk_curated_picks_product;
ALTER TABLE curated_picks RENAME CONSTRAINT fk_recommendations_pants TO fk_curated_picks_pick;

-- The order the seller arranged the picks in, and when each was added.
ALTER TABLE curated_picks ADD COLUMN position   INTEGER     NOT NULL DEFAULT 0;
ALTER TABLE curated_picks ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now();

COMMIT;
