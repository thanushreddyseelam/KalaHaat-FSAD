const { Product, Order, OrderItem, Review, Transaction, User, sequelize } = require('../models');
const { Op } = require('sequelize');

// @desc    Get artisan's own products
// @route   GET /api/artisan/products
const getMyProducts = async (req, res) => {
    try {
        const products = await Product.findAll({ 
            where: { artisanUserId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(products);
    } catch (error) {
        console.error('Artisan getMyProducts error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a new product (pending verification)
// @route   POST /api/artisan/products
const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, image, origin, material, dimensions, tribe, stock, bg, emoji } = req.body;

        if (!name || !price || !category) {
            return res.status(400).json({ message: 'Name, price, and category are required' });
        }

        const product = await Product.create({
            name,
            description: description || '',
            price,
            category,
            image: image || '',
            origin: origin || '',
            material: material || '',
            dimensions: dimensions || '',
            tribe: tribe || '',
            artisan: req.user.name, // String for display
            artisanUserId: req.user.id, // Foreign Key
            stock: stock || 10,
            bg: bg || '#F5EDD6',
            emoji: emoji || '',
            verificationStatus: 'pending',
        });

        res.status(201).json(product);
    } catch (error) {
        console.error('Artisan createProduct error:', error.message);
        res.status(500).json({ message: 'Server error creating product' });
    }
};

// @desc    Update own product
// @route   PUT /api/artisan/products/:id
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Ensure artisan owns this product
        if (product.artisanUserId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this product' });
        }

        const allowedFields = ['name', 'description', 'price', 'category', 'image', 'origin', 'material', 'dimensions', 'tribe', 'stock', 'bg', 'emoji'];
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) product[field] = req.body[field];
        });

        // Reset verification when product is updated
        product.verificationStatus = 'pending';
        product.verifiedBy = null;
        product.verificationNotes = '';

        await product.save();
        res.json(product);
    } catch (error) {
        console.error('Artisan updateProduct error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete own product
// @route   DELETE /api/artisan/products/:id
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        if (product.artisanUserId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this product' });
        }

        await product.destroy();
        res.json({ message: 'Product deleted' });
    } catch (error) {
        console.error('Artisan deleteProduct error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get orders containing this artisan's products
// @route   GET /api/artisan/orders
const getArtisanOrders = async (req, res) => {
    try {
        // Find orders that contain any products owned by this artisan
        const orders = await Order.findAll({
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    required: true,
                    include: [{
                        model: Product,
                        where: { artisanUserId: req.user.id },
                        required: true
                    }]
                },
                { model: User, as: 'customer', attributes: ['name', 'email'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Format for frontend
        const formatted = orders.map(o => ({
            ...o.toJSON(),
            id: o.orderId,
            date: o.createdAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Artisan getOrders error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get artisan dashboard stats
// @route   GET /api/artisan/stats
const getArtisanStats = async (req, res) => {
    try {
        const productCount = await Product.count({ where: { artisanUserId: req.user.id } });

        // Get delivered orders with this artisan's products
        const myOrders = await Order.findAll({
            where: { status: 'Delivered' },
            include: [{
                model: OrderItem,
                as: 'items',
                required: true,
                include: [{
                    model: Product,
                    where: { artisanUserId: req.user.id },
                    required: true
                }]
            }]
        });

        const totalEarnings = myOrders.reduce((sum, o) => {
            return sum + o.items.reduce((s, item) => s + (Number(item.price) * Number(item.qty)), 0);
        }, 0);

        const orderCountTotal = await Order.count({
            distinct: true,
            include: [{
                model: OrderItem,
                as: 'items',
                required: true,
                include: [{
                    model: Product,
                    where: { artisanUserId: req.user.id },
                    required: true
                }]
            }]
        });

        // Average rating from reviews
        const reviews = await Review.findAll({
            include: [{
                model: Product,
                as: 'product',
                where: { artisanUserId: req.user.id },
                required: true
            }]
        });
        
        const avgRating = reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : '0.0';

        // Payout and transactions (assuming Transaction model handles this)
        const pendingPayoutResult = await Transaction.findAll({
            attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'total']],
            where: { userId: req.user.id, paymentStatus: 'Pending' },
            raw: true
        });

        const recentTransactions = await Transaction.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
            limit: 5
        });

        res.json({
            totalEarnings,
            productCount,
            orderCount: orderCountTotal,
            avgRating,
            pendingPayout: Number(pendingPayoutResult[0]?.total) || 0,
            recentTransactions,
        });
    } catch (error) {
        console.error('Artisan getStats error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getMyProducts, createProduct, updateProduct, deleteProduct, getArtisanOrders, getArtisanStats };
