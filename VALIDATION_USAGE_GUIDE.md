# Using the New Validation Utilities

## Quick Reference for Controllers

The new validation utilities are in `src/utils/validation.ts` and should be used in all controllers for input validation.

### Import Statement

```typescript
import {
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
} from '../utils/validation';
```

## Common Use Cases

### 1. Validating ID Parameters

```typescript
export const getAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = validateId(req.params.id, 'Address ID');
        
        const address = await AddressModel.findById(id, req.user!.userId);
        sendSuccess(res, address);
    } catch (error) {
        next(error); // Validation errors are caught by error handler
    }
};
```

### 2. Validating Amounts (Payments/Orders)

```typescript
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate amount is between 0.01 and 1,000,000
        const amount = validateAmount(req.body.amount, 'Order Amount', 0.01, 1000000);
        
        const order = await OrderModel.create({
            ...req.body,
            amount,
            user_id: req.user!.userId
        });
        sendSuccess(res, order, 201);
    } catch (error) {
        next(error);
    }
};
```

### 3. Validating Email

```typescript
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const email = validateEmail(req.body.email);
        
        const user = await UserModel.update(req.user!.userId, { email });
        sendSuccess(res, user);
    } catch (error) {
        next(error);
    }
};
```

### 4. Validating String Fields

```typescript
export const createReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate review text is 10-500 characters
        const reviewText = validateString(
            req.body.review,
            'Review',
            10,  // min length
            500  // max length
        );
        
        const review = await ReviewModel.create({
            text: reviewText,
            product_id: validateId(req.body.product_id),
            user_id: req.user!.userId,
            rating: validateAmount(req.body.rating, 'Rating', 1, 5)
        });
        sendSuccess(res, review, 201);
    } catch (error) {
        next(error);
    }
};
```

### 5. Validating Required Fields

```typescript
export const createAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const street = validateRequired(req.body.street, 'Street address');
        const city = validateRequired(req.body.city, 'City');
        const postalCode = validateRequired(req.body.postal_code, 'Postal code');
        
        const address = await AddressModel.create({
            street,
            city,
            postal_code: postalCode,
            user_id: req.user!.userId
        });
        sendSuccess(res, address, 201);
    } catch (error) {
        next(error);
    }
};
```

### 6. Validating Phone Numbers

```typescript
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const phone = validatePhone(req.body.phone);
        
        const user = await UserModel.update(req.user!.userId, { phone });
        sendSuccess(res, user);
    } catch (error) {
        next(error);
    }
};
```

### 7. Validating Pagination Parameters

```typescript
export const listProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = validatePage(req.query.page);
        const limit = validateLimit(req.query.limit, 20, 100); // default 20, max 100
        
        const offset = (page - 1) * limit;
        
        const { data, total } = await ProductModel.findAll(offset, limit);
        
        sendSuccess(res, {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};
```

### 8. Sanitizing User Input

```typescript
export const sendContactEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const message = validateString(req.body.message, 'Message', 10, 2000);
        const sanitizedMessage = sanitizeString(message);
        
        // Use sanitized message...
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};
```

### 9. Validating Multiple Fields at Once

```typescript
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate all required object properties exist
        validateObjectProperties(req.body, ['email', 'password', 'name']);
        
        // Then validate individual fields
        const email = validateEmail(req.body.email);
        const name = validateString(req.body.name, 'Name', 2, 100);
        const password = validateString(req.body.password, 'Password', 8, 128);
        
        const user = await UserModel.create({
            email,
            name,
            password
        });
        sendSuccess(res, user, 201);
    } catch (error) {
        next(error);
    }
};
```

### 10. Complex Validation in Order Controller

