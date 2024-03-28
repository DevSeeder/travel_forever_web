import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.TRAVEL_FOREVER_API_STORAGE_SUPABASE_URL;
const supabaseAnonKey = process.env.TRAVEL_FOREVER_API_STORAGE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
