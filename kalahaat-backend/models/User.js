const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    phone: {
        type: DataTypes.STRING,
        defaultValue: '',
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('customer', 'artisan', 'consultant', 'admin'),
        defaultValue: 'customer',
    },
    status: {
        type: DataTypes.ENUM('active', 'pending', 'suspended'),
        defaultValue: 'active',
    },
    // Artisan-specific fields
    tribe: {
        type: DataTypes.STRING,
        defaultValue: '',
    },
    bio: {
        type: DataTypes.TEXT,
        defaultValue: '',
    },
    // Consultant-specific fields
    specialization: {
        type: DataTypes.STRING,
        defaultValue: '',
    },
    qualifications: {
        type: DataTypes.TEXT,
        defaultValue: '',
    },
    // Temporary field for migration tracking
    mongoId: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    timestamps: true,
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
    },
});

// Instance method to check password
User.prototype.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = User;
