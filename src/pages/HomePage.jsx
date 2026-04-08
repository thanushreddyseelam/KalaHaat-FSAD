import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import { productsAPI } from '../services/api';
import { categories, artisans } from '../data/products';
import './HomePage.css';

export default function HomePage() {
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeNav, setActiveNav] = useState('');

    useEffect(() => {
        setLoading(true);
        setError('');
        productsAPI.getAllProducts().then(res => {
            setAllProducts(res.data);
        }).catch(err => {
            console.error('Failed to fetch products:', err);
            if (err.code === 'ERR_NETWORK' || !err.response) {
                setError('Unable to connect to server. Products will appear once the server is running.');
            } else {
                setError('Failed to load products. Please try again.');
            }
        }).finally(() => setLoading(false));
    }, []);

    const featured = allProducts.slice(0, 4);

    const heroProducts = allProducts.length >= 9 ? [
        { ...allProducts[0], displayPrice: `₹${Number(allProducts[0].price).toLocaleString('en-IN')}` },
        { ...allProducts[1], displayPrice: `₹${Number(allProducts[1].price).toLocaleString('en-IN')}` },
        { ...allProducts[8], displayPrice: `₹${Number(allProducts[8].price).toLocaleString('en-IN')}` },
        { ...allProducts[3], displayPrice: `₹${Number(allProducts[3].price).toLocaleString('en-IN')}` },
    ] : allProducts.slice(0, 4).map(p => ({ ...p, displayPrice: `₹${Number(p.price).toLocaleString('en-IN')}` }));

    const handleNavClick = (e, sectionId) => {
        e.preventDefault();
        setActiveNav(sectionId);
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // We are now using the globally imported SkeletonCard component

    return (
        <div id="page-home" className="page-fade-in">
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
                    {loading ? (
                        <div className="products-grid">
                            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
                        </div>
                    ) : heroProducts.length > 0 ? (
                        heroProducts.map((card, i) => (
                            <div className="hero-card" key={i} style={{ animationDelay: `${i * 0.15}s` }}>
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
                        ))
                    ) : (
                        // Empty fallback with visual cards
                        [
                            { emoji: '🏺', name: 'Dhokra Bronze Idol', price: '₹3,200', image: '/images/products/dhokra-bronze-idol.png' },
                            { emoji: '🎨', name: 'Warli Folk Painting', price: '₹2,400', image: '/images/products/warli-folk-painting.png' },
                            { emoji: '🪡', name: 'Ikat Silk Saree', price: '₹6,800', image: '/images/products/ikat-silk-saree.png' },
                            { emoji: '🪆', name: 'Kondapalli Toy', price: '₹850', image: '/images/products/kondapalli-wooden-toy.png' },
                        ].map((card, i) => (
                            <div className="hero-card" key={i} style={{ animationDelay: `${i * 0.15}s` }}>
                                <div className="hero-card-img">
                                    {card.image ? (
                                        <img src={card.image} alt={card.name} />
                                    ) : (
                                        <span className="hero-card-emoji">{card.emoji}</span>
                                    )}
                                </div>
                                <div className="hero-card-name">{card.name}</div>
                                <div className="hero-card-price">{card.price}</div>
                            </div>
                        ))
                    )}
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
                    <div key={i} className="stat-item" style={{ animationDelay: `${i * 0.1}s` }}>
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
                        <Link to="/products" className="category-item" key={i} style={{ animationDelay: `${i * 0.08}s` }}>
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
                {loading ? (
                    <div className="products-grid">
                        {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
                    </div>
                ) : error ? (
                    <div className="homepage-error">
                        <div style={{ fontSize: '3rem', marginBottom: 14 }}>🔌</div>
                        <p>{error}</p>
                        <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => window.location.reload()}>Retry</button>
                    </div>
                ) : featured.length === 0 ? (
                    <div className="homepage-error">
                        <div style={{ fontSize: '3rem', marginBottom: 14 }}>🏺</div>
                        <p>New products coming soon! Check back later.</p>
                        <Link to="/login" className="btn-primary" style={{ marginTop: 16, textDecoration: 'none' }}>Become an Artisan</Link>
                    </div>
                ) : (
                    <div className="products-grid">
                        {featured.map(p => <ProductCard key={p._id || p.id} product={p} />)}
                    </div>
                )}
                <div style={{ textAlign: 'center', marginTop: 48 }}>
                    <Link to="/products" className="btn-primary">View All Products</Link>
                </div>
            </section>

            {/* Why KalaHaat - NEW section */}
            <section className="why-section">
                <div className="section-title" style={{ textAlign: 'center' }}>Why KalaHaat?</div>
                <div className="section-sub" style={{ textAlign: 'center' }}>What makes us different from other marketplaces</div>
                <div className="why-grid">
                    <div className="why-card">
                        <div className="why-icon">🤝</div>
                        <h3>Direct to Artisan</h3>
                        <p>100% of your purchase goes directly to the tribal artisan who created it. No middlemen, no markups.</p>
                    </div>
                    <div className="why-card">
                        <div className="why-icon">✅</div>
                        <h3>Verified Authentic</h3>
                        <p>Every product is verified by our Cultural Consultants for authenticity and quality before listing.</p>
                    </div>
                    <div className="why-card">
                        <div className="why-icon">🌍</div>
                        <h3>Preserving Heritage</h3>
                        <p>Your purchase helps preserve centuries-old tribal art forms and supports indigenous communities.</p>
                    </div>
                    <div className="why-card">
                        <div className="why-icon">📦</div>
                        <h3>Secure & Safe</h3>
                        <p>Free shipping on orders above ₹1,000, secure checkout, and easy 7-day returns.</p>
                    </div>
                </div>
            </section>

            {/* Artisan Spotlight */}
            <section className="artisan-section" id="artisan-spotlight">
                <div className="section-title" style={{ color: 'var(--cream)' }}>Artisan Spotlight</div>
                <div className="section-sub" style={{ color: 'rgba(245,237,214,0.6)' }}>Real people, real craft, real stories</div>
                <div className="artisan-grid">
                    {artisans.map((a, i) => (
                        <div className="artisan-card" key={i} style={{ animationDelay: `${i * 0.12}s` }}>
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
