const { User } = require('../models');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { name, email, phone, password, role, tribe, bio, specialization, qualifications } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Create user
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            phone: phone || '',
            password,
            role: role || 'customer',
            tribe: tribe || '',
            bio: bio || '',
            specialization: specialization || '',
            qualifications: qualifications || '',
        });

        // Return user data + token
        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            status: user.status,
            tribe: user.tribe,
            bio: user.bio,
            specialization: user.specialization,
            qualifications: user.qualifications,
            token: generateToken(user.id),
        });
    } catch (error) {
        console.error('Register error:', error.message);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Find user
        const user = await User.findOne({ where: { email: email.toLowerCase() } });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            status: user.status,
            tribe: user.tribe,
            bio: user.bio,
            specialization: user.specialization,
            qualifications: user.qualifications,
            token: generateToken(user.id),
        });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('GetMe error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update current user profile
// @route   PUT /api/auth/me
// @access  Private
const updateMe = async (req, res) => {
    try {
        const allowedFields = ['name', 'phone', 'tribe', 'bio', 'specialization', 'qualifications'];
        const updates = {};

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const [updatedRowsCount, updatedUsers] = await User.update(updates, {
            where: { id: req.user.id },
            returning: true,
            plain: true
        });

        if (updatedRowsCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = await User.findByPk(req.user.id);
        res.json(user);
    } catch (error) {
        console.error('UpdateMe error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { register, login, getMe, updateMe };
