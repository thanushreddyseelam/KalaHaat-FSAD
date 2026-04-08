import axios from 'axios';

// Base API instance — points to our Express backend
const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('kalahaat_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses (expired/invalid token)
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Don't clear session or redirect for auth endpoints (login/register)
            // A 401 there just means bad credentials, not an expired session
            const url = error.config?.url || '';
            const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');

            if (!isAuthEndpoint) {
                localStorage.removeItem('kalahaat_token');
                localStorage.removeItem('kalahaat_user');
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

// ─── Auth API ───────────────────────────────────────────
export const authAPI = {
    register: (data) => API.post('/auth/register', data),
    login: (data) => API.post('/auth/login', data),
    getMe: () => API.get('/auth/me'),
    updateMe: (data) => API.put('/auth/me', data),
};

// ─── Products API (public) ──────────────────────────────
export const productsAPI = {
    getAllProducts: (params) => API.get('/products', { params }),
    getProductById: (id) => API.get(`/products/${id}`),
};

// ─── Cart API (auth required) ───────────────────────────
export const cartAPI = {
    getCart: () => API.get('/cart'),
    addToCart: (productId, qty = 1) => API.post('/cart/add', { productId, qty }),
    updateItem: (productId, qty) => API.put('/cart/update', { productId, qty }),
    removeItem: (productId) => API.delete(`/cart/remove/${productId}`),
    clearCart: () => API.delete('/cart/clear'),
};

// ─── Wishlist API (auth required) ───────────────────────
export const wishlistAPI = {
    getWishlist: () => API.get('/wishlist'),
    addToWishlist: (productId) => API.post('/wishlist/add', { productId }),
    removeFromWishlist: (productId) => API.delete(`/wishlist/remove/${productId}`),
};

// ─── Orders & Payment API (auth required) ──────────────────
export const ordersAPI = {
    placeOrder: (data) => API.post('/orders', data),
    getMyOrders: () => API.get('/orders/my-orders'),
};

export const paymentAPI = {
    createRazorpayOrder: (amount) => API.post('/payment/create-order', { amount }),
    verifyRazorpayPayment: (data) => API.post('/payment/verify', data),
};

// ─── Addresses API (auth required) ──────────────────────
export const addressesAPI = {
    getAddresses: () => API.get('/addresses'),
    addAddress: (data) => API.post('/addresses', data),
    updateAddress: (id, data) => API.put(`/addresses/${id}`, data),
    deleteAddress: (id) => API.delete(`/addresses/${id}`),
};

// ─── Artisan API (artisan role required) ────────────────
export const artisanAPI = {
    getMyProducts: () => API.get('/artisan/products'),
    createProduct: (data) => API.post('/artisan/products', data),
    uploadImage: (formData) => API.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    updateProduct: (id, data) => API.put(`/artisan/products/${id}`, data),
    deleteProduct: (id) => API.delete(`/artisan/products/${id}`),
    getMyOrders: () => API.get('/artisan/orders'),
    getStats: () => API.get('/artisan/stats'),
};

// ─── Consultant API (consultant role required) ──────────
export const consultantAPI = {
    getPending: () => API.get('/consultant/pending'),
    verify: (id, data) => API.put(`/consultant/verify/${id}`, data),
    getStats: () => API.get('/consultant/stats'),
    getHistory: (status) => API.get('/consultant/history', { params: status ? { status } : {} }),
};

// ─── Admin API (admin role required) ────────────────────
export const adminAPI = {
    getUsers: (params) => API.get('/admin/users', { params }),
    updateUserStatus: (id, status) => API.put(`/admin/users/${id}/status`, { status }),
    getStats: () => API.get('/admin/stats'),
    getOrders: () => API.get('/admin/orders'),
    getProducts: () => API.get('/admin/products'),
};

// ─── Reviews API ────────────────────────────────────────
export const reviewsAPI = {
    createReview: (data) => API.post('/reviews', data),
    getProductReviews: (productId) => API.get(`/reviews/product/${productId}`),
};

export default API;
