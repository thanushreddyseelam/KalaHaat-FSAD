import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Navbar.css';

export default function Navbar() {
    const { currentRole, currentUser, cartCount, signOut } = useApp();
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    const roleLabels = {
        customer: '🛍 Customer', artisan: '🎨 Artisan',
        admin: '⚙️ Admin', consultant: '🏛 Consultant'
    };

    const navItems = {
        guest: [
            { label: 'Home', to: '/' },
            { label: 'Shop', to: '/products' },
            { label: `🛒 Cart (${cartCount})`, to: '/cart' },
            { label: 'Sign In', to: '/login', cta: true },
        ],
        customer: [
            { label: 'Home', to: '/' },
            { label: 'Shop', to: '/products' },
            { label: `🛒 Cart (${cartCount})`, to: '/cart' },
            { label: 'My Orders', to: '/dashboard/customer' },
        ],
        artisan: [
            { label: 'Home', to: '/' },
            { label: 'My Dashboard', to: '/dashboard/artisan' },
            { label: 'Shop', to: '/products' },
        ],
        admin: [
            { label: 'Home', to: '/' },
            { label: 'Dashboard', to: '/dashboard/admin' },
            { label: 'Shop', to: '/products' },
        ],
        consultant: [
            { label: 'Home', to: '/' },
            { label: 'Review Queue', to: '/dashboard/consultant' },
            { label: 'Shop', to: '/products' },
        ],
    };

    const items = navItems[currentRole] || navItems.guest;

    return (
        <nav className="main-nav">
            <Link to="/" className="logo" onClick={() => setMobileOpen(false)}>Kala<span>Haat</span></Link>

            <button className="hamburger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
                {mobileOpen ? '✕' : '☰'}
            </button>

            <div className={`nav-links ${mobileOpen ? 'open' : ''}`}>
                {currentRole !== 'guest' && (
                    <div className="role-badge">{roleLabels[currentRole]}</div>
                )}
                {items.map((item, i) => (
                    <Link
                        key={i}
                        to={item.to}
                        className={`nav-btn ${item.cta ? 'nav-cta' : ''} ${location.pathname === item.to ? 'active-nav' : ''}`}
                        onClick={() => setMobileOpen(false)}
                    >
                        {item.label}
                    </Link>
                ))}
                {currentRole !== 'guest' && (
                    <button className="nav-cta" onClick={() => { signOut(); setMobileOpen(false); }}>Sign Out</button>
                )}
            </div>
        </nav>
    );
}
