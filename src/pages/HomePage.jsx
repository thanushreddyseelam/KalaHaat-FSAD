import { useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { allProducts, categories, artisans } from '../data/products';
import './HomePage.css';

export default function HomePage() {
    const featured = allProducts.slice(0, 4);
    const [activeNav, setActiveNav] = useState('');

    const heroProducts = [
        { ...allProducts[0], displayPrice: '₹3,200' },
        { ...allProducts[1], displayPrice: '₹2,400' },
        { ...allProducts[8], displayPrice: '₹5,200' },
        { ...allProducts[3], displayPrice: '₹850' },
    ];

    const handleNavClick = (e, sectionId) => {
        e.preventDefault();
        setActiveNav(sectionId);
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div id="page-home">
            {/* Section Navigation Bar — at top, below main navbar */}
            <nav className="section-nav">
                <a href="#hero-section" className={activeNav === 'hero-section' ? 'active' : ''} onClick={e => handleNavClick(e, 'hero-section')}>
                    🏠 Home
                </a>
                <a href="#browse-craft" className={activeNav === 'browse-craft' ? 'active' : ''} onClick={e => handleNavClick(e, 'browse-craft')}>
                    🏺 Browse by Craft
                </a>
                <a href="#featured-products" className={activeNav === 'featured-products' ? 'active' : ''} onClick={e => handleNavClick(e, 'featured-products')}>
                    ⭐ Featured Products
                </a>
                <a href="#artisan-spotlight" className={activeNav === 'artisan-spotlight' ? 'active' : ''} onClick={e => handleNavClick(e, 'artisan-spotlight')}>
                    🎨 Artisan Spotlight
                </a>
                <Link to="/products" className="section-nav-shop">
                    🛍 Shop All →
                </Link>
            </nav>

            {/* Hero */}
            <section className="hero tribal-pattern" id="hero-section">
                <div className="hero-content">
                    <div className="hero-eyebrow">Authentic Tribal Craftsmanship</div>
                    <h1 className="hero-title">
                        Where Ancient<br /><em>Artistry</em> Meets<br />the World
                    </h1>
                    <p className="hero-desc">
                        Discover handcrafted treasures made by India's tribal artisans. Every purchase directly supports indigenous communities and preserves centuries-old traditions.
                    </p>
                    <div className="hero-btns">
                        <Link to="/products" className="btn-primary">Explore Crafts</Link>
                        <Link to="/login" className="btn-secondary" style={{ color: 'var(--cream)', borderColor: 'rgba(245,237,214,0.4)' }}>Become an Artisan</Link>
                    </div>
                </div>
                <div className="hero-visual">
                    {heroProducts.map((card, i) => (
                        <div className="hero-card" key={i}>
                            <div className="hero-card-img">
                                {card.image ? (
                                    <img src={card.image} alt={card.name} />
                                ) : (
                                    <span className="hero-card-emoji">{card.emoji}</span>
                                )}
                            </div>
                            <div className="hero-card-name">{card.name}</div>
                            <div className="hero-card-origin">{card.origin}</div>
                            <div className="hero-card-price">{card.displayPrice}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Stats */}
            <section className="stats-banner">
                {[
                    { num: '2,400+', label: 'Tribal Artisans' },
                    { num: '18,000+', label: 'Products Listed' },
                    { num: '56', label: 'Tribal Communities' },
                    { num: '38', label: 'Countries Reached' },
                ].map((s, i) => (
                    <div key={i} className="stat-item">
                        <div className="stat-num">{s.num}</div>
                        <div className="stat-lbl">{s.label}</div>
                    </div>
                ))}
            </section>

            {/* Categories */}
            <section className="categories-section" id="browse-craft">
                <div className="section-title">Browse by Craft</div>
                <div className="section-sub">Six centuries of tradition in your hands</div>
                <div className="categories-grid">
                    {categories.map((cat, i) => (
                        <Link to="/products" className="category-item" key={i}>
                            <div className="category-icon">{cat.icon}</div>
                            <div className="category-name">{cat.name}</div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Featured */}
            <section className="featured-section" id="featured-products">
                <div className="section-title">Featured Products</div>
                <div className="section-sub">Handpicked treasures from our Cultural Consultants</div>
                <div className="products-grid">
                    {featured.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
                <div style={{ textAlign: 'center', marginTop: 48 }}>
                    <Link to="/products" className="btn-primary">View All Products</Link>
                </div>
            </section>

            {/* Artisan Spotlight */}
            <section className="artisan-section" id="artisan-spotlight">
                <div className="section-title" style={{ color: 'var(--cream)' }}>Artisan Spotlight</div>
                <div className="section-sub" style={{ color: 'rgba(245,237,214,0.6)' }}>Real people, real craft, real stories</div>
                <div className="artisan-grid">
                    {artisans.map((a, i) => (
                        <div className="artisan-card" key={i}>
                            <div className="artisan-avatar">{a.avatar}</div>
                            <div className="artisan-name">{a.name}</div>
                            <div className="artisan-tribe">{a.tribe}</div>
                            <div className="artisan-desc">{a.desc}</div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
