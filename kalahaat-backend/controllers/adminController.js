const { User, Product, Order, Transaction, OrderItem } = require('../models');

// @desc    Get all users (filterable by role, status)
// @route   GET /api/admin/users
const getUsers = async (req, res) => {
    try {
        const { role, status } = req.query;
        const where = {};
        if (role) where.role = role;
        if (status) where.status = status;

        const users = await User.findAll({ 
            where,
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']] 
        });
        res.json(users);
    } catch (error) {
        console.error('Admin getUsers error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update user status (approve/suspend)
// @route   PUT /api/admin/users/:id/status
const updateUserStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['active', 'pending', 'suspended'].includes(status)) {
            return res.status(400).json({ message: 'Status must be active, pending, or suspended' });
        }

        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        user.status = status;
        await user.save();
        
        res.json(user);
    } catch (error) {
        console.error('Admin updateUserStatus error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get platform stats
// @route   GET /api/admin/stats
const getStats = async (req, res) => {
    try {
        const totalUsers = await User.count();
        const artisanCount = await User.count({ where: { role: 'artisan' } });
        const customerCount = await User.count({ where: { role: 'customer' } });
        const consultantCount = await User.count({ where: { role: 'consultant' } });
        const pendingUsers = await User.count({ where: { status: 'pending' } });

        const totalProducts = await Product.count();
        const approvedProducts = await Product.count({ where: { verificationStatus: 'approved' } });
        const pendingProducts = await Product.count({ where: { verificationStatus: 'pending' } });

        const totalOrders = await Order.count();
        const processingOrders = await Order.count({ where: { status: 'Processing' } });
        const deliveredOrders = await Order.count({ where: { status: 'Delivered' } });

        // Revenue from delivered orders
        const totalRevenue = await Order.sum('total', { where: { status: 'Delivered' } }) || 0;

        // Recent activity
        const recentOrders = await Order.findAll({
            include: [{ model: User, as: 'customer', attributes: ['name'] }],
            order: [['createdAt', 'DESC']],
            limit: 5
        });

        const recentUsers = await User.findAll({
            attributes: ['name', 'role', 'createdAt'],
            order: [['createdAt', 'DESC']],
            limit: 5
        });

        res.json({
            users: { totalUsers, artisanCount, customerCount, consultantCount, pendingUsers },
            products: { totalProducts, approvedProducts, pendingProducts },
            orders: { totalOrders, processingOrders, deliveredOrders },
            totalRevenue,
            recentOrders: recentOrders.map(o => ({
                orderId: o.orderId,
                customer: o.customer?.name || 'Unknown',
                total: o.total,
                status: o.status,
                date: o.createdAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            })),
            recentUsers: recentUsers.map(u => ({
                name: u.name,
                role: u.role,
                date: u.createdAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            })),
        });
    } catch (error) {
        console.error('Admin getStats error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all orders
// @route   GET /api/admin/orders
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [{ model: User, as: 'customer', attributes: ['name', 'email'] }],
            order: [['createdAt', 'DESC']]
        });

        const formatted = orders.map(o => ({
            ...o.toJSON(),
            id: o.orderId,
            customerName: o.customer?.name || 'Unknown',
            date: o.createdAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Admin getAllOrders error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all products (including pending)
// @route   GET /api/admin/products
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            include: [{ model: User, as: 'artisanUser', attributes: ['name', 'email'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(products);
    } catch (error) {
        console.error('Admin getAllProducts error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getUsers, updateUserStatus, getStats, getAllOrders, getAllProducts };
