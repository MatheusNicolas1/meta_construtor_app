// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://jchnjeihrutgmfjwnfyo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_KEY || "eyJHbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBlcmJhc2UiLCJyZWYiOiJqY2huamVpbnJ1dGdtZmp3bmZ5byIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzEwMTkyMDIxLCJleHAiOjIwMjU3NTgwMjF9.MKknOXWEWELTFWNljm58PFSoj6QT-zUMisacQXqtqHs";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);