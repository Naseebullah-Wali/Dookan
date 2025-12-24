-- Create users table for local authentication and Google OAuth
CREATE TABLE IF NOT EXISTS public.users (
    id BIGSERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL DEFAULT '',
    name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    is_verified SMALLINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);

-- Set up automatic updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_users_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_timestamp_trigger
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.update_users_timestamp();

-- Enable RLS (Row Level Security) if needed
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Optional: Create RLS policies (commented out - adjust as needed for your use case)
-- CREATE POLICY "users_select_own" ON public.users
--     FOR SELECT USING (auth.uid()::text = id::text);
-- CREATE POLICY "users_update_own" ON public.users
--     FOR UPDATE USING (auth.uid()::text = id::text);
