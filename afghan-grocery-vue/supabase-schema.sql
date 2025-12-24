-- =====================================================
-- DOOKAN E-COMMERCE DATABASE SCHEMA
-- Enhanced schema with multilingual support
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE (extends auth.users)
-- =====================================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
    language_preference TEXT DEFAULT 'en' CHECK (language_preference IN ('en', 'de', 'fr', 'ps', 'fa')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_de TEXT,
    name_fr TEXT,
    name_ps TEXT,
    name_fa TEXT,
    description_en TEXT,
    description_de TEXT,
    description_fr TEXT,
    description_ps TEXT,
    description_fa TEXT,
    slug TEXT UNIQUE NOT NULL,
    image TEXT,
    icon TEXT,
    active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_de TEXT,
    name_fr TEXT,
    name_ps TEXT,
    name_fa TEXT,
    description_en TEXT,
    description_de TEXT,
    description_fr TEXT,
    description_ps TEXT,
    description_fa TEXT,
    slug TEXT UNIQUE NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    compare_at_price NUMERIC(10, 2) CHECK (compare_at_price >= 0),
    cost_price NUMERIC(10, 2) CHECK (cost_price >= 0),
    image TEXT,
    images TEXT[], -- Array of image URLs
    category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    sku TEXT UNIQUE,
    barcode TEXT,
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    low_stock_threshold INTEGER DEFAULT 10,
    weight NUMERIC(10, 2), -- in kg
    dimensions JSONB, -- {length, width, height}
    featured BOOLEAN DEFAULT false,
    on_sale BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    rating NUMERIC(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,
    tags TEXT[],
    meta_title TEXT,
    meta_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PRODUCT REVIEWS TABLE
-- =====================================================
CREATE TABLE product_reviews (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    images TEXT[],
    verified_purchase BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, user_id) -- One review per user per product
);

-- =====================================================
-- ADDRESSES TABLE
-- =====================================================
CREATE TABLE addresses (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    label TEXT, -- e.g., "Home", "Work"
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    street TEXT NOT NULL,
    street2 TEXT,
    city TEXT NOT NULL,
    state TEXT,
    zip TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'Germany',
    is_default BOOLEAN DEFAULT false,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ORDERS TABLE
-- =====================================================
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    address_id BIGINT REFERENCES addresses(id) ON DELETE SET NULL,
    
    -- Order Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'card', 'bank_transfer', 'paypal')),
    
    -- Pricing
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    shipping_fee NUMERIC(10, 2) DEFAULT 0 CHECK (shipping_fee >= 0),
    tax NUMERIC(10, 2) DEFAULT 0 CHECK (tax >= 0),
    discount NUMERIC(10, 2) DEFAULT 0 CHECK (discount >= 0),
    total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
    
    -- Shipping Info
    tracking_number TEXT,
    carrier TEXT,
    estimated_delivery TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    
    -- Additional Info
    notes TEXT,
    admin_notes TEXT,
    customer_ip TEXT,
    user_agent TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ORDER ITEMS TABLE
-- =====================================================
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
    
    -- Snapshot of product at time of order
    product_name TEXT NOT NULL,
    product_image TEXT,
    sku TEXT,
    
    -- Pricing
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- WISHLISTS TABLE
-- =====================================================
CREATE TABLE wishlists (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- =====================================================
-- CART ITEMS TABLE (for persistent cart)
-- =====================================================
CREATE TABLE cart_items (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- =====================================================
-- COUPONS TABLE
-- =====================================================
CREATE TABLE coupons (
    id BIGSERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
    min_purchase NUMERIC(10, 2) DEFAULT 0,
    max_discount NUMERIC(10, 2),
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Products indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_featured ON products(featured) WHERE featured = true;
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_price ON products(price);

-- Orders indexes
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_number ON orders(order_number);

-- Order items indexes
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- Reviews indexes
CREATE INDEX idx_reviews_product ON product_reviews(product_id);
CREATE INDEX idx_reviews_user ON product_reviews(user_id);

-- Addresses indexes
CREATE INDEX idx_addresses_user ON addresses(user_id);
CREATE INDEX idx_addresses_default ON addresses(user_id, is_default) WHERE is_default = true;

-- Cart indexes
CREATE INDEX idx_cart_user ON cart_items(user_id);

-- Wishlist indexes
CREATE INDEX idx_wishlist_user ON wishlists(user_id);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Categories policies (public read, admin write)
CREATE POLICY "Categories are viewable by everyone"
    ON categories FOR SELECT
    USING (active = true OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Only admins can insert categories"
    ON categories FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Only admins can update categories"
    ON categories FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Only admins can delete categories"
    ON categories FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- Products policies (public read, admin write)
CREATE POLICY "Active products are viewable by everyone"
    ON products FOR SELECT
    USING (is_active = true OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Only admins can insert products"
    ON products FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Only admins can update products"
    ON products FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Only admins can delete products"
    ON products FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- Product reviews policies
CREATE POLICY "Reviews are viewable by everyone"
    ON product_reviews FOR SELECT
    USING (true);

CREATE POLICY "Users can insert own reviews"
    ON product_reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
    ON product_reviews FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
    ON product_reviews FOR DELETE
    USING (auth.uid() = user_id);

-- Addresses policies
CREATE POLICY "Users can view own addresses"
    ON addresses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses"
    ON addresses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
    ON addresses FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses"
    ON addresses FOR DELETE
    USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Users can view own orders"
    ON orders FOR SELECT
    USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Users can insert own orders"
    ON orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update orders"
    ON orders FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- Order items policies
CREATE POLICY "Users can view own order items"
    ON order_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM orders WHERE orders.id = order_items.order_id 
        AND (orders.user_id = auth.uid() OR EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
        ))
    ));

CREATE POLICY "Users can insert order items"
    ON order_items FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM orders WHERE orders.id = order_items.order_id 
        AND orders.user_id = auth.uid()
    ));

