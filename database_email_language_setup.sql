-- =============================================
-- Dookan Email Verification & Language Support
-- Database Schema Updates
-- =============================================

-- Add email verification and language support columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS language VARCHAR(5) DEFAULT 'en' CHECK (language IN ('en', 'ps', 'fa', 'de', 'fr'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email_verified 
ON profiles(email_verified);

CREATE INDEX IF NOT EXISTS idx_profiles_language 
ON profiles(language);

-- Update existing users to have email_verified = true (for backward compatibility)
-- Remove this if you want existing users to re-verify their emails
UPDATE profiles 
SET email_verified = true 
WHERE email_verified IS NULL OR email_verified = false;

-- Add comment for documentation
COMMENT ON COLUMN profiles.email_verified IS 'Track email verification status for new user registrations';
COMMENT ON COLUMN profiles.language IS 'User preferred language: en=English, ps=Pashto, fa=Dari/Farsi, de=German, fr=French';

-- Optional: Create a view for user management with email status
CREATE OR REPLACE VIEW user_overview AS
SELECT 
    p.id,
    p.name,
    p.phone,
    p.role,
    p.email_verified,
    p.language,
    p.created_at,
    p.updated_at,
    au.email,
    au.email_confirmed_at,
    au.last_sign_in_at
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
ORDER BY p.created_at DESC;

-- Grant appropriate permissions (adjust based on your RLS policies)
-- GRANT SELECT ON user_overview TO authenticated;

-- Example query to check email verification status
-- SELECT * FROM user_overview WHERE email_verified = false;

-- Example query to see language distribution
-- SELECT language, COUNT(*) FROM profiles GROUP BY language;

COMMENT ON VIEW user_overview IS 'Comprehensive user view combining profile and auth data for admin dashboard';