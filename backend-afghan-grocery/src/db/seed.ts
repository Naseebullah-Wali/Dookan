import DatabaseConnection from './connection';
import { hashPassword } from '../utils/auth';

export const seedDatabase = async (): Promise<void> => {
    const db = await DatabaseConnection.getInstance();

    console.log('🌱 Seeding database...');

    // Check if already seeded
    const userCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM users');
    if (userCount && userCount.count > 0) {
        console.log('✅ Database already seeded');
        return;
    }

    // Create admin user
    const adminPassword = await hashPassword('admin123');
    await db.run(`
    INSERT INTO users (email, password, name, role, is_verified)
    VALUES (?, ?, ?, ?, ?)
  `, 'admin@afghangrocery.com', adminPassword, 'Admin User', 'admin', 1);

    // Create test customer
    const customerPassword = await hashPassword('customer123');
    await db.run(`
    INSERT INTO users (email, password, name, phone, is_verified)
    VALUES (?, ?, ?, ?, ?)
  `, 'customer@test.com', customerPassword, 'Test Customer', '+93701234567', 1);

    // Create categories
    const categories = [
        { name: 'Rice & Grains', name_ps: 'وريجې او غلې', name_fa: 'برنج و غلات', name_de: 'Reis & Getreide', name_fr: 'Riz et Céréales', icon: '🌾' },
        { name: 'Spices', name_ps: 'مصالحې', name_fa: 'ادویه', name_de: 'Gewürze', name_fr: 'Épices', icon: '🌶️' },
        { name: 'Dried Fruits', name_ps: 'وچ میوې', name_fa: 'میوه خشک', name_de: 'Trockenfrüchte', name_fr: 'Fruits Secs', icon: '🥜' },
        { name: 'Nuts', name_ps: 'مغزونه', name_fa: 'آجیل', name_de: 'Nüsse', name_fr: 'Noix', icon: '🌰' },
        { name: 'Oils & Ghee', name_ps: 'غوړ او روغن', name_fa: 'روغن و کره', name_de: 'Öle & Ghee', name_fr: 'Huiles & Ghee', icon: '🫗' },
        { name: 'Tea & Coffee', name_ps: 'چای او قهوه', name_fa: 'چای و قهوه', name_de: 'Tee & Kaffee', name_fr: 'Thé & Café', icon: '☕' },
        { name: 'Sweets', name_ps: 'خواږه', name_fa: 'شیرینی', name_de: 'Süßigkeiten', name_fr: 'Sucreries', icon: '🍬' },
        { name: 'Bread & Bakery', name_ps: 'ډوډۍ', name_fa: 'نان و شیرینی', name_de: 'Brot & Gebäck', name_fr: 'Pain & Pâtisserie', icon: '🥖' },
    ];

    const categoryIds: number[] = [];
    for (const cat of categories) {
        const result = await db.run(`
      INSERT INTO categories (name, name_ps, name_fa, name_de, name_fr, icon)
      VALUES (?, ?, ?, ?, ?, ?)
    `, cat.name, cat.name_ps, cat.name_fa, cat.name_de, cat.name_fr, cat.icon);
        categoryIds.push(result.lastID!);
    }

    // Create sample products
    const products = [
        {
            name: 'Basmati Rice Premium',
            name_ps: 'باسماتي وريجې',
            name_fa: 'برنج باسماتی',
            description: 'Premium quality long-grain basmati rice from Afghanistan',
            price: 25.99,
            original_price: 29.99,
            stock: 100,
            category_id: categoryIds[0],
            image: '/images/products/basmati-rice.jpg',
            unit: 'kg',
            weight: 5,
            is_featured: 1,
        },
        {
            name: 'Saffron Threads',
            name_ps: 'زعفران',
            name_fa: 'زعفران',
            description: 'Authentic Afghan saffron, hand-picked premium quality',
            price: 89.99,
            original_price: 99.99,
            stock: 50,
            category_id: categoryIds[1],
            image: '/images/products/saffron.jpg',
            unit: 'gram',
            weight: 0.01,
            is_featured: 1,
        },
        {
            name: 'Dried Mulberries',
            name_ps: 'وچ توت',
            name_fa: 'توت خشک',
            description: 'Sweet and nutritious dried mulberries',
            price: 12.99,
            stock: 75,
            category_id: categoryIds[2],
            image: '/images/products/mulberries.jpg',
            unit: 'kg',
            weight: 0.5,
            is_featured: 1,
        },
        {
            name: 'Almonds',
            name_ps: 'بادام',
            name_fa: 'بادام',
            description: 'Fresh Afghan almonds, rich in nutrients',
            price: 18.99,
            stock: 60,
            category_id: categoryIds[3],
            image: '/images/products/almonds.jpg',
            unit: 'kg',
            weight: 1,
            is_featured: 1,
        },
        {
            name: 'Pure Ghee',
            name_ps: 'خالص روغن',
            name_fa: 'روغن خالص',
            description: 'Traditional Afghan pure ghee',
            price: 22.99,
            stock: 40,
            category_id: categoryIds[4],
            image: '/images/products/ghee.jpg',
            unit: 'liter',
            weight: 1,
        },
        {
            name: 'Green Tea',
            name_ps: 'شین چای',
            name_fa: 'چای سبز',
            description: 'Premium Afghan green tea',
            price: 8.99,
            stock: 100,
            category_id: categoryIds[5],
            image: '/images/products/green-tea.jpg',
            unit: 'gram',
            weight: 0.25,
        },
        {
            name: 'Pistachio',
            name_ps: 'پسته',
            name_fa: 'پسته',
            description: 'Roasted and salted Afghan pistachios',
            price: 24.99,
            stock: 45,
            category_id: categoryIds[3],
            image: '/images/products/pistachio.jpg',
            unit: 'kg',
            weight: 0.5,
        },
        {
            name: 'Cardamom',
            name_ps: 'هل',
            name_fa: 'هل',
            description: 'Aromatic green cardamom pods',
            price: 15.99,
            stock: 80,
            category_id: categoryIds[1],
            image: '/images/products/cardamom.jpg',
            unit: 'gram',
            weight: 0.1,
        },
    ];

    for (const product of products) {
        await db.run(`
      INSERT INTO products (
        name, name_ps, name_fa, description, price, original_price,
        stock, category_id, image, unit, weight, is_featured
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
            product.name,
            product.name_ps,
            product.name_fa,
            product.description,
            product.price,
            product.original_price || null,
            product.stock,
            product.category_id,
            product.image,
            product.unit,
            product.weight,
            product.is_featured || 0
        );
    }

    console.log('✅ Database seeded successfully');
    console.log('📧 Admin: admin@afghangrocery.com / admin123');
    console.log('📧 Customer: customer@test.com / customer123');
};

export default seedDatabase;
