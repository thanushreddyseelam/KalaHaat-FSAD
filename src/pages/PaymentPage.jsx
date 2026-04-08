import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { paymentAPI } from '../services/api';
import './PaymentPage.css';

export default function PaymentPage() {
    const { cartItems, cartTotal, shipping, orderTotal, currentUser, placeOrder, showToast } = useApp();
    const navigate = useNavigate();
    const [payMethod, setPayMethod] = useState('upi');
    const [address, setAddress] = useState({ name: currentUser?.name || '', phone: '', line1: '', line2: '', city: '', state: '', pin: '', type: 'home' });
    const [addrErr, setAddrErr] = useState('');
    const [cardName, setCardName] = useState('');
    const [cardNum, setCardNum] = useState('');
    const [cardExp, setCardExp] = useState('');
    const [cardCvv, setCardCvv] = useState('');
    const [upiId, setUpiId] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [orderId, setOrderId] = useState('');
    const [processing, setProcessing] = useState(false);

    // Guard: redirect to cart if cart is empty and we haven't just placed an order
    useEffect(() => {
        if (cartItems.length === 0 && !showSuccess && !processing) {
            navigate('/cart', { replace: true });
        }
    }, [cartItems, showSuccess, processing, navigate]);

    const validateAddr = () => {
        if (!address.name) { setAddrErr('Please enter recipient name'); return false; }
        if (!address.phone || address.phone.length < 10) { setAddrErr('Please enter a valid phone number'); return false; }
        if (!address.line1) { setAddrErr('Please enter your address'); return false; }
        if (!address.city) { setAddrErr('Please enter your city'); return false; }
        if (!address.state) { setAddrErr('Please select your state'); return false; }
        if (!address.pin || address.pin.length !== 6) { setAddrErr('Enter a valid 6-digit pincode'); return false; }
        setAddrErr('');
        return true;
    };



    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const processPayment = async () => {
        if (!validateAddr()) return;
        if (payMethod === 'card' && (!cardName || !cardNum || cardNum.replace(/\s/g, '').length < 16 || !cardExp || !cardCvv)) {
            showToast('⚠ Please fill all card details'); return;
        }
        
        setProcessing(true);
        
        if (payMethod === 'cod') {
            showToast('⏳ Placing your order...');
            setTimeout(async () => {
                const id = await placeOrder(payMethod, address);
                if (id) { setOrderId(id); setShowSuccess(true); } else { showToast('⚠ Order failed. Please try again.'); }
                setProcessing(false);
            }, 1800);
            return;
        }

        try {
            showToast('⏳ Initializing secure payment...');
            
            // 1. Create Order on Backend
            const res = await paymentAPI.createRazorpayOrder(orderTotal);
            const { order, key, isMock } = res.data;

            if (isMock) {
                // Testing Mode (Keys absent)
                showToast('✅ Mock Payment Success (Sandbox)');
                const internalId = await placeOrder(payMethod, address);
                if (internalId) {
                    await paymentAPI.verifyRazorpayPayment({
                        razorpay_order_id: order.id,
                        razorpay_payment_id: 'pay_mock_' + Math.random().toString(36).substr(2, 9),
                        razorpay_signature: 'signature_mock',
                        internal_order_id: internalId
                    });
                    setOrderId(internalId);
                    setShowSuccess(true);
                }
                setProcessing(false);
                return;
            }

            // 2. Load Razorpay SDK (Production)
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                showToast('⚠ Failed to load payment gateway');
                setProcessing(false);
                return;
            }

            // 3. Open Modal
            const options = {
                key: key,
                amount: order.amount,
                currency: order.currency,
                name: "KalaHaat",
                description: "Tribal Handicrafts Purchase",
                order_id: order.id,
                prefill: {
                    name: address.name,
                    contact: address.phone
                },
                theme: { color: "#3B4E38" }, // var(--moss)
                handler: async function (response) {
                    // 4. Verify Payment & Place Internal Order
                    showToast('⏳ Verifying payment...');
                    const internalId = await placeOrder(payMethod, address);
                    
                    if (internalId) {
                        const verification = await paymentAPI.verifyRazorpayPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            internal_order_id: internalId
                        });

                        if (verification.data.success) {
                            setOrderId(internalId);
                            setShowSuccess(true);
                        } else {
                            showToast('⚠ Payment Verification Failed');
                        }
                    }
                    setProcessing(false);
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                showToast('❌ Payment Failed: ' + response.error.description);
                setProcessing(false);
            });
            rzp.open();

        } catch (error) {
            console.error(error);
            showToast('⚠ Error initiating payment');
            setProcessing(false);
        }
    };

    const methods = [
        { key: 'upi', icon: '📱', label: 'UPI' },
        { key: 'card', icon: '💳', label: 'Card' },
        { key: 'netbank', icon: '🏦', label: 'Net Bank' },
        { key: 'wallet', icon: '👜', label: 'Wallet' },
        { key: 'cod', icon: '💵', label: 'Cash' },
    ];

    const states = ['Andhra Pradesh', 'Telangana', 'Tamil Nadu', 'Karnataka', 'Kerala', 'Maharashtra', 'Gujarat', 'Rajasthan', 'Madhya Pradesh', 'Chhattisgarh', 'Odisha', 'West Bengal', 'Delhi', 'Uttar Pradesh', 'Bihar', 'Jharkhand', 'Punjab', 'Haryana', 'Other'];

    // If cart is empty and not showing success, show nothing (useEffect will redirect)
    if (cartItems.length === 0 && !showSuccess) {
        return null;
    }

    return (
        <div className="page-fade-in">
            <div className="page-header"><h1>Secure Checkout</h1><p>Complete your purchase safely · 256-bit SSL encrypted</p></div>
            <div className="payment-grid">
                <div>
                    {/* Progress */}
                    <div className="checkout-progress">
                        <div className="progress-step done"><div className="progress-circle">✓</div><span>Cart</span></div>
                        <div className="progress-line done"></div>
                        <div className={`progress-step ${showSuccess ? 'done' : 'active'}`}><div className="progress-circle">{showSuccess ? '✓' : '2'}</div><span>Payment</span></div>
                        <div className={`progress-line ${showSuccess ? 'done' : ''}`}></div>
                        <div className={`progress-step ${showSuccess ? 'active' : ''}`}><div className="progress-circle">{showSuccess ? '✓' : '3'}</div><span>Confirmation</span></div>
                    </div>

                    {/* Payment Methods */}
                    <div className="pay-card">
                        <h3>Choose Payment Method</h3>
                        <div className="pay-methods">
                            {methods.map(m => (
                                <div key={m.key} className={`pay-tab ${payMethod === m.key ? 'selected' : ''}`} onClick={() => setPayMethod(m.key)}>
                                    <div style={{ fontSize: '1.6rem', marginBottom: 5 }}>{m.icon}</div>
                                    <div>{m.label}</div>
                                </div>
                            ))}
                        </div>

                        {payMethod === 'upi' && (
                            <div>
                                <div className="pay-section-label">Pay via UPI Apps</div>
                                <div className="upi-apps">
                                    {['🟣 PhonePe', '🔵 GPay', '🟡 Paytm', '🟠 BHIM'].map((app, i) => (
                                        <div key={i} className="upi-app">{app.split(' ').map((p, j) => <div key={j}>{p}</div>)}</div>
                                    ))}
                                </div>
                                <div className="form-group" style={{ marginTop: 16 }}>
                                    <label>Or enter UPI ID manually</label>
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi" style={{ flex: 1 }} />
                                        <button className="verify-btn" onClick={() => { if (upiId.includes('@')) showToast('✓ UPI ID verified!'); else showToast('⚠ Enter a valid UPI ID'); }}>Verify</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {payMethod === 'card' && (
                            <div>
                                <div className="card-preview">
                                    <div className="card-preview-top"><span>KalaHaat</span><span>💳</span></div>
                                    <div className="card-preview-num">{cardNum || '•••• •••• •••• ••••'}</div>
                                    <div className="card-preview-bottom">
                                        <div><small>Card Holder</small><div>{cardName.toUpperCase() || 'FULL NAME'}</div></div>
                                        <div><small>Expires</small><div>{cardExp || 'MM / YY'}</div></div>
                                    </div>
                                </div>
                                <div className="form-group"><label>Cardholder Name</label><input type="text" value={cardName} onChange={e => setCardName(e.target.value)} placeholder="As printed on card" /></div>
                                <div className="form-group"><label>Card Number</label><input type="text" value={cardNum} onChange={e => { let v = e.target.value.replace(/\D/g, '').slice(0, 16); v = v.replace(/(.{4})/g, '$1 ').trim(); setCardNum(v); }} placeholder="1234 5678 9012 3456" maxLength={19} /></div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div className="form-group"><label>Expiry</label><input type="text" value={cardExp} onChange={e => { let v = e.target.value.replace(/\D/g, '').slice(0, 4); if (v.length >= 2) v = v.slice(0, 2) + ' / ' + v.slice(2); setCardExp(v); }} placeholder="MM / YY" maxLength={7} /></div>
                                    <div className="form-group"><label>CVV</label><input type="password" value={cardCvv} onChange={e => setCardCvv(e.target.value)} placeholder="•••" maxLength={3} /></div>
                                </div>
                            </div>
                        )}

                        {payMethod === 'netbank' && (
                            <div>
                                <div className="pay-section-label">Popular Banks</div>
                                <div className="bank-grid">
                                    {['🏛 SBI', '🏦 HDFC', '🏧 ICICI', '💰 Axis', '🏗 Kotak', '📊 PNB'].map((b, i) => (
                                        <div key={i} className="bank-item">{b.split(' ').map((p, j) => <div key={j}>{p}</div>)}</div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {payMethod === 'wallet' && (
                            <div>
                                <div className="pay-section-label">Select Wallet</div>
                                <div className="wallet-grid">
                                    {[{ n: 'Paytm', b: '₹2,500', e: '🟡' }, { n: 'Amazon Pay', b: '₹1,200', e: '🟠' }, { n: 'Mobikwik', b: '₹800', e: '🔵' }, { n: 'Freecharge', b: '₹350', e: '🟢' }].map((w, i) => (
                                        <div key={i} className="wallet-item"><span style={{ fontSize: '1.8rem' }}>{w.e}</span><div><strong>{w.n}</strong><div style={{ fontSize: '0.82rem', color: 'var(--bark)' }}>Bal: {w.b}</div></div></div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {payMethod === 'cod' && (
                            <div className="cod-box">
                                <div style={{ fontSize: '3.5rem', marginBottom: 14 }}>💵</div>
                                <h3>Cash on Delivery</h3>
                                <p>Pay in cash when your tribal treasure arrives at your doorstep.</p>
                                <div className="cod-features">
                                    <div><span>✅</span><span>No Extra Charge</span></div>
                                    <div><span>🚚</span><span>3–5 Days</span></div>
                                    <div><span>🔄</span><span>Easy Returns</span></div>
                                </div>
                            </div>
                        )}

                        <button
                            className="btn-primary"
                            style={{ width: '100%', marginTop: 20, fontSize: '0.85rem', padding: 16, background: payMethod === 'cod' ? 'var(--moss)' : undefined, opacity: processing ? 0.6 : 1 }}
                            onClick={processPayment}
                            disabled={processing}
                        >
                            {processing ? '⏳ Processing...' : payMethod === 'cod' ? '📦 Confirm Cash on Delivery' : `🔒 Pay ₹${orderTotal.toLocaleString('en-IN')}`}
                        </button>
                    </div>

                    {/* Address */}
                    <div className="pay-card" style={{ marginTop: 24 }}>
                        <h3>📍 Delivery Address</h3>
                        <p style={{ fontSize: '0.88rem', color: 'var(--bark)', fontStyle: 'italic', marginBottom: 22 }}>Where should we deliver your tribal treasures?</p>
                        <div className="addr-grid">
                            <div className="form-group"><label>Full Name</label><input value={address.name} onChange={e => setAddress({ ...address, name: e.target.value })} placeholder="Recipient's full name" /></div>
                            <div className="form-group"><label>Phone</label><input value={address.phone} onChange={e => setAddress({ ...address, phone: e.target.value })} placeholder="+91 9876543210" maxLength={13} /></div>
                            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Address Line 1</label><input value={address.line1} onChange={e => setAddress({ ...address, line1: e.target.value })} placeholder="House/Flat No., Street, Area" /></div>
                            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Address Line 2 <span style={{ fontStyle: 'italic', fontSize: '0.8rem', color: 'var(--bark)' }}>(optional)</span></label><input value={address.line2} onChange={e => setAddress({ ...address, line2: e.target.value })} placeholder="Landmark, Colony" /></div>
                            <div className="form-group"><label>City</label><input value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} placeholder="City" /></div>
                            <div className="form-group"><label>State</label>
                                <select value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })}>
                                    <option value="">Select State</option>
                                    {states.map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="form-group"><label>Pincode</label><input value={address.pin} onChange={e => setAddress({ ...address, pin: e.target.value })} placeholder="522501" maxLength={6} /></div>
                            <div className="form-group"><label>Address Type</label>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <label className="addr-type-label"><input type="radio" name="addr-type" value="home" checked={address.type === 'home'} onChange={() => setAddress({ ...address, type: 'home' })} /> 🏠 Home</label>
                                    <label className="addr-type-label"><input type="radio" name="addr-type" value="work" checked={address.type === 'work'} onChange={() => setAddress({ ...address, type: 'work' })} /> 🏢 Work</label>
                                </div>
                            </div>
                        </div>
                        {addrErr && <div className="auth-err" style={{ marginTop: 8 }}>{addrErr}</div>}
                    </div>
                </div>

                {/* Right: Order Summary */}
                <div>
                    <div className="pay-summary">
                        <h3>Order Summary</h3>
                        <div className="pay-items">
                            {cartItems.map(item => (
                                <div key={item._id || item.id} className="pay-item">
                                    <div className="pay-item-img">{item.image ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }} /> : item.emoji}</div>
                                    <div style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>{item.name}</div><div style={{ fontSize: '0.8rem', color: 'var(--bark)' }}>Qty: {item.qty}</div></div>
                                    <div style={{ fontFamily: "'Space Mono',monospace", color: 'var(--terracotta)' }}>₹{(Number(item.price) * item.qty).toLocaleString('en-IN')}</div>
                                </div>
                            ))}
                        </div>
                        <div className="pay-totals">
                            <div className="summary-row"><span>Subtotal</span><span>₹{cartTotal.toLocaleString('en-IN')}</span></div>
                            <div className="summary-row"><span>Shipping</span><span style={{ color: 'var(--moss)' }}>{shipping === 0 ? 'Free' : `₹${shipping}`}</span></div>
                            <div className="summary-total"><span>Total</span><span>₹{orderTotal.toLocaleString('en-IN')}</span></div>
                        </div>
                        <div className="pay-deliver-to">
                            <small>Delivering to</small>
                            <div style={{ fontWeight: 600 }}>{address.name || '—'}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--bark)', marginTop: 4 }}>{address.line1 ? `${address.line1}, ${address.city}, ${address.state} – ${address.pin}` : 'Fill in your address below'}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccess && (
                <div className="success-overlay">
                    <div className="success-modal">
                        <div className="success-checkmark">
                            <svg viewBox="0 0 52 52" className="checkmark-svg">
                                <circle cx="26" cy="26" r="25" fill="none" className="checkmark-circle" />
                                <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" className="checkmark-check" />
                            </svg>
                        </div>
                        <h2>Payment Successful!</h2>
                        <p style={{ fontStyle: 'italic', marginBottom: 8 }}>Your order has been placed.</p>
                        <div className="success-order-id">Order #{orderId}</div>
                        <p>Your tribal treasures will be handcrafted and shipped within 3–5 business days.</p>
                        <div className="success-details">
                            <div className="success-detail-item"><span>📦</span><span>Tracking updates via email</span></div>
                            <div className="success-detail-item"><span>🔄</span><span>Easy 7-day returns</span></div>
                            <div className="success-detail-item"><span>📞</span><span>24/7 customer support</span></div>
                        </div>
                        <button className="btn-primary" style={{ width: '100%' }} onClick={() => { setShowSuccess(false); navigate('/dashboard/customer'); }}>View My Orders →</button>
                        <button className="btn-secondary" style={{ width: '100%', marginTop: 10 }} onClick={() => { setShowSuccess(false); navigate('/products'); }}>Continue Shopping</button>
                    </div>
                </div>
            )}
        </div>
    );
}
