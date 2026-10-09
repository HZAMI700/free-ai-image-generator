-- ==============================================================================
-- Supabase Schema for Free AI Image Generator SaaS
-- Host: db.lqmwpfdstacnhqkdivya.supabase.co
-- Zero-account architecture: Public access, server-managed rate limits and storage
-- ==============================================================================

-- 1. Cooldowns table (Enforces 3-minute generation cooldown across distributed instances)
CREATE TABLE IF NOT EXISTS public.cooldowns (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ip_hash TEXT NOT NULL,
  device_id TEXT NOT NULL,
  next_available_at BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cooldowns_lookup ON public.cooldowns (ip_hash, device_id);
CREATE INDEX IF NOT EXISTS idx_cooldowns_next_avail ON public.cooldowns (next_available_at);

-- 2. Generated Images metadata table
CREATE TABLE IF NOT EXISTS public.generated_images (
  id TEXT PRIMARY KEY,
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  model_used TEXT NOT NULL,
  provider_used TEXT NOT NULL DEFAULT 'runware',
  aspect_ratio TEXT NOT NULL DEFAULT '1:1',
  image_url TEXT NOT NULL,
  latency_ms INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  expires_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_generated_images_created ON public.generated_images (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_images_model ON public.generated_images (model_used);

-- 3. Generation logs table (Telemetry, provider latency, health tracking)
CREATE TABLE IF NOT EXISTS public.generation_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'runware',
  model TEXT NOT NULL,
  latency_ms INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'success',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_generation_logs_created ON public.generation_logs (created_at DESC);

-- Enable Row Level Security (RLS) with public read access
ALTER TABLE public.cooldowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_logs ENABLE ROW LEVEL SECURITY;

-- Allow server operations (service role has full access; anonymous users can read public images)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'generated_images' AND policyname = 'Public can view images'
  ) THEN
    CREATE POLICY "Public can view images" ON public.generated_images FOR SELECT USING (true);
  END IF;
END $$;
