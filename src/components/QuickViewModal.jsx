import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import './QuickViewModal.css';

export default function QuickViewModal({ product, isOpen, onClose }) {
    const { addToCart, showToast } = useApp();
    const [adding, setAdding] = useState(false);

    if (!isOpen) return null;

    const handleAdd = async () => {
        setAdding(true);
        await addToCart(product);
        setAdding(false);
        showToast(`✨ Added ${product.name} to cart`);
        onClose();
    };

    const priceNum = Number(product.price);
    const displayPrice = `₹${priceNum.toLocaleString('en-IN')}`;

    return (
        <AnimatePresence>
            <motion.div 
                className="qvm-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div 
                    className="qvm-content"
                    initial={{ y: 50, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 20, opacity: 0, scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button className="qvm-close" onClick={onClose}>✕</button>
                    
                    <div className="qvm-grid">
                        <div className="qvm-img-col">
                            {product.image ? (
                                <img src={product.image} alt={product.name} className="qvm-image" />
                            ) : (
                                <div className="qvm-emoji-wrapper">
                                    <span className="qvm-emoji">{product.emoji || '🏺'}</span>
                                </div>
                            )}
                        </div>
                        <div className="qvm-info-col">
                            <span className="qvm-badge">{product.category}</span>
                            <h2 className="qvm-title">{product.name}</h2>
                            <p className="qvm-origin">By {product.origin}</p>
                            
                            <div className="qvm-price">
                                <span>{displayPrice}</span>
                                {product.rating && <span className="qvm-rating">★ {product.rating}</span>}
                            </div>
                            
                            <p className="qvm-desc">
                                {product.description || "A gorgeous handcrafted piece made using traditional tribal techniques passed down through generations."}
                            </p>
                            
                            <div className="qvm-actions">
                                <button 
                                    className="btn-primary qvm-add-btn" 
                                    onClick={handleAdd}
                                    disabled={adding}
                                >
                                    {adding ? '⏳ Adding...' : '🛍 Add to Cart'}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
