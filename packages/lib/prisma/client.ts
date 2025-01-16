// utils/supabase.ts
import { createClient } from '@supabase/supabase-js';

const dbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const dbKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const db = createClient(dbUrl, dbKey);
