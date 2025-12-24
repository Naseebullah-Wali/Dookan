-- Delete old categories
DELETE FROM categories WHERE id > 0;

-- Reseed categories
INSERT INTO categories (name_en, name_de, name_fr, name_ps, name_fa, description_en, description_de, slug, image, icon, display_order, active) VALUES
('Fresh Produce', 'Frisches Obst und Gemüse', 'Produits Frais', 'تازه محصولات', 'محصولات تازه', 'Fresh fruits and vegetables', 'Frisches Obst und Gemüse', 'fresh-produce', 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=400', '🥬', 1, true),
('Dairy & Eggs', 'Milchprodukte & Eier', 'Produits Laitiers', 'لبنیات او هګۍ', 'لبنیات و تخم مرغ', 'Milk, cheese, yogurt and eggs', 'Milch, Käse, Joghurt und Eier', 'dairy-eggs', 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400', '🥛', 2, true),
('Meat & Seafood', 'Fleisch & Meeresfrüchte', 'Viande & Fruits de Mer', 'غوښه او کب', 'گوشت و غذای دریایی', 'Fresh meat and seafood', 'Frisches Fleisch und Meeresfrüchte', 'meat-seafood', 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400', '🥩', 3, true),
('Pantry Staples', 'Grundnahrungsmittel', 'Produits de Base', 'اساسی توکي', 'مواد اولیه', 'Rice, pasta, oils and spices', 'Reis, Nudeln, Öle und Gewürze', 'pantry-staples', 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400', '🌾', 5, true),
('Beverages', 'Getränke', 'Boissons', 'څښاک', 'نوشیدنی', 'Drinks and beverages', 'Getränke und Erfrischungen', 'beverages', 'https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=400', '🥤', 6, true),
('Snacks', 'Snacks', 'Collations', 'خوراکي', 'میان وعده', 'Chips, nuts and treats', 'Chips, Nüsse und Leckereien', 'snacks', 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400', '🍿', 7, true),
('Frozen Foods', 'Tiefkühlkost', 'Produits Surgelés', 'منجمد خواړه', 'غذاهای منجمد', 'Frozen meals and ingredients', 'Tiefkühlgerichte und Zutaten', 'frozen-foods', 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400', '🧊', 8, true);
