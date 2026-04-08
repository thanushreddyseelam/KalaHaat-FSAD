import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useState } from 'react';
import QuickViewModal from './QuickViewModal';

export default function ProductCard({ product }) {
    const { addToCart, showToast } = useApp();
    const navigate = useNavigate();
    const [imgError, setImgError] = useState(false);
    const [quickView, setQuickView] = useState(false);

    const handleAdd = (e) => {
        e.stopPropagation();
        addToCart(product);
        showToast(`✨ Added ${product.name} to cart`);
    };

    const handleQuickView = (e) => {
        e.stopPropagation();
        setQuickView(true);
    };

    return (
        <>
            <div className="product-card" onClick={() => navigate(`/product/${product._id || product.id}`)}>
                <div className="product-img" style={{ background: product.bg || 'var(--cream)', height: 230 }}>
                    {product.image && !imgError ? (
                        <img
                            src={product.image}
                            alt={product.name}
                            className="product-img-photo"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <span className="product-img-emoji">{product.emoji || '🏺'}</span>
                    )}
                    {product.badge && <span className="product-badge">{product.badge}</span>}
                    
                    <button className="quick-view-btn" onClick={handleQuickView}>
                        🔍 Quick View
                    </button>
                </div>
                <div className="product-info">
                    <div className="product-name">{product.name}</div>
                    <div className="product-origin">{product.origin}</div>
                    <div className="product-footer">
                        <span className="product-price">₹{Number(product.price).toLocaleString('en-IN')}</span>
                        <span className="product-rating">★ {product.rating}</span>
                    </div>
                    <button className="add-cart-btn" onClick={handleAdd}>
                        + Add to Cart
                    </button>
                </div>
            </div>

            <QuickViewModal 
                product={product} 
                isOpen={quickView} 
                onClose={() => setQuickView(false)} 
            />
        </>
    );
}
