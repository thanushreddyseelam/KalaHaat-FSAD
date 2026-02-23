import { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
    const [currentRole, setCurrentRole] = useState('guest');
    const [currentUser, setCurrentUser] = useState(null);
    const [registeredUsers, setRegisteredUsers] = useState({});
    const [cartItems, setCartItems] = useState([]);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [placedOrders, setPlacedOrders] = useState([]);
    const [toastMsg, setToastMsg] = useState('');
    const [toastVisible, setToastVisible] = useState(false);

    const showToast = useCallback((msg) => {
        setToastMsg(msg);
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 3200);
    }, []);

    const registerUser = useCallback((email, password, role, name, phone) => {
        setRegisteredUsers(prev => ({
            ...prev,
            [email.toLowerCase()]: { password, role, name, email, phone }
        }));
    }, []);

    const loginAs = useCallback((role, name, email) => {
        setCurrentRole(role);
        setCurrentUser({ name, email, role });
    }, []);

    const signOut = useCallback(() => {
        setCurrentRole('guest');
        setCurrentUser(null);
        setCartItems([]);
        setPlacedOrders([]);
        setWishlistItems([]);
        showToast('👋 Signed out. See you soon!');
    }, [showToast]);

    const addToCart = useCallback((product, qty = 1) => {
        setCartItems(prev => {
            const existing = prev.find(c => c.id === product.id);
            if (existing) return prev.map(c => c.id === product.id ? { ...c, qty: c.qty + qty } : c);
            return [...prev, { ...product, qty }];
        });
        showToast(`🛒 "${product.name}" added to cart!`);
    }, [showToast]);

    const removeFromCart = useCallback((productId) => {
        setCartItems(prev => prev.filter(c => c.id !== productId));
        showToast('Item removed from cart');
    }, [showToast]);

    const updateCartQty = useCallback((productId, delta) => {
        setCartItems(prev => {
            const item = prev.find(c => c.id === productId);
            if (!item) return prev;
            const newQty = item.qty + delta;
            if (newQty <= 0) return prev.filter(c => c.id !== productId);
            return prev.map(c => c.id === productId ? { ...c, qty: newQty } : c);
        });
    }, []);

    const cartTotal = cartItems.reduce((s, c) => s + c.price * c.qty, 0);
    const cartCount = cartItems.reduce((s, c) => s + c.qty, 0);
    const shipping = cartTotal >= 1000 ? 0 : 99;
    const orderTotal = cartTotal + shipping;

    const addToWishlist = useCallback((product) => {
        setWishlistItems(prev => {
            if (prev.find(w => w.id === product.id)) return prev;
            return [...prev, { ...product }];
        });
        showToast('❤ Added to wishlist!');
    }, [showToast]);

    const removeFromWishlist = useCallback((productId) => {
        setWishlistItems(prev => prev.filter(w => w.id !== productId));
        showToast('Removed from wishlist');
    }, [showToast]);

    const isInWishlist = useCallback((productId) => {
        return wishlistItems.some(w => w.id === productId);
    }, [wishlistItems]);

    const placeOrder = useCallback((method, address) => {
        const orderId = 'KH-' + Math.floor(100000 + Math.random() * 900000);
        const methodLabels = { upi: 'UPI', card: 'Card', netbank: 'Net Banking', wallet: 'Wallet', cod: 'Cash on Delivery' };
        const order = {
            id: orderId,
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
    }, [cartItems, orderTotal]);

    const value = {
        currentRole, currentUser, registeredUsers,
        cartItems, cartCount, cartTotal, shipping, orderTotal,
        wishlistItems, placedOrders, toastMsg, toastVisible,
        setCurrentRole, setCurrentUser, registerUser, loginAs, signOut,
        addToCart, removeFromCart, updateCartQty,
        addToWishlist, removeFromWishlist, isInWishlist,
        placeOrder, showToast,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within AppProvider');
    return context;
}
