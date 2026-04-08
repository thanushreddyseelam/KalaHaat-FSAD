const { Product } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all products (public)
// @route   GET /api/products
const getProducts = async (req, res) => {
    try {
        const { category, search, minPrice, maxPrice, sortBy } = req.query;
        
        const where = { verificationStatus: 'approved' };

        if (category) {
            where.category = category;
        }

        if (search) {
            where.name = { [Op.like]: `%${search}%` };
        }

        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price[Op.gte] = Number(minPrice);
            if (maxPrice) where.price[Op.lte] = Number(maxPrice);
        }

        let order = [['createdAt', 'DESC']];
        if (sortBy === 'price-low') order = [['price', 'ASC']];
        else if (sortBy === 'price-high') order = [['price', 'DESC']];
        else if (sortBy === 'rating') order = [['rating', 'DESC']];

        const products = await Product.findAll({
            where,
            order
        });

        res.json(products);
    } catch (error) {
        console.error('GetProducts error:', error.message);
        res.status(500).json({ message: 'Server error fetching products' });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
const getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        console.error('GetProductById error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getProducts, getProductById };
