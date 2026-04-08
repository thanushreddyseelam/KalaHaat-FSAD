const { Address } = require('../models');

// @desc    Get user's saved addresses
// @route   GET /api/addresses
const getAddresses = async (req, res) => {
    try {
        const addresses = await Address.findAll({ 
            where: { userId: req.user.id },
            order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
        });
        res.json(addresses);
    } catch (error) {
        console.error('GetAddresses error:', error.message);
        res.status(500).json({ message: 'Server error fetching addresses' });
    }
};

// @desc    Add new address
// @route   POST /api/addresses
const addAddress = async (req, res) => {
    try {
        const { name, phone, line1, line2, city, state, pin, type, isDefault } = req.body;

        // If this is the default, unset any existing default
        if (isDefault) {
            await Address.update({ isDefault: false }, { where: { userId: req.user.id } });
        }

        const address = await Address.create({
            userId: req.user.id,
            name, phone, line1, line2: line2 || '', city, state, pin,
            type: type || 'home',
            isDefault: isDefault || false,
        });

        res.status(201).json(address);
    } catch (error) {
        console.error('AddAddress error:', error.message);
        res.status(500).json({ message: 'Server error adding address' });
    }
};

// @desc    Update address
// @route   PUT /api/addresses/:id
const updateAddress = async (req, res) => {
    try {
        const address = await Address.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!address) return res.status(404).json({ message: 'Address not found' });

        if (req.body.isDefault) {
            await Address.update({ isDefault: false }, { where: { userId: req.user.id } });
        }

        const allowedFields = ['name', 'phone', 'line1', 'line2', 'city', 'state', 'pin', 'type', 'isDefault'];
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) address[field] = req.body[field];
        });
        await address.save();
        res.json(address);
    } catch (error) {
        console.error('UpdateAddress error:', error.message);
        res.status(500).json({ message: 'Server error updating address' });
    }
};

// @desc    Delete address
// @route   DELETE /api/addresses/:id
const deleteAddress = async (req, res) => {
    try {
        const deleted = await Address.destroy({ where: { id: req.params.id, userId: req.user.id } });
        if (!deleted) return res.status(404).json({ message: 'Address not found' });
        res.json({ message: 'Address deleted' });
    } catch (error) {
        console.error('DeleteAddress error:', error.message);
        res.status(500).json({ message: 'Server error deleting address' });
    }
};

module.exports = { getAddresses, addAddress, updateAddress, deleteAddress };
