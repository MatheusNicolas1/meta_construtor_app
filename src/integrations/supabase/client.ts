// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://jchnjeihrutgmfjwnfyo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjaG5qZWlocnV0Z21manduZnlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1OTk2ODIsImV4cCI6MjA1OTE3NTY4Mn0.Mkn0XWEwElTiFWNLjm58PfSoj6QT-zUMisaCQxqtqHs";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);