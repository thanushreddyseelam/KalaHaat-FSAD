import { useState, useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import { allProducts } from '../data/products';
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
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedPrices, setSelectedPrices] = useState([]);
    const [selectedRegions, setSelectedRegions] = useState([]);
    const [sortBy, setSortBy] = useState('featured');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleFilter = (arr, setArr, value) => {
        setArr(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
    };

    const clearAll = () => {
        setSelectedCategories([]);
        setSelectedPrices([]);
        setSelectedRegions([]);
    };

    const hasFilters = selectedCategories.length > 0 || selectedPrices.length > 0 || selectedRegions.length > 0;

    const filteredAndSorted = useMemo(() => {
        let result = [...allProducts];

        // Category filter
        if (selectedCategories.length > 0) {
            result = result.filter(p => selectedCategories.includes(p.category));
        }

        // Price filter
        if (selectedPrices.length > 0) {
            const ranges = selectedPrices.map(label => PRICE_RANGES.find(r => r.label === label)).filter(Boolean);
            result = result.filter(p => ranges.some(r => p.price >= r.min && p.price < r.max));
        }

        // Region filter
        if (selectedRegions.length > 0) {
            result = result.filter(p => selectedRegions.some(region => p.origin.includes(region)));
        }

        // Sort
        result.sort((a, b) => {
            if (sortBy === 'price-low') return a.price - b.price;
            if (sortBy === 'price-high') return b.price - a.price;
            if (sortBy === 'rating') return b.rating - a.rating;
            return 0;
        });

        return result;
    }, [selectedCategories, selectedPrices, selectedRegions, sortBy]);

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
                        <div className="products-grid-listing">
                            {filteredAndSorted.map(p => <ProductCard key={p.id} product={p} />)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
