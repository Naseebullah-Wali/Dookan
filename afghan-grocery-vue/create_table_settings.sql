-- Create site_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS site_settings (
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

-- Insert default exchange rates configuration
INSERT INTO site_settings (key, value, description)
VALUES 
    ('exchange_rates', 
    '{"AFN": 1, "USD": 70, "EUR": 75}', 
    'Currency exchange rates relative to AFN')
ON CONFLICT (key) DO NOTHING;
