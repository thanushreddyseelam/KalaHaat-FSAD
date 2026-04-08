const { Review, User } = require('../models');

// @desc    Post a review for a product
// @route   POST /api/reviews
const createReview = async (req, res) => {
    try {
        const { productId, rating, text } = req.body;

        if (!productId || !rating) {
            return res.status(400).json({ message: 'Product ID and rating are required' });
        }

        // Check if user already reviewed this product
        const existing = await Review.findOne({ 
            where: { productId, userId: req.user.id } 
        });
        if (existing) {
            return res.status(400).json({ message: 'You have already reviewed this product' });
        }

        const review = await Review.create({
            productId: productId,
            userId: req.user.id,
            rating,
            comment: text || '', // Using 'comment' as defined in Sequelize model
        });

        const fullReview = await Review.findByPk(review.id, {
            include: [{ model: User, as: 'user', attributes: ['name'] }]
        });

        res.status(201).json(fullReview);
    } catch (error) {
        console.error('CreateReview error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
const getProductReviews = async (req, res) => {
    try {
        const reviews = await Review.findAll({ 
            where: { productId: req.params.productId },
            include: [{ model: User, as: 'user', attributes: ['name'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(reviews);
    } catch (error) {
        console.error('GetProductReviews error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createReview, getProductReviews };
