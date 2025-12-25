import { ValidationError } from './errors';

/**
 * Validate and parse numeric ID from string
 * @param id - The ID string to validate
 * @param fieldName - The field name for error message
 * @returns Parsed integer ID
 * @throws ValidationError if invalid
 */
export function validateId(id: string | number, fieldName: string = 'ID'): number {
    const parsed = typeof id === 'number' ? id : parseInt(id, 10);
    
    if (isNaN(parsed) || parsed < 1) {
        throw new ValidationError(`Invalid ${fieldName}. Must be a positive integer.`);
    }
    
    return parsed;
}

/**
 * Validate and parse numeric amount
 * @param amount - The amount to validate
 * @param fieldName - The field name for error message
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Parsed float amount
 * @throws ValidationError if invalid
 */
export function validateAmount(
    amount: string | number,
    fieldName: string = 'Amount',
    min: number = 0,
    max: number = 1000000
): number {
    const parsed = typeof amount === 'number' ? amount : parseFloat(amount);
    
    if (isNaN(parsed)) {
        throw new ValidationError(`Invalid ${fieldName}. Must be a valid number.`);
    }
    
    if (parsed < min) {
        throw new ValidationError(`${fieldName} must be at least ${min}.`);
    }
    
    if (parsed > max) {
        throw new ValidationError(`${fieldName} cannot exceed ${max}.`);
    }
    
    return parsed;
}

/**
 * Validate email format
 * @param email - Email to validate
 * @throws ValidationError if invalid
 * @returns The email if valid
 */
export function validateEmail(email: string): string {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email || !emailRegex.test(email)) {
        throw new ValidationError('Invalid email format.');
    }
    
    return email.trim().toLowerCase();
}

/**
 * Validate string is not empty and within length limits
 * @param str - String to validate
 * @param fieldName - The field name for error message
 * @param minLength - Minimum string length
 * @param maxLength - Maximum string length
 * @throws ValidationError if invalid
 * @returns The trimmed string if valid
 */
export function validateString(
    str: string | undefined,
    fieldName: string = 'String',
    minLength: number = 1,
    maxLength: number = 1000
): string {
    if (!str || typeof str !== 'string') {
        throw new ValidationError(`${fieldName} is required.`);
    }
    
    const trimmed = str.trim();
    
    if (trimmed.length < minLength) {
        throw new ValidationError(`${fieldName} must be at least ${minLength} characters.`);
    }
    
    if (trimmed.length > maxLength) {
        throw new ValidationError(`${fieldName} cannot exceed ${maxLength} characters.`);
    }
    
    return trimmed;
}

/**
 * Validate required field exists
 * @param value - The value to check
 * @param fieldName - The field name for error message
 * @throws ValidationError if missing
 * @returns The value if present
 */
export function validateRequired<T>(value: T | undefined | null, fieldName: string = 'Field'): T {
    if (value === undefined || value === null) {
        throw new ValidationError(`${fieldName} is required.`);
    }
    
    return value;
}

/**
 * Validate array is not empty
 * @param arr - Array to validate
 * @param fieldName - The field name for error message
 * @throws ValidationError if empty
 * @returns The array if valid
 */
export function validateArray<T>(arr: T[] | undefined, fieldName: string = 'Array'): T[] {
    if (!Array.isArray(arr) || arr.length === 0) {
        throw new ValidationError(`${fieldName} cannot be empty.`);
    }
    
    return arr;
}

/**
 * Validate phone number format (basic validation)
 * @param phone - Phone number to validate
 * @throws ValidationError if invalid
 * @returns The phone number if valid
 */
export function validatePhone(phone: string): string {
    // Basic phone validation - at least 10 digits
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    const digitsOnly = phone.replace(/\D/g, '');
    
    if (!phoneRegex.test(phone) || digitsOnly.length < 10) {
        throw new ValidationError('Invalid phone number format.');
    }
    
    return phone.trim();
}

/**
 * Validate URL format
 * @param url - URL to validate
 * @throws ValidationError if invalid
 * @returns The URL if valid
 */
export function validateUrl(url: string): string {
    try {
        new URL(url);
        return url;
    } catch {
        throw new ValidationError('Invalid URL format.');
    }
}

/**
 * Sanitize input string to prevent basic injection attacks
 * @param str - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(str: string): string {
    if (typeof str !== 'string') return '';
    
    return str
        .trim()
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .replace(/--/g, ''); // Remove SQL comment syntax
}

/**
 * Validate object properties exist and are not null/undefined
 * @param obj - Object to validate
 * @param requiredFields - Array of required field names
 * @throws ValidationError if any required field is missing
 * @returns True if valid
 */
export function validateObjectProperties(obj: any, requiredFields: string[]): boolean {
    for (const field of requiredFields) {
        if (obj[field] === undefined || obj[field] === null) {
            throw new ValidationError(`Required field '${field}' is missing.`);
        }
    }
    
    return true;
}

/**
 * Validate query parameter limit is reasonable
 * @param limit - The limit parameter
 * @param defaultLimit - Default limit if not provided
 * @param maxLimit - Maximum allowed limit
 * @throws ValidationError if invalid
 * @returns Validated limit
 */
export function validateLimit(limit: any, defaultLimit: number = 20, maxLimit: number = 100): number {
    if (!limit) return defaultLimit;
    
    const parsed = parseInt(limit, 10);
    
    if (isNaN(parsed) || parsed < 1) {
        throw new ValidationError('Limit must be a positive integer.');
    }
    
    if (parsed > maxLimit) {
        throw new ValidationError(`Limit cannot exceed ${maxLimit}.`);
    }
    
    return parsed;
}

/**
 * Validate query parameter page is reasonable
 * @param page - The page parameter
 * @returns Validated page (default 1)
 * @throws ValidationError if invalid
 */
export function validatePage(page: any): number {
    if (!page) return 1;
    
    const parsed = parseInt(page, 10);
    
    if (isNaN(parsed) || parsed < 1) {
        throw new ValidationError('Page must be a positive integer.');
    }
    
    return parsed;
}

export default {
    validateId,
    validateAmount,
    validateEmail,
    validateString,
    validateRequired,
    validateArray,
    validatePhone,
    validateUrl,
    sanitizeString,
    validateObjectProperties,
    validateLimit,
    validatePage,
};
