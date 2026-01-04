/**
 * Telegram Notification Service
 * Sends order notifications to a Telegram chat/group
 */

import config from '../config';

interface OrderNotification {
    orderId: number;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    address: {
        street: string;
        city: string;
        state?: string;
        country?: string;
    };
    items: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
    subtotal: number;
    shippingFee: number;
    total: number;
    paymentMethod: string;
    paymentStatus: string;
    status: string;
    notes?: string;
}

interface StatusUpdateNotification {
    orderId: number;
    orderNumber: string;
    customerName: string;
    oldStatus: string;
    newStatus: string;
    paymentStatus?: string;
    trackingNumber?: string;
}

interface TelegramResponse {
    ok?: boolean;
    description?: string;
    result?: {
        username?: string;
        [key: string]: any;
    };
}

class TelegramService {
    private botToken: string;
    private chatId: string;
    private threadId: string | null;
    private enabled: boolean;
    private baseUrl: string;

    constructor() {
        this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
        this.chatId = process.env.TELEGRAM_CHAT_ID || '';
        this.threadId = process.env.TELEGRAM_THREAD_ID || null;
        this.enabled = !!(this.botToken && this.chatId);
        this.baseUrl = `https://api.telegram.org/bot${this.botToken}`;
        
        if (!this.enabled) {
            console.warn('[Telegram] Bot token or chat ID not configured. Notifications disabled.');
        } else {
            console.log('[Telegram] Notification service initialized' + (this.threadId ? ` (topic: ${this.threadId})` : ''));
        }
    }

