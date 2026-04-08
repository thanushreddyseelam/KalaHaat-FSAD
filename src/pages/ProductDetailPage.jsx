import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { productsAPI, reviewsAPI } from '../services/api';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
    const { id } = useParams();
    const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useApp();
    const [qty, setQty] = useState(1);
    const [imgError, setImgError] = useState(false);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [productReviews, setProductReviews] = useState([]);

    useEffect(() => {
        setLoading(true);
        productsAPI.getProductById(id).then(res => {
            setProduct(res.data);
        }).catch(err => {
            console.error('Failed to fetch product:', err);
        }).finally(() => setLoading(false));

        // Fetch real reviews from backend
        reviewsAPI.getProductReviews(id).then(res => {
            setProductReviews(res.data);
        }).catch(() => {
            setProductReviews([]);
        });
    }, [id]);

    const productId = product?._id || product?.id;
    const wishlisted = isInWishlist(productId);

    // Stable review count based on actual reviews
    const reviewCount = productReviews.length;

    if (loading || !product) {
        return (
            <div>
                <div className="breadcrumb">
                    <Link to="/">Home</Link> › <Link to="/products">Shop</Link> › Loading...
                </div>
                <div style={{ textAlign: 'center', padding: '80px 20px', fontSize: '1.1rem', color: 'var(--bark)' }}>
                    Loading product details...
                </div>
            </div>
        );
    }

    // Generate avatar color from user name
    const avatarColor = (name) => {
        const colors = ['var(--terracotta)', 'var(--moss)', '#6B5B95', '#D64161', '#FF7B25'];
        const hash = name.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    return (
        <div>
            <div className="breadcrumb">
                <Link to="/">Home</Link> › <Link to="/products">Shop</Link> › {product.category} › {product.name}
            </div>
            <div className="detail-layout">
                <div>
                    <div className="detail-image" style={{ background: product.bg }}>
                        {product.image && !imgError ? (
                            <img
                                src={product.image}
                                alt={product.name}
                                className="detail-image-photo"
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            product.emoji
                        )}
                        <div className="detail-verified">✓ Consultant Verified</div>
                    </div>
                    <div className="detail-thumbs">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`detail-thumb ${i === 1 ? 'active' : ''}`}>
                                {product.image ? (
                                    <img src={product.image} alt={`${product.name} view ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }} />
                                ) : (
                                    product.emoji
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <div className="detail-category">{product.category}</div>
                    <h1 className="detail-title">{product.name}</h1>
                    <div className="detail-artisan">By <strong>{product.artisan}</strong> · {product.origin}</div>
                    <div className="detail-stars">{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))} <span>({reviewCount} review{reviewCount !== 1 ? 's' : ''})</span></div>
                    <div className="detail-price">₹{Number(product.price).toLocaleString('en-IN')}</div>
                    <p className="detail-desc">{product.description || product.desc}</p>
                    <div className="detail-meta">
                        <div className="detail-meta-item"><div className="label">Material</div><div className="value">{product.material}</div></div>
                        <div className="detail-meta-item"><div className="label">Dimensions</div><div className="value">{product.dimensions}</div></div>
                        <div className="detail-meta-item"><div className="label">Origin</div><div className="value">{product.origin}</div></div>
                        <div className="detail-meta-item"><div className="label">Tribe</div><div className="value">{product.tribe}</div></div>
                    </div>
                    <div className="detail-actions">
                        <div className="qty-control">
                            <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                            <input className="qty-num" value={qty} readOnly />
                            <button className="qty-btn" onClick={() => setQty(Math.min(10, qty + 1))}>+</button>
                        </div>
                        <button className="btn-primary" onClick={() => addToCart(product, qty)}>🛒 Add to Cart</button>
                        <button
                            className="btn-secondary"
                            style={wishlisted ? { background: '#FDF0E8' } : {}}
                            onClick={() => wishlisted ? removeFromWishlist(productId) : addToWishlist(product)}
                        >
                            {wishlisted ? '❤ Wishlisted' : '♡ Wishlist'}
                        </button>
                    </div>
                    <div className="detail-badges">
                        <div className="detail-badge-item"><span>🚚</span><span>Free Shipping</span></div>
                        <div className="detail-badge-item"><span>🔒</span><span>Secure Payment</span></div>
                        <div className="detail-badge-item"><span>✅</span><span>Authenticity Cert</span></div>
                    </div>
                </div>
            </div>
            <div className="reviews-section">
                <div className="section-title" style={{ marginBottom: 8 }}>Customer Reviews</div>
                <div className="section-sub">What buyers are saying</div>
                <div className="reviews-list">
                    {productReviews.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--bark)', fontSize: '1rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: 12 }}>📝</div>
                            <p>No reviews yet. Be the first to review this product!</p>
                        </div>
                    ) : (
                        productReviews.map((r, i) => (
                            <div className="review-card" key={r._id || i}>
                                <div className="review-header">
                                    <div className="review-avatar" style={{ background: avatarColor(r.user?.name || 'User') }}>
                                        {(r.user?.name || 'U')[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="review-name">{r.user?.name || 'Anonymous'}</div>
                                        <div className="review-date">{new Date(r.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</div>
                                    </div>
                                    <div className="review-stars" style={{ marginLeft: 'auto' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                                </div>
                                {(r.comment || r.text) && <div className="review-text">{r.comment || r.text}</div>}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
