-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- University profiles
CREATE TABLE IF NOT EXISTS public.university_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  website TEXT,
  logo_url TEXT,
  banner_url TEXT,
  contact_email TEXT,
  phone TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.university_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for university_profiles
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'university_profiles' AND policyname = 'Public can view published university profiles'
  ) THEN
    CREATE POLICY "Public can view published university profiles"
    ON public.university_profiles
    FOR SELECT
    USING (is_published = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'university_profiles' AND policyname = 'Users can view their own profile'
  ) THEN
    CREATE POLICY "Users can view their own profile"
    ON public.university_profiles
    FOR SELECT
    USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'university_profiles' AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile"
    ON public.university_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'university_profiles' AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile"
    ON public.university_profiles
    FOR UPDATE
    USING (auth.uid() = id);
  END IF;
END $$;

-- Trigger for updated_at on university_profiles
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_university_profiles_updated_at'
  ) THEN
    CREATE TRIGGER trg_university_profiles_updated_at
    BEFORE UPDATE ON public.university_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- University programs
CREATE TABLE IF NOT EXISTS public.university_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  degree_level TEXT,
  duration TEXT,
  tuition_fee TEXT,
  description TEXT,
  delivery_mode TEXT,
  application_deadline DATE,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.university_programs ENABLE ROW LEVEL SECURITY;

-- Policies for university_programs
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'university_programs' AND policyname = 'Public can view published programs'
  ) THEN
    CREATE POLICY "Public can view published programs"
    ON public.university_programs
    FOR SELECT
    USING (is_published = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'university_programs' AND policyname = 'Users can view their own programs'
  ) THEN
    CREATE POLICY "Users can view their own programs"
    ON public.university_programs
    FOR SELECT
    USING (auth.uid() = university_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'university_programs' AND policyname = 'Users can insert their own programs'
  ) THEN
    CREATE POLICY "Users can insert their own programs"
    ON public.university_programs
    FOR INSERT
    WITH CHECK (auth.uid() = university_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'university_programs' AND policyname = 'Users can update their own programs'
  ) THEN
    CREATE POLICY "Users can update their own programs"
    ON public.university_programs
    FOR UPDATE
    USING (auth.uid() = university_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'university_programs' AND policyname = 'Users can delete their own programs'
  ) THEN
    CREATE POLICY "Users can delete their own programs"
    ON public.university_programs
    FOR DELETE
    USING (auth.uid() = university_id);
  END IF;
END $$;

-- Trigger for updated_at on university_programs
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_university_programs_updated_at'
  ) THEN
    CREATE TRIGGER trg_university_programs_updated_at
    BEFORE UPDATE ON public.university_programs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Analytics events table
CREATE TABLE IF NOT EXISTS public.university_analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id UUID NULL REFERENCES public.university_programs(id) ON DELETE SET NULL,
  actor_id UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('view','application')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.university_analytics_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'university_analytics_events' AND policyname = 'Universities can read their analytics'
  ) THEN
    CREATE POLICY "Universities can read their analytics"
    ON public.university_analytics_events
    FOR SELECT
    USING (auth.uid() = university_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'university_analytics_events' AND policyname = 'Authenticated users can log events'
  ) THEN
    CREATE POLICY "Authenticated users can log events"
    ON public.university_analytics_events
    FOR INSERT
    WITH CHECK (actor_id = auth.uid());
  END IF;
END $$;

-- Enable realtime
ALTER TABLE public.university_profiles REPLICA IDENTITY FULL;
ALTER TABLE public.university_programs REPLICA IDENTITY FULL;
ALTER TABLE public.university_analytics_events REPLICA IDENTITY FULL;

DO $$ BEGIN
  -- add to publication, ignore if already added
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.university_profiles;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.university_programs;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.university_analytics_events;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- Storage bucket for universities
INSERT INTO storage.buckets (id, name, public) VALUES ('universities', 'universities', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read for universities bucket'
  ) THEN
    CREATE POLICY "Public read for universities bucket"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'universities');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can upload to their folder in universities bucket'
  ) THEN
    CREATE POLICY "Users can upload to their folder in universities bucket"
    ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'universities' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can update their files in universities bucket'
  ) THEN
    CREATE POLICY "Users can update their files in universities bucket"
    ON storage.objects
    FOR UPDATE
    USING (bucket_id = 'universities' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can delete their files in universities bucket'
  ) THEN
    CREATE POLICY "Users can delete their files in universities bucket"
    ON storage.objects
    FOR DELETE
    USING (bucket_id = 'universities' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_university_programs_university_id ON public.university_programs(university_id);
CREATE INDEX IF NOT EXISTS idx_university_analytics_events_university_id ON public.university_analytics_events(university_id);
CREATE INDEX IF NOT EXISTS idx_university_analytics_events_type_created ON public.university_analytics_events(event_type, created_at);
