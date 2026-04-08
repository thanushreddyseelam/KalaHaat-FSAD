const { User, Product, WishlistItem } = require('../models');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
const getWishlist = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        const products = await user.getWishlistItems();
        
        res.json({
            id: user.id,
            products: products
        });
    } catch (error) {
        console.error('GetWishlist error:', error.message);
        res.status(500).json({ message: 'Server error fetching wishlist' });
    }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist/add
const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = await User.findByPk(req.user.id);
        const product = await Product.findByPk(productId);

        if (!product) return res.status(404).json({ message: 'Product not found' });

        await user.addWishlistItem(product);
        
        return getWishlist(req, res);
    } catch (error) {
        console.error('AddToWishlist error:', error.message);
        res.status(500).json({ message: 'Server error adding to wishlist' });
    }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/remove/:productId
const removeFromWishlist = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        const product = await Product.findByPk(req.params.productId);

        if (!product) return res.status(404).json({ message: 'Product not found' });

        await user.removeWishlistItem(product);
        
        return getWishlist(req, res);
    } catch (error) {
        console.error('RemoveFromWishlist error:', error.message);
        res.status(500).json({ message: 'Server error removing from wishlist' });
    }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
