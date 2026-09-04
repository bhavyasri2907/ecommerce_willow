INSERT INTO products (id, name, type, color, hex, style, price, description) VALUES
(101, 'Blue Crop Top', 'TOP', 'Blue', '#5C7AA6', 'Casual', 999, 'A relaxed cotton crop top with a soft drape, cut for everyday layering.'),
(102, 'Ivory Silk Blouse', 'TOP', 'Ivory', '#C9BBA0', 'Smart', 1899, 'Fluid silk blouse with a clean neckline - built to go from desk to dinner.'),
(103, 'Rust Knit Top', 'TOP', 'Rust', '#B4636F', 'Casual', 1299, 'A ribbed knit top in a warm rust tone, soft against the skin.'),
(104, 'Sage Linen Shirt', 'TOP', 'Sage', '#7C8B6F', 'Smart Casual', 1599, 'Breathable linen shirt with a relaxed collar, made for warm days.'),

(201, 'Black Wide-Leg Pants', 'PANTS', 'Black', '#2B2730', 'Casual', 1499, 'High-rise wide-leg trousers with a fluid, unhurried silhouette.'),
(202, 'White Straight-Fit Pants', 'PANTS', 'White', '#EDEAE3', 'Casual', 1399, 'Crisp straight-fit trousers in brushed cotton twill.'),
(203, 'Light Blue Jeans', 'PANTS', 'Light Blue', '#9DB3C8', 'Casual', 1799, 'Softly faded straight jeans with a mid-rise fit.'),
(204, 'Beige Tailored Trousers', 'PANTS', 'Beige', '#C9BBA0', 'Smart', 1699, 'Tailored trousers with a tapered leg, cut from a smooth twill.'),
(205, 'Charcoal Pleated Trousers', 'PANTS', 'Charcoal', '#4A4550', 'Smart', 1899, 'Pleated-front trousers in charcoal wool blend, sharply tailored.'),
(206, 'Olive Cargo Pants', 'PANTS', 'Olive', '#7C8B6F', 'Casual', 1599, 'Utility cargo pants with a tapered ankle and patch pockets.');

INSERT INTO recommendations (top_id, pants_id) VALUES
(101, 201), (101, 203), (101, 206),
(102, 204), (102, 205), (102, 202),
(103, 201), (103, 204), (103, 206),
(104, 203), (104, 201), (104, 202);
