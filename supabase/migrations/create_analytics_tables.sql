
-- Create a table to store RDO analytics data
CREATE TABLE IF NOT EXISTS public.obra_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id UUID REFERENCES public.obras(id) NOT NULL,
  last_rdo_id UUID NOT NULL,
  last_rdo_date TIMESTAMP WITH TIME ZONE NOT NULL,
  overall_progress NUMERIC DEFAULT 0,
  activity_progress JSONB DEFAULT '{}',
  team_distribution JSONB DEFAULT '{}',
  weather_idle_hours INTEGER DEFAULT 0,
  has_accidents BOOLEAN DEFAULT FALSE,
  has_equipment_issues BOOLEAN DEFAULT FALSE,
  gpt_analysis TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (obra_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_obra_analytics_obra_id ON public.obra_analytics(obra_id);

-- Create a table to store WhatsApp message logs
CREATE TABLE IF NOT EXISTS public.whatsapp_message_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rdo_id UUID,
  sender TEXT,
  message TEXT NOT NULL,
  response TEXT,
  question TEXT,
  direction TEXT DEFAULT 'outgoing',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for WhatsApp message logs
CREATE INDEX IF NOT EXISTS idx_whatsapp_message_log_rdo_id ON public.whatsapp_message_log(rdo_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_message_log_timestamp ON public.whatsapp_message_log(timestamp);

-- Create RLA policies for the analytics tables
ALTER TABLE public.obra_analytics ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to view analytics for obras they have access to
CREATE POLICY "Users can view analytics for their obras" 
  ON public.obra_analytics 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.obras 
      WHERE public.obras.id = public.obra_analytics.obra_id 
      AND public.obras.user_id = auth.uid()
    )
  );

-- Create policy that allows users to insert analytics for their obras
CREATE POLICY "Users can insert analytics for their obras" 
  ON public.obra_analytics 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.obras 
      WHERE public.obras.id = public.obra_analytics.obra_id 
      AND public.obras.user_id = auth.uid()
    )
  );

-- Create policy that allows users to update analytics for their obras
CREATE POLICY "Users can update analytics for their obras" 
  ON public.obra_analytics 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.obras 
      WHERE public.obras.id = public.obra_analytics.obra_id 
      AND public.obras.user_id = auth.uid()
    )
  );

-- Create a table to store RDO photos
CREATE TABLE IF NOT EXISTS public.rdo_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rdo_id UUID NOT NULL,
  url TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for RDO photos
CREATE INDEX IF NOT EXISTS idx_rdo_photos_rdo_id ON public.rdo_photos(rdo_id);

-- Create a storage bucket for RDO photos if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('rdo-photos', 'rdo-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Add storage policy to allow authenticated users to upload photos
CREATE POLICY "Authenticated users can upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'rdo-photos');

-- Add storage policy to allow public to view photos
CREATE POLICY "Public can view photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'rdo-photos');
