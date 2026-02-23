import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function ConsultantDashboard() {
    const { currentUser, signOut, showToast } = useApp();
    const navigate = useNavigate();
    const [section, setSection] = useState('pending');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [reviewStatuses, setReviewStatuses] = useState({});

    const firstName = currentUser?.name?.split(' ')[0] || 'Consultant';
    const initial = (currentUser?.name || 'C').charAt(0).toUpperCase();
    const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

    const menuItems = [
        { key: 'pending', icon: '🔍', label: 'Pending Reviews' },
        { key: 'approved', icon: '✅', label: 'Approved Items' },
        { key: 'rejected', icon: '❌', label: 'Rejected Items' },
        { key: 'encyclopedia', icon: '📚', label: 'Craft Encyclopedia' },
        { key: 'heritage', icon: '🌍', label: 'Heritage Reports' },
        { key: 'profile', icon: '⚙️', label: 'Profile' },
    ];

    const pendingItems = [
        { id: 1, name: 'Madhubani Painting Set', artisan: 'Gita Devi', region: 'Bihar', date: '18 Feb 2026', emoji: '🏺', desc: 'Traditional Madhubani painting depicting village life, painted on handmade paper using natural colours from turmeric, indigo, and flowers.' },
        { id: 2, name: 'Pashmina Shawl', artisan: 'Bashir Ahmed', region: 'Kashmir', date: '17 Feb 2026', emoji: '🪡', desc: 'Handwoven pure Pashmina shawl with traditional Kashmiri Sozni embroidery. Claims to be from the Chakdar community weavers.' },
    ];

    const approve = (id, name) => { setReviewStatuses(prev => ({ ...prev, [id]: 'approved' })); showToast(`✅ "${name}" verified and approved!`); };
    const reject = (id, name) => { setReviewStatuses(prev => ({ ...prev, [id]: 'rejected' })); showToast(`❌ "${name}" has been rejected.`); };

    return (
        <div className="dashboard-layout">
            <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)} />
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-profile">
                    <div className="sidebar-avatar" style={{ background: 'var(--moss)' }}>{initial}</div>
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
                    <div className="stat-card"><div className="stat-number" style={{ color: 'var(--ochre)' }}>28</div><div className="stat-label">Pending Reviews</div></div>
                    <div className="stat-card" style={{ borderLeftColor: 'var(--moss)' }}><div className="stat-number" style={{ color: 'var(--moss)' }}>342</div><div className="stat-label">Approved This Month</div></div>
                    <div className="stat-card" style={{ borderLeftColor: '#dc3545' }}><div className="stat-number" style={{ color: '#dc3545' }}>12</div><div className="stat-label">Rejected (Inauthentic)</div></div>
                </div>

                {section === 'pending' && (
                    <div className="section-card">
                        <div className="section-card-title">Products Pending Verification</div>
                        {pendingItems.filter(item => !reviewStatuses[item.id]).map(item => (
                            <div key={item.id} style={{ border: '1px solid #F0E4D0', borderRadius: 10, padding: 24, marginBottom: 16 }}>
                                <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                    <div style={{ width: 100, height: 100, background: 'var(--cream)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', flexShrink: 0 }}>{item.emoji}</div>
                                    <div style={{ flex: 1, minWidth: 200 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                                            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.1rem' }}>{item.name}</div>
                                            <span className="status-badge status-pending">Pending</span>
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--bark)' }}>Artisan: <strong>{item.artisan}</strong> · {item.region} · Uploaded: {item.date}</div>
                                        <div style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--bark)', marginTop: 10 }}>{item.desc}</div>
                                        <div className="form-group" style={{ marginTop: 16 }}><label>Consultant Notes</label><textarea placeholder="Add verification notes, cultural accuracy assessment..." style={{ height: 80 }} /></div>
                                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                            <button className="btn-primary" onClick={() => approve(item.id, item.name)}>✅ Approve & Certify</button>
                                            <button style={{ background: '#dc3545', color: 'white', border: 'none', padding: '14px 24px', borderRadius: 4, fontFamily: "'Space Mono', monospace", fontSize: '0.75rem', letterSpacing: 1, cursor: 'pointer' }} onClick={() => reject(item.id, item.name)}>❌ Reject</button>
                                            <button className="btn-secondary" onClick={() => showToast(`💬 Message sent to ${item.artisan}`)}>💬 Request Info</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {pendingItems.filter(item => !reviewStatuses[item.id]).length === 0 && (
                            <div style={{ textAlign: 'center', padding: 40, color: 'var(--bark)' }}>
                                <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
                                <p>All items have been reviewed! Check back later for new submissions.</p>
                            </div>
                        )}
                    </div>
                )}

                {section === 'approved' && (
                    <div className="section-card">
                        <div className="section-card-title">✅ Approved Items</div>
                        {[{ name: 'Dhokra Bronze Idol', artisan: 'Ramesh Dhokra', date: '10 Feb 2026' },
                        { name: 'Warli Folk Painting', artisan: 'Meera Warli', date: '8 Feb 2026' },
                        { name: 'Ikat Silk Saree', artisan: 'Tribal Coop', date: '5 Feb 2026' },
                        ...pendingItems.filter(i => reviewStatuses[i.id] === 'approved').map(i => ({ name: i.name, artisan: i.artisan, date: 'Today' }))
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #F0E4D0', alignItems: 'center' }}>
                                <div><strong>{item.name}</strong><div style={{ fontSize: '0.85rem', color: 'var(--bark)' }}>by {item.artisan}</div></div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--bark)' }}>{item.date}</div>
                            </div>
                        ))}
                    </div>
                )}

                {section === 'rejected' && (
                    <div className="section-card">
                        <div className="section-card-title">❌ Rejected Items</div>
                        {[{ name: 'Machine-made "Tribal" Rug', artisan: 'Unknown Seller', reason: 'Not handmade – machine produce identified', date: '14 Feb' },
                        { name: 'Fake Dokra Necklace', artisan: 'Rajesh K.', reason: 'Material mismatch – claimed brass but is alloy', date: '10 Feb' },
                        ...pendingItems.filter(i => reviewStatuses[i.id] === 'rejected').map(i => ({ name: i.name, artisan: i.artisan, reason: 'Failed authenticity review', date: 'Today' }))
                        ].map((item, i) => (
                            <div key={i} style={{ border: '1px solid #F8D7DA', borderRadius: 10, padding: 16, marginBottom: 12, background: '#FFF5F5' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><strong>{item.name}</strong><span style={{ fontSize: '0.8rem', color: 'var(--bark)' }}>{item.date}</span></div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--bark)' }}>by {item.artisan}</div>
                                <div style={{ fontSize: '0.88rem', color: '#dc3545', marginTop: 6 }}>Reason: {item.reason}</div>
                            </div>
                        ))}
                    </div>
                )}

                {section === 'encyclopedia' && (
                    <div className="section-card">
                        <div className="section-card-title">📚 Craft Encyclopedia</div>
                        {[{ craft: 'Dhokra Metal Casting', origin: 'Chhattisgarh, West Bengal', age: '4,000+ years', desc: 'Lost-wax casting technique using clay molds, beeswax, and bronze.' },
                        { craft: 'Warli Art', origin: 'Maharashtra', age: '2,500+ years', desc: 'Geometric patterns using rice paste, depicting daily life and nature.' },
                        { craft: 'Madhubani Painting', origin: 'Bihar', age: '2,500+ years', desc: 'Intricate paintings on handmade paper using natural dyes and geometric patterns.' },
                        { craft: 'Ikat Weaving', origin: 'Odisha, Andhra Pradesh', age: '1,000+ years', desc: 'Tie-dye resist technique where threads are dyed before weaving.' },
                        ].map((e, i) => (
                            <div key={i} style={{ border: '1px solid #F0E4D0', borderRadius: 10, padding: 20, marginBottom: 16 }}>
                                <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.1rem', marginBottom: 6 }}>{e.craft}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--bark)', marginBottom: 8 }}>Origin: {e.origin} · History: {e.age}</div>
                                <div style={{ fontSize: '0.95rem', color: 'var(--earth)', lineHeight: 1.6 }}>{e.desc}</div>
                            </div>
                        ))}
                    </div>
                )}

                {section === 'heritage' && (
                    <div className="section-card">
                        <div className="section-card-title">🌍 Heritage Reports</div>
                        {[{ title: 'Bastar Dhokra Traditions – Field Report', date: 'Feb 2026', status: 'Published', pages: 24 },
                        { title: 'Warli Art: Preservation Challenges', date: 'Jan 2026', status: 'Published', pages: 18 },
                        { title: 'Northeast Bamboo Craft Survey', date: 'Dec 2025', status: 'Draft', pages: 12 },
                        ].map((r, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #F0E4D0', flexWrap: 'wrap', gap: 8 }}>
                                <div><strong>{r.title}</strong><div style={{ fontSize: '0.82rem', color: 'var(--bark)' }}>{r.date} · {r.pages} pages</div></div>
                                <span className={`status-badge ${r.status === 'Published' ? 'status-active' : 'status-pending'}`}>{r.status}</span>
                            </div>
                        ))}
                    </div>
                )}

                {section === 'profile' && (
                    <div className="section-card">
                        <div className="section-card-title">⚙️ Consultant Profile</div>
                        <div style={{ maxWidth: 500 }}>
                            <div className="form-group"><label>Full Name</label><input defaultValue={currentUser?.name || ''} /></div>
                            <div className="form-group"><label>Email</label><input defaultValue={currentUser?.email || ''} /></div>
                            <div className="form-group"><label>Specialization</label><input placeholder="e.g. Tribal Art, Textile Heritage" /></div>
                            <div className="form-group"><label>Qualifications</label><textarea placeholder="Your academic background and expertise..." /></div>
                            <button className="btn-primary" onClick={() => showToast('✅ Profile updated!')}>Save Profile</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
