import { createClient, SupabaseClient } from '@supabase/supabase-js';
import config from '../config';

// Polyfill fetch / Headers for Node < 18 when running server-side
if (typeof (globalThis as any).Headers === 'undefined' || typeof (globalThis as any).fetch === 'undefined') {
    try {
        // Prefer undici if available
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const undici = require('undici');
        if (undici && undici.fetch) {
            (globalThis as any).fetch = undici.fetch;
            (globalThis as any).Headers = undici.Headers;
            (globalThis as any).Request = undici.Request;
            (globalThis as any).Response = undici.Response;
        }
    } catch (e) {
        try {
            // Fallback to node-fetch (v2 or v3 may vary by install)
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const nodeFetch = require('node-fetch');
            if (nodeFetch) {
                (globalThis as any).fetch = nodeFetch;
                (globalThis as any).Headers = nodeFetch.Headers || (nodeFetch as any).default?.Headers;
                (globalThis as any).Request = nodeFetch.Request || (nodeFetch as any).default?.Request;
                (globalThis as any).Response = nodeFetch.Response || (nodeFetch as any).default?.Response;
            }
        } catch (err) {
            // If neither polyfill is available, instruct to upgrade Node or install a polyfill
            // Do not throw here to allow a clearer error to be shown by supabase if it fails later
            // but log a helpful message
            // eslint-disable-next-line no-console
            console.warn('Fetch/Headers not polyfilled. Install "undici" or "node-fetch", or upgrade Node to >=18/20 for native fetch support.');
        }
    }
}

const SUPABASE_URL = config.supabase?.url || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = config.supabase?.serviceKey || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error('Supabase URL and Service Key must be provided via config or env');
}

const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false }
});

export default supabase;
