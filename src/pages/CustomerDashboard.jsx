import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { addressesAPI } from '../services/api';

export default function CustomerDashboard() {
    const { currentUser, placedOrders, wishlistItems, addToCart, removeFromWishlist, signOut, showToast, updateProfile } = useApp();
    const navigate = useNavigate();
    const [section, setSection] = useState('orders');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [editAddr, setEditAddr] = useState(null);
    const [settings, setSettings] = useState({ name: currentUser?.name || '', email: currentUser?.email || '', phone: currentUser?.phone || '' });
    const [settingsSaving, setSettingsSaving] = useState(false);

    useEffect(() => {
        if (currentUser) {
            addressesAPI.getAddresses().then(res => setAddresses(res.data)).catch(() => { });
        }
    }, [currentUser]);

    // Update settings state when currentUser changes
    useEffect(() => {
        if (currentUser) {
            setSettings({ name: currentUser.name || '', email: currentUser.email || '', phone: currentUser.phone || '' });
        }
    }, [currentUser]);

    const firstName = currentUser?.name?.split(' ')[0] || 'User';
    const initial = (currentUser?.name || 'U').charAt(0).toUpperCase();
    const menuItems = [
        { key: 'orders', icon: '📋', label: 'My Orders' },
        { key: 'wishlist', icon: '♡', label: 'Wishlist' },
        { key: 'reviews', icon: '⭐', label: 'My Reviews' },
        { key: 'promotions', icon: '🎁', label: 'Promotions' },
        { key: 'addresses', icon: '📍', label: 'Addresses' },
        { key: 'settings', icon: '⚙️', label: 'Account Settings' },
    ];

    const handleSaveSettings = async () => {
        if (!settings.name.trim()) { showToast('⚠ Name is required'); return; }
        setSettingsSaving(true);
        await updateProfile({ name: settings.name, phone: settings.phone });
        setSettingsSaving(false);
    };

    // Helper to safely get order date
    const getOrderDate = (order) => {
        if (order.date) return order.date;
        if (order.createdAt) return new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        return '—';
    };

    // Helper to safely get payment method label
    const getPaymentMethod = (order) => {
        if (order.method) return order.method;
        const labels = { upi: 'UPI', card: 'Card', netbank: 'Net Banking', wallet: 'Wallet', cod: 'Cash on Delivery' };
        return labels[order.paymentMethod] || order.paymentMethod || '—';
    };

    return (
        <div className="dashboard-layout page-fade-in">
            <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)} />
            <aside className={`sidebar sidebar-customer ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-profile">
                    <div className="sidebar-avatar">{initial}</div>
                    <div className="sidebar-name">{currentUser?.name || 'User'}</div>
                    <div className="sidebar-role">Customer Account</div>
                </div>
                <ul className="sidebar-menu">
                    {menuItems.map(m => (
                        <li key={m.key}><a className={section === m.key ? 'active' : ''} onClick={() => { setSection(m.key); setSidebarOpen(false); }}><span className="sidebar-menu-icon">{m.icon}</span>{m.label}</a></li>
                    ))}
                    <li><Link to="/products" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 28px', color: 'var(--cream)', textDecoration: 'none', fontFamily: "'Space Mono', monospace", fontSize: '0.74rem', letterSpacing: '0.8px', textTransform: 'uppercase' }}><span className="sidebar-menu-icon">🛍</span>Continue Shopping</Link></li>
                    <li><a onClick={() => { signOut(); navigate('/'); }}><span className="sidebar-menu-icon">🚪</span>Sign Out</a></li>
                </ul>
            </aside>
            <main className="dashboard-main">
                <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰ Menu</button>
                <div className="dashboard-greeting">Welcome, {firstName} 👋</div>
                <div className="dashboard-date">Track your tribal treasures</div>

                {/* Quick Stats */}
                <div className="customer-quick-stats">
                    <div className="customer-stat" onClick={() => setSection('orders')}>
                        <div className="customer-stat-num">{placedOrders.length}</div>
                        <div className="customer-stat-label">Orders</div>
                    </div>
                    <div className="customer-stat" onClick={() => setSection('wishlist')}>
                        <div className="customer-stat-num">{wishlistItems.length}</div>
                        <div className="customer-stat-label">Wishlist</div>
                    </div>
                    <div className="customer-stat" onClick={() => setSection('addresses')}>
                        <div className="customer-stat-num">{addresses.length}</div>
                        <div className="customer-stat-label">Addresses</div>
                    </div>
                </div>

                {section === 'orders' && (
                    <div className="section-card">
                        <div className="section-card-title">My Orders</div>
                        {placedOrders.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">📦</div>
                                <h3>No Orders Yet</h3>
                                <p>You haven't placed any orders yet. Start exploring our tribal handicrafts!</p>
                                <Link to="/products" className="btn-primary" style={{ textDecoration: 'none' }}>🏺 Browse Products</Link>
                            </div>
                        ) : (
                            placedOrders.map(order => (
                                <div key={order.orderId || order.id} className="order-card">
                                    <div className="order-header">
                                        <div><div className="order-id">{order.orderId || order.id}</div><div className="order-meta">Placed on {getOrderDate(order)} · {getPaymentMethod(order)}</div></div>
                                        <span className={`status-badge ${order.statusClass || 'status-active'}`}>{order.status}</span>
                                    </div>
                                    {(order.items || []).map((item, idx) => (
                                        <div key={item.product || item.id || idx} className="order-item">
                                            <div className="order-item-img">{item.image ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }} /> : '📦'}</div>
                                            <div style={{ flex: 1 }}><div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>{item.name}</div>{item.origin && <div style={{ fontSize: '0.82rem', color: 'var(--bark)' }}>{item.origin}</div>}</div>
                                            <div style={{ textAlign: 'right' }}><div style={{ fontFamily: "'Space Mono', monospace", color: 'var(--terracotta)' }}>₹{(Number(item.price) * item.qty).toLocaleString('en-IN')}</div><div style={{ fontSize: '0.8rem', color: 'var(--bark)' }}>Qty: {item.qty}</div></div>
                                        </div>
                                    ))}
                                    <div className="order-footer">
                                        <div style={{ fontSize: '0.85rem', color: 'var(--bark)' }}>📍 <strong>{order.address?.name || order.addressName || '—'}</strong> · {order.address?.line1 || order.addressLine1 || ''}, {order.address?.city || order.addressCity || ''}, {order.address?.state || order.addressState || ''} – {order.address?.pin || order.addressPin || ''}</div>
                                        <div style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>Total: ₹{Number(order.total || order.totalAmount || 0).toLocaleString('en-IN')}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {section === 'wishlist' && (
                    <div className="section-card">
                        <div className="section-card-title">♡ My Wishlist</div>
                        {wishlistItems.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">💝</div>
                                <h3>Wishlist is Empty</h3>
                                <p>Save items you love while browsing!</p>
                                <Link to="/products" className="btn-primary" style={{ textDecoration: 'none' }}>🏺 Browse Products</Link>
                            </div>
                        ) : (
                            wishlistItems.map(item => (
                                <div key={item._id || item.id} className="wishlist-item">
                                    <div className="wishlist-img">{item.image ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} /> : item.emoji}</div>
                                    <div style={{ flex: 1 }}><div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>{item.name}</div><div style={{ fontSize: '0.85rem', color: 'var(--bark)' }}>{item.origin}</div><div style={{ fontFamily: "'Space Mono', monospace", color: 'var(--terracotta)', marginTop: 4 }}>₹{Number(item.price).toLocaleString('en-IN')}</div></div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <button className="btn-primary" style={{ fontSize: '0.72rem', padding: '8px 14px' }} onClick={() => { addToCart(item); showToast('Moved to cart!'); }}>🛒 Add to Cart</button>
                                        <button className="btn-secondary" style={{ fontSize: '0.72rem', padding: '8px 14px' }} onClick={() => removeFromWishlist(item._id || item.id)}>🗑 Remove</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {section === 'reviews' && (
                    <div className="section-card">
                        <div className="section-card-title">⭐ My Reviews</div>
                        <div className="empty-state">
                            <div className="empty-state-icon">✍️</div>
                            <h3>No Reviews Yet</h3>
                            <p>Purchase a product and share your experience!</p>
                            <Link to="/products" className="btn-primary" style={{ textDecoration: 'none' }}>🏺 Browse Products</Link>
                        </div>
                    </div>
                )}

                {section === 'promotions' && (
                    <div className="section-card">
                        <div className="section-card-title">🎁 Promotions & Offers</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                            {[{ code: 'TRIBAL10', desc: 'Get 10% off on your first order', min: '₹500', expires: 'Apr 30, 2026' },
                            { code: 'FREESHIPKH', desc: 'Free shipping on all orders above ₹999', min: '₹999', expires: 'May 31, 2026' },
                            { code: 'CRAFTS20', desc: '20% off on Pottery & Ceramics category', min: '₹1,000', expires: 'Jun 30, 2026' }
                            ].map((promo, i) => (
                                <div key={i} className="promo-card">
                                    <div className="promo-code">{promo.code}</div>
                                    <div className="promo-desc">{promo.desc}</div>
                                    <div className="promo-meta">Min. order: {promo.min} · Expires: {promo.expires}</div>
                                    <button className="btn-primary" style={{ marginTop: 12, fontSize: '0.7rem', padding: '8px 16px' }} onClick={() => { navigator.clipboard?.writeText(promo.code); showToast(`📋 Code "${promo.code}" copied!`); }}>Copy Code</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {section === 'addresses' && (
                    <div className="section-card">
                        <div className="section-card-title">📍 Saved Addresses
                            <button className="btn-primary" style={{ fontSize: '0.7rem', padding: '8px 16px' }} onClick={() => setEditAddr({ id: Date.now(), name: '', phone: '', line1: '', city: '', state: '', pin: '', type: 'home' })}>+ Add Address</button>
                        </div>
                        {editAddr && (
                            <div style={{ border: '2px solid var(--terracotta)', borderRadius: 10, padding: 20, marginBottom: 20, background: '#FDF6EC' }}>
                                <h4 style={{ marginBottom: 16, fontFamily: "'Playfair Display', serif" }}>{editAddr._id ? 'Edit Address' : 'Add New Address'}</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div className="form-group"><label>Full Name</label><input value={editAddr.name} onChange={e => setEditAddr({ ...editAddr, name: e.target.value })} /></div>
                                    <div className="form-group"><label>Phone</label><input value={editAddr.phone} onChange={e => setEditAddr({ ...editAddr, phone: e.target.value })} /></div>
                                    <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Address</label><input value={editAddr.line1} onChange={e => setEditAddr({ ...editAddr, line1: e.target.value })} /></div>
                                    <div className="form-group"><label>City</label><input value={editAddr.city} onChange={e => setEditAddr({ ...editAddr, city: e.target.value })} /></div>
                                    <div className="form-group"><label>State</label><input value={editAddr.state} onChange={e => setEditAddr({ ...editAddr, state: e.target.value })} /></div>
                                    <div className="form-group"><label>Pincode</label><input value={editAddr.pin} onChange={e => setEditAddr({ ...editAddr, pin: e.target.value })} /></div>
                                </div>
                                <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                                    <button className="btn-primary" style={{ fontSize: '0.72rem', padding: '10px 20px' }} onClick={async () => {
                                        if (!editAddr.name || !editAddr.line1 || !editAddr.city) { showToast('⚠ Please fill required fields'); return; }
                                        try {
                                            const isEdit = editAddr.id;
                                            if (isEdit) {
                                                const res = await addressesAPI.updateAddress(editAddr.id, editAddr);
                                                setAddresses(prev => prev.map(a => (a.id || a._id) === editAddr.id ? res.data : a));
                                            } else {
                                                const res = await addressesAPI.addAddress(editAddr);
                                                setAddresses(prev => [...prev, res.data]);
                                            }
                                            setEditAddr(null); showToast('✅ Address saved!');
                                        } catch (err) { showToast('⚠ Failed to save address'); }
                                    }}>Save</button>
                                    <button className="btn-secondary" style={{ fontSize: '0.72rem', padding: '10px 20px' }} onClick={() => setEditAddr(null)}>Cancel</button>
                                </div>
                            </div>
                        )}
                        {addresses.length === 0 && !editAddr && (
                            <div className="empty-state">
                                <div className="empty-state-icon">📍</div>
                                <h3>No Saved Addresses</h3>
                                <p>Add a delivery address for faster checkout!</p>
                            </div>
                        )}
                        {addresses.map(addr => (
                            <div key={addr._id || addr.id} style={{ border: '1px solid #F0E4D0', borderRadius: 10, padding: 18, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                                <div>
                                    <div style={{ fontWeight: 700 }}>{addr.name} <span style={{ fontSize: '0.8rem', color: 'var(--bark)' }}>({addr.type === 'home' ? '🏠 Home' : '🏢 Work'})</span></div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--bark)', marginTop: 4 }}>{addr.line1}, {addr.city}, {addr.state} – {addr.pin}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--bark)', marginTop: 2 }}>📞 {addr.phone}</div>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button className="btn-secondary" style={{ fontSize: '0.68rem', padding: '6px 12px' }} onClick={() => setEditAddr({ ...addr })}>Edit</button>
                                    <button style={{ background: 'none', border: '1px solid #dc3545', color: '#dc3545', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: '0.68rem' }} onClick={async () => { try { await addressesAPI.deleteAddress(addr.id || addr._id); setAddresses(prev => prev.filter(a => (a.id || a._id) !== (addr.id || addr._id))); showToast('Address removed'); } catch (err) { showToast('⚠ Failed to remove'); } }}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {section === 'settings' && (
                    <div className="section-card">
                        <div className="section-card-title">⚙️ Account Settings</div>
                        <div style={{ maxWidth: 500 }}>
                            <div className="form-group"><label>Full Name</label><input value={settings.name} onChange={e => setSettings({ ...settings, name: e.target.value })} /></div>
                            <div className="form-group"><label>Email Address <span style={{ fontSize: '0.72rem', color: 'var(--bark)', fontStyle: 'italic' }}>(cannot be changed)</span></label><input value={settings.email} disabled style={{ opacity: 0.6 }} /></div>
                            <div className="form-group"><label>Phone Number</label><input value={settings.phone} onChange={e => setSettings({ ...settings, phone: e.target.value })} placeholder="+91 9876543210" /></div>
                            <button className="btn-primary" onClick={handleSaveSettings} disabled={settingsSaving} style={{ opacity: settingsSaving ? 0.6 : 1 }}>
                                {settingsSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
