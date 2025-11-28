import DatabaseConnection from './connection';
import { hashPassword } from '../utils/auth';

export const seedDatabase = async (): Promise<void> => {
    const db = await DatabaseConnection.getInstance();

    console.log('🌱 Seeding database...');

    // Check if users already seeded
    const userCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM users');
    if (!userCount || userCount.count === 0) {
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
        console.log('✅ Users, Categories, and Products seeded');
    }

    // Check and seed Testimonials
    const testimonialCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM testimonials');
    if (!testimonialCount || testimonialCount.count === 0) {
        const testimonials = [
            {
                user_name: 'Ahmad Khalil',
                location: 'Kabul, Afghanistan',
                rating: 5,
                comment: 'Excellent service! The quality of products is outstanding and delivery is always on time. Highly recommended for Afghan groceries.',
                gender: 'male',
                created_at: '2025-01-15 10:00:00'
            },
            {
                user_name: 'Fatima Rahman',
                location: 'London, UK',
                rating: 5,
                comment: 'Finally found authentic Afghan products in the UK! The basmati rice and spices are exactly like back home. Thank you!',
                gender: 'female',
                created_at: '2025-01-10 14:30:00'
            },
            {
                user_name: 'Mohammed Aziz',
                location: 'Dubai, UAE',
                rating: 5,
                comment: 'Best Afghan grocery store online. Fresh products, reasonable prices, and excellent customer service. Will order again!',
                gender: 'male',
                created_at: '2025-01-08 09:15:00'
            },
            {
                user_name: 'Zainab Hussain',
                location: 'Toronto, Canada',
                rating: 5,
                comment: 'Amazing quality and fast shipping to Canada! My family loves all the products. The flour makes perfect naan bread.',
                gender: 'female',
                created_at: '2025-01-05 16:45:00'
            },
            {
                user_name: 'Rashid Ali',
                location: 'Herat, Afghanistan',
                rating: 5,
                comment: 'Very reliable service. Products are always fresh and well-packaged. Great prices too!',
                gender: 'male',
                created_at: '2025-01-03 11:20:00'
            }
        ];

        for (const t of testimonials) {
            await db.run(`
                INSERT INTO testimonials (user_name, location, rating, comment, gender, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            `, t.user_name, t.location, t.rating, t.comment, t.gender, t.created_at);
        }
        console.log('✅ Testimonials seeded');
    }

    // Check and seed News Items
    const newsCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM news_items');
    if (!newsCount || newsCount.count === 0) {
        const newsItems = [
            {
                title: '50% OFF Rice',
                subtitle: 'Premium Basmati Special',
                description: 'Experience the authentic taste of Afghanistan with our premium aged Basmati rice. Perfect for Pulao and Biryani. Limited time offer!',
                tag: 'Special Offer',
                image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400',
                bg_class: 'bg-gradient-success'
            },
            {
                title: 'Free Delivery',
                subtitle: 'On orders over 5000 AFN',
                description: 'Shop to your heart\'s content! We are offering free delivery on all orders exceeding 5000 AFN. Send love to your family without extra costs.',
                tag: 'Limited Time',
                image: 'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?auto=format&fit=crop&q=80&w=400',
                bg_class: 'bg-gradient-primary'
            },
            {
                title: 'New Arrival',
                subtitle: 'Fresh Saffron from Herat',
                description: 'Directly from the fields of Herat, our new stock of premium Saffron is here. Known for its vibrant color and unmatched aroma.',
                tag: 'New In',
                image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400',
                bg_class: 'bg-gradient-danger'
            },
            {
                title: 'Bulk Discount',
                subtitle: 'Save 20% on Oil & Flour',
                description: 'Stock up on essentials! Get a flat 20% discount when you buy cooking oil and wheat flour in bulk. Ideal for large families.',
                tag: 'Bulk Save',
                image: 'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?auto=format&fit=crop&q=80&w=400',
                bg_class: 'bg-gradient-warning'
            }
        ];

        for (const n of newsItems) {
            await db.run(`
                INSERT INTO news_items (title, subtitle, description, tag, image, bg_class)
                VALUES (?, ?, ?, ?, ?, ?)
            `, n.title, n.subtitle, n.description, n.tag, n.image, n.bg_class);
        }
        console.log('✅ News Items seeded');
    }

    // FIX: Update product images to use Unsplash URLs (since local files are missing)
    console.log('🔧 Fixing product images...');
    const productImages: Record<string, string> = {
        'Basmati Rice Premium': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=800',
        'Saffron Threads': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=800',
        'Dried Mulberries': 'https://plus.unsplash.com/premium_photo-1675364738596-f579d465d644?q=80&w=800',
        'Almonds': 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?q=80&w=800',
        'Pure Ghee': 'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?q=80&w=800',
        'Green Tea': 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?q=80&w=800',
        'Pistachio': 'https://images.unsplash.com/photo-1615485925763-867862f80932?q=80&w=800',
        'Cardamom': 'https://images.unsplash.com/photo-1599940824399-b87987ce0799?q=80&w=800'
    };

    for (const [name, imageUrl] of Object.entries(productImages)) {
        await db.run('UPDATE products SET image = ? WHERE name = ?', imageUrl, name);
    }
    console.log('✅ Product images updated to Unsplash URLs');

    console.log('✅ Database seeded successfully');
    console.log('📧 Admin: admin@afghangrocery.com / admin123');
    console.log('📧 Customer: customer@test.com / customer123');
};

export default seedDatabase;
