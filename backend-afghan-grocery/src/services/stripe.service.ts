import Stripe from 'stripe';
import config from '../config';

// Initialize Stripe with the appropriate key based on environment
const getStripeKey = (): string => {
    const isProduction = config.env === 'production';
    
    if (isProduction) {
        const liveKey = process.env.STRIPE_SECRET_KEY_LIVE;
        if (!liveKey) {
            throw new Error('STRIPE_SECRET_KEY_LIVE is not set in production');
        }
        return liveKey;
    }
    
    const testKey = process.env.STRIPE_SECRET_KEY_TEST;
    if (!testKey) {
        throw new Error('STRIPE_SECRET_KEY_TEST is not set');
    }
    return testKey;
};

const stripe = new Stripe(getStripeKey(), {
    apiVersion: '2023-10-16' as any,
});

/**
 * Create a Payment Intent for checkout
 * Supports multiple currencies
 */
export async function createPaymentIntent({
    amount,
    currency = 'usd',
    customerId,
    description,
    metadata = {},
}: {
    amount: number; // Amount in cents (e.g., 1000 = $10.00)
    currency?: string; // 'usd', 'eur', 'afn', etc.
    customerId?: string;
    description?: string;
    metadata?: Record<string, string | number>;
}): Promise<Stripe.PaymentIntent> {
    try {
        console.log(`💳 Creating Payment Intent: ${amount} ${currency.toUpperCase()}`);
        
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: currency.toLowerCase(),
            customer: customerId,
            description,
            metadata: {
                ...metadata,
                environment: config.env,
                timestamp: new Date().toISOString(),
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        console.log(`✅ Payment Intent created: ${paymentIntent.id}`);
        return paymentIntent;
    } catch (error: any) {
        console.error('❌ Error creating Payment Intent:', {
            message: error.message,
            code: error.code,
        });
        throw error;
    }
}

/**
 * Retrieve a Payment Intent
 */
export async function getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
        return await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error: any) {
        console.error('❌ Error retrieving Payment Intent:', error.message);
        throw error;
    }
}

/**
 * Create a customer in Stripe
 */
export async function createCustomer({
    email,
    name,
    metadata = {},
}: {
    email: string;
    name?: string;
    metadata?: Record<string, string>;
}): Promise<Stripe.Customer> {
    try {
        console.log(`👤 Creating Stripe customer: ${email}`);
        
        const customer = await stripe.customers.create({
            email,
            name,
            metadata,
        });

        console.log(`✅ Stripe customer created: ${customer.id}`);
        return customer;
    } catch (error: any) {
        console.error('❌ Error creating customer:', error.message);
        throw error;
    }
}

/**
 * Get or create a customer
 */
export async function getOrCreateCustomer({
    email,
    name,
}: {
    email: string;
    name?: string;
}): Promise<Stripe.Customer> {
    try {
        // Search for existing customer
        const customers = await stripe.customers.list({
            email,
            limit: 1,
        });

        if (customers.data.length > 0) {
            console.log(`👤 Found existing Stripe customer: ${customers.data[0].id}`);
            return customers.data[0];
        }

        // Create new customer if not found
        return await createCustomer({ email, name });
    } catch (error: any) {
        console.error('❌ Error getting/creating customer:', error.message);
        throw error;
    }
}

/**
 * Create a Payment Method
 */
export async function createPaymentMethod({
    type = 'card',
    card,
    billingDetails,
}: {
    type?: string;
    card: {
        number: string;
        exp_month: number;
        exp_year: number;
        cvc: string;
    };
    billingDetails?: Stripe.PaymentMethodCreateParams.BillingDetails;
}): Promise<Stripe.PaymentMethod> {
    try {
        return await stripe.paymentMethods.create({
            type: type as any,
            card,
            billing_details: billingDetails,
        });
    } catch (error: any) {
        console.error('❌ Error creating Payment Method:', error.message);
        throw error;
    }
}

/**
 * Get supported currencies
 * Returns common currencies with conversion rates
 */
