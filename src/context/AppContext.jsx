import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { authAPI, cartAPI, wishlistAPI, ordersAPI } from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
    // Auth state — initialized from localStorage if available
    const [currentRole, setCurrentRole] = useState(() => {
        const saved = localStorage.getItem('kalahaat_user');
        return saved ? JSON.parse(saved).role : 'guest';
    });
    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem('kalahaat_user');
        return saved ? JSON.parse(saved) : null;
    });
    const [authLoading, setAuthLoading] = useState(false);

    // Cart, wishlist, orders — now powered by backend APIs
    const [cartItems, setCartItems] = useState([]);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [placedOrders, setPlacedOrders] = useState([]);

    // Custom CSS vars for toast to match KalaHaat branding
    const toastStyle = {
        background: '#1B3A2D',
        color: '#E8B84B',
        fontFamily: '"Space Mono", monospace',
        fontSize: '0.85rem',
        borderRadius: '8px',
        padding: '12px 20px',
        border: '1px solid #4CAF7D'
    };

    const showToast = useCallback((msg, type = 'success') => {
        // Simple regex check to see if we should show error or loading icon
        if (msg.includes('❌') || msg.includes('⚠') || msg.includes('Failed')) {
            toast.error(msg.replace(/[❌⚠]/g, '').trim(), { style: { ...toastStyle, border: '1px solid #C4622D' }});
        } else if (msg.includes('⏳')) {
            toast.loading(msg.replace('⏳', '').trim(), { style: toastStyle, duration: 2000 });
        } else {
            toast.success(msg.replace(/[✅✨👋]/g, '').trim(), { style: toastStyle });
        }
    }, [toastStyle]);

    // ─── Validate stored token on startup ───────────────────
    useEffect(() => {
        const token = localStorage.getItem('kalahaat_token');
        const saved = localStorage.getItem('kalahaat_user');
        if (token && saved) {
            authAPI.getMe().then(res => {
                // Token valid — keep session
            }).catch(() => {
                // Token expired or invalid — clear session
                localStorage.removeItem('kalahaat_token');
                localStorage.removeItem('kalahaat_user');
                setCurrentRole('guest');
                setCurrentUser(null);
            });
        } else if (saved && !token) {
            // User data exists but no token — clear stale data
            localStorage.removeItem('kalahaat_user');
            setCurrentRole('guest');
            setCurrentUser(null);
        }
    }, []);

    // ─── Fetch cart & wishlist when user logs in ─────────────
    useEffect(() => {
        if (currentUser && currentUser.token) {
            // Fetch cart
            cartAPI.getCart().then(res => {
                const items = (res.data.items || []).map(i => ({
                    ...i.product,
                    id: i.product.id || i.product._id,
                    price: Number(i.product.price),
                    qty: i.qty,
                }));
                setCartItems(items);
            }).catch(() => { });

            // Fetch wishlist
            wishlistAPI.getWishlist().then(res => {
                const products = (res.data.products || []).map(p => ({ ...p, id: p.id || p._id, price: Number(p.price) }));
                setWishlistItems(products);
            }).catch(() => { });

            // Fetch orders
            ordersAPI.getMyOrders().then(res => {
                setPlacedOrders(res.data);
            }).catch(() => { });
        }
    }, [currentUser]);

    // ─── Auth Functions (API-powered) ────────────────────────
    const registerUser = useCallback(async (email, password, role, name, phone) => {
        setAuthLoading(true);
        try {
            const res = await authAPI.register({ name, email, phone, password, role });
            showToast(`✅ Account created! Welcome, ${name.split(' ')[0]}! Please sign in.`);
            return { success: true, data: res.data };
        } catch (err) {
            console.error('Registration error:', err);
            let msg = 'Registration failed';
            if (err.response?.data?.message) {
                msg = err.response.data.message;
            } else if (err.code === 'ERR_NETWORK' || !err.response) {
                msg = 'Cannot connect to server. Please ensure the backend is running on port 5000.';
            }
            return { success: false, message: msg };
        } finally {
            setAuthLoading(false);
        }
    }, [showToast]);

    const loginUser = useCallback(async (email, password) => {
        setAuthLoading(true);
        try {
            const res = await authAPI.login({ email, password });
            const userData = res.data;

            // Don't save to state/localStorage yet — wait for OTP verification
            return { success: true, data: userData };
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed';
            return { success: false, message: msg };
        } finally {
            setAuthLoading(false);
        }
    }, []);

    const finalizeLogin = useCallback((userData) => {
        // Save token and user to localStorage after OTP verification
        localStorage.setItem('kalahaat_token', userData.token);
        localStorage.setItem('kalahaat_user', JSON.stringify(userData));

        setCurrentUser(userData);
        setCurrentRole(userData.role);

        showToast(`✅ Welcome back, ${userData.name.split(' ')[0]}!`);
    }, [showToast]);

    const signOut = useCallback(() => {
        localStorage.removeItem('kalahaat_token');
        localStorage.removeItem('kalahaat_user');
        setCurrentRole('guest');
        setCurrentUser(null);
        setCartItems([]);
        setPlacedOrders([]);
        setWishlistItems([]);
        showToast('👋 Signed out. See you soon!');
    }, [showToast]);



    // ─── Cart Functions (API-powered) ────────────────────────
    const addToCart = useCallback(async (product, qty = 1) => {
        const productId = product._id || product.id;
        if (currentUser && currentUser.token) {
            try {
                const res = await cartAPI.addToCart(productId, qty);
                const items = (res.data.items || []).map(i => ({
                    ...i.product,
                    id: i.product.id || i.product._id,
                    price: Number(i.product.price),
                    qty: i.qty,
                }));
                setCartItems(items);
            } catch {
                // Fallback to local state
                setCartItems(prev => {
                    const existing = prev.find(c => (c._id || c.id) === productId);
                    if (existing) return prev.map(c => (c._id || c.id) === productId ? { ...c, qty: c.qty + qty } : c);
                    return [...prev, { ...product, id: productId, qty }];
                });
            }
        } else {
            // Guest: use local state
            setCartItems(prev => {
                const existing = prev.find(c => (c._id || c.id) === productId);
                if (existing) return prev.map(c => (c._id || c.id) === productId ? { ...c, qty: c.qty + qty } : c);
                return [...prev, { ...product, id: productId, qty }];
            });
        }
        showToast(`🛒 "${product.name}" added to cart!`);
    }, [showToast, currentUser]);

    const removeFromCart = useCallback(async (productId) => {
        if (currentUser && currentUser.token) {
            try {
                const res = await cartAPI.removeItem(productId);
                const items = (res.data.items || []).map(i => ({
                    ...i.product,
                    id: i.product.id || i.product._id,
                    price: Number(i.product.price),
                    qty: i.qty,
                }));
                setCartItems(items);
            } catch {
                setCartItems(prev => prev.filter(c => (c._id || c.id) !== productId));
            }
        } else {
            setCartItems(prev => prev.filter(c => (c._id || c.id) !== productId));
        }
        showToast('Item removed from cart');
    }, [showToast, currentUser]);

    const updateCartQty = useCallback(async (productId, delta) => {
        if (currentUser && currentUser.token) {
            try {
                // Read current qty from state via functional updater to avoid stale closure
                let currentItem = null;
                setCartItems(prev => {
                    currentItem = prev.find(c => (c._id || c.id) === productId);
                    return prev; // Don't modify — just read
                });
                if (!currentItem) return;
                const newQty = currentItem.qty + delta;
                if (newQty <= 0) {
                    const res = await cartAPI.removeItem(productId);
                    const items = (res.data.items || []).map(i => ({
                        ...i.product,
                        id: i.product.id || i.product._id,
                        price: Number(i.product.price),
                        qty: i.qty,
                    }));
                    setCartItems(items);
                } else {
                    const res = await cartAPI.updateItem(productId, newQty);
                    const items = (res.data.items || []).map(i => ({
                        ...i.product,
                        id: i.product.id || i.product._id,
                        price: Number(i.product.price),
                        qty: i.qty,
                    }));
                    setCartItems(items);
                }
            } catch {
                setCartItems(prev => {
                    const item = prev.find(c => (c._id || c.id) === productId);
                    if (!item) return prev;
                    const newQty = item.qty + delta;
                    if (newQty <= 0) return prev.filter(c => (c._id || c.id) !== productId);
                    return prev.map(c => (c._id || c.id) === productId ? { ...c, qty: newQty } : c);
                });
            }
        } else {
            setCartItems(prev => {
                const item = prev.find(c => (c._id || c.id) === productId);
                if (!item) return prev;
                const newQty = item.qty + delta;
                if (newQty <= 0) return prev.filter(c => (c._id || c.id) !== productId);
                return prev.map(c => (c._id || c.id) === productId ? { ...c, qty: newQty } : c);
            });
        }
    }, [currentUser]);

    const cartTotal = cartItems.reduce((s, c) => s + Number(c.price) * c.qty, 0);
    const cartCount = cartItems.reduce((s, c) => s + c.qty, 0);
    const shipping = cartTotal >= 1000 ? 0 : 99;
    const orderTotal = cartTotal + shipping;

    // ─── Wishlist Functions (API-powered) ────────────────────
    const addToWishlist = useCallback(async (product) => {
        const productId = product._id || product.id;
        if (currentUser && currentUser.token) {
            try {
                const res = await wishlistAPI.addToWishlist(productId);
                const products = (res.data.products || []).map(p => ({ ...p, id: p.id || p._id, price: Number(p.price) }));
                setWishlistItems(products);
            } catch {
                setWishlistItems(prev => {
                    if (prev.find(w => (w._id || w.id) === productId)) return prev;
                    return [...prev, { ...product, id: productId }];
                });
            }
        } else {
            setWishlistItems(prev => {
                if (prev.find(w => (w._id || w.id) === productId)) return prev;
                return [...prev, { ...product, id: productId }];
            });
        }
        showToast('❤ Added to wishlist!');
    }, [showToast, currentUser]);

    const removeFromWishlist = useCallback(async (productId) => {
        if (currentUser && currentUser.token) {
            try {
                const res = await wishlistAPI.removeFromWishlist(productId);
                const products = (res.data.products || []).map(p => ({ ...p, id: p.id || p._id, price: Number(p.price) }));
                setWishlistItems(products);
            } catch {
                setWishlistItems(prev => prev.filter(w => (w._id || w.id) !== productId));
            }
        } else {
            setWishlistItems(prev => prev.filter(w => (w._id || w.id) !== productId));
        }
        showToast('Removed from wishlist');
    }, [showToast, currentUser]);

    const isInWishlist = useCallback((productId) => {
        return wishlistItems.some(w => (w._id || w.id) === productId);
    }, [wishlistItems]);

    // ─── Profile Update (API-powered) ────────────────────────
    const updateProfile = useCallback(async (updates) => {
        try {
            const res = await authAPI.updateMe(updates);
            const updatedUser = { ...currentUser, ...res.data };
            // Keep token from current user (API response may not include it)
            updatedUser.token = currentUser.token;
            localStorage.setItem('kalahaat_user', JSON.stringify(updatedUser));
            setCurrentUser(updatedUser);
            showToast('✅ Profile updated successfully!');
            return true;
        } catch (err) {
            console.error('UpdateProfile error:', err);
            showToast('⚠ Failed to update profile');
            return false;
        }
    }, [currentUser, showToast]);

    // ─── Order Functions (API-powered) ───────────────────────
    const placeOrder = useCallback(async (method, address) => {
        if (currentUser && currentUser.token) {
            try {
                const orderData = {
                    items: cartItems.map(c => ({
                        product: c._id || c.id,
                        name: c.name,
                        price: c.price,
                        qty: c.qty,
                        image: c.image || '',
                    })),
                    total: orderTotal,
                    shipping,
                    paymentMethod: method,
                    address,
                };
                const res = await ordersAPI.placeOrder(orderData);
                // Refetch all orders to ensure consistent format
                try {
                    const ordersRes = await ordersAPI.getMyOrders();
                    setPlacedOrders(ordersRes.data);
                } catch {
                    // Fallback: add raw response to state
                    setPlacedOrders(prev => [res.data, ...prev]);
                }
                setCartItems([]);
                return res.data.orderId;
            } catch (err) {
                console.error('PlaceOrder error:', err);
                showToast('⚠ Failed to place order. Please try again.');
                return null;
            }
        } else {
            // Guest fallback (shouldn't happen, but just in case)
            const orderId = 'KH-' + Math.floor(100000 + Math.random() * 900000);
            const methodLabels = { upi: 'UPI', card: 'Card', netbank: 'Net Banking', wallet: 'Wallet', cod: 'Cash on Delivery' };
            const order = {
                id: orderId,
                orderId,
                date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                method: methodLabels[method] || method,
                items: cartItems.map(c => ({ ...c })),
                total: orderTotal,
                address,
                status: method === 'cod' ? 'Confirmed' : 'Processing',
                statusClass: method === 'cod' ? 'status-pending' : 'status-active'
            };
            setPlacedOrders(prev => [order, ...prev]);
            setCartItems([]);
            return orderId;
        }
    }, [cartItems, orderTotal, shipping, currentUser, showToast]);

    const value = {
        currentRole, currentUser, authLoading,
        cartItems, cartCount, cartTotal, shipping, orderTotal,
        wishlistItems, placedOrders,
        setCurrentRole, setCurrentUser, registerUser, loginUser, finalizeLogin, signOut,
        addToCart, removeFromCart, updateCartQty,
        addToWishlist, removeFromWishlist, isInWishlist,
        placeOrder, updateProfile, showToast,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within AppProvider');
    return context;
}
