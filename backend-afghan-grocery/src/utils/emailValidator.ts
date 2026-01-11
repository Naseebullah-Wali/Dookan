import dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);

/**
 * E-commerce grade email validation
 * Similar to Amazon, eBay, and other major e-commerce platforms
 */
export class EmailValidator {
    // Disposable/temporary email providers
    private static disposableProviders: string[] = [
        'mailinator.com', '10minutemail.com', 'guerrillamail.com', 'tempmail.org',
        'yopmail.com', 'throwaway.email', 'temp-mail.org', 'maildrop.cc',
        'sharklasers.com', 'guerrillamail.info', 'guerrillamail.biz',
        'getnada.com', 'mohmal.com', 'emailondeck.com', 'fakeinbox.com',
        'tempail.com', 'tempr.email', 'discard.email', 'spamgourmet.com'
    ];

    // Major email providers that need strict validation
    private static majorProviders: string[] = [
        'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com',
        'aol.com', 'icloud.com', 'me.com', 'mac.com', 'msn.com'
    ];

    /**
     * Check if email format is valid
     */
    static isValidFormat(email: string): boolean {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        
        if (!emailRegex.test(email)) return false;
        if (email.length > 254) return false;
        
        const [local, domain] = email.split('@');
        if (!local || !domain) return false;
        if (local.length > 64) return false;
        if (local.startsWith('.') || local.endsWith('.')) return false;
        if (local.includes('..')) return false;
        
        return true;
    }

    /**
     * Check if email is from a disposable provider
     */
    static isDisposable(email: string): boolean {
        const domain = email.split('@')[1]?.toLowerCase();
        return this.disposableProviders.includes(domain);
    }

    /**
     * Check if email looks fake (numbers only, test patterns, etc.)
     */
    static isSuspicious(email: string): boolean {
        const local = email.split('@')[0].toLowerCase();
        const domain = email.split('@')[1]?.toLowerCase();
        
        // Only numbers as username (like 34234@gmail.com)
        if (/^\d+$/.test(local)) {
            return true;
        }
        
        // Single letter + numbers (like a123456@gmail.com)
        if (/^[a-z]\d{4,}$/.test(local)) {
            return true;
        }
        
        // Test/fake/dummy patterns
        if (/^(test|fake|dummy|temp|spam|trash|junk|asdf|qwerty)\d*$/.test(local)) {
            return true;
        }
        
        // Very short usernames (1-2 chars) on major providers
        if (this.majorProviders.includes(domain) && local.length <= 2) {
            return true;
        }
        
        // Repeated characters (like aaaa@, xxxx@)
        if (/^(.)\1{3,}$/.test(local)) {
            return true;
        }
        
        // Sequential patterns
        if (/^(abc|xyz|123|111|000)\d*$/.test(local)) {
            return true;
        }
        
        return false;
    }

    /**
     * Check if domain has MX records (can receive email)
     */
    static async hasMXRecord(email: string): Promise<boolean> {
        try {
            const domain = email.split('@')[1];
            const records = await resolveMx(domain);
            return records && records.length > 0;
        } catch {
            return false;
        }
    }

    /**
     * Main validation function - e-commerce grade
     */
    static async validateEmail(email: string): Promise<{ isValid: boolean; error?: string; reason?: string }> {
        // 1. Format check
        if (!this.isValidFormat(email)) {
            return {
                isValid: false,
                error: 'Please enter a valid email address',
                reason: 'Invalid format'
            };
        }

        // 2. Disposable email check
        if (this.isDisposable(email)) {
            return {
                isValid: false,
                error: 'Temporary email addresses are not allowed. Please use your regular email',
                reason: 'Disposable provider'
            };
        }

        // 3. Suspicious pattern check
        if (this.isSuspicious(email)) {
            return {
                isValid: false,
                error: 'Please use a valid email address. We need to send you order updates',
                reason: 'Suspicious pattern'
            };
        }

        // 4. MX record check (domain can receive emails)
        try {
            const hasMX = await this.hasMXRecord(email);
            if (!hasMX) {
                return {
                    isValid: false,
                    error: 'This email domain cannot receive messages. Please check your email',
                    reason: 'No MX record'
                };
            }
        } catch (err) {
            console.warn('MX check failed:', err);
        }

        return { isValid: true };
    }
}
