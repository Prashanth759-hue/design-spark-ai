
CREATE TABLE public.designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  domain text NOT NULL DEFAULT 'vehicle',
  title text NOT NULL DEFAULT 'Untitled Design',
  params jsonb NOT NULL DEFAULT '{}'::jsonb,
  thumbnail_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own designs" ON public.designs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own designs" ON public.designs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own designs" ON public.designs
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own designs" ON public.designs
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
