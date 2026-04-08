import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './CartPage.css';

export default function CartPage() {
    const { cartItems, cartCount, cartTotal, shipping, orderTotal, updateCartQty, removeFromCart, currentRole, showToast } = useApp();
    const navigate = useNavigate();

    const doCheckout = () => {
        if (currentRole === 'guest') { showToast('⚠ Please sign in to checkout'); navigate('/login'); return; }
        if (cartItems.length === 0) { showToast('⚠ Your cart is empty!'); return; }
        navigate('/payment');
    };

    return (
        <div>
            <div className="page-header"><h1>Your Cart</h1><p>{cartCount === 0 ? 'Your cart is empty' : `${cartCount} item${cartCount > 1 ? 's' : ''} from tribal artisans`}</p></div>
            <div className="cart-layout">
                <div>
                    {cartItems.length === 0 ? (
                        <div className="cart-empty">
                            <div style={{ fontSize: '5rem', marginBottom: 20 }}>🛒</div>
                            <h2>Your Cart is Empty</h2>
                            <p>Looks like you haven't added any tribal treasures yet.</p>
                            <Link to="/products" className="btn-primary">🏺 Start Shopping</Link>
                        </div>
                    ) : (
                        <div>
                            {cartItems.map(item => (
                                <div className="cart-item" key={item._id || item.id}>
                                    <div className="cart-item-img">{item.image ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} /> : item.emoji}</div>
                                    <div className="cart-item-info">
                                        <div className="cart-item-name">{item.name}</div>
                                        <div className="cart-item-origin">{item.origin}</div>
                                        <div className="cart-item-price">₹{(Number(item.price) * item.qty).toLocaleString('en-IN')}</div>
                                    </div>
                                    <div className="cart-item-qty">
                                        <button className="qty-mini-btn" onClick={() => updateCartQty(item._id || item.id, -1)}>−</button>
                                        <span>{item.qty}</span>
                                        <button className="qty-mini-btn" onClick={() => updateCartQty(item._id || item.id, 1)}>+</button>
                                    </div>
                                    <button className="remove-btn" onClick={() => removeFromCart(item._id || item.id)}>🗑</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div>
                    <div className="order-summary">
                        <div className="summary-title">Order Summary</div>
                        <div className="summary-row"><span>Subtotal ({cartCount} items)</span><span>₹{cartTotal.toLocaleString('en-IN')}</span></div>
                        <div className="summary-row"><span>Shipping</span><span style={{ color: 'var(--moss)' }}>{shipping === 0 ? 'Free' : `₹${shipping}`}</span></div>
                        <div className="summary-row"><span>Discount</span><span style={{ color: 'var(--moss)' }}>−₹0</span></div>
                        <div className="summary-total"><span>Total</span><span>₹{orderTotal.toLocaleString('en-IN')}</span></div>
                        <button className="btn-primary" style={{ width: '100%', marginTop: 24, opacity: cartItems.length === 0 ? 0.5 : 1 }} onClick={doCheckout} disabled={cartItems.length === 0}>Proceed to Checkout</button>
                        <Link to="/products" className="btn-secondary" style={{ width: '100%', marginTop: 12, display: 'block', textAlign: 'center', textDecoration: 'none' }}>Continue Shopping</Link>
                        <div className="cart-secure">🔒 Secure payment powered by Razorpay</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
