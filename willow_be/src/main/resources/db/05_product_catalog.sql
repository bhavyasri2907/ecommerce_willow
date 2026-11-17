-- ============================================================================
-- Willow - richer product listings
-- Database: willow_local (PostgreSQL)
--
-- Changes: products (who it is for, brand, material)
-- Tables:  product_images
-- Run after 01_storefront.sql.
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- products: who the product is for (drives the storefront's Men / Women pages),
-- its brand (the store's own name is shown when blank) and what it is made of.
-- ---------------------------------------------------------------------------
ALTER TABLE products ADD COLUMN gender   VARCHAR(10) NOT NULL DEFAULT 'UNISEX';
ALTER TABLE products ADD COLUMN brand    VARCHAR(80);
ALTER TABLE products ADD COLUMN material VARCHAR(120);

ALTER TABLE products ADD CONSTRAINT ck_products_gender CHECK (gender IN ('MEN', 'WOMEN', 'UNISEX'));

CREATE INDEX idx_products_gender ON products (gender);

-- ---------------------------------------------------------------------------
-- product_images: a product's photos, in the order the seller arranged them.
-- Position 0 is the cover; it is also copied to products.image_url so lists
-- (cart, wishlist, order lines) can show it without a join.
-- ---------------------------------------------------------------------------
CREATE TABLE product_images (
    product_id BIGINT       NOT NULL,
    position   INTEGER      NOT NULL,
    url        VARCHAR(500) NOT NULL,

    CONSTRAINT pk_product_images         PRIMARY KEY (product_id, position),
    CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);

-- Products that already had a single image keep it as their cover.
INSERT INTO product_images (product_id, position, url)
SELECT id, 0, image_url FROM products WHERE image_url IS NOT NULL;

COMMIT;
