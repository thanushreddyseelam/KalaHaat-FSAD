const dotenv = require('dotenv');
dotenv.config();

const { sequelize, Product } = require('./models');

const products = [
    { name: 'Dhokra Bronze Idol', origin: 'Bastar Tribe, Chhattisgarh', price: 3200, emoji: '🏺', image: '/images/products/dhokra-bronze-idol.png', category: 'Pottery & Ceramics', rating: 4.9, badge: 'Featured', bg: '#F5EDD6', description: 'Exquisite Dhokra bronze idol crafted using the ancient lost-wax casting method, a technique dating back over 4,000 years.', material: 'Bronze (Lost-wax cast)', dimensions: '18 × 8 × 6 cm', tribe: 'Bastar Gondi', artisan: 'Ramesh Dhokra', stock: 10, verificationStatus: 'approved' },
    { name: 'Warli Folk Painting', origin: 'Warli Tribe, Maharashtra', price: 2400, emoji: '🎨', image: '/images/products/warli-folk-painting.png', category: 'Folk Paintings', rating: 4.8, badge: null, bg: '#EDF5F0', description: 'Traditional Warli painting depicting village life using rice paste and bamboo sticks with geometric patterns.', material: 'Rice paste on paper', dimensions: '30 × 40 cm', tribe: 'Warli', artisan: 'Meera Warli', stock: 15, verificationStatus: 'approved' },
    { name: 'Ikat Silk Saree', origin: 'Odisha Tribal Weavers', price: 6800, emoji: '🪡', image: '/images/products/ikat-silk-saree.png', category: 'Textiles & Sarees', rating: 5.0, badge: 'Bestseller', bg: '#F0EDF5', description: 'Handwoven Ikat silk saree with traditional tie-dye resist patterns from Odisha.', material: 'Pure Silk', dimensions: '6.3 meters', tribe: 'Odisha Weavers', artisan: 'Tribal Weavers Coop', stock: 5, verificationStatus: 'approved' },
    { name: 'Kondapalli Wooden Toy', origin: 'Andhra Pradesh', price: 850, emoji: '🪆', image: '/images/products/kondapalli-wooden-toy.png', category: 'Wooden Crafts', rating: 4.7, badge: null, bg: '#F5F0ED', description: 'Hand-carved and painted wooden toy from Kondapalli village, made from Tella Poniki softwood.', material: 'Tella Poniki Wood', dimensions: '12 × 6 × 5 cm', tribe: 'Kondapalli Artisans', artisan: 'Local Artisan Coop', stock: 20, verificationStatus: 'approved' },
    { name: 'Tribal Silver Necklace', origin: 'Baiga Tribe, MP', price: 780, emoji: '💎', image: '/images/products/tribal-silver-necklace.png', category: 'Tribal Jewellery', rating: 4.6, badge: 'New', bg: '#EDF0F5', description: 'Handcrafted sterling silver necklace with traditional Baiga tribal motifs.', material: 'Sterling Silver', dimensions: 'Adjustable', tribe: 'Baiga', artisan: 'Baiga Silversmiths', stock: 12, verificationStatus: 'approved' },
    { name: 'Bamboo Basket', origin: 'Northeastern Tribes', price: 450, emoji: '🧺', image: '/images/products/bamboo-basket.png', category: 'Bamboo & Cane', rating: 4.5, badge: null, bg: '#F5F5ED', description: 'Handwoven bamboo basket from Northeast India, traditional weaving pattern.', material: 'Natural Bamboo', dimensions: '25 × 25 × 15 cm', tribe: 'Northeastern Tribes', artisan: 'Tribal Coop NE', stock: 30, verificationStatus: 'approved' },
    { name: 'Gond Painting', origin: 'Gondi Tribe, MP', price: 3500, emoji: '🎨', image: '/images/products/gond-painting.png', category: 'Folk Paintings', rating: 4.9, badge: 'Featured', bg: '#EDF5F0', description: 'Vibrant Gond painting depicting nature and mythology using dots and lines.', material: 'Natural dyes on canvas', dimensions: '60 × 45 cm', tribe: 'Gondi', artisan: 'Savitri Bai', stock: 8, verificationStatus: 'approved' },
    { name: 'Dokra Brass Necklace', origin: 'Bastar, Chhattisgarh', price: 2200, emoji: '💎', image: '/images/products/dokra-brass-necklace.png', category: 'Tribal Jewellery', rating: 4.8, badge: null, bg: '#EDF0F5', description: 'Hand-cast brass necklace using the ancient Dokra technique.', material: 'Brass', dimensions: '18 inches', tribe: 'Bastar', artisan: 'Ramesh Dhokra', stock: 15, verificationStatus: 'approved' },
    { name: 'Sambalpuri Saree', origin: 'Odisha', price: 5200, emoji: '🪡', image: '/images/products/sambalpuri-saree.png', category: 'Textiles & Sarees', rating: 4.9, badge: 'Bestseller', bg: '#F0EDF5', description: 'Traditional Sambalpuri tie-dye saree with intricate Ikat patterns.', material: 'Cotton Silk blend', dimensions: '6.3 meters', tribe: 'Sambalpuri Weavers', artisan: 'Sambalpuri Coop', stock: 7, verificationStatus: 'approved' },
];

const seedProducts = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to MySQL');

        // Force sync models to ensure fresh tables
        await sequelize.sync();
        
        // Clear existing products
        await Product.destroy({ where: {} });
        console.log('🗑  Cleared existing products');

        // Insert seed data
        const created = await Product.bulkCreate(products);
        console.log(`✅ Seeded ${created.length} products successfully!`);

        created.forEach(p => console.log(`   → ${p.name} (₹${p.price}) [${p.id}]`));

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error.message);
        process.exit(1);
    }
};

seedProducts();
