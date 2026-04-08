const Razorpay = require('razorpay');
const crypto = require('crypto');
const { Order } = require('../models');

// Configure Razorpay instance if keys are available
const hasRazorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;
let razorpayInstance = null;

if (hasRazorpay) {
    razorpayInstance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
}

// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
const createOrder = async (req, res) => {
    try {
        const { amount } = req.body; // Amount in INR

        if (!amount) {
            return res.status(400).json({ message: 'Amount is required' });
        }

        const options = {
            amount: amount * 100, // Razorpay works in paise (smallest currency unit)
            currency: 'INR',
            receipt: 'receipt_' + Date.now(),
        };

        if (hasRazorpay) {
            const order = await razorpayInstance.orders.create(options);
            res.json({
                success: true,
                order,
                key: process.env.RAZORPAY_KEY_ID,
                isMock: false
            });
        } else {
            // Mock Order generation for sandbox testing when keys are absent
            res.json({
                success: true,
                order: {
                    id: 'order_mock_' + Math.random().toString(36).substr(2, 9),
                    amount: options.amount,
                    currency: 'INR',
                },
                key: 'mock_key_123',
                isMock: true
            });
        }
    } catch (error) {
        console.error('Create Order Error:', error);
        res.status(500).json({ message: 'Error creating Razorpay order' });
    }
};

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/payment/verify
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, internal_order_id } = req.body;

        if (!hasRazorpay) {
            // If in mock mode, automatically succeed
            return res.json({ success: true, message: 'Mock payment verified successfully' });
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Optional: Update the internal Order model status if an ID was passed
            if (internal_order_id) {
                const order = await Order.findByPk(internal_order_id);
                if (order) {
                    order.status = 'Confirmed';
                    order.paymentMethod = 'Razorpay';
                    await order.save();
                }
            }

            res.json({ success: true, message: 'Payment verified successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
    } catch (error) {
        console.error('Verify Payment Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { createOrder, verifyPayment };
