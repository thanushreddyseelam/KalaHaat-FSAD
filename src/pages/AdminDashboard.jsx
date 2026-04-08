import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { adminAPI } from '../services/api';

export default function AdminDashboard() {
    const { currentUser, signOut, showToast } = useApp();
    const navigate = useNavigate();
    const [section, setSection] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Data states
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);

    const [userFilter, setUserFilter] = useState('all');

    const firstName = currentUser?.name?.split(' ')[0] || 'Admin';
    const initial = (currentUser?.name || 'A').charAt(0).toUpperCase();
    const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

    const menuItems = [
        { key: 'overview', icon: '📊', label: 'Overview' },
        { key: 'users', icon: '👥', label: 'Manage Users' },
        { key: 'products', icon: '📦', label: 'Products' },
        { key: 'orders', icon: '🛒', label: 'All Orders' },
        { key: 'settings', icon: '⚙️', label: 'Platform Settings' },
    ];

    const fetchStats = useCallback(async () => {
        try {
            const res = await adminAPI.getStats();
            setStats(res.data);
        } catch (err) { console.error('Fetch stats error:', err); }
    }, []);

    const fetchUsers = useCallback(async (params) => {
        try {
            const res = await adminAPI.getUsers(params);
            setUsers(res.data);
        } catch (err) { console.error('Fetch users error:', err); }
    }, []);

    const fetchOrders = useCallback(async () => {
        try {
            const res = await adminAPI.getOrders();
            setOrders(res.data);
        } catch (err) { console.error('Fetch orders error:', err); }
    }, []);

    const fetchProducts = useCallback(async () => {
        try {
            const res = await adminAPI.getProducts();
            setProducts(res.data);
        } catch (err) { console.error('Fetch products error:', err); }
    }, []);

    useEffect(() => {
        fetchStats();
        fetchUsers();
        fetchOrders();
        fetchProducts();
    }, [fetchStats, fetchUsers, fetchOrders, fetchProducts]);

    // Filter users by tab
    const filteredUsers = users.filter(u => {
        if (userFilter === 'all') return true;
        if (userFilter === 'pending') return u.status === 'pending';
        return u.role === userFilter;
    });

    const handleUserStatus = async (userId, userName, newStatus) => {
        setLoading(true);
        try {
            await adminAPI.updateUserStatus(userId, newStatus);
            showToast(`✅ ${userName} ${newStatus === 'active' ? 'approved' : newStatus}!`);
            fetchUsers();
            fetchStats();
        } catch (err) {
            showToast('❌ Failed to update user');
        }
        setLoading(false);
    };

    return (
        <div className="dashboard-layout">
            <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)} />
            <aside className={`sidebar sidebar-admin ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-profile">
                    <div className="sidebar-avatar">{initial}</div>
                    <div className="sidebar-name">{currentUser?.name || 'Admin'}</div>
                    <div className="sidebar-role">Platform Administrator</div>
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
                <div className="dashboard-greeting">Welcome, {firstName} 👋</div>
                <div className="dashboard-date">Admin Control Center · {dateStr}</div>

                {section === 'overview' && (
                    <>
                        <div className="stats-grid">
                            <div className="stat-card"><div className="stat-number">{stats?.users?.artisanCount || 0}</div><div className="stat-label">Total Artisans</div></div>
                            <div className="stat-card" style={{ borderLeftColor: 'var(--moss)' }}><div className="stat-number" style={{ color: 'var(--moss)' }}>{stats?.products?.totalProducts || 0}</div><div className="stat-label">Total Products</div></div>
                            <div className="stat-card" style={{ borderLeftColor: 'var(--indigo)' }}><div className="stat-number" style={{ color: 'var(--indigo)' }}>₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}</div><div className="stat-label">Total Revenue</div></div>
                            <div className="stat-card" style={{ borderLeftColor: 'var(--ochre)' }}><div className="stat-number" style={{ color: 'var(--ochre)' }}>{stats?.users?.pendingUsers || 0}</div><div className="stat-label">Pending Approvals</div></div>
                        </div>
                        <div className="section-card">
                            <div className="section-card-title">Platform Summary</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, padding: '8px 0' }}>
                                <div style={{ padding: 12, border: '1px solid #F0E4D0', borderRadius: 8 }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--bark)' }}>Users</div>
                                    <div style={{ fontSize: '0.95rem' }}>{stats?.users?.customerCount || 0} Customers · {stats?.users?.consultantCount || 0} Consultants</div>
                                </div>
                                <div style={{ padding: 12, border: '1px solid #F0E4D0', borderRadius: 8 }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--bark)' }}>Products</div>
                                    <div style={{ fontSize: '0.95rem' }}>{stats?.products?.approvedProducts || 0} Approved · {stats?.products?.pendingProducts || 0} Pending</div>
                                </div>
                                <div style={{ padding: 12, border: '1px solid #F0E4D0', borderRadius: 8 }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--bark)' }}>Orders</div>
                                    <div style={{ fontSize: '0.95rem' }}>{stats?.orders?.totalOrders || 0} Total · {stats?.orders?.deliveredOrders || 0} Delivered</div>
                                </div>
                            </div>
                        </div>
                        {stats?.recentOrders && stats.recentOrders.length > 0 && (
                            <div className="section-card">
                                <div className="section-card-title">Recent Orders</div>
                                <div className="table-scroll-wrapper"><table className="data-table">
                                    <thead><tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
                                    <tbody>
                                        {stats.recentOrders.map((o, i) => (
                                            <tr key={i}>
                                                <td>{o.orderId}</td><td>{o.customer}</td><td>₹{o.total?.toLocaleString('en-IN')}</td><td>{o.date}</td>
                                                <td><span className={`status-badge ${o.status === 'Delivered' ? 'status-delivered' : o.status === 'Shipped' ? 'status-active' : 'status-pending'}`}>{o.status}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table></div>
                            </div>
                        )}
                    </>
                )}

                {section === 'users' && (
                    <div className="section-card">
                        <div className="section-card-title">User Management
                            <div className="tabs" style={{ marginBottom: 0 }}>
                                {['all', 'artisan', 'customer', 'consultant', 'pending'].map(f => (
                                    <button key={f} className={`tab ${userFilter === f ? 'active' : ''}`} onClick={() => setUserFilter(f)}>{f === 'all' ? 'All Users' : f.charAt(0).toUpperCase() + f.slice(1) + (f !== 'pending' ? 's' : '')}</button>
                                ))}
                            </div>
                        </div>
                        {filteredUsers.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 30, color: 'var(--bark)' }}>No users found</div>
                        ) : (
                            <div className="table-scroll-wrapper">
                                <table className="data-table">
                                    <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th><th>Action</th></tr></thead>
                                    <tbody>
                                        {filteredUsers.map(u => (
                                            <tr key={u.id || u._id}>
                                                <td><strong>{u.name}</strong></td>
                                                <td style={{ fontSize: '0.85rem' }}>{u.email}</td>
                                                <td>{u.role.charAt(0).toUpperCase() + u.role.slice(1)}</td>
                                                <td>{new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                                <td><span className={`status-badge ${u.status === 'active' ? 'status-active' : u.status === 'suspended' ? 'status-rejected' : 'status-pending'}`}>{u.status.charAt(0).toUpperCase() + u.status.slice(1)}</span></td>
                                                <td>
                                                    {u.status === 'pending' ? (
                                                        <button style={{ background: 'var(--moss)', color: 'white', border: 'none', padding: '4px 12px', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem' }} onClick={() => handleUserStatus(u.id || u._id, u.name, 'active')} disabled={loading}>Approve</button>
                                                    ) : u.status === 'active' ? (
                                                        <button style={{ background: 'none', border: '1px solid #dc3545', color: '#dc3545', padding: '4px 12px', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem' }} onClick={() => handleUserStatus(u.id || u._id, u.name, 'suspended')} disabled={loading}>Suspend</button>
                                                    ) : (
                                                        <button style={{ background: 'var(--moss)', color: 'white', border: 'none', padding: '4px 12px', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem' }} onClick={() => handleUserStatus(u.id || u._id, u.name, 'active')} disabled={loading}>Reactivate</button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {section === 'products' && (
                    <div className="section-card">
                        <div className="section-card-title">All Products ({products.length})</div>
                        {products.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 30, color: 'var(--bark)' }}>No products found</div>
                        ) : (
                            <div className="table-scroll-wrapper">
                                <table className="data-table">
                                    <thead><tr><th>Product</th><th>Artisan</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th></tr></thead>
                                    <tbody>
                                        {products.map(p => (
                                            <tr key={p.id || p._id}>
                                                <td><strong>{p.name}</strong></td>
                                                <td>{p.artisanUser?.name || p.artisan || '—'}</td>
                                                <td>{p.category}</td>
                                                <td>₹{p.price?.toLocaleString('en-IN')}</td>
                                                <td>{p.stock}</td>
                                                <td><span className={`status-badge ${p.verificationStatus === 'approved' ? 'status-active' : p.verificationStatus === 'rejected' ? 'status-rejected' : 'status-pending'}`}>{p.verificationStatus.charAt(0).toUpperCase() + p.verificationStatus.slice(1)}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {section === 'orders' && (
                    <div className="section-card">
                        <div className="section-card-title">All Orders ({orders.length})</div>
                        {orders.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 30, color: 'var(--bark)' }}>No orders found</div>
                        ) : (
                            <div className="table-scroll-wrapper">
                                <table className="data-table">
                                    <thead><tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Date</th><th>Payment</th><th>Status</th></tr></thead>
                                    <tbody>
                                        {orders.map(o => (
                                            <tr key={o.id || o._id}>
                                                <td>{o.orderId}</td>
                                                <td>{o.customerName || 'Unknown'}</td>
                                                <td>₹{o.total?.toLocaleString('en-IN')}</td>
                                                <td>{o.date}</td>
                                                <td>{o.paymentMethod?.toUpperCase()}</td>
                                                <td><span className={`status-badge ${o.status === 'Delivered' ? 'status-delivered' : o.status === 'Shipped' ? 'status-active' : o.status === 'Cancelled' ? 'status-rejected' : 'status-pending'}`}>{o.status}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {section === 'settings' && (
                    <div className="section-card">
                        <div className="section-card-title">⚙️ Platform Settings</div>
                        <div style={{ maxWidth: 500 }}>
                            <div className="form-group"><label>Platform Name</label><input defaultValue="KalaHaat" /></div>
                            <div className="form-group"><label>Support Email</label><input defaultValue="support@kalahaat.in" /></div>
                            <div className="form-group"><label>Commission Rate (%)</label><input type="number" defaultValue="8" /></div>
                            <div className="form-group"><label>Free Shipping Threshold (₹)</label><input type="number" defaultValue="1000" /></div>
                            <div className="form-group"><label>Max Products Per Artisan</label><input type="number" defaultValue="50" /></div>
                            <button className="btn-primary" onClick={() => showToast('✅ Settings updated!')}>Save Settings</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
