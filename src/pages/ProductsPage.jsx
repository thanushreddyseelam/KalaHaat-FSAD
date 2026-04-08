import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import { productsAPI } from '../services/api';
import './ProductsPage.css';

const CATEGORIES = ['Pottery & Ceramics', 'Folk Paintings', 'Textiles & Sarees', 'Tribal Jewellery', 'Wooden Crafts', 'Bamboo & Cane'];
const PRICE_RANGES = [
    { label: 'Under ₹500', min: 0, max: 500 },
    { label: '₹500 – ₹2,000', min: 500, max: 2000 },
    { label: '₹2,000 – ₹5,000', min: 2000, max: 5000 },
    { label: 'Above ₹5,000', min: 5000, max: Infinity },
];
const REGIONS = ['Chhattisgarh', 'Andhra Pradesh', 'Maharashtra', 'Odisha', 'Madhya Pradesh'];

export default function ProductsPage() {
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedPrices, setSelectedPrices] = useState([]);
    const [selectedRegions, setSelectedRegions] = useState([]);
    const [sortBy, setSortBy] = useState('featured');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // Search & Pagination states
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 12;

    // Debounce search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1); // reset to page 1 on search
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Reset pagination on filter change
    useEffect(() => {
        setPage(1);
    }, [selectedCategories, selectedPrices, selectedRegions, sortBy]);

    useEffect(() => {
        productsAPI.getAllProducts().then(res => {
            setAllProducts(res.data);
        }).catch(err => {
            console.error('Failed to fetch products:', err);
        }).finally(() => setLoading(false));
    }, []);

    const toggleFilter = (arr, setArr, value) => {
        setArr(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
    };

    const clearAll = () => {
        setSelectedCategories([]);
        setSelectedPrices([]);
        setSelectedRegions([]);
        setSearchTerm('');
        setPage(1);
    };

    const hasFilters = selectedCategories.length > 0 || selectedPrices.length > 0 || selectedRegions.length > 0 || debouncedSearch !== '';

    const filteredAndSorted = useMemo(() => {
        let result = [...allProducts];

        // Search filter
        if (debouncedSearch) {
            const query = debouncedSearch.toLowerCase();
            result = result.filter(p => 
                (p.name || '').toLowerCase().includes(query) || 
                (p.description || '').toLowerCase().includes(query) ||
                (p.category || '').toLowerCase().includes(query)
            );
        }

        // Category filter
        if (selectedCategories.length > 0) {
            result = result.filter(p => selectedCategories.includes(p.category));
        }

        // Price filter
        if (selectedPrices.length > 0) {
            const ranges = selectedPrices.map(label => PRICE_RANGES.find(r => r.label === label)).filter(Boolean);
            result = result.filter(p => ranges.some(r => Number(p.price) >= r.min && Number(p.price) < r.max));
        }

        // Region filter
        if (selectedRegions.length > 0) {
            result = result.filter(p => selectedRegions.some(region => {
                const r = region.toLowerCase();
                const o = (p.origin || '').toLowerCase();
                if (r === 'madhya pradesh' && (o.includes('mp') || o.includes('madhya pradesh'))) return true;
                if (r === 'andhra pradesh' && (o.includes('ap') || o.includes('andhra pradesh'))) return true;
                return o.includes(r);
            }));
        }

        // Sort
        result.sort((a, b) => {
            if (sortBy === 'price-low') return Number(a.price) - Number(b.price);
            if (sortBy === 'price-high') return Number(b.price) - Number(a.price);
            if (sortBy === 'rating') return Number(b.rating) - Number(a.rating);
            return 0;
        });

        return result;
    }, [allProducts, selectedCategories, selectedPrices, selectedRegions, sortBy, debouncedSearch]);

    const paginatedList = filteredAndSorted.slice(0, page * ITEMS_PER_PAGE);

    if (loading) {
        return (
            <div>
                <div className="page-header">
                    <h1>Handcrafted Marketplace</h1>
                    <p>Discover authentic tribal crafts from across India</p>
                </div>
                <div className="products-layout">
                    <div style={{ width: '260px' }}></div>
                    <div className="products-main">
                        <div className="products-grid-listing">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    return (
        <div>
            <div className="page-header">
                <h1>Handcrafted Marketplace</h1>
                <p>Discover authentic tribal crafts from across India</p>
            </div>
            <div className="products-layout">
                <button className="filter-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    🎛 {sidebarOpen ? 'Close Filters' : 'Show Filters'}
                </button>
                <aside className={`filter-sidebar ${sidebarOpen ? 'open' : ''}`}>
                    <div className="filter-header">
                        <div className="filter-title">🎛 Filters</div>
                        {hasFilters && (
                            <button className="clear-filters-btn" onClick={clearAll}>
                                ✕ Clear All
                            </button>
                        )}
                    </div>
                    
                    <div className="filter-group">
                        <div className="filter-group-title">Search</div>
                        <input 
                            type="text" 
                            placeholder="Search products..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                    </div>

                    <div className="filter-group">
                        <div className="filter-group-title">Category</div>
                        {CATEGORIES.map(cat => (
                            <label className="filter-option" key={cat}>
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(cat)}
                                    onChange={() => toggleFilter(selectedCategories, setSelectedCategories, cat)}
                                />
                                {cat}
                            </label>
                        ))}
                    </div>
                    <div className="filter-group">
                        <div className="filter-group-title">Price Range</div>
                        {PRICE_RANGES.map(p => (
                            <label className="filter-option" key={p.label}>
                                <input
                                    type="checkbox"
                                    checked={selectedPrices.includes(p.label)}
                                    onChange={() => toggleFilter(selectedPrices, setSelectedPrices, p.label)}
                                />
                                {p.label}
                            </label>
                        ))}
                    </div>
                    <div className="filter-group">
                        <div className="filter-group-title">State / Region</div>
                        {REGIONS.map(r => (
                            <label className="filter-option" key={r}>
                                <input
                                    type="checkbox"
                                    checked={selectedRegions.includes(r)}
                                    onChange={() => toggleFilter(selectedRegions, setSelectedRegions, r)}
                                />
                                {r}
                            </label>
                        ))}
                    </div>
                </aside>
                <div className="products-main">
                    <div className="products-toolbar">
                        <span className="products-count">
                            Showing {filteredAndSorted.length} of {allProducts.length} products
                            {hasFilters && <span className="filter-active-badge">{selectedCategories.length + selectedPrices.length + selectedRegions.length} filters active</span>}
                        </span>
                        <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                            <option value="featured">Sort: Featured</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="rating">Top Rated</option>
                        </select>
                    </div>
                    {filteredAndSorted.length === 0 ? (
                        <div className="no-results">
                            <div style={{ fontSize: '4rem', marginBottom: 16 }}>🔍</div>
                            <h3>No products found</h3>
                            <p>Try adjusting your filters to find what you're looking for.</p>
                            <button className="btn-secondary" onClick={clearAll} style={{ marginTop: 16 }}>Clear All Filters</button>
                        </div>
                    ) : (
                        <div>
                            <motion.div 
                                className="products-grid-listing"
                                variants={containerVariants}
                                initial="hidden"
                                animate="show"
                            >
                                {paginatedList.map(p => (
                                    <motion.div key={p.id || p._id} variants={itemVariants}>
                                        <ProductCard product={p} />
                                    </motion.div>
                                ))}
                            </motion.div>
                            {filteredAndSorted.length > paginatedList.length && (
                                <div style={{ textAlign: 'center', marginTop: 40, marginBottom: 20 }}>
                                    <button 
                                        className="btn-secondary" 
                                        onClick={() => setPage(p => p + 1)}
                                        style={{ padding: '12px 30px', fontSize: '1rem' }}
                                    >
                                        Load More Products ⬇️
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
