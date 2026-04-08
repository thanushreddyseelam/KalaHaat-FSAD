import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { consultantAPI, authAPI } from '../services/api';

export default function ConsultantDashboard() {
    const { currentUser, signOut, showToast } = useApp();
    const navigate = useNavigate();
    const [section, setSection] = useState('pending');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Data states
    const [pendingItems, setPendingItems] = useState([]);
    const [approvedItems, setApprovedItems] = useState([]);
    const [rejectedItems, setRejectedItems] = useState([]);
    const [stats, setStats] = useState({ pendingCount: 0, approvedCount: 0, rejectedCount: 0 });
    const [notes, setNotes] = useState({});

    // Profile form
    const [profileForm, setProfileForm] = useState({ name: '', specialization: '', qualifications: '' });

    const firstName = currentUser?.name?.split(' ')[0] || 'Consultant';
    const initial = (currentUser?.name || 'C').charAt(0).toUpperCase();
    const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

    const menuItems = [
        { key: 'pending', icon: '🔍', label: 'Pending Reviews' },
        { key: 'approved', icon: '✅', label: 'Approved Items' },
        { key: 'rejected', icon: '❌', label: 'Rejected Items' },
        { key: 'profile', icon: '⚙️', label: 'Profile' },
    ];

    const fetchPending = useCallback(async () => {
        try {
            const res = await consultantAPI.getPending();
            setPendingItems(res.data);
        } catch (err) { console.error('Fetch pending error:', err); }
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            const res = await consultantAPI.getStats();
            setStats(res.data);
        } catch (err) { console.error('Fetch stats error:', err); }
    }, []);

    const fetchHistory = useCallback(async (status) => {
        try {
            const res = await consultantAPI.getHistory(status);
            if (status === 'approved') setApprovedItems(res.data);
            else setRejectedItems(res.data);
        } catch (err) { console.error('Fetch history error:', err); }
    }, []);

    useEffect(() => {
        fetchPending();
        fetchStats();
        fetchHistory('approved');
        fetchHistory('rejected');
    }, [fetchPending, fetchStats, fetchHistory]);

    useEffect(() => {
        if (currentUser) {
            setProfileForm({
                name: currentUser.name || '',
                specialization: currentUser.specialization || '',
                qualifications: currentUser.qualifications || '',
            });
        }
    }, [currentUser]);

    const handleVerify = async (id, name, status) => {
        setLoading(true);
        try {
            await consultantAPI.verify(id, { status, notes: notes[id] || '' });
            showToast(status === 'approved' ? `✅ "${name}" verified and approved!` : `❌ "${name}" has been rejected.`);
            fetchPending();
            fetchStats();
            fetchHistory(status);
        } catch (err) {
            showToast('❌ Failed to update product');
            console.error(err);
        }
        setLoading(false);
    };

    const saveProfile = async () => {
        setLoading(true);
        try {
            await authAPI.updateMe(profileForm);
            showToast('✅ Profile updated!');
        } catch (err) { showToast('❌ Failed to update profile'); }
        setLoading(false);
    };

    return (
        <div className="dashboard-layout">
            <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)} />
            <aside className={`sidebar sidebar-consultant ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-profile">
                    <div className="sidebar-avatar">{initial}</div>
                    <div className="sidebar-name">{currentUser?.name || 'Consultant'}</div>
                    <div className="sidebar-role">Cultural Consultant</div>
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
                <div className="dashboard-greeting">Hello, {firstName} 👋</div>
                <div className="dashboard-date">Authenticity Review Queue · {dateStr}</div>

                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    <div className="stat-card"><div className="stat-number" style={{ color: 'var(--ochre)' }}>{stats.pendingCount}</div><div className="stat-label">Pending Reviews</div></div>
                    <div className="stat-card" style={{ borderLeftColor: 'var(--moss)' }}><div className="stat-number" style={{ color: 'var(--moss)' }}>{stats.approvedCount}</div><div className="stat-label">Approved by You</div></div>
                    <div className="stat-card" style={{ borderLeftColor: '#dc3545' }}><div className="stat-number" style={{ color: '#dc3545' }}>{stats.rejectedCount}</div><div className="stat-label">Rejected (Inauthentic)</div></div>
                </div>

                {section === 'pending' && (
                    <div className="section-card">
                        <div className="section-card-title">Products Pending Verification</div>
                        {pendingItems.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 40, color: 'var(--bark)' }}>
                                <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
                                <p>All items have been reviewed! Check back later for new submissions.</p>
                            </div>
                        ) : (
                            pendingItems.map(item => (
                                <div key={item.id || item._id} style={{ border: '1px solid #F0E4D0', borderRadius: 10, padding: 24, marginBottom: 16 }}>
                                    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                        <div style={{ width: 100, height: 100, background: 'var(--cream)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', flexShrink: 0 }}>{item.emoji || '🏺'}</div>
                                        <div style={{ flex: 1, minWidth: 200 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                                                <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.1rem' }}>{item.name}</div>
                                                <span className="status-badge status-pending">Pending</span>
                                            </div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--bark)' }}>
                                                Artisan: <strong>{item.artisanUser?.name || item.artisan || 'Unknown'}</strong> · {item.tribe || 'N/A'} · ₹{item.price?.toLocaleString('en-IN')}
                                            </div>
                                            <div style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--bark)', marginTop: 10 }}>{item.description || 'No description provided.'}</div>
                                            <div className="form-group" style={{ marginTop: 16 }}>
                                                <label>Consultant Notes</label>
                                                <textarea
                                                    placeholder="Add verification notes, cultural accuracy assessment..."
                                                    style={{ height: 80 }}
                                                    value={notes[item.id || item._id] || ''}
                                                    onChange={e => setNotes(prev => ({ ...prev, [item.id || item._id]: e.target.value }))}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                                <button className="btn-primary" onClick={() => handleVerify(item.id || item._id, item.name, 'approved')} disabled={loading}>✅ Approve & Certify</button>
                                                <button style={{ background: '#dc3545', color: 'white', border: 'none', padding: '14px 24px', borderRadius: 4, fontFamily: "'Space Mono', monospace", fontSize: '0.75rem', letterSpacing: 1, cursor: 'pointer' }} onClick={() => handleVerify(item.id || item._id, item.name, 'rejected')} disabled={loading}>❌ Reject</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {section === 'approved' && (
                    <div className="section-card">
                        <div className="section-card-title">✅ Approved Items</div>
                        {approvedItems.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 30, color: 'var(--bark)' }}>No approved items yet</div>
                        ) : (
                            approvedItems.map(item => (
                                <div key={item.id || item._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #F0E4D0', alignItems: 'center' }}>
                                    <div><strong>{item.name}</strong><div style={{ fontSize: '0.85rem', color: 'var(--bark)' }}>by {item.artisanUser?.name || item.artisan || 'Unknown'}</div></div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--bark)' }}>₹{item.price?.toLocaleString('en-IN')}</div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {section === 'rejected' && (
                    <div className="section-card">
                        <div className="section-card-title">❌ Rejected Items</div>
                        {rejectedItems.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 30, color: 'var(--bark)' }}>No rejected items yet</div>
                        ) : (
                            rejectedItems.map(item => (
                                <div key={item.id || item._id} style={{ border: '1px solid #F8D7DA', borderRadius: 10, padding: 16, marginBottom: 12, background: '#FFF5F5' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><strong>{item.name}</strong><span style={{ fontSize: '0.8rem', color: 'var(--bark)' }}>₹{item.price?.toLocaleString('en-IN')}</span></div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--bark)' }}>by {item.artisanUser?.name || item.artisan || 'Unknown'}</div>
                                    {item.verificationNotes && <div style={{ fontSize: '0.88rem', color: '#dc3545', marginTop: 6 }}>Notes: {item.verificationNotes}</div>}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {section === 'profile' && (
                    <div className="section-card">
                        <div className="section-card-title">⚙️ Consultant Profile</div>
                        <div style={{ maxWidth: 500 }}>
                            <div className="form-group"><label>Full Name</label><input value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} /></div>
                            <div className="form-group"><label>Email</label><input defaultValue={currentUser?.email || ''} disabled style={{ opacity: 0.6 }} /></div>
                            <div className="form-group"><label>Specialization</label><input value={profileForm.specialization} onChange={e => setProfileForm({ ...profileForm, specialization: e.target.value })} placeholder="e.g. Tribal Art, Textile Heritage" /></div>
                            <div className="form-group"><label>Qualifications</label><textarea value={profileForm.qualifications} onChange={e => setProfileForm({ ...profileForm, qualifications: e.target.value })} placeholder="Your academic background and expertise..." /></div>
                            <button className="btn-primary" onClick={saveProfile} disabled={loading}>{loading ? '⏳ Saving...' : 'Save Profile'}</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