export function getSupportedCurrencies(): Record<string, string> {
    return {
        'usd': 'US Dollar',
        'eur': 'Euro',
        'gbp': 'British Pound',
        'jpy': 'Japanese Yen',
        'cad': 'Canadian Dollar',
        'aud': 'Australian Dollar',
        'chf': 'Swiss Franc',
        'cny': 'Chinese Yuan',
        'inr': 'Indian Rupee',
        'nzd': 'New Zealand Dollar',
        'sgd': 'Singapore Dollar',
        'hkd': 'Hong Kong Dollar',
        'nok': 'Norwegian Krone',
        'sek': 'Swedish Krona',
        'dkk': 'Danish Krone',
        'pln': 'Polish Zloty',
        'czk': 'Czech Koruna',
        'huf': 'Hungarian Forint',
        'ron': 'Romanian Leu',
        'bgn': 'Bulgarian Lev',
        'hrk': 'Croatian Kuna',
        'try': 'Turkish Lira',
        'brl': 'Brazilian Real',
        'mxn': 'Mexican Peso',
        'ars': 'Argentine Peso',
        'clp': 'Chilean Peso',
        'cop': 'Colombian Peso',
        'zar': 'South African Rand',
        'egp': 'Egyptian Pound',
        'idr': 'Indonesian Rupiah',
        'thb': 'Thai Baht',
        'myr': 'Malaysian Ringgit',
        'php': 'Philippine Peso',
        'pkr': 'Pakistani Rupee',
        'bdt': 'Bangladesh Taka',
        'vnd': 'Vietnamese Dong',
        'aed': 'UAE Dirham',
        'sar': 'Saudi Riyal',
        'qar': 'Qatari Riyal',
        'kwd': 'Kuwaiti Dinar',
        'afn': 'Afghan Afghani',
    };
}

/**
 * Validate currency is supported
 */
export function isValidCurrency(currency: string): boolean {
    return currency.toLowerCase() in getSupportedCurrencies();
}

/**
 * Get minimum amount for currency (Stripe has minimums)
 * Most currencies require minimum of 50 cents in smallest unit
 */
export function getMinimumAmount(currency: string): number {
    const zeroDecimalCurrencies = ['jpy', 'krw', 'vnd', 'clp', 'pyg', 'ugx'];
    const currency_lower = currency.toLowerCase();
    
    if (zeroDecimalCurrencies.includes(currency_lower)) {
        return 50; // 50 in the currency
    }
    
    return 50; // 50 cents in two-decimal currencies
}

/**
 * Create a Stripe Payment Link (hosted checkout)
 * This creates a link to Stripe's hosted payment page
 */
export async function createPaymentLink({
    items,
    currency = 'usd',
    description = 'Order',
    userEmail,
    userId,
    successUrl,
    cancelUrl,
    metadata = {},
}: {
    items: Array<{
        name: string;
        amount: number;
        quantity: number;
        image?: string;
    }>;
    currency?: string;
    description?: string;
    userEmail?: string;
    userId?: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
}): Promise<Stripe.PaymentLink> {
    try {
        console.log(`🔗 Creating Payment Link: ${items.length} items in ${currency.toUpperCase()}`);
        
        // Convert items to Stripe line items format
        const lineItems = items.map(item => {
            // Prices come from frontend already converted to selected currency and in cents
            // item.amount is already in cents of the selected currency
            const unitAmount = Math.round(item.amount);
            
            return {
                price_data: {
                    currency: currency.toLowerCase(),
                    product_data: {
                        name: item.name,
                        images: item.image ? [item.image] : undefined,
                    },
                    unit_amount: unitAmount,
                },
                quantity: item.quantity,
            };
        });

        const paymentLink = await stripe.paymentLinks.create({
            line_items: lineItems as any,
            after_completion: {
                type: 'redirect',
                redirect: {
                    url: successUrl,
                },
            } as any,
        } as any);

        console.log(`✅ Payment Link created: ${paymentLink.id}`);
        return paymentLink;
    } catch (error: any) {
        console.error('❌ Error creating Payment Link:', {
            message: error.message,
            code: error.code,
        });
        throw error;
    }
}

export default stripe;
