-- =====================================================
-- DEMO DATA FOR DOOKAN E-COMMERCE
-- =====================================================

-- =====================================================
-- CATEGORIES
-- =====================================================
INSERT INTO categories (name_en, name_de, name_fr, name_ps, name_fa, description_en, description_de, slug, image, icon, display_order) VALUES
('Fresh Produce', 'Frisches Obst und Gemüse', 'Produits Frais', 'تازه محصولات', 'محصولات تازه', 'Fresh fruits and vegetables', 'Frisches Obst und Gemüse', 'fresh-produce', 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=400', '🥬', 1),
('Dairy & Eggs', 'Milchprodukte & Eier', 'Produits Laitiers', 'لبنیات او هګۍ', 'لبنیات و تخم مرغ', 'Milk, cheese, yogurt and eggs', 'Milch, Käse, Joghurt und Eier', 'dairy-eggs', 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400', '🥛', 2),
('Meat & Seafood', 'Fleisch & Meeresfrüchte', 'Viande & Fruits de Mer', 'غوښه او کب', 'گوشت و غذای دریایی', 'Fresh meat and seafood', 'Frisches Fleisch und Meeresfrüchte', 'meat-seafood', 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400', '🥩', 3),
('Bakery', 'Bäckerei', 'Boulangerie', 'نانوایی', 'نانوایی', 'Fresh bread and baked goods', 'Frisches Brot und Backwaren', 'bakery', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', '🥖', 4),
('Pantry Staples', 'Grundnahrungsmittel', 'Produits de Base', 'اساسی توکي', 'مواد اولیه', 'Rice, pasta, oils and spices', 'Reis, Nudeln, Öle und Gewürze', 'pantry-staples', 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400', '🌾', 5),
('Beverages', 'Getränke', 'Boissons', 'څښاک', 'نوشیدنی', 'Drinks and beverages', 'Getränke und Erfrischungen', 'beverages', 'https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=400', '🥤', 6),
('Snacks', 'Snacks', 'Collations', 'خوراکي', 'میان وعده', 'Chips, nuts and treats', 'Chips, Nüsse und Leckereien', 'snacks', 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400', '🍿', 7),
('Frozen Foods', 'Tiefkühlkost', 'Produits Surgelés', 'منجمد خواړه', 'غذاهای منجمد', 'Frozen meals and ingredients', 'Tiefkühlgerichte und Zutaten', 'frozen-foods', 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400', '🧊', 8);

-- =====================================================
-- PRODUCTS - Fresh Produce
-- =====================================================
INSERT INTO products (name_en, name_de, name_fr, name_ps, name_fa, description_en, description_de, slug, price, compare_at_price, image, category_id, sku, stock, featured, rating, review_count, tags) VALUES
('Organic Apples', 'Bio-Äpfel', 'Pommes Bio', 'ارګانیک مڼې', 'سیب ارگانیک', 'Fresh organic apples from local farms', 'Frische Bio-Äpfel von lokalen Bauernhöfen', 'organic-apples', 3.99, 4.99, 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400', 1, 'PROD-001', 150, true, 4.5, 23, ARRAY['organic', 'fresh', 'local']),
('Fresh Tomatoes', 'Frische Tomaten', 'Tomates Fraîches', 'تازه روميان', 'گوجه فرنگی تازه', 'Ripe and juicy tomatoes', 'Reife und saftige Tomaten', 'fresh-tomatoes', 2.49, NULL, 'https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=400', 1, 'PROD-002', 200, true, 4.7, 45, ARRAY['fresh', 'vegetables']),
('Baby Spinach', 'Baby-Spinat', 'Épinards Bébé', 'کوچنی پالک', 'اسفناج بچه', 'Tender baby spinach leaves', 'Zarte Baby-Spinatblätter', 'baby-spinach', 2.99, NULL, 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400', 1, 'PROD-003', 80, false, 4.3, 12, ARRAY['organic', 'greens']),
('Carrots', 'Karotten', 'Carottes', 'ګاجرې', 'هویج', 'Fresh crunchy carrots', 'Frische knackige Karotten', 'carrots', 1.99, NULL, 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400', 1, 'PROD-004', 120, false, 4.6, 18, ARRAY['fresh', 'vegetables']),
('Bananas', 'Bananen', 'Bananes', 'کیلې', 'موز', 'Sweet ripe bananas', 'Süße reife Bananen', 'bananas', 1.49, NULL, 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400', 1, 'PROD-005', 180, true, 4.8, 67, ARRAY['fresh', 'fruit']);

-- =====================================================
-- PRODUCTS - Dairy & Eggs
-- =====================================================
INSERT INTO products (name_en, name_de, name_fr, name_ps, name_fa, description_en, description_de, slug, price, compare_at_price, image, category_id, sku, stock, featured, rating, review_count, tags) VALUES
('Whole Milk', 'Vollmilch', 'Lait Entier', 'بشپړه شيدې', 'شیر کامل', 'Fresh whole milk 1L', 'Frische Vollmilch 1L', 'whole-milk', 1.79, NULL, 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400', 2, 'PROD-006', 100, false, 4.4, 34, ARRAY['dairy', 'fresh']),
('Greek Yogurt', 'Griechischer Joghurt', 'Yaourt Grec', 'یوناني مستو', 'ماست یونانی', 'Creamy Greek yogurt 500g', 'Cremiger griechischer Joghurt 500g', 'greek-yogurt', 3.49, NULL, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400', 2, 'PROD-007', 75, true, 4.9, 89, ARRAY['dairy', 'protein']),
('Cheddar Cheese', 'Cheddar-Käse', 'Fromage Cheddar', 'چیدر پنیر', 'پنیر چدار', 'Aged cheddar cheese 200g', 'Gereifter Cheddar-Käse 200g', 'cheddar-cheese', 4.99, 5.99, 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=400', 2, 'PROD-008', 60, false, 4.6, 28, ARRAY['dairy', 'cheese']),
('Free Range Eggs', 'Freilandeier', 'Œufs de Plein Air', 'آزاد هګۍ', 'تخم مرغ محلی', 'Fresh free range eggs (12 pack)', 'Frische Freilandeier (12er Pack)', 'free-range-eggs', 3.99, NULL, 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400', 2, 'PROD-009', 90, true, 4.7, 52, ARRAY['eggs', 'protein', 'free-range']);

-- =====================================================
-- PRODUCTS - Meat & Seafood
-- =====================================================
INSERT INTO products (name_en, name_de, name_fr, name_ps, name_fa, description_en, description_de, slug, price, compare_at_price, image, category_id, sku, stock, featured, rating, review_count, tags) VALUES
('Chicken Breast', 'Hähnchenbrust', 'Blanc de Poulet', 'چرګ سینه', 'سینه مرغ', 'Fresh chicken breast 500g', 'Frische Hähnchenbrust 500g', 'chicken-breast', 6.99, NULL, 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400', 3, 'PROD-010', 45, false, 4.5, 31, ARRAY['meat', 'protein', 'fresh']),
('Salmon Fillet', 'Lachsfilet', 'Filet de Saumon', 'سالمون ماهی', 'فیله ماهی سالمون', 'Fresh Atlantic salmon 300g', 'Frischer Atlantik-Lachs 300g', 'salmon-fillet', 12.99, 14.99, 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=400', 3, 'PROD-011', 30, true, 4.8, 42, ARRAY['seafood', 'omega-3', 'fresh']),
('Ground Beef', 'Rinderhackfleisch', 'Bœuf Haché', 'غوښه', 'گوشت چرخ کرده', 'Premium ground beef 500g', 'Premium Rinderhackfleisch 500g', 'ground-beef', 7.99, NULL, 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400', 3, 'PROD-012', 55, false, 4.4, 26, ARRAY['meat', 'beef', 'fresh']);

-- =====================================================
-- PRODUCTS - Bakery
-- =====================================================
INSERT INTO products (name_en, name_de, name_fr, name_ps, name_fa, description_en, description_de, slug, price, compare_at_price, image, category_id, sku, stock, featured, rating, review_count, tags) VALUES
('Sourdough Bread', 'Sauerteigbrot', 'Pain au Levain', 'خمیره ډوډۍ', 'نان خمیر ترش', 'Artisan sourdough loaf', 'Handwerkliches Sauerteigbrot', 'sourdough-bread', 4.49, NULL, 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400', 4, 'PROD-013', 40, true, 4.9, 78, ARRAY['bakery', 'artisan', 'fresh']),
('Croissants', 'Croissants', 'Croissants', 'کروسانت', 'کروسان', 'Butter croissants (4 pack)', 'Butter-Croissants (4er Pack)', 'croissants', 5.99, NULL, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400', 4, 'PROD-014', 35, false, 4.7, 44, ARRAY['bakery', 'pastry', 'butter']),
('Whole Wheat Bread', 'Vollkornbrot', 'Pain Complet', 'بشپړ غنم ډوډۍ', 'نان گندم کامل', 'Healthy whole wheat bread', 'Gesundes Vollkornbrot', 'whole-wheat-bread', 3.99, NULL, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', 4, 'PROD-015', 50, false, 4.5, 33, ARRAY['bakery', 'healthy', 'whole-grain']);

-- =====================================================
-- PRODUCTS - Pantry Staples
-- =====================================================
INSERT INTO products (name_en, name_de, name_fr, name_ps, name_fa, description_en, description_de, slug, price, compare_at_price, image, category_id, sku, stock, featured, rating, review_count, tags) VALUES
('Basmati Rice', 'Basmatireis', 'Riz Basmati', 'باسماتی وریژې', 'برنج باسماتی', 'Premium basmati rice 2kg', 'Premium Basmatireis 2kg', 'basmati-rice', 8.99, NULL, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', 5, 'PROD-016', 120, true, 4.8, 91, ARRAY['rice', 'staple', 'pantry']),
('Olive Oil', 'Olivenöl', 'Huile d''Olive', 'زیتون غوړ', 'روغن زیتون', 'Extra virgin olive oil 500ml', 'Natives Olivenöl extra 500ml', 'olive-oil', 9.99, 11.99, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400', 5, 'PROD-017', 80, false, 4.6, 37, ARRAY['oil', 'cooking', 'healthy']),
('Pasta', 'Pasta', 'Pâtes', 'پاستا', 'پاستا', 'Italian pasta 500g', 'Italienische Pasta 500g', 'pasta', 2.99, NULL, 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400', 5, 'PROD-018', 150, false, 4.4, 29, ARRAY['pasta', 'italian', 'pantry']);

-- =====================================================
-- PRODUCTS - Beverages
-- =====================================================
INSERT INTO products (name_en, name_de, name_fr, name_ps, name_fa, description_en, description_de, slug, price, compare_at_price, image, category_id, sku, stock, featured, rating, review_count, tags) VALUES
('Orange Juice', 'Orangensaft', 'Jus d''Orange', 'نارنج جوس', 'آب پرتقال', 'Fresh squeezed orange juice 1L', 'Frisch gepresster Orangensaft 1L', 'orange-juice', 3.99, NULL, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400', 6, 'PROD-019', 70, false, 4.5, 38, ARRAY['juice', 'fresh', 'vitamin-c']),
('Green Tea', 'Grüner Tee', 'Thé Vert', 'شین چای', 'چای سبز', 'Organic green tea (20 bags)', 'Bio-Grüntee (20 Beutel)', 'green-tea', 4.99, NULL, 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400', 6, 'PROD-020', 100, true, 4.7, 56, ARRAY['tea', 'organic', 'healthy']),
('Sparkling Water', 'Sprudelwasser', 'Eau Gazeuse', 'بلبل اوبه', 'آب گازدار', 'Natural sparkling water 1L', 'Natürliches Sprudelwasser 1L', 'sparkling-water', 1.49, NULL, 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400', 6, 'PROD-021', 200, false, 4.3, 22, ARRAY['water', 'sparkling', 'refreshing']);

-- =====================================================
-- PRODUCTS - Snacks
-- =====================================================
INSERT INTO products (name_en, name_de, name_fr, name_ps, name_fa, description_en, description_de, slug, price, compare_at_price, image, category_id, sku, stock, featured, rating, review_count, tags) VALUES
('Mixed Nuts', 'Gemischte Nüsse', 'Noix Mélangées', 'مخلوط مغز', 'آجیل مخلوط', 'Premium mixed nuts 250g', 'Premium gemischte Nüsse 250g', 'mixed-nuts', 6.99, NULL, 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400', 7, 'PROD-022', 90, false, 4.6, 41, ARRAY['nuts', 'snack', 'protein']),
('Dark Chocolate', 'Dunkle Schokolade', 'Chocolat Noir', 'تیاره چاکلیټ', 'شکلات تلخ', '70% dark chocolate bar', '70% dunkle Schokolade', 'dark-chocolate', 3.49, NULL, 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=400', 7, 'PROD-023', 110, true, 4.8, 73, ARRAY['chocolate', 'snack', 'premium']),
('Potato Chips', 'Kartoffelchips', 'Chips de Pomme de Terre', 'کچالو چپس', 'چیپس سیب زمینی', 'Sea salt potato chips 150g', 'Meersalz-Kartoffelchips 150g', 'potato-chips', 2.49, NULL, 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400', 7, 'PROD-024', 130, false, 4.2, 19, ARRAY['chips', 'snack', 'salty']);

-- =====================================================
-- PRODUCTS - Frozen Foods
-- =====================================================
INSERT INTO products (name_en, name_de, name_fr, name_ps, name_fa, description_en, description_de, slug, price, compare_at_price, image, category_id, sku, stock, featured, rating, review_count, tags) VALUES
('Frozen Pizza', 'Tiefkühlpizza', 'Pizza Surgelée', 'منجمد پیزا', 'پیتزا منجمد', 'Margherita frozen pizza', 'Margherita Tiefkühlpizza', 'frozen-pizza', 5.99, NULL, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400', 8, 'PROD-025', 65, false, 4.3, 27, ARRAY['frozen', 'pizza', 'quick-meal']),
('Ice Cream', 'Eiscreme', 'Crème Glacée', 'آیس کریم', 'بستنی', 'Vanilla ice cream 500ml', 'Vanilleeis 500ml', 'ice-cream', 4.99, NULL, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400', 8, 'PROD-026', 85, true, 4.9, 102, ARRAY['frozen', 'dessert', 'ice-cream']),
('Frozen Vegetables', 'Tiefkühlgemüse', 'Légumes Surgelés', 'منجمد سبزیجات', 'سبزیجات منجمد', 'Mixed frozen vegetables 1kg', 'Gemischtes Tiefkühlgemüse 1kg', 'frozen-vegetables', 3.99, NULL, 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=400', 8, 'PROD-027', 95, false, 4.4, 31, ARRAY['frozen', 'vegetables', 'healthy']);

-- =====================================================
-- COUPONS
-- =====================================================
INSERT INTO coupons (code, description, discount_type, discount_value, min_purchase, max_discount, usage_limit, valid_until, is_active) VALUES
('WELCOME10', 'Welcome discount for new customers', 'percentage', 10, 20, 10, 100, NOW() + INTERVAL '30 days', true),
('SAVE5', '5 EUR off on orders over 50 EUR', 'fixed', 5, 50, NULL, 50, NOW() + INTERVAL '14 days', true),
('FREESHIP', 'Free shipping on orders over 30 EUR', 'fixed', 5, 30, 5, NULL, NOW() + INTERVAL '60 days', true);
