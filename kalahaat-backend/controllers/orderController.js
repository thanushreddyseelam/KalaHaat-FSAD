const { Order, OrderItem, Cart, CartItem, sequelize } = require('../models');

// @desc    Place a new order
// @route   POST /api/orders
const placeOrder = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { items, total, shipping, paymentMethod, address } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items in order' });
        }
        if (!address || !address.name || !address.line1 || !address.city || !address.state || !address.pin) {
            return res.status(400).json({ message: 'Complete delivery address is required' });
        }

        const methodLabels = { upi: 'UPI', card: 'Card', netbank: 'Net Banking', wallet: 'Wallet', cod: 'Cash on Delivery' };

        // Generate unique order ID
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const orderId = `KH-${timestamp}-${random}`;

        const order = await Order.create({
            orderId,
            customerId: req.user.id,
            total,
            shipping: shipping || 0,
            paymentMethod,
            status: paymentMethod === 'cod' ? 'Confirmed' : 'Processing',
            // Map flat columns
            addressName: address.name,
            addressPhone: address.phone,
            addressLine1: address.line1,
            addressLine2: address.line2,
            addressCity: address.city,
            addressState: address.state,
            addressPin: address.pin,
            addressType: address.type || 'home',
        }, { transaction: t });

        // Add items to OrderItems table
        const orderItems = items.map(item => ({
            orderId: order.id,
            productId: item.product?.id || item.product,
            name: item.name,
            price: item.price,
            qty: item.qty,
            image: item.image
        }));

        await OrderItem.bulkCreate(orderItems, { transaction: t });

        // Clear the user's cart (CartItems)
        const userCart = await Cart.findOne({ where: { userId: req.user.id } });
        if (userCart) {
            await CartItem.destroy({ where: { cartId: userCart.id }, transaction: t });
        }

        await t.commit();

        res.status(201).json({
            ...order.toJSON(),
            method: methodLabels[paymentMethod] || paymentMethod,
            date: order.createdAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        });
    } catch (error) {
        await t.rollback();
        console.error('PlaceOrder error:', error.message);
        res.status(500).json({ message: 'Server error placing order' });
    }
};

// @desc    Get customer's orders
// @route   GET /api/orders/my-orders
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { customerId: req.user.id },
            include: [{ model: OrderItem, as: 'items' }],
            order: [['createdAt', 'DESC']]
        });

        // Format for frontend
        const formatted = orders.map(o => ({
            ...o.toJSON(),
            id: o.orderId,
            date: o.createdAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            statusClass: o.status === 'Delivered' ? 'status-delivered' : o.status === 'Cancelled' ? 'status-cancelled' : 'status-active',
        }));

        res.json(formatted);
    } catch (error) {
        console.error('GetMyOrders error:', error.message);
        res.status(500).json({ message: 'Server error fetching orders' });
    }
};

module.exports = { placeOrder, getMyOrders };
