const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    orderId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    shipping: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
    },
    paymentMethod: {
        type: DataTypes.ENUM('upi', 'card', 'netbank', 'wallet', 'cod'),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('Pending Payment', 'Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'),
        defaultValue: 'Processing',
    },
    razorpayOrderId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    razorpayPaymentId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    razorpaySignature: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    // Snapshot of address at time of order
    addressName: DataTypes.STRING,
    addressPhone: DataTypes.STRING,
    addressLine1: DataTypes.STRING,
    addressLine2: DataTypes.STRING,
    addressCity: DataTypes.STRING,
    addressState: DataTypes.STRING,
    addressPin: DataTypes.STRING,
    addressType: DataTypes.ENUM('home', 'work'),
}, {
    timestamps: true,
});

const OrderItem = sequelize.define('OrderItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: DataTypes.STRING,
    price: DataTypes.DECIMAL(10, 2),
    qty: DataTypes.INTEGER,
    image: DataTypes.STRING,
    // Order ID and Product ID (optional for history) will be FKs
}, {
    timestamps: true,
});

module.exports = { Order, OrderItem };
