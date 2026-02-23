import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function ArtisanDashboard() {
    const { currentUser, signOut, showToast } = useApp();
    const navigate = useNavigate();
    const [section, setSection] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [products] = useState([
        { id: 1, name: 'Gond Painting – Forest Scene', category: 'Folk Paintings', price: 2400, stock: 3, status: 'Verified' },
        { id: 2, name: 'Tribal Necklace', category: 'Jewellery', price: 1800, stock: 5, status: 'Pending' },
        { id: 3, name: 'Warli Wall Art', category: 'Folk Paintings', price: 3200, stock: 2, status: 'Verified' },
    ]);

    const firstName = currentUser?.name?.split(' ')[0] || 'Artisan';
    const initial = (currentUser?.name || 'A').charAt(0).toUpperCase();
    const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

    const menuItems = [
        { key: 'overview', icon: '📊', label: 'Dashboard' },
        { key: 'products', icon: '📦', label: 'My Products' },
        { key: 'addproduct', icon: '➕', label: 'Add Product' },
        { key: 'orders', icon: '🛒', label: 'Orders' },
        { key: 'messages', icon: '💬', label: 'Messages' },
        { key: 'earnings', icon: '💰', label: 'Earnings' },
        { key: 'settings', icon: '⚙️', label: 'Profile Settings' },
    ];

    const [artForm, setArtForm] = useState({ name: '', category: 'Folk Paintings', price: '', stock: '', tribe: '', material: '', desc: '' });

    const saveProduct = () => {
        if (!artForm.name) { showToast('⚠ Product name is required'); return; }
        if (!artForm.price || artForm.price <= 0) { showToast('⚠ Enter a valid price'); return; }
        if (!artForm.tribe) { showToast('⚠ Tribe/Community is required'); return; }
        if (!artForm.desc) { showToast('⚠ Description is required'); return; }
        setArtForm({ name: '', category: 'Folk Paintings', price: '', stock: '', tribe: '', material: '', desc: '' });
        showToast('✅ Product saved! Pending consultant verification.');
    };

    return (
        <div className="dashboard-layout">
            <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)} />
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
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
                            <div className="stat-card"><div className="stat-number">₹48,200</div><div className="stat-label">Total Earnings</div></div>
                            <div className="stat-card" style={{ borderLeftColor: 'var(--moss)' }}><div className="stat-number" style={{ color: 'var(--moss)' }}>34</div><div className="stat-label">Products Listed</div></div>
                            <div className="stat-card" style={{ borderLeftColor: 'var(--indigo)' }}><div className="stat-number" style={{ color: 'var(--indigo)' }}>127</div><div className="stat-label">Total Orders</div></div>
                            <div className="stat-card" style={{ borderLeftColor: 'var(--ochre)' }}><div className="stat-number" style={{ color: 'var(--ochre)' }}>4.9 ★</div><div className="stat-label">Avg. Rating</div></div>
                        </div>
                        <div className="section-card">
                            <div className="section-card-title">Recent Orders</div>
                            <div className="table-scroll-wrapper"><table className="data-table">
                                <thead><tr><th>Order ID</th><th>Product</th><th>Customer</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
                                <tbody>
                                    <tr><td>#ORD-1024</td><td>Gond Painting</td><td>Ananya S.</td><td>18 Feb 2026</td><td>₹2,400</td><td><span className="status-badge status-delivered">Delivered</span></td></tr>
                                    <tr><td>#ORD-1019</td><td>Tribal Necklace</td><td>Priya M.</td><td>15 Feb 2026</td><td>₹1,800</td><td><span className="status-badge status-active">Shipped</span></td></tr>
                                    <tr><td>#ORD-1015</td><td>Gond Painting</td><td>Raj P.</td><td>12 Feb 2026</td><td>₹2,400</td><td><span className="status-badge status-pending">Processing</span></td></tr>
                                </tbody>
                            </table></div>
                        </div>
                    </>
                )}

                {section === 'products' && (
                    <div className="section-card">
                        <div className="section-card-title">My Products
                            <button className="btn-primary" style={{ fontSize: '0.7rem', padding: '8px 16px' }} onClick={() => setSection('addproduct')}>➕ Add New</button>
                        </div>
                        <div className="table-scroll-wrapper"><table className="data-table">
                            <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th></tr></thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p.id}>
                                        <td><strong>{p.name}</strong></td><td>{p.category}</td>
                                        <td>₹{p.price.toLocaleString('en-IN')}</td><td>{p.stock}</td>
                                        <td><span className={`status-badge ${p.status === 'Verified' ? 'status-active' : 'status-pending'}`}>{p.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table></div>
                    </div>
                )}

                {section === 'addproduct' && (
                    <div className="section-card">
                        <div className="section-card-title">Add New Product
                            <button className="btn-primary" style={{ fontSize: '0.7rem', padding: '8px 16px' }} onClick={saveProduct}>💾 Save Product</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            <div className="form-group"><label>Product Name</label><input value={artForm.name} onChange={e => setArtForm({ ...artForm, name: e.target.value })} placeholder="e.g. Gond Painting – Forest Scene" /></div>
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
                        <div className="table-scroll-wrapper"><table className="data-table">
                            <thead><tr><th>Order ID</th><th>Product</th><th>Customer</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
                            <tbody>
                                <tr><td>#ORD-1024</td><td>Gond Painting</td><td>Ananya S.</td><td>18 Feb 2026</td><td>₹2,400</td><td><span className="status-badge status-delivered">Delivered</span></td></tr>
                                <tr><td>#ORD-1019</td><td>Tribal Necklace</td><td>Priya M.</td><td>15 Feb 2026</td><td>₹1,800</td><td><span className="status-badge status-active">Shipped</span></td></tr>
                                <tr><td>#ORD-1015</td><td>Gond Painting</td><td>Raj P.</td><td>12 Feb 2026</td><td>₹2,400</td><td><span className="status-badge status-pending">Processing</span></td></tr>
                                <tr><td>#ORD-1008</td><td>Warli Wall Art</td><td>Sneha K.</td><td>8 Feb 2026</td><td>₹3,200</td><td><span className="status-badge status-delivered">Delivered</span></td></tr>
                            </tbody>
                        </table></div>
                    </div>
                )}

                {section === 'messages' && (
                    <div className="section-card">
                        <div className="section-card-title">💬 Messages</div>
                        {[{ from: 'Ananya Sharma', msg: 'Can you customize the size of the Gond painting?', time: '2 hours ago', unread: true },
                        { from: 'KalaHaat Support', msg: 'Your product "Tribal Necklace" has been verified!', time: '1 day ago', unread: false },
                        { from: 'Raj Patel', msg: 'Thank you for the beautiful painting!', time: '3 days ago', unread: false },
                        ].map((m, i) => (
                            <div key={i} style={{ display: 'flex', gap: 16, padding: 16, border: '1px solid #F0E4D0', borderRadius: 10, marginBottom: 12, background: m.unread ? '#FDF6EC' : 'white' }}>
                                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--terracotta)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, flexShrink: 0 }}>{m.from.charAt(0)}</div>
                                <div style={{ flex: 1 }}><div style={{ fontWeight: 700, marginBottom: 4 }}>{m.from} {m.unread && <span style={{ background: 'var(--terracotta)', color: 'white', fontSize: '0.6rem', padding: '2px 8px', borderRadius: 10, marginLeft: 8 }}>New</span>}</div><div style={{ fontSize: '0.9rem', color: 'var(--bark)' }}>{m.msg}</div></div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--bark)', whiteSpace: 'nowrap' }}>{m.time}</div>
                            </div>
                        ))}
                    </div>
                )}

                {section === 'earnings' && (
                    <div className="section-card">
                        <div className="section-card-title">💰 Earnings Overview</div>
                        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                            <div className="stat-card"><div className="stat-number">₹48,200</div><div className="stat-label">Total Earnings</div></div>
                            <div className="stat-card" style={{ borderLeftColor: 'var(--moss)' }}><div className="stat-number" style={{ color: 'var(--moss)' }}>₹12,400</div><div className="stat-label">This Month</div></div>
                            <div className="stat-card" style={{ borderLeftColor: 'var(--ochre)' }}><div className="stat-number" style={{ color: 'var(--ochre)' }}>₹8,600</div><div className="stat-label">Pending Payout</div></div>
                        </div>
                        <div style={{ marginTop: 24 }}><h4 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 16 }}>Recent Payouts</h4>
                            <div className="table-scroll-wrapper"><table className="data-table">
                                <thead><tr><th>Date</th><th>Amount</th><th>Method</th><th>Status</th></tr></thead>
                                <tbody>
                                    <tr><td>15 Feb 2026</td><td>₹8,400</td><td>Bank Transfer</td><td><span className="status-badge status-delivered">Completed</span></td></tr>
                                    <tr><td>1 Feb 2026</td><td>₹12,000</td><td>Bank Transfer</td><td><span className="status-badge status-delivered">Completed</span></td></tr>
                                    <tr><td>15 Jan 2026</td><td>₹6,800</td><td>Bank Transfer</td><td><span className="status-badge status-delivered">Completed</span></td></tr>
                                </tbody>
                            </table></div>
                        </div>
                    </div>
                )}

                {section === 'settings' && (
                    <div className="section-card">
                        <div className="section-card-title">⚙️ Profile Settings</div>
                        <div style={{ maxWidth: 500 }}>
                            <div className="form-group"><label>Full Name</label><input defaultValue={currentUser?.name || ''} /></div>
                            <div className="form-group"><label>Email</label><input defaultValue={currentUser?.email || ''} /></div>
                            <div className="form-group"><label>Phone</label><input placeholder="+91 9876543210" /></div>
                            <div className="form-group"><label>Tribe / Community</label><input placeholder="e.g. Gondi Tribe, Madhya Pradesh" /></div>
                            <div className="form-group"><label>Bio</label><textarea placeholder="Tell buyers about yourself and your craft..." /></div>
                            <button className="btn-primary" onClick={() => showToast('✅ Profile updated!')}>Save Profile</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
