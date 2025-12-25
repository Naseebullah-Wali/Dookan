# Connection Timeout Error Handling Guide

## Problem
Your backend is receiving connection timeout errors when Supabase becomes temporarily unreachable:
```
ConnectTimeoutError: Connect Timeout Error (attempted addresses: 172.64.149.246:443, 104.18.38.10:443, timeout: 10000ms)
```

## Solution Implemented

### 1. **New Error Class** (`src/utils/errors.ts`)
Added `ServiceUnavailableError` for 503 status responses:
```typescript
export class ServiceUnavailableError extends AppError {
    constructor(message: string = 'Service temporarily unavailable. Please try again later.') {
        super(message, 503);
    }
}
```

### 2. **Enhanced Error Handler** (`src/middleware/errorHandler.ts`)
Updated to detect and properly handle connection errors:
- Detects `fetch failed`, `ConnectTimeoutError`, `ECONNREFUSED`, `ETIMEDOUT`
- Returns HTTP 503 (Service Unavailable) status
- Logs connection issues with timestamp and request path
- Doesn't crash the server, allows graceful error response

### 3. **Supabase Error Utility** (`src/utils/supabaseHandler.ts`)
Helper functions to wrap Supabase calls:
```typescript
// Usage example:
const reviews = await withSupabaseErrorHandling(
    supabase.from('product_reviews').select('*')
);
```

## What Happens Now

### Before (Old Behavior)
- Connection timeout → Unhandled error → Server logs "Unexpected Error"
- Response might be undefined or partial
- Potential server instability

### After (New Behavior)
- Connection timeout → Caught by error handler
- Returns: `{ success: false, message: "Database connection failed. Please try again in a moment." }`
- HTTP Status: **503 Service Unavailable**
- Server continues running normally
- Client can retry request

## Frontend Handling

The frontend should handle 503 responses:

```javascript
try {
    const response = await api.get('/reviews/product/56')
} catch (error) {
    if (error.response?.status === 503) {
        // Show user: "Service temporarily unavailable, please try again in a moment"
        showToast('Service temporarily unavailable. Please try again.', 'warning')
    } else {
        // Handle other errors
    }
}
```

## Prevention Tips

1. **Monitor Supabase Status**: Check https://status.supabase.com for outages
2. **Increase Timeout** (if needed):
   - Supabase default: 10 seconds
   - In critical endpoints, consider increasing to 15-20 seconds

3. **Add Retry Logic** (Optional):
```typescript
async function retryWithBackoff(fn: () => Promise<any>, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            // Exponential backoff: 100ms, 200ms, 400ms
            await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, i)));
        }
    }
}
```

4. **Health Check Endpoint** (Optional):
```typescript
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});
```

## Testing

To test error handling locally:
1. Stop Supabase/database connection
2. Make a request to affected endpoints
3. Should see 503 response instead of server crash
4. Server logs will show: `⚠️ Connection Timeout Error`

## Status Codes Returned

- **503 Service Unavailable**: Database connection failed
- **500 Internal Server Error**: Other unexpected errors
- **400 Bad Request**: Validation errors
- **401 Unauthorized**: Auth errors
- **404 Not Found**: Resource not found

Your server is now resilient to temporary connection failures! ✅
