import { createClient } from '@supabase/supabase-js'

// Use Vercel Rewrite Proxy in Production to bypass ISP Domain Blocking
const isProd = import.meta.env.MODE === 'production';
const proxyOrigin = typeof window !== 'undefined' ? window.location.origin : '';

const supabaseUrl = isProd
    ? `${proxyOrigin}/api/supabase`
    : import.meta.env.VITE_SUPABASE_URL;

const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
})

