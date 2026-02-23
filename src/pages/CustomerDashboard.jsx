import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function CustomerDashboard() {
    const { currentUser, placedOrders, wishlistItems, addToCart, removeFromWishlist, signOut, showToast } = useApp();
    const navigate = useNavigate();
    const [section, setSection] = useState('orders');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [addresses, setAddresses] = useState([
        { id: 1, name: currentUser?.name || 'User', phone: '+91 9876543210', line1: '12-3-456, Main Street', city: 'Hyderabad', state: 'Telangana', pin: '500001', type: 'home' }
    ]);
    const [editAddr, setEditAddr] = useState(null);
    const [settings, setSettings] = useState({ name: currentUser?.name || '', email: currentUser?.email || '', phone: '' });

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

    return (
        <div className="dashboard-layout">
            <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)} />
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-profile">
                    <div className="sidebar-avatar" style={{ background: 'var(--indigo)' }}>{initial}</div>
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

                {section === 'orders' && (
                    <div className="section-card">
                        <div className="section-card-title">My Orders</div>
                        {placedOrders.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 40px' }}>
                                <div style={{ fontSize: '4rem', marginBottom: 16 }}>📦</div>
                                <h3 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 10 }}>No Orders Yet</h3>
                                <p style={{ color: 'var(--bark)', fontStyle: 'italic', marginBottom: 28 }}>You haven't placed any orders yet.</p>
                                <Link to="/products" className="btn-primary" style={{ textDecoration: 'none' }}>🏺 Browse Products</Link>
                            </div>
                        ) : (
                            placedOrders.map(order => (
                                <div key={order.id} className="order-card">
                                    <div className="order-header">
                                        <div><div className="order-id">{order.id}</div><div className="order-meta">Placed on {order.date} · {order.method}</div></div>
                                        <span className={`status-badge ${order.statusClass}`}>{order.status}</span>
                                    </div>
                                    {order.items.map(item => (
                                        <div key={item.id} className="order-item">
                                            <div className="order-item-img">{item.image ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }} /> : item.emoji}</div>
                                            <div style={{ flex: 1 }}><div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>{item.name}</div><div style={{ fontSize: '0.82rem', color: 'var(--bark)' }}>{item.origin}</div></div>
                                            <div style={{ textAlign: 'right' }}><div style={{ fontFamily: "'Space Mono', monospace", color: 'var(--terracotta)' }}>₹{(item.price * item.qty).toLocaleString('en-IN')}</div><div style={{ fontSize: '0.8rem', color: 'var(--bark)' }}>Qty: {item.qty}</div></div>
                                        </div>
                                    ))}
                                    <div className="order-footer">
                                        <div style={{ fontSize: '0.85rem', color: 'var(--bark)' }}>📍 <strong>{order.address.name}</strong> · {order.address.line1}, {order.address.city}, {order.address.state} – {order.address.pin}</div>
                                        <div style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>Total: ₹{order.total.toLocaleString('en-IN')}</div>
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
                            <div style={{ textAlign: 'center', padding: '60px 40px' }}>
                                <div style={{ fontSize: '4rem', marginBottom: 16 }}>💝</div>
                                <h3 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 10 }}>Wishlist is Empty</h3>
                                <p style={{ color: 'var(--bark)', fontStyle: 'italic', marginBottom: 28 }}>Save items you love while browsing!</p>
                                <Link to="/products" className="btn-primary" style={{ textDecoration: 'none' }}>🏺 Browse Products</Link>
                            </div>
                        ) : (
                            wishlistItems.map(item => (
                                <div key={item.id} className="wishlist-item">
                                    <div className="wishlist-img">{item.image ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} /> : item.emoji}</div>
                                    <div style={{ flex: 1 }}><div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>{item.name}</div><div style={{ fontSize: '0.85rem', color: 'var(--bark)' }}>{item.origin}</div><div style={{ fontFamily: "'Space Mono', monospace", color: 'var(--terracotta)', marginTop: 4 }}>₹{item.price.toLocaleString('en-IN')}</div></div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <button className="btn-primary" style={{ fontSize: '0.72rem', padding: '8px 14px' }} onClick={() => { addToCart(item); showToast('Moved to cart!'); }}>🛒 Add to Cart</button>
                                        <button className="btn-secondary" style={{ fontSize: '0.72rem', padding: '8px 14px' }} onClick={() => removeFromWishlist(item.id)}>🗑 Remove</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {section === 'reviews' && (
                    <div className="section-card">
                        <div className="section-card-title">⭐ My Reviews</div>
                        <div style={{ textAlign: 'center', padding: '60px 40px' }}>
                            <div style={{ fontSize: '4rem', marginBottom: 16 }}>✍️</div>
                            <h3 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 10 }}>No Reviews Yet</h3>
                            <p style={{ color: 'var(--bark)', fontStyle: 'italic', marginBottom: 28 }}>Purchase a product and share your experience!</p>
                            <Link to="/products" className="btn-primary" style={{ textDecoration: 'none' }}>🏺 Browse Products</Link>
                        </div>
                    </div>
                )}

                {section === 'promotions' && (
                    <div className="section-card">
                        <div className="section-card-title">🎁 Promotions & Offers</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                            {[{ code: 'TRIBAL10', desc: 'Get 10% off on your first order', min: '₹500', expires: 'Mar 31, 2026' },
                            { code: 'FREESHIPKH', desc: 'Free shipping on all orders above ₹999', min: '₹999', expires: 'Apr 30, 2026' },
                            { code: 'CRAFTS20', desc: '20% off on Pottery & Ceramics category', min: '₹1,000', expires: 'Feb 28, 2026' }
                            ].map((promo, i) => (
                                <div key={i} style={{ border: '2px dashed var(--ochre)', borderRadius: 12, padding: 20, background: '#FDF6EC' }}>
                                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '1.1rem', fontWeight: 700, color: 'var(--terracotta)', marginBottom: 8 }}>{promo.code}</div>
                                    <div style={{ fontSize: '0.95rem', color: 'var(--earth)', marginBottom: 12 }}>{promo.desc}</div>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--bark)' }}>Min. order: {promo.min} · Expires: {promo.expires}</div>
                                    <button className="btn-primary" style={{ marginTop: 12, fontSize: '0.7rem', padding: '8px 16px' }} onClick={() => showToast(`📋 Code "${promo.code}" copied!`)}>Copy Code</button>
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
                                <h4 style={{ marginBottom: 16, fontFamily: "'Playfair Display', serif" }}>{addresses.find(a => a.id === editAddr.id) ? 'Edit Address' : 'Add New Address'}</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div className="form-group"><label>Full Name</label><input value={editAddr.name} onChange={e => setEditAddr({ ...editAddr, name: e.target.value })} /></div>
                                    <div className="form-group"><label>Phone</label><input value={editAddr.phone} onChange={e => setEditAddr({ ...editAddr, phone: e.target.value })} /></div>
                                    <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Address</label><input value={editAddr.line1} onChange={e => setEditAddr({ ...editAddr, line1: e.target.value })} /></div>
                                    <div className="form-group"><label>City</label><input value={editAddr.city} onChange={e => setEditAddr({ ...editAddr, city: e.target.value })} /></div>
                                    <div className="form-group"><label>State</label><input value={editAddr.state} onChange={e => setEditAddr({ ...editAddr, state: e.target.value })} /></div>
                                    <div className="form-group"><label>Pincode</label><input value={editAddr.pin} onChange={e => setEditAddr({ ...editAddr, pin: e.target.value })} /></div>
                                </div>
                                <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                                    <button className="btn-primary" style={{ fontSize: '0.72rem', padding: '10px 20px' }} onClick={() => {
                                        if (!editAddr.name || !editAddr.line1 || !editAddr.city) { showToast('⚠ Please fill required fields'); return; }
                                        setAddresses(prev => { const existing = prev.find(a => a.id === editAddr.id); if (existing) return prev.map(a => a.id === editAddr.id ? editAddr : a); return [...prev, editAddr]; });
                                        setEditAddr(null); showToast('✅ Address saved!');
                                    }}>Save</button>
                                    <button className="btn-secondary" style={{ fontSize: '0.72rem', padding: '10px 20px' }} onClick={() => setEditAddr(null)}>Cancel</button>
                                </div>
                            </div>
                        )}
                        {addresses.map(addr => (
                            <div key={addr.id} style={{ border: '1px solid #F0E4D0', borderRadius: 10, padding: 18, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                                <div>
                                    <div style={{ fontWeight: 700 }}>{addr.name} <span style={{ fontSize: '0.8rem', color: 'var(--bark)' }}>({addr.type === 'home' ? '🏠 Home' : '🏢 Work'})</span></div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--bark)', marginTop: 4 }}>{addr.line1}, {addr.city}, {addr.state} – {addr.pin}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--bark)', marginTop: 2 }}>📞 {addr.phone}</div>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button className="btn-secondary" style={{ fontSize: '0.68rem', padding: '6px 12px' }} onClick={() => setEditAddr({ ...addr })}>Edit</button>
                                    <button style={{ background: 'none', border: '1px solid #dc3545', color: '#dc3545', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: '0.68rem' }} onClick={() => { setAddresses(prev => prev.filter(a => a.id !== addr.id)); showToast('Address removed'); }}>Delete</button>
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
                            <div className="form-group"><label>Email Address</label><input value={settings.email} onChange={e => setSettings({ ...settings, email: e.target.value })} /></div>
                            <div className="form-group"><label>Phone Number</label><input value={settings.phone} onChange={e => setSettings({ ...settings, phone: e.target.value })} placeholder="+91 9876543210" /></div>
                            <div className="form-group"><label>Change Password</label><input type="password" placeholder="Enter new password" /></div>
                            <div className="form-group"><label>Confirm New Password</label><input type="password" placeholder="Re-enter new password" /></div>
                            <button className="btn-primary" onClick={() => showToast('✅ Settings saved successfully!')}>Save Changes</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
