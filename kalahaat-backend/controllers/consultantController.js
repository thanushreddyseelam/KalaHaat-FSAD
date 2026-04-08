const { Product, User } = require('../models');

// @desc    Get products pending verification
// @route   GET /api/consultant/pending
const getPending = async (req, res) => {
    try {
        const products = await Product.findAll({
            where: { verificationStatus: 'pending' },
            include: [{ model: User, as: 'artisanUser', attributes: ['name', 'email', 'tribe'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(products);
    } catch (error) {
        console.error('Consultant getPending error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Approve or reject a product
// @route   PUT /api/consultant/verify/:id
const verifyProduct = async (req, res) => {
    try {
        const { status, notes } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Status must be "approved" or "rejected"' });
        }

        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        product.verificationStatus = status;
        product.verifiedBy = req.user.id;
        product.verificationNotes = notes || '';
        await product.save();

        res.json(product);
    } catch (error) {
        console.error('Consultant verifyProduct error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get consultant stats
// @route   GET /api/consultant/stats
const getConsultantStats = async (req, res) => {
    try {
        const pendingCount = await Product.count({ where: { verificationStatus: 'pending' } });
        const approvedCount = await Product.count({ where: { verifiedBy: req.user.id, verificationStatus: 'approved' } });
        const rejectedCount = await Product.count({ where: { verifiedBy: req.user.id, verificationStatus: 'rejected' } });

        res.json({ pendingCount, approvedCount, rejectedCount });
    } catch (error) {
        console.error('Consultant getStats error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get products reviewed by this consultant
// @route   GET /api/consultant/history
const getHistory = async (req, res) => {
    try {
        const { status } = req.query; // optional filter: 'approved' or 'rejected'
        const where = { verifiedBy: req.user.id };
        if (status) where.verificationStatus = status;

        const products = await Product.findAll({
            where,
            include: [{ model: User, as: 'artisanUser', attributes: ['name', 'email', 'tribe'] }],
            order: [['updatedAt', 'DESC']]
        });

        res.json(products);
    } catch (error) {
        console.error('Consultant getHistory error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getPending, verifyProduct, getConsultantStats, getHistory };
