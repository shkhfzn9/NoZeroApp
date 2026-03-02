import { createClient } from '@supabase/supabase-js'
import fetch from 'cross-fetch'

// Use Vercel Rewrite Proxy in Production to bypass ISP Domain Blocking
const isProd = import.meta.env.MODE === 'production';
const proxyOrigin = typeof window !== 'undefined' ? window.location.origin : '';

const supabaseUrl = isProd
    ? `${proxyOrigin}/api/supabase`
    : import.meta.env.VITE_SUPABASE_URL;

const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Custom fetch wrapper to pass original host headers through Vercel's proxy
// Supabase needs this to know where to point the {{ .ConfirmationURL }} instead of localhost
const customFetch = (url, options = {}) => {
    if (isProd && typeof window !== 'undefined') {
        options.headers = {
            ...options.headers,
            'x-forwarded-host': window.location.host,
            'x-forwarded-proto': window.location.protocol.replace(':', '')
        };
    }
    return fetch(url, options);
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    },
    global: {
        fetch: customFetch
    }
})
