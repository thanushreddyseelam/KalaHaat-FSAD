import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function AdminDashboard() {
    const { currentUser, signOut, showToast } = useApp();
    const navigate = useNavigate();
    const [section, setSection] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const firstName = currentUser?.name?.split(' ')[0] || 'Admin';
    const initial = (currentUser?.name || 'A').charAt(0).toUpperCase();
    const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

    const menuItems = [
        { key: 'overview', icon: '📊', label: 'Overview' },
        { key: 'users', icon: '👥', label: 'Manage Users' },
        { key: 'products', icon: '📦', label: 'Products' },
        { key: 'orders', icon: '🛒', label: 'All Orders' },
        { key: 'issues', icon: '⚠️', label: 'Issues & Reports' },
        { key: 'consultant', icon: '🏛', label: 'Consultant Reviews' },
        { key: 'transactions', icon: '💰', label: 'Transactions' },
        { key: 'settings', icon: '⚙️', label: 'Platform Settings' },
    ];

    const [userFilter, setUserFilter] = useState('all');
    const users = [
        { name: 'Savitri Bai', role: 'artisan', joined: 'Jan 2025', status: 'active' },
        { name: 'Ramesh Dhokra', role: 'artisan', joined: 'Mar 2025', status: 'active' },
        { name: 'Kirtan Mistry', role: 'artisan', joined: 'Feb 2026', status: 'pending' },
        { name: 'Ananya Sharma', role: 'customer', joined: 'Dec 2024', status: 'active' },
    ];
    const [userStatuses, setUserStatuses] = useState({});

    const filteredUsers = users.filter(u => {
        if (userFilter === 'all') return true;
        if (userFilter === 'pending') return (userStatuses[u.name] || u.status) === 'pending';
        return u.role === userFilter;
    });

    return (
        <div className="dashboard-layout">
            <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)} />
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
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
                            <div className="stat-card"><div className="stat-number">2,412</div><div className="stat-label">Total Artisans</div></div>
                            <div className="stat-card" style={{ borderLeftColor: 'var(--moss)' }}><div className="stat-number" style={{ color: 'var(--moss)' }}>18,240</div><div className="stat-label">Total Products</div></div>
                            <div className="stat-card" style={{ borderLeftColor: 'var(--indigo)' }}><div className="stat-number" style={{ color: 'var(--indigo)' }}>₹12.4L</div><div className="stat-label">Revenue (Feb)</div></div>
                            <div className="stat-card" style={{ borderLeftColor: 'var(--ochre)' }}><div className="stat-number" style={{ color: 'var(--ochre)' }}>14</div><div className="stat-label">Pending Issues</div></div>
                        </div>
                        <div className="section-card">
                            <div className="section-card-title">Recent Activity</div>
                            {['New artisan registration: Kirtan Mistry', 'Product verified: Madhubani Painting Set', 'Order #ORD-1024 delivered successfully', 'Transaction #TXN-8819 on hold – review required'].map((a, i) => (
                                <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid #F0E4D0', fontSize: '0.95rem', color: 'var(--bark)' }}>• {a}</div>
                            ))}
                        </div>
                    </>
                )}

                {section === 'users' && (
                    <div className="section-card">
                        <div className="section-card-title">User Management
                            <div className="tabs" style={{ marginBottom: 0 }}>
                                {['all', 'artisan', 'customer', 'pending'].map(f => (
                                    <button key={f} className={`tab ${userFilter === f ? 'active' : ''}`} onClick={() => setUserFilter(f)}>{f === 'all' ? 'All Users' : f.charAt(0).toUpperCase() + f.slice(1) + 's'}</button>
                                ))}
                            </div>
                        </div>
                        <div className="table-scroll-wrapper">
                            <table className="data-table">
                                <thead><tr><th>User</th><th>Role</th><th>Joined</th><th>Status</th><th>Action</th></tr></thead>
                                <tbody>
                                    {filteredUsers.map((u, i) => (
                                        <tr key={i}>
                                            <td><strong>{u.name}</strong></td><td>{u.role.charAt(0).toUpperCase() + u.role.slice(1)}</td><td>{u.joined}</td>
                                            <td><span className={`status-badge ${(userStatuses[u.name] || u.status) === 'active' ? 'status-active' : 'status-pending'}`}>{(userStatuses[u.name] || u.status).charAt(0).toUpperCase() + (userStatuses[u.name] || u.status).slice(1)}</span></td>
                                            <td>{(userStatuses[u.name] || u.status) === 'pending' ?
                                                <button style={{ background: 'var(--moss)', color: 'white', border: 'none', padding: '4px 12px', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem' }} onClick={() => { setUserStatuses(prev => ({ ...prev, [u.name]: 'active' })); showToast(`✅ ${u.name} approved!`); }}>Approve</button>
                                                : <button style={{ background: 'none', border: '1px solid var(--terracotta)', color: 'var(--terracotta)', padding: '4px 12px', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem' }} onClick={() => showToast(`👤 Viewing ${u.name}'s profile`)}>View</button>
                                            }</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {section === 'products' && (
                    <div className="section-card">
                        <div className="section-card-title">Products Management</div>
                        <div className="table-scroll-wrapper">
                            <table className="data-table">
                                <thead><tr><th>Product</th><th>Artisan</th><th>Category</th><th>Price</th><th>Status</th><th>Action</th></tr></thead>
                                <tbody>
                                    {[{ n: 'Dhokra Bronze Idol', a: 'Ramesh Dhokra', c: 'Pottery', p: '₹3,200', s: 'Verified' },
                                    { n: 'Madhubani Painting Set', a: 'Gita Devi', c: 'Paintings', p: '₹4,500', s: 'Pending' },
                                    { n: 'Warli Folk Painting', a: 'Meera Warli', c: 'Paintings', p: '₹2,400', s: 'Verified' },
                                    { n: 'Pashmina Shawl', a: 'Bashir Ahmed', c: 'Textiles', p: '₹8,500', s: 'Pending' },
                                    ].map((p, i) => (
                                        <tr key={i}>
                                            <td><strong>{p.n}</strong></td><td>{p.a}</td><td>{p.c}</td><td>{p.p}</td>
                                            <td><span className={`status-badge ${p.s === 'Verified' ? 'status-active' : 'status-pending'}`}>{p.s}</span></td>
                                            <td>{p.s === 'Pending' ?
                                                <button style={{ background: 'var(--moss)', color: 'white', border: 'none', padding: '4px 12px', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem' }} onClick={() => showToast(`✅ "${p.n}" verified!`)}>Verify</button>
                                                : <button style={{ background: 'none', border: '1px solid var(--bark)', color: 'var(--bark)', padding: '4px 12px', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem' }} onClick={() => showToast(`🔍 Viewing "${p.n}"`)}>View</button>
                                            }</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {section === 'orders' && (
                    <div className="section-card">
                        <div className="section-card-title">All Orders</div>
                        <div className="table-scroll-wrapper">
                            <table className="data-table">
                                <thead><tr><th>Order ID</th><th>Customer</th><th>Artisan</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
                                <tbody>
                                    {[{ id: '#ORD-1024', c: 'Ananya S.', a: 'Savitri Bai', amt: '₹2,400', d: '18 Feb', s: 'Delivered' },
                                    { id: '#ORD-1019', c: 'Priya M.', a: 'Ramesh Dhokra', amt: '₹1,800', d: '15 Feb', s: 'Shipped' },
                                    { id: '#ORD-1015', c: 'Raj P.', a: 'Savitri Bai', amt: '₹2,400', d: '12 Feb', s: 'Processing' },
                                    ].map((o, i) => (
                                        <tr key={i}><td>{o.id}</td><td>{o.c}</td><td>{o.a}</td><td>{o.amt}</td><td>{o.d}</td><td><span className={`status-badge ${o.s === 'Delivered' ? 'status-delivered' : o.s === 'Shipped' ? 'status-active' : 'status-pending'}`}>{o.s}</span></td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {section === 'issues' && (
                    <div className="section-card">
                        <div className="section-card-title">⚠️ Issues & Reports</div>
                        {[{ title: 'Counterfeit product report', desc: 'Customer reported a possibly fake Pashmina shawl', severity: 'High', date: '18 Feb' },
                        { title: 'Delivery delay complaint', desc: 'Order #ORD-1015 delayed beyond expected date', severity: 'Medium', date: '16 Feb' },
                        { title: 'Payment mismatch', desc: 'Transaction #TXN-8819 shows amount discrepancy', severity: 'High', date: '15 Feb' },
                        ].map((issue, i) => (
                            <div key={i} style={{ border: '1px solid #F0E4D0', borderRadius: 10, padding: 18, marginBottom: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <strong>{issue.title}</strong>
                                    <span className={`status-badge ${issue.severity === 'High' ? 'status-rejected' : 'status-pending'}`}>{issue.severity}</span>
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--bark)', marginBottom: 8 }}>{issue.desc}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--bark)' }}>Reported: {issue.date} 2026</div>
                            </div>
                        ))}
                    </div>
                )}

                {section === 'consultant' && (
                    <div className="section-card">
                        <div className="section-card-title">🏛 Consultant Reviews</div>
                        <div className="table-scroll-wrapper">
                            <table className="data-table">
                                <thead><tr><th>Consultant</th><th>Products Reviewed</th><th>Approved</th><th>Rejected</th><th>Rating</th></tr></thead>
                                <tbody>
                                    <tr><td><strong>Dr. Priya Menon</strong></td><td>142</td><td>128</td><td>14</td><td>★ 4.8</td></tr>
                                    <tr><td><strong>Prof. Arvind Das</strong></td><td>98</td><td>91</td><td>7</td><td>★ 4.9</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {section === 'transactions' && (
                    <div className="section-card">
                        <div className="section-card-title">Recent Transactions
                            <button className="btn-secondary" style={{ fontSize: '0.68rem', padding: '6px 14px' }} onClick={() => showToast('📥 Export started')}>📥 Export</button>
                        </div>
                        <div className="table-scroll-wrapper">
                            <table className="data-table">
                                <thead><tr><th>Transaction ID</th><th>Artisan</th><th>Customer</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
                                <tbody>
                                    <tr><td>#TXN-8821</td><td>Savitri Bai</td><td>Ananya S.</td><td>₹2,400</td><td>18 Feb</td><td><span className="status-badge status-delivered">Completed</span></td></tr>
                                    <tr><td>#TXN-8820</td><td>Ramesh Dhokra</td><td>Raj P.</td><td>₹3,200</td><td>17 Feb</td><td><span className="status-badge status-active">Cleared</span></td></tr>
                                    <tr><td>#TXN-8819</td><td>Meera Warli</td><td>Priya M.</td><td>₹1,800</td><td>16 Feb</td><td><span className="status-badge status-pending">On Hold</span></td></tr>
                                </tbody>
                            </table>
                        </div>
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
