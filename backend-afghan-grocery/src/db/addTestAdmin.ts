import DatabaseConnection from './connection';
import { hashPassword } from '../utils/auth';

const addTestAdmin = async () => {
    const db = await DatabaseConnection.getInstance();

    try {
        // Check if user already exists
        const existing = await db.get('SELECT * FROM users WHERE email = ?', 'test@gmail.com');

        if (existing) {
            console.log('❌ User test@gmail.com already exists');
            return;
        }

        // Create test admin user
        const testAdminPassword = await hashPassword('123test');
        await db.run(`
            INSERT INTO users (email, password, name, role, is_verified)
            VALUES (?, ?, ?, ?, ?)
        `, 'test@gmail.com', testAdminPassword, 'Test Admin', 'admin', 1);

        console.log('✅ Test admin user created successfully');
        console.log('📧 Email: test@gmail.com');
        console.log('🔑 Password: 123test');

    } catch (error) {
        console.error('❌ Error creating test admin:', error);
    }

    process.exit(0);
};

addTestAdmin();