-- Wishlists policies
CREATE POLICY "Users can view own wishlist"
    ON wishlists FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert to own wishlist"
    ON wishlists FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from own wishlist"
    ON wishlists FOR DELETE
    USING (auth.uid() = user_id);

-- Cart items policies
CREATE POLICY "Users can view own cart"
    ON cart_items FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert to own cart"
    ON cart_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart"
    ON cart_items FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from own cart"
    ON cart_items FOR DELETE
    USING (auth.uid() = user_id);

-- Coupons policies
CREATE POLICY "Active coupons are viewable by everyone"
    ON coupons FOR SELECT
    USING (is_active = true AND (valid_until IS NULL OR valid_until > NOW()));

CREATE POLICY "Only admins can manage coupons"
    ON coupons FOR ALL
    USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update product rating when review is added/updated/deleted
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET 
        rating = (SELECT COALESCE(AVG(rating), 0) FROM product_reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)),
        review_count = (SELECT COUNT(*) FROM product_reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id))
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_product_rating
AFTER INSERT OR UPDATE OR DELETE ON product_reviews
FOR EACH ROW
EXECUTE FUNCTION update_product_rating();

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEW.id::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_order_number
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION generate_order_number();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SITE SETTINGS TABLE
-- =====================================================
CREATE TABLE site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Site settings policies
CREATE POLICY "Site settings are viewable by everyone"
    ON site_settings FOR SELECT
    USING (true);

CREATE POLICY "Only admins can manage site settings"
    ON site_settings FOR ALL
    USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- Add trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Initial data for exchange rates
INSERT INTO site_settings (key, value, description)
VALUES (
    'exchange_rates', 
    '{"USD": 70, "EUR": 75, "AFN": 1}', 
    'Exchange rates relative to AFN'
);