```typescript
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate items array
        const items = validateArray(req.body.items, 'Order items');
        
        // Validate address
        const addressId = validateId(req.body.address_id, 'Address ID');
        
        // Validate amount
        const totalAmount = validateAmount(
            req.body.total_amount,
            'Total amount',
            0.01,
            1000000
        );
        
        // Validate and process items
        const validatedItems = items.map(item => ({
            product_id: validateId(item.product_id, `Product ID`),
            quantity: validateAmount(item.quantity, 'Quantity', 1, 1000),
            price: validateAmount(item.price, 'Price', 0.01, 100000)
        }));
        
        const order = await OrderModel.create({
            items: validatedItems,
            address_id: addressId,
            total_amount: totalAmount,
            user_id: req.user!.userId
        });
        
        sendSuccess(res, order, 201);
    } catch (error) {
        next(error); // ValidationError caught and returned with 400 status
    }
};
```

## Error Handling

All validation functions throw `ValidationError` which has:
- Status code: 400
- Message describing the validation issue

The global error handler catches these and returns a proper 400 response:

```json
{
    "success": false,
    "error": "Invalid Address ID. Must be a positive integer."
}
```

## Best Practices

1. **Always validate IDs first** - Prevents unnecessary processing
2. **Validate lengths before processing** - Prevents large string attacks
3. **Use appropriate min/max values** - Check business requirements
4. **Sanitize before storing** - Use `sanitizeString()` for user content
5. **Let error handler catch errors** - Don't try/catch validation errors
6. **Use descriptive field names** - Makes error messages clearer

## Example Complete Controller

```typescript
import { Request, Response, NextFunction } from 'express';
import AddressModel from '../models/Address';
import { sendSuccess } from '../utils/response';
import {
    validateId,
    validateString,
    validateRequired,
    validatePhone,
    sanitizeString
} from '../utils/validation';

export const createAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate all inputs
        const street = validateString(req.body.street, 'Street', 5, 200);
        const city = validateString(req.body.city, 'City', 2, 100);
        const postalCode = validateString(req.body.postal_code, 'Postal code', 1, 20);
        const phone = validatePhone(req.body.phone);
        
        // Sanitize optional notes field
        const notes = req.body.notes ? sanitizeString(req.body.notes) : '';
        
        // Create address
        const address = await AddressModel.create({
            street: sanitizeString(street),
            city: sanitizeString(city),
            postal_code: sanitizeString(postalCode),
            phone,
            notes,
            user_id: req.user!.userId
        });
        
        sendSuccess(res, address, 201);
    } catch (error) {
        next(error);
    }
};

export const updateAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = validateId(req.params.id, 'Address ID');
        
        // Validate only provided fields
        const updates: any = {};
        if (req.body.street) updates.street = sanitizeString(validateString(req.body.street, 'Street', 5, 200));
        if (req.body.city) updates.city = sanitizeString(validateString(req.body.city, 'City', 2, 100));
        if (req.body.phone) updates.phone = validatePhone(req.body.phone);
        
        const address = await AddressModel.update(id, req.user!.userId, updates);
        sendSuccess(res, address);
    } catch (error) {
        next(error);
    }
};

export const getAddresses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const addresses = await AddressModel.findByUserId(req.user!.userId);
        sendSuccess(res, addresses);
    } catch (error) {
        next(error);
    }
};

export const deleteAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = validateId(req.params.id, 'Address ID');
        await AddressModel.delete(id, req.user!.userId);
        sendSuccess(res, null, 200, 'Address deleted successfully');
    } catch (error) {
        next(error);
    }
};
```

## Updating Existing Controllers

To integrate validation into existing controllers, follow this pattern:

```typescript
// BEFORE
export const updateAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const address = await AddressModel.update(
            parseInt(req.params.id),
            req.user!.userId,
            req.body
        );
        sendSuccess(res, address);
    } catch (error) {
        next(error);
    }
};

// AFTER
export const updateAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = validateId(req.params.id, 'Address ID');
        
        const address = await AddressModel.update(id, req.user!.userId, req.body);
        sendSuccess(res, address);
    } catch (error) {
        next(error);
    }
};
```

This ensures all inputs are properly validated before processing!
