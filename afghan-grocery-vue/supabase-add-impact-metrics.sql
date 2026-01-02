-- =====================================================
-- ADD IMPACT METRICS TO SITE SETTINGS
-- =====================================================

-- Insert impact metrics as site settings
INSERT INTO site_settings (key, value, description)
VALUES (
    'impact_metrics',
    '{"families_served": 5000, "orders_delivered": 12500, "cities_covered": 1, "customer_satisfaction": 98}',
    'Impact metrics for about page'
)
ON CONFLICT (key) DO UPDATE
SET value = '{"families_served": 5000, "orders_delivered": 12500, "cities_covered": 1, "customer_satisfaction": 98}',
    updated_at = NOW();

-- You can update these values anytime by running:
-- UPDATE site_settings SET value = '{"families_served": YOUR_NUMBER, "orders_delivered": YOUR_NUMBER, "cities_covered": YOUR_NUMBER, "customer_satisfaction": YOUR_NUMBER}', updated_at = NOW() WHERE key = 'impact_metrics';