-- =====================================================
-- NEWS ITEMS (news_ticker) TABLE
-- =====================================================
CREATE TABLE news_items (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    title_de TEXT,
    title_fr TEXT,
    title_ps TEXT,
    title_fa TEXT,
    subtitle TEXT,
    subtitle_de TEXT,
    subtitle_fr TEXT,
    subtitle_ps TEXT,
    subtitle_fa TEXT,
    description TEXT,
    description_de TEXT,
    description_fr TEXT,
    description_ps TEXT,
    description_fa TEXT,
    tag TEXT,
    image TEXT,
    bg_class TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;

-- Public select policy (active items visible to everyone)
CREATE POLICY "News items are viewable by everyone"
    ON news_items FOR SELECT
    USING (is_active = true OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- Only admins may insert
CREATE POLICY "Only admins can insert news items"
    ON news_items FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- Only admins may update
CREATE POLICY "Only admins can update news items"
    ON news_items FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- Only admins may delete
CREATE POLICY "Only admins can delete news items"
    ON news_items FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- Indexes
CREATE INDEX idx_news_items_active ON news_items(is_active) WHERE is_active = true;
CREATE INDEX idx_news_items_order ON news_items(display_order);
CREATE INDEX idx_news_items_created ON news_items(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_news_items_updated_at BEFORE UPDATE ON news_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Demo data for news_items (multi-language)
INSERT INTO news_items (title, title_de, title_fr, title_ps, title_fa, subtitle, subtitle_de, subtitle_fr, subtitle_ps, subtitle_fa, description, description_de, description_fr, description_ps, description_fa, tag, image, bg_class, is_active, display_order)
VALUES
('Fresh Dates Harvest', 'Frische Datteln Ernte', 'Récolte de dattes', 'د تازه نېټه حاصلات', 'برداشت تازه خرما', 'Now available from local farms', 'Jetzt verfügbar', 'Disponible maintenant', 'اوس شتون لري', 'همدا اوس موجود است', 'Our new batch of dates is sweet and organic.', 'Unsere neue Charge Datteln ist süß und biologisch.', 'Notre nouvelle récolte de dattes est sucrée et biologique.', 'زموږ نوې کچه خوږه او عضوي ده.', 'د تازه خرما نوی مقدار طبیعي او خوږ دی.', 'Fruits', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800', 'bg-gradient-success', true, 1),
('Ramadan Specials', 'Ramadan-Angebote', 'Offres Ramadan', 'د روژې ځانګړي', 'پولې رمضان', 'Discounts on essentials', 'Rabatte auf Grundnahrungsmittel', 'Réductions sur les essentiels', 'اساسونه په رعايت', 'تخفیفات بر نیازمندیها', 'Stock up for the month with special bundles.', 'Für den Monat bevorraten mit Sonderpaketen.', 'Faites le plein pour le mois avec des packs spéciaux.', 'د میاشت لپاره ځانګړي بسته بندي', 'برای ماه بسته‌های ویژه', 'Offers', 'https://images.unsplash.com/photo-1542736667-069246bdbc75?auto=format&fit=crop&q=80&w=800', 'bg-gradient-primary', true, 2),
('New Organic Tea', 'Neuer Bio-Tee', 'Nouveau thé bio', 'نوی عضوي چای', 'چای اورگانیک جدید', 'Aromatic and fair-trade', 'Aromatisch und fair gehandelt', 'Aromatique et équitable', 'ټاکني او عادلانه', 'معطر و تجاری منصفانه', 'Try our new green tea sourced from cooperatives.', 'Probieren Sie unseren neuen Grünen Tee von Kooperativen.', 'Essayez notre nouveau thé vert issu de coopératives.', 'زموږ نوی شین چای د اتحادیو څخه راغلی.', 'چای سبز جدید از تعاون‌ها', 'Beverages', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800', 'bg-gradient-warning', true, 3);

-- =====================================================
-- TESTIMONIALS TABLE
-- =====================================================
CREATE TABLE testimonials (
    id BIGSERIAL PRIMARY KEY,
    user_name TEXT NOT NULL,
    user_name_de TEXT,
    user_name_fr TEXT,
    user_name_ps TEXT,
    user_name_fa TEXT,
    location TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 0 AND rating <= 5),
    comment TEXT NOT NULL,
    comment_de TEXT,
    comment_fr TEXT,
    comment_ps TEXT,
    comment_fa TEXT,
    avatar TEXT,
    gender TEXT CHECK (gender IN ('male', 'female')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Public select policy (active testimonials visible to everyone)
CREATE POLICY "Testimonials are viewable by everyone"
    ON testimonials FOR SELECT
    USING (is_active = true OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- Only admins may insert
CREATE POLICY "Only admins can insert testimonials"
    ON testimonials FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- Only admins may update
CREATE POLICY "Only admins can update testimonials"
    ON testimonials FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- Only admins may delete
CREATE POLICY "Only admins can delete testimonials"
    ON testimonials FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- Indexes
CREATE INDEX idx_testimonials_active ON testimonials(is_active) WHERE is_active = true;
CREATE INDEX idx_testimonials_rating ON testimonials(rating);
CREATE INDEX idx_testimonials_created ON testimonials(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Demo data for testimonials (multi-language)
INSERT INTO testimonials (user_name, user_name_de, user_name_fr, user_name_ps, user_name_fa, location, rating, comment, comment_de, comment_fr, comment_ps, comment_fa, avatar, gender, is_active)
VALUES
('Aisha Rahimi', 'Aisha Rahimi', 'Aisha Rahimi', 'عایشه رحیمی', 'عایشه رحیمی', 'Kabul, Afghanistan', 5, 'Fantastic service and fresh products!', 'Fantastischer Service und frische Produkte!', 'Service fantastique et produits frais!', 'خدمت او تازه محصولات عالي دي!', 'خدمات فوق العاده و محصولات تازه!', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200', 'female', true),
('Omid Karimi', 'Omid Karimi', 'Omid Karimi', 'امید کریمی', 'امید کریمی', 'Herat, Afghanistan', 4, 'Great selection and timely delivery.', 'Tolle Auswahl und pünktliche Lieferung.', 'Grande sélection et livraison ponctuelle.', 'ښه انتخاب او پر وخت تحویلي.', 'انتخاب عالی و تحویل به موقع.', 'https://images.unsplash.com/photo-1545996124-1b2b0b0a3f1d?auto=format&fit=crop&q=80&w=200', 'male', true);