    /**
     * Send a message to the configured Telegram chat
     */
    private async sendMessage(text: string, parseMode: 'HTML' | 'Markdown' = 'HTML'): Promise<boolean> {
        if (!this.enabled) {
            console.log('[Telegram] Notifications disabled, skipping message');
            return false;
        }

        try {
            const payload: any = {
                chat_id: this.chatId,
                text,
                parse_mode: parseMode,
                disable_web_page_preview: true,
            };

            // Add thread_id for forum topics
            if (this.threadId) {
                payload.message_thread_id = parseInt(this.threadId);
            }

            const response = await fetch(`${this.baseUrl}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result: TelegramResponse = await response.json();
            
            if (!result.ok) {
                console.error('[Telegram] Failed to send message:', result.description);
                return false;
            }

            return true;
        } catch (error) {
            console.error('[Telegram] Error sending message:', error);
            return false;
        }
    }

    /**
     * Format currency for display
     */
    private formatCurrency(amount: number): string {
        return `${amount.toLocaleString()} AFN`;
    }

    /**
     * Get emoji for order status
     */
    private getStatusEmoji(status: string): string {
        const emojis: Record<string, string> = {
            'pending': '⏳',
            'confirmed': '✅',
            'processing': '🔄',
            'shipped': '📦',
            'delivered': '🎉',
            'cancelled': '❌',
        };
        return emojis[status] || '📋';
    }

    /**
     * Get emoji for payment status
     */
    private getPaymentEmoji(status: string): string {
        const emojis: Record<string, string> = {
            'pending': '⏳',
            'paid': '💰',
            'failed': '❌',
            'refunded': '↩️',
        };
        return emojis[status] || '💳';
    }

    /**
     * Get payment method display name
     */
    private getPaymentMethodName(method: string): string {
        const names: Record<string, string> = {
            'cod': '💵 Cash on Delivery',
            'card': '💳 Credit/Debit Card',
            'bank_transfer': '🏦 Bank Transfer',
            'paypal': '🅿️ PayPal',
            'trc20': '💎 Crypto (TRC20)',
            'arbitrum': '🔷 Crypto (Arbitrum)',
            'stripe': '💳 Stripe',
            'whatsapp': '📱 WhatsApp Order',
        };
        return names[method] || method;
    }

    /**
     * Send notification for a new order
     */
    async sendNewOrderNotification(order: OrderNotification): Promise<boolean> {
        const itemsList = order.items
            .map((item, idx) => `  ${idx + 1}. ${item.name} × ${item.quantity} = ${this.formatCurrency(item.price * item.quantity)}`)
            .join('\n');

        const message = `
🛒 <b>NEW ORDER RECEIVED!</b>

📝 <b>Order #${order.orderNumber}</b>
🆔 ID: ${order.orderId}

👤 <b>Customer Details:</b>
• Name: ${order.customerName}
• Phone: <code>${order.customerPhone}</code>
${order.customerEmail ? `• Email: ${order.customerEmail}` : ''}

📍 <b>Delivery Address:</b>
${order.address.street}
${order.address.city}${order.address.state ? ', ' + order.address.state : ''}
${order.address.country || 'Afghanistan'}

🛍️ <b>Items:</b>
${itemsList}

💰 <b>Order Summary:</b>
• Subtotal: ${this.formatCurrency(order.subtotal)}
• Shipping: ${this.formatCurrency(order.shippingFee)}
• <b>Total: ${this.formatCurrency(order.total)}</b>

💳 <b>Payment:</b>
• Method: ${this.getPaymentMethodName(order.paymentMethod)}
• Status: ${this.getPaymentEmoji(order.paymentStatus)} ${order.paymentStatus.toUpperCase()}

${order.notes ? `📝 <b>Notes:</b>\n${order.notes}` : ''}

⏰ ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kabul' })}
`.trim();

        return this.sendMessage(message);
    }

    /**
     * Send notification for order status update
     */
    async sendStatusUpdateNotification(notification: StatusUpdateNotification): Promise<boolean> {
        const message = `
${this.getStatusEmoji(notification.newStatus)} <b>ORDER STATUS UPDATED</b>

📝 <b>Order #${notification.orderNumber}</b>
🆔 ID: ${notification.orderId}
👤 Customer: ${notification.customerName}

📊 <b>Status Change:</b>
${this.getStatusEmoji(notification.oldStatus)} ${notification.oldStatus.toUpperCase()} → ${this.getStatusEmoji(notification.newStatus)} ${notification.newStatus.toUpperCase()}

${notification.paymentStatus ? `💰 Payment: ${this.getPaymentEmoji(notification.paymentStatus)} ${notification.paymentStatus.toUpperCase()}` : ''}
${notification.trackingNumber ? `📦 Tracking: <code>${notification.trackingNumber}</code>` : ''}

⏰ ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kabul' })}
`.trim();

        return this.sendMessage(message);
    }

    /**
     * Send notification for payment status update
     */
    async sendPaymentStatusNotification(
        orderId: number,
        orderNumber: string,
        customerName: string,
        paymentMethod: string,
        oldStatus: string,
        newStatus: string,
        amount: number
    ): Promise<boolean> {
        const emoji = newStatus === 'paid' ? '✅' : newStatus === 'failed' ? '❌' : '🔄';
        
        const message = `
${emoji} <b>PAYMENT STATUS UPDATE</b>

📝 <b>Order #${orderNumber}</b>
🆔 ID: ${orderId}
👤 Customer: ${customerName}

💳 <b>Payment Details:</b>
• Method: ${this.getPaymentMethodName(paymentMethod)}
• Amount: ${this.formatCurrency(amount)}

📊 <b>Status Change:</b>
${this.getPaymentEmoji(oldStatus)} ${oldStatus.toUpperCase()} → ${this.getPaymentEmoji(newStatus)} ${newStatus.toUpperCase()}

⏰ ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kabul' })}
`.trim();

        return this.sendMessage(message);
    }

    /**
     * Send a custom notification
     */
    async sendCustomNotification(title: string, body: string): Promise<boolean> {
        const message = `
📢 <b>${title}</b>

${body}

⏰ ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kabul' })}
`.trim();

        return this.sendMessage(message);
    }

    /**
     * Test the Telegram connection
     */
    async testConnection(): Promise<{ success: boolean; message: string }> {
        if (!this.enabled) {
            return { 
                success: false, 
                message: 'Telegram bot token or chat ID not configured' 
            };
        }

        try {
            const response = await fetch(`${this.baseUrl}/getMe`);
            const result: TelegramResponse = await response.json();

            if (!result.ok) {
                return { 
                    success: false, 
                    message: `Bot verification failed: ${result.description}` 
                };
            }

            // Send a test message
            const testSent = await this.sendMessage('🔔 <b>Test notification</b>\n\nTelegram notifications are working correctly!');
            
            if (testSent) {
                return { 
                    success: true, 
                    message: `Connected as @${result.result?.username || 'unknown'}. Test message sent!` 
                };
            } else {
                return { 
                    success: false, 
                    message: 'Bot connected but failed to send test message. Check chat ID.' 
                };
            }
        } catch (error: any) {
            return { 
                success: false, 
                message: `Connection error: ${error.message}` 
            };
        }
    }
}

// Export singleton instance
export const telegramService = new TelegramService();
export default telegramService;
