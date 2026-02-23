import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useState } from 'react';

export default function ProductCard({ product }) {
    const { addToCart } = useApp();
    const navigate = useNavigate();
    const [imgError, setImgError] = useState(false);

    return (
        <div className="product-card" onClick={() => navigate(`/product/${product.id}`)}>
            <div className="product-img" style={{ background: product.bg, height: 200 }}>
                {product.image && !imgError ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        className="product-img-photo"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <span className="product-img-emoji">{product.emoji}</span>
                )}
                {product.badge && <span className="product-badge">{product.badge}</span>}
            </div>
            <div className="product-info">
                <div className="product-name">{product.name}</div>
                <div className="product-origin">{product.origin}</div>
                <div className="product-footer">
                    <span className="product-price">₹{product.price.toLocaleString('en-IN')}</span>
                    <span className="product-rating">★ {product.rating}</span>
                </div>
                <button className="add-cart-btn" onClick={(e) => { e.stopPropagation(); addToCart(product); }}>
                    + Add to Cart
                </button>
            </div>
        </div>
    );
}
