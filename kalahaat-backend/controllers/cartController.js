const { Cart, CartItem, Product } = require('../models');

// @desc    Get user's cart
// @route   GET /api/cart
const getCart = async (req, res) => {
    try {
        // Ensure cart exists
        await Cart.findOrCreate({ where: { userId: req.user.id } });

        // Now load with associations (findOrCreate doesn't populate includes on create)
        const cart = await Cart.findOne({
            where: { userId: req.user.id },
            include: [{
                model: Product,
                as: 'products',
                through: { attributes: ['qty'] }
            }]
        });

        // Format response to match frontend expectations (items.product)
        const formattedItems = (cart.products || []).map(p => ({
            product: p,
            qty: p.CartItem.qty
        }));

        res.json({ ...cart.toJSON(), items: formattedItems });
    } catch (error) {
        console.error('GetCart error:', error.message);
        res.status(500).json({ message: 'Server error fetching cart' });
    }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
const addToCart = async (req, res) => {
    try {
        const { productId, qty = 1 } = req.body;
        const [cart] = await Cart.findOrCreate({ where: { userId: req.user.id } });

        const [item, created] = await CartItem.findOrCreate({
            where: { cartId: cart.id, productId },
            defaults: { qty }
        });

        if (!created) {
            item.qty += Number(qty);
            await item.save();
        }

        return getCart(req, res); // Reuse formatted GET logic
    } catch (error) {
        console.error('AddToCart error:', error.message);
        res.status(500).json({ message: 'Server error adding to cart' });
    }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
const updateCartItem = async (req, res) => {
    try {
        const { productId, qty } = req.body;
        const cart = await Cart.findOne({ where: { userId: req.user.id } });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        if (Number(qty) <= 0) {
            await CartItem.destroy({ where: { cartId: cart.id, productId } });
        } else {
            await CartItem.update({ qty: Number(qty) }, {
                where: { cartId: cart.id, productId }
            });
        }

        return getCart(req, res);
    } catch (error) {
        console.error('UpdateCartItem error:', error.message);
        res.status(500).json({ message: 'Server error updating cart' });
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:productId
const removeFromCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ where: { userId: req.user.id } });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        await CartItem.destroy({ where: { cartId: cart.id, productId: req.params.productId } });
        
        return getCart(req, res);
    } catch (error) {
        console.error('RemoveFromCart error:', error.message);
        res.status(500).json({ message: 'Server error removing from cart' });
    }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart/clear
const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ where: { userId: req.user.id } });
        if (cart) {
            await CartItem.destroy({ where: { cartId: cart.id } });
        }
        res.json({ message: 'Cart cleared', items: [] });
    } catch (error) {
        console.error('ClearCart error:', error.message);
        res.status(500).json({ message: 'Server error clearing cart' });
    }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
