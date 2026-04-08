import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { artisanAPI, authAPI } from '../services/api';

export default function ArtisanDashboard() {
    const { currentUser, showToast, signOut } = useApp();
    const navigate = useNavigate();
    const [section, setSection] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Data states
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({ totalEarnings: 0, productCount: 0, orderCount: 0, avgRating: '0.0', pendingPayout: 0, recentTransactions: [] });

    // Add product form
    const [artForm, setArtForm] = useState({ name: '', category: 'Folk Paintings', price: '', stock: '', tribe: '', material: '', desc: '' });
    const [imageFile, setImageFile] = useState(null);

    // Profile form
    const [profileForm, setProfileForm] = useState({ name: '', phone: '', tribe: '', bio: '' });

    const firstName = currentUser?.name?.split(' ')[0] || 'Artisan';
    const initial = (currentUser?.name || 'A').charAt(0).toUpperCase();
    const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

    const menuItems = [
        { key: 'overview', icon: '📊', label: 'Dashboard' },
        { key: 'products', icon: '📦', label: 'My Products' },
        { key: 'addproduct', icon: '➕', label: 'Add Product' },
        { key: 'orders', icon: '🛒', label: 'Orders' },
        { key: 'earnings', icon: '💰', label: 'Earnings' },
        { key: 'settings', icon: '⚙️', label: 'Profile Settings' },
    ];

    // Fetch data on mount
    const fetchProducts = useCallback(async () => {
        try {
            const res = await artisanAPI.getMyProducts();
            setProducts(res.data);
        } catch (err) { console.error('Fetch products error:', err); }
    }, []);

    const fetchOrders = useCallback(async () => {
        try {
            const res = await artisanAPI.getMyOrders();
            setOrders(res.data);
        } catch (err) { console.error('Fetch orders error:', err); }
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            const res = await artisanAPI.getStats();
            setStats(res.data);
        } catch (err) { console.error('Fetch stats error:', err); }
    }, []);

    useEffect(() => {
        fetchProducts();
        fetchOrders();
        fetchStats();
    }, [fetchProducts, fetchOrders, fetchStats]);

    useEffect(() => {
        if (currentUser) {
            setProfileForm({
                name: currentUser.name || '',
                phone: currentUser.phone || '',
                tribe: currentUser.tribe || '',
                bio: currentUser.bio || '',
            });
        }
    }, [currentUser]);

    // Create product
    const saveProduct = async () => {
        if (!artForm.name) { showToast('⚠ Product name is required'); return; }
        if (!artForm.price || artForm.price <= 0) { showToast('⚠ Enter a valid price'); return; }
        if (!artForm.tribe) { showToast('⚠ Tribe/Community is required'); return; }
        if (!artForm.desc) { showToast('⚠ Description is required'); return; }
        if (!imageFile) { showToast('⚠ Product image is required'); return; }

        setLoading(true);
        try {
            // Upload Image first
            const formData = new FormData();
            formData.append('image', imageFile);
            const uploadRes = await artisanAPI.uploadImage(formData);
            const imageUrl = uploadRes.data.imageUrl;

            await artisanAPI.createProduct({
                name: artForm.name,
                category: artForm.category,
                price: Number(artForm.price),
                stock: Number(artForm.stock) || 10,
                tribe: artForm.tribe,
                material: artForm.material,
                description: artForm.desc,
                image: imageUrl,
            });
            setArtForm({ name: '', category: 'Folk Paintings', price: '', stock: '', tribe: '', material: '', desc: '' });
            setImageFile(null);
            showToast('✅ Product saved! Pending consultant verification.');
            fetchProducts();
            fetchStats();
        } catch (err) {
            showToast('❌ Failed to save product or upload image');
            console.error(err);
        }
        setLoading(false);
    };

    // Delete product
    const handleDelete = async (id) => {
        try {
            await artisanAPI.deleteProduct(id);
            showToast('🗑️ Product deleted');
            fetchProducts();
            fetchStats();
        } catch (err) {
            showToast('❌ Failed to delete product');
        }
    };

    // Save profile
    const saveProfile = async () => {
        setLoading(true);
        try {
            await authAPI.updateMe(profileForm);
            showToast('✅ Profile updated!');
        } catch (err) {
            showToast('❌ Failed to update profile');
        }
        setLoading(false);
    };

    return (
        <div className="dashboard-layout">
            <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)} />
            <aside className={`sidebar sidebar-artisan ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-profile">
                    <div className="sidebar-avatar">{initial}</div>
                    <div className="sidebar-name">{currentUser?.name || 'Artisan'}</div>
                    <div className="sidebar-role">Artisan Account</div>
                </div>
                <ul className="sidebar-menu">
                    {menuItems.map(m => (
                        <li key={m.key}><a className={section === m.key ? 'active' : ''} onClick={() => { setSection(m.key); setSidebarOpen(false); }}><span className="sidebar-menu-icon">{m.icon}</span>{m.label}</a></li>
                    ))}
                    <li><a onClick={() => { signOut(); navigate('/'); }}><span className="sidebar-menu-icon">🚪</span>Sign Out</a></li>
                </ul>
            </aside>
            <main className="dashboard-main">
                <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰ Menu</button>
                <div className="dashboard-greeting">Good Day, {firstName} 👋</div>
                <div className="dashboard-date">{dateStr}</div>

                {section === 'overview' && (
                    <>
                        <div className="stats-grid">
                            <div className="stat-card"><div className="stat-number">₹{stats.totalEarnings.toLocaleString('en-IN')}</div><div className="stat-label">Total Earnings</div></div>
                            <div className="stat-card" style={{ borderLeftColor: 'var(--moss)' }}><div className="stat-number" style={{ color: 'var(--moss)' }}>{stats.productCount}</div><div className="stat-label">Products Listed</div></div>
                            <div className="stat-card" style={{ borderLeftColor: 'var(--indigo)' }}><div className="stat-number" style={{ color: 'var(--indigo)' }}>{stats.orderCount}</div><div className="stat-label">Total Orders</div></div>
                            <div className="stat-card" style={{ borderLeftColor: 'var(--ochre)' }}><div className="stat-number" style={{ color: 'var(--ochre)' }}>{stats.avgRating} ★</div><div className="stat-label">Avg. Rating</div></div>
                        </div>
                        <div className="section-card">
                            <div className="section-card-title">Recent Orders</div>
                            {orders.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: 30, color: 'var(--bark)' }}>No orders yet</div>
                            ) : (
                                <div className="table-scroll-wrapper"><table className="data-table">
                                    <thead><tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
                                    <tbody>
                                        {orders.slice(0, 5).map(o => (
                                            <tr key={o.id || o._id}>
                                                <td>{o.orderId}</td>
                                                <td>{o.customer?.name || 'Customer'}</td>
                                                <td>{o.date}</td>
                                                <td>₹{o.total?.toLocaleString('en-IN')}</td>
                                                <td><span className={`status-badge ${o.status === 'Delivered' ? 'status-delivered' : o.status === 'Shipped' ? 'status-active' : 'status-pending'}`}>{o.status}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table></div>
                            )}
                        </div>
                    </>
                )}

                {section === 'products' && (
                    <div className="section-card">
                        <div className="section-card-title">My Products
                            <button className="btn-primary" style={{ fontSize: '0.7rem', padding: '8px 16px' }} onClick={() => setSection('addproduct')}>➕ Add New</button>
                        </div>
                        {products.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 30, color: 'var(--bark)' }}>No products yet. Click "Add New" to list your first craft!</div>
                        ) : (
                            <div className="table-scroll-wrapper"><table className="data-table">
                                <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Action</th></tr></thead>
                                <tbody>
                                    {products.map(p => (
                                        <tr key={p.id || p._id}>
                                            <td><strong>{p.name}</strong></td><td>{p.category}</td>
                                            <td>₹{Number(p.price).toLocaleString('en-IN')}</td><td>{p.stock}</td>
                                            <td><span className={`status-badge ${p.verificationStatus === 'approved' ? 'status-active' : p.verificationStatus === 'rejected' ? 'status-rejected' : 'status-pending'}`}>{p.verificationStatus.charAt(0).toUpperCase() + p.verificationStatus.slice(1)}</span></td>
                                            <td><button style={{ background: 'none', border: '1px solid #dc3545', color: '#dc3545', padding: '4px 12px', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem' }} onClick={() => handleDelete(p.id || p._id)}>Delete</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table></div>
                        )}
                    </div>
                )}

                {section === 'addproduct' && (
                    <div className="section-card">
                        <div className="section-card-title">Add New Product
                            <button className="btn-primary" style={{ fontSize: '0.7rem', padding: '8px 16px' }} onClick={saveProduct} disabled={loading}>{loading ? '⏳ Saving...' : '💾 Save Product'}</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            <div className="form-group"><label>Product Name</label><input value={artForm.name} onChange={e => setArtForm({ ...artForm, name: e.target.value })} placeholder="e.g. Gond Painting – Forest Scene" /></div>
                            <div className="form-group"><label>Product Image</label><input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={{ padding: '8px' }} /></div>
                            <div className="form-group"><label>Category</label><select value={artForm.category} onChange={e => setArtForm({ ...artForm, category: e.target.value })}><option>Folk Paintings</option><option>Pottery</option><option>Textiles</option><option>Jewellery</option><option>Wooden Crafts</option></select></div>
                            <div className="form-group"><label>Price (₹)</label><input type="number" value={artForm.price} onChange={e => setArtForm({ ...artForm, price: e.target.value })} placeholder="2400" /></div>
                            <div className="form-group"><label>Stock Quantity</label><input type="number" value={artForm.stock} onChange={e => setArtForm({ ...artForm, stock: e.target.value })} placeholder="5" /></div>
                            <div className="form-group"><label>Tribe / Community</label><input value={artForm.tribe} onChange={e => setArtForm({ ...artForm, tribe: e.target.value })} placeholder="e.g. Gondi Tribe, Madhya Pradesh" /></div>
                            <div className="form-group"><label>Materials Used</label><input value={artForm.material} onChange={e => setArtForm({ ...artForm, material: e.target.value })} placeholder="e.g. Natural dyes, canvas" /></div>
                        </div>
                        <div className="form-group"><label>Product Description</label><textarea value={artForm.desc} onChange={e => setArtForm({ ...artForm, desc: e.target.value })} placeholder="Describe the craft, its origin, technique, and cultural significance..." /></div>
                    </div>
                )}

                {section === 'orders' && (
                    <div className="section-card">
                        <div className="section-card-title">All Orders</div>
                        {orders.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 30, color: 'var(--bark)' }}>No orders received yet</div>
                        ) : (
                            <div className="table-scroll-wrapper"><table className="data-table">
                                <thead><tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
                                <tbody>
                                    {orders.map(o => (
                                        <tr key={o.id || o._id}>
                                            <td>{o.orderId}</td>
                                            <td>{o.customer?.name || 'Customer'}</td>
                                            <td>{o.date}</td>
                                            <td>₹{o.total?.toLocaleString('en-IN')}</td>
                                            <td><span className={`status-badge ${o.status === 'Delivered' ? 'status-delivered' : o.status === 'Shipped' ? 'status-active' : 'status-pending'}`}>{o.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table></div>
                        )}
                    </div>
                )}

                {section === 'earnings' && (
                    <div className="section-card">
                        <div className="section-card-title">💰 Earnings Overview</div>
                        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                            <div className="stat-card"><div className="stat-number">₹{stats.totalEarnings.toLocaleString('en-IN')}</div><div className="stat-label">Total Earnings</div></div>
                            <div className="stat-card" style={{ borderLeftColor: 'var(--ochre)' }}><div className="stat-number" style={{ color: 'var(--ochre)' }}>₹{stats.pendingPayout.toLocaleString('en-IN')}</div><div className="stat-label">Pending Payout</div></div>
                            <div className="stat-card" style={{ borderLeftColor: 'var(--moss)' }}><div className="stat-number" style={{ color: 'var(--moss)' }}>{stats.orderCount}</div><div className="stat-label">Total Orders</div></div>
                        </div>
                        {stats.recentTransactions && stats.recentTransactions.length > 0 && (
                            <div style={{ marginTop: 24 }}><h4 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 16 }}>Recent Payouts</h4>
                                <div className="table-scroll-wrapper"><table className="data-table">
                                    <thead><tr><th>Date</th><th>Amount</th><th>Method</th><th>Status</th></tr></thead>
                                    <tbody>
                                        {stats.recentTransactions.map((t, i) => (
                                            <tr key={i}>
                                                <td>{new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                                <td>₹{t.amount.toLocaleString('en-IN')}</td>
                                                <td>{t.method === 'bank' ? 'Bank Transfer' : 'UPI'}</td>
                                                <td><span className={`status-badge ${t.status === 'completed' ? 'status-delivered' : t.status === 'pending' ? 'status-pending' : 'status-rejected'}`}>{t.status.charAt(0).toUpperCase() + t.status.slice(1)}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table></div>
                            </div>
                        )}
                        {(!stats.recentTransactions || stats.recentTransactions.length === 0) && (
                            <div style={{ textAlign: 'center', padding: 30, color: 'var(--bark)', marginTop: 16 }}>No payout history yet</div>
                        )}
                    </div>
                )}

                {section === 'settings' && (
                    <div className="section-card">
                        <div className="section-card-title">⚙️ Profile Settings</div>
                        <div style={{ maxWidth: 500 }}>
                            <div className="form-group"><label>Full Name</label><input value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} /></div>
                            <div className="form-group"><label>Phone</label><input value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="+91 9876543210" /></div>
                            <div className="form-group"><label>Tribe / Community</label><input value={profileForm.tribe} onChange={e => setProfileForm({ ...profileForm, tribe: e.target.value })} placeholder="e.g. Gondi Tribe, Madhya Pradesh" /></div>
                            <div className="form-group"><label>Bio</label><textarea value={profileForm.bio} onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })} placeholder="Tell buyers about yourself and your craft..." /></div>
                            <button className="btn-primary" onClick={saveProfile} disabled={loading}>{loading ? '⏳ Saving...' : 'Save Profile'}</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
