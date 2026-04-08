const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB, sequelize } = require('./config/database');

// Load env vars
dotenv.config();

// Connect to MySQL
connectDB();

// Sync Tables (Phase 3 transition)
sequelize.sync()
    .then(() => console.log('✅ MySQL Models synced successfully'))
    .catch((err) => console.error('❌ Sync error:', err));

const app = express();

// CORS configuration
const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Explicitly handle preflight OPTIONS requests for all routes
app.options('{*path}', cors(corsOptions));

app.use(express.json());

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/addresses', require('./routes/addresses'));
app.use('/api/artisan', require('./routes/artisan'));
app.use('/api/consultant', require('./routes/consultant'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/reviews', require('./routes/reviews'));
// Image Uploads Route (Phase 3)
app.use('/api/upload', require('./routes/uploadRoutes'));
// Payment Route (Phase 4)
app.use('/api/payment', require('./routes/payment'));

// Health check
app.get('/', (req, res) => {
    res.json({
        message: '🎨 KalaHaat API is running on MySQL!',
        version: '3.1.0',
        db: 'MySQL',
        endpoints: {
            auth: '/api/auth',
            products: '/api/products',
            cart: '/api/cart',
            wishlist: '/api/wishlist',
            orders: '/api/orders',
            addresses: '/api/addresses',
            artisan: '/api/artisan',
            consultant: '/api/consultant',
            admin: '/api/admin',
            reviews: '/api/reviews',
        }
    });
});

// 404 handler — skip OPTIONS requests (handled by CORS above)
app.use((req, res, _next) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Error handler (Express 5 requires all 4 params)
app.use((err, req, res, _next) => {
    console.error('Server error:', err.stack);
    res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 KalaHaat Backend running on http://localhost:${PORT}`);
});
