const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        defaultValue: '',
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    image: {
        type: DataTypes.STRING,
        defaultValue: '',
    },
    origin: {
        type: DataTypes.STRING,
        defaultValue: '',
    },
    material: {
        type: DataTypes.STRING,
        defaultValue: '',
    },
    dimensions: {
        type: DataTypes.STRING,
        defaultValue: '',
    },
    tribe: {
        type: DataTypes.STRING,
        defaultValue: '',
    },
    artisan: {
        type: DataTypes.STRING,
        defaultValue: '',
    },
    rating: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        validate: {
            min: 0,
            max: 5,
        },
    },
    badge: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 10,
    },
    bg: {
        type: DataTypes.STRING,
        defaultValue: '#F5EDD6',
    },
    emoji: {
        type: DataTypes.STRING,
        defaultValue: '',
    },
    verificationStatus: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'approved',
    },
    verificationNotes: {
        type: DataTypes.TEXT,
        defaultValue: '',
    },
    // Foreign keys will be configured in models/index.js
}, {
    timestamps: true,
});

module.exports = Product;
