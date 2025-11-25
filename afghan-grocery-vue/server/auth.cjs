// Custom Authentication Middleware for Plain Text Passwords
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const SECRET = 'your-secret-key-for-development';
const dbPath = path.join(__dirname, 'db.json');

// Read database
function getDb() {
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data);
}

// Write database
function saveDb(db) {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

// Custom auth middleware
module.exports = (req, res, next) => {
    // Handle login
    if (req.method === 'POST' && req.path === '/login') {
        const { email, password } = req.body;
        const db = getDb();

        // Find user by email
        const user = db.users.find(u => u.email === email);

        if (!user) {
            return res.status(400).json({ message: 'Cannot find user' });
        }

        // Compare plain text password
        if (user.password !== password) {
            return res.status(400).json({ message: 'Incorrect password' });
        }

        // Generate token
        const accessToken = jwt.sign(
            { email: user.email, id: user.id },
            SECRET,
            { expiresIn: '1h' }
        );

        // Return user data without password
        const { password: _, ...userWithoutPassword } = user;

        return res.json({
            accessToken,
            user: userWithoutPassword
        });
    }

    // Handle registration
    if (req.method === 'POST' && req.path === '/register') {
        const { email, password, firstName, lastName, phone } = req.body;
        const db = getDb();

        // Check if user already exists
        const existingUser = db.users.find(u => u.email === email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Create new user with plain text password
        const newUser = {
            id: db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1,
            email,
            password, // Plain text password
            firstName,
            lastName,
            phone: phone || '',
            avatar: '',
            addresses: [],
            createdAt: new Date().toISOString()
        };

        db.users.push(newUser);
        saveDb(db);

        // Generate token
        const accessToken = jwt.sign(
            { email: newUser.email, id: newUser.id },
            SECRET,
            { expiresIn: '1h' }
        );

        // Return user data without password
        const { password: _, ...userWithoutPassword } = newUser;

        return res.json({
            accessToken,
            user: userWithoutPassword
        });
    }

    // For other routes, continue to next middleware
    next();
};
