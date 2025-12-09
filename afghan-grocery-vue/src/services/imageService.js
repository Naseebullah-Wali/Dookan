import api from './api'

// Get the backend base URL for serving static files
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

/**
 * Convert a relative image path to an absolute URL
 * @param {string} imagePath - Relative path like '/uploads/products/image.jpg'
 * @returns {string} - Absolute URL like 'http://localhost:3000/uploads/products/image.jpg'
 */
// Default image for products without an image
// Source: https://unsplash.com/photos/a-market-with-lots-of-fruits-and-vegetables-8ZepDlngDkE
const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop'

/**
 * Convert a relative image path to an absolute URL
 * @param {string} imagePath - Relative path like '/uploads/products/image.jpg'
 * @returns {string} - Absolute URL like 'http://localhost:3000/uploads/products/image.jpg'
 */
export function getImageUrl(imagePath) {
    if (!imagePath) return DEFAULT_PRODUCT_IMAGE

    // If already absolute URL, return as-is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath
    }

    // Legacy/Local Backend Support: If path starts with /uploads, serve from Backend
    if (imagePath.startsWith('/uploads/') || imagePath.startsWith('uploads/')) {
        const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
        return `${BACKEND_URL}${path}`
    }

    // Supabase Storage Support
    // If we have a Supabase URL and the path doesn't look like a local upload, 
    // assume it's a file in the 'products' bucket.
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    if (supabaseUrl) {
        // Clean path
        const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath
        return `${supabaseUrl}/storage/v1/object/public/products/${cleanPath}`
    }

    // Fallback to backend default behavior
    const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
    return `${BACKEND_URL}${path}`
}

/**
 * Get avatar URL for testimonials
 * @param {string} gender - 'male' or 'female'
 * @param {number} index - Avatar index (1-5)
 * @returns {string} - Avatar URL
 */
export function getAvatarUrl(gender, index = 1) {
    const avatarIndex = Math.min(Math.max(index, 1), 5)
    return `https://i.pravatar.cc/150?img=${gender === 'female' ? avatarIndex + 10 : avatarIndex}`
}

export default {
    getImageUrl,
    getAvatarUrl
}
