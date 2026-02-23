import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer>
            <div className="footer-grid">
                <div className="footer-brand">
                    <Link to="/" className="logo" style={{ textDecoration: 'none' }}>Kala<span>Haat</span></Link>
                    <p className="footer-desc">India's premier marketplace for authentic tribal handicrafts. Every purchase directly supports indigenous artisan communities.</p>
                </div>
                <div>
                    <div className="footer-heading">Quick Links</div>
                    <ul className="footer-links">
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/products">Shop All</Link></li>
                        <li><Link to="/cart">Cart</Link></li>
                        <li><Link to="/login">Sign In</Link></li>
                    </ul>
                </div>
                <div>
                    <div className="footer-heading">Categories</div>
                    <ul className="footer-links">
                        <li><Link to="/products">Pottery & Ceramics</Link></li>
                        <li><Link to="/products">Folk Paintings</Link></li>
                        <li><Link to="/products">Textiles & Sarees</Link></li>
                        <li><Link to="/products">Tribal Jewellery</Link></li>
                    </ul>
                </div>
                <div>
                    <div className="footer-heading">Support</div>
                    <ul className="footer-links">
                        <li><a href="mailto:support@kalahaat.in">Contact Us</a></li>
                        <li><a href="#" onClick={e => e.preventDefault()}>Shipping Info</a></li>
                        <li><a href="#" onClick={e => e.preventDefault()}>Returns Policy</a></li>
                        <li><a href="#" onClick={e => e.preventDefault()}>FAQs</a></li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom">© 2026 KalaHaat — Preserving India's Tribal Heritage</div>
        </footer>
    );
}
