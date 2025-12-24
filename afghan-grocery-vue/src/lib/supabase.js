// Supabase client removed from frontend.
// This file remains as a fail-fast stub in case any legacy import was missed.
export const supabase = (() => {
    throw new Error('Frontend must not import Supabase client. Use backend API endpoints instead.')
})();

export const getCurrentUser = async () => {
    throw new Error('Frontend must not call Supabase directly. Use backend auth endpoints.')
}

export const getUserProfile = async () => {
    throw new Error('Frontend must not call Supabase directly. Use backend API endpoints.')
}

export default supabase
