-- Supabase additions: news_items and testimonials
-- Run this in your Supabase SQL editor to create tables, policies and demo data

-- NEWS ITEMS (news_ticker) TABLE
CREATE TABLE IF NOT EXISTS news_items (
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

ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "News items are viewable by everyone"
    ON news_items FOR SELECT
    USING (is_active = true OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Only admins can insert news items"
    ON news_items FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Only admins can update news items"
    ON news_items FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Only admins can delete news items"
    ON news_items FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE INDEX IF NOT EXISTS idx_news_items_active ON news_items(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_news_items_order ON news_items(display_order);
CREATE INDEX IF NOT EXISTS idx_news_items_created ON news_items(created_at DESC);

-- Note: this script assumes update_updated_at_column() function exists in your DB.
CREATE TRIGGER IF NOT EXISTS update_news_items_updated_at BEFORE UPDATE ON news_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Demo data for news_items (multi-language)
INSERT INTO news_items (title, title_de, title_fr, title_ps, title_fa, subtitle, subtitle_de, subtitle_fr, subtitle_ps, subtitle_fa, description, description_de, description_fr, description_ps, description_fa, tag, image, bg_class, is_active, display_order)
VALUES
('Fresh Dates Harvest', 'Frische Datteln Ernte', 'Récolte de dattes', 'د تازه نېټه حاصلات', 'برداشت تازه خرما', 'Now available from local farms', 'Jetzt verfügbar', 'Disponible maintenant', 'اوس شتون لري', 'همدا اوس موجود است', 'Our new batch of dates is sweet and organic.', 'Unsere neue Charge Datteln ist süß und biologisch.', 'Notre nouvelle récolte de dattes est sucrée et biologique.', 'زموږ نوې کچه خوږه او عضوي ده.', 'د تازه خرما نوی مقدار طبیعي او خوږ دی.', 'Fruits', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800', 'bg-gradient-success', true, 1),
('Ramadan Specials', 'Ramadan-Angebote', 'Offres Ramadan', 'د روژې ځانګړي', 'پولې رمضان', 'Discounts on essentials', 'Rabatte auf Grundnahrungsmittel', 'Réductions sur les essentiels', 'اساسونه په رعايت', 'تخفیفات بر نیازمندیها', 'Stock up for the month with special bundles.', 'Für den Monat bevorraten mit Sonderpaketen.', 'Faites le plein pour le mois avec des packs spéciaux.', 'د میاشت لپاره ځانګړي بسته بندي', 'برای ماه بسته‌های ویژه', 'Offers', 'https://images.unsplash.com/photo-1542736667-069246bdbc75?auto=format&fit=crop&q=80&w=800', 'bg-gradient-primary', true, 2),
('New Organic Tea', 'Neuer Bio-Tee', 'Nouveau thé bio', 'نوی عضوي چای', 'چای اورگانیک جدید', 'Aromatic and fair-trade', 'Aromatisch und fair gehandelt', 'Aromatique et équitable', 'ټاکني او عادلانه', 'معطر و تجاری منصفانه', 'Try our new green tea sourced from cooperatives.', 'Probieren Sie unseren neuen Grünen Tee von Kooperativen.', 'Essayez notre nouveau thé vert issu de coopératives.', 'زموږ نوی شین چای د اتحادیو څخه راغلی.', 'چای سبز جدید از تعاون‌ها', 'Beverages', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800', 'bg-gradient-warning', true, 3);


-- TESTIMONIALS TABLE
CREATE TABLE IF NOT EXISTS testimonials (
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

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Testimonials are viewable by everyone"
    ON testimonials FOR SELECT
    USING (is_active = true OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Only admins can insert testimonials"
    ON testimonials FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Only admins can update testimonials"
    ON testimonials FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Only admins can delete testimonials"
    ON testimonials FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE INDEX IF NOT EXISTS idx_testimonials_active ON testimonials(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_testimonials_rating ON testimonials(rating);
CREATE INDEX IF NOT EXISTS idx_testimonials_created ON testimonials(created_at DESC);

CREATE TRIGGER IF NOT EXISTS update_testimonials_updated_at BEFORE UPDATE ON testimonials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Demo data for testimonials (multi-language)
INSERT INTO testimonials (user_name, user_name_de, user_name_fr, user_name_ps, user_name_fa, location, rating, comment, comment_de, comment_fr, comment_ps, comment_fa, avatar, gender, is_active)
VALUES
('Aisha Rahimi', 'Aisha Rahimi', 'Aisha Rahimi', 'عایشه رحیمی', 'عایشه رحیمی', 'Kabul, Afghanistan', 5, 'Fantastic service and fresh products!', 'Fantastischer Service und frische Produkte!', 'Service fantastique et produits frais!', 'خدمت او تازه محصولات عالي دي!', 'خدمات فوق العاده و محصولات تازه!', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200', 'female', true),
('Omid Karimi', 'Omid Karimi', 'Omid Karimi', 'امید کریمی', 'امید کریمی', 'Herat, Afghanistan', 4, 'Great selection and timely delivery.', 'Tolle Auswahl und pünktliche Lieferung.', 'Grande sélection et livraison ponctuelle.', 'ښه انتخاب او پر وخت تحویلي.', 'انتخاب عالی و تحویل به موقع.', 'https://images.unsplash.com/photo-1545996124-1b2b0b0a3f1d?auto=format&fit=crop&q=80&w=200', 'male', true);
