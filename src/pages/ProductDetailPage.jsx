import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { allProducts, reviews } from '../data/products';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
    const { id } = useParams();
    const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useApp();
    const [qty, setQty] = useState(1);
    const [imgError, setImgError] = useState(false);
    const product = allProducts.find(p => p.id === parseInt(id)) || allProducts[0];
    const wishlisted = isInWishlist(product.id);

    // Stable review count based on product id
    const reviewCount = useMemo(() => 30 + ((product.id * 17) % 100), [product.id]);

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
                    <div className="detail-stars">★★★★★ <span>({reviewCount} reviews)</span></div>
                    <div className="detail-price">₹{product.price.toLocaleString('en-IN')}</div>
                    <p className="detail-desc">{product.desc}</p>
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
                            onClick={() => wishlisted ? removeFromWishlist(product.id) : addToWishlist(product)}
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
                    {reviews.map((r, i) => (
                        <div className="review-card" key={i}>
                            <div className="review-header">
                                <div className="review-avatar" style={{ background: r.color }}>{r.initial}</div>
                                <div><div className="review-name">{r.name}</div><div className="review-date">{r.date}</div></div>
                                <div className="review-stars" style={{ marginLeft: 'auto' }}>{'★'.repeat(r.stars)}</div>
                            </div>
                            <div className="review-text">{r.text}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
