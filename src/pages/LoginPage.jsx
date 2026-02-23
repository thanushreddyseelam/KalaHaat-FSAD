import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './LoginPage.css';

export default function LoginPage() {
    const { registeredUsers, registerUser, loginAs, showToast } = useApp();
    const navigate = useNavigate();
    const [tab, setTab] = useState('login');

    // Login state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPass, setLoginPass] = useState('');
    const [captcha, setCaptcha] = useState('');
    const [captchaAnswer, setCaptchaAnswer] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    const [loginErr, setLoginErr] = useState('');
    const [showPwdLogin, setShowPwdLogin] = useState(false);

    // OTP state
    const [otpSection, setOtpSection] = useState(false);
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const [currentOTP, setCurrentOTP] = useState('');
    const [otpErr, setOtpErr] = useState('');
    const [pendingEmail, setPendingEmail] = useState('');

    // Register state
    const [regFname, setRegFname] = useState('');
    const [regLname, setRegLname] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPhone, setRegPhone] = useState('');
    const [regPass, setRegPass] = useState('');
    const [regCpass, setRegCpass] = useState('');
    const [regRole, setRegRole] = useState('customer');
    const [regTerms, setRegTerms] = useState(false);
    const [regErr, setRegErr] = useState('');
    const [showPwdReg, setShowPwdReg] = useState(false);

    const generateCaptcha = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
        setCaptchaAnswer(code);
        setCaptcha(code);
        setCaptchaInput('');
    };

    useEffect(() => { generateCaptcha(); }, []);

    const isValidEmail = (email) => /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email.trim());

    const passStrength = () => {
        let s = 0;
        if (regPass.length >= 8) s++;
        if (/[A-Z]/.test(regPass)) s++;
        if (/[0-9]/.test(regPass)) s++;
        if (/[^A-Za-z0-9]/.test(regPass)) s++;
        return s;
    };
    const strengthColors = ['#dc3545', '#fd7e14', '#ffc107', '#4A6741'];
    const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

    const doSignIn = () => {
        setLoginErr('');
        if (!loginEmail || !isValidEmail(loginEmail)) { setLoginErr('Enter a valid email'); return; }
        if (!loginPass) { setLoginErr('Password is required'); return; }
        if (captchaInput.toUpperCase() !== captchaAnswer) { setLoginErr('Incorrect security code'); generateCaptcha(); return; }
        const user = registeredUsers[loginEmail.toLowerCase()];
        if (!user) { setLoginErr('No account found. Please register first.'); return; }
        if (user.password !== loginPass) { setLoginErr('Incorrect password'); return; }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        setCurrentOTP(otp);
        setPendingEmail(loginEmail);
        setOtpSection(true);
        setOtpDigits(['', '', '', '', '', '']);
        setOtpErr('');
    };

    const verifyOTP = () => {
        const entered = otpDigits.join('');
        if (entered.length < 6) { setOtpErr('Please enter all 6 digits'); return; }
        if (entered !== currentOTP) { setOtpErr('Incorrect OTP. Try again.'); return; }
        const user = registeredUsers[pendingEmail.toLowerCase()];
        loginAs(user.role, user.name, user.email);
        showToast(`✅ Welcome back, ${user.name.split(' ')[0]}!`);
        const dest = { customer: '/dashboard/customer', artisan: '/dashboard/artisan', admin: '/dashboard/admin', consultant: '/dashboard/consultant' };
        navigate(dest[user.role] || '/');
    };

    const handleOtpChange = (idx, val) => {
        val = val.replace(/[^0-9]/g, '');
        const newDigits = [...otpDigits];
        newDigits[idx] = val;
        setOtpDigits(newDigits);
        if (val && idx < 5) {
            const next = document.querySelectorAll('.otp-digit')[idx + 1];
            if (next) next.focus();
        }
    };

    const doRegister = () => {
        setRegErr('');
        if (!regFname) { setRegErr('First name is required'); return; }
        if (!regLname) { setRegErr('Last name is required'); return; }
        if (!regEmail || !isValidEmail(regEmail)) { setRegErr('Enter a valid email'); return; }
        if (registeredUsers[regEmail.toLowerCase()]) { setRegErr('Already registered. Sign In instead.'); return; }
        if (!regPhone || regPhone.length < 10) { setRegErr('Enter a valid phone number'); return; }
        if (!regPass || regPass.length < 8) { setRegErr('Password must be at least 8 characters'); return; }
        if (!/[0-9]/.test(regPass)) { setRegErr('Password must contain a number'); return; }
        if (!/[^A-Za-z0-9]/.test(regPass)) { setRegErr('Password must contain a special character'); return; }
        if (regPass !== regCpass) { setRegErr('Passwords do not match'); return; }
        if (!regTerms) { setRegErr('You must accept the Terms of Service'); return; }
        registerUser(regEmail, regPass, regRole, `${regFname} ${regLname}`, regPhone);
        showToast(`✅ Account created! Welcome, ${regFname}! Please sign in.`);
        setTab('login');
        setLoginEmail(regEmail);
    };

    return (
        <div className="auth-layout">
            <div className="auth-visual tribal-pattern">
                <div className="auth-visual-emoji">🏺</div>
                <div className="auth-visual-title">Welcome to KalaHaat</div>
                <div className="auth-visual-sub">India's premier tribal handicrafts marketplace</div>
                <div className="auth-roles-box">
                    <div className="auth-roles-title">Platform Roles</div>
                    <div className="auth-role-item"><span>🛍</span> Customer – Browse & Buy</div>
                    <div className="auth-role-item"><span>🎨</span> Artisan – Sell Crafts</div>
                    <div className="auth-role-item"><span>🏛</span> Cultural Consultant</div>
                    <div className="auth-role-item"><span>⚙️</span> Admin – Manage Platform</div>
                </div>
            </div>

            <div className="auth-form">
                <div className="tabs">
                    <button className={`tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); generateCaptcha(); setOtpSection(false); }}>Sign In</button>
                    <button className={`tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>Register</button>
                </div>

                {tab === 'login' && (
                    <div>
                        <h2 className="auth-title">Sign In</h2>
                        <p className="auth-sub">Don't have an account? <a onClick={() => setTab('register')} style={{ color: 'var(--terracotta)', cursor: 'pointer', fontWeight: 600 }}>Register first →</a></p>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="text" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="yourname@gmail.com" />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <div style={{ position: 'relative' }}>
                                <input type={showPwdLogin ? 'text' : 'password'} value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="Enter your password" style={{ paddingRight: 50 }} />
                                <button onClick={() => setShowPwdLogin(!showPwdLogin)} className="pwd-toggle">{showPwdLogin ? '🙈' : '👁'}</button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Security Check</label>
                            <div className="captcha-row">
                                <div className="captcha-box">{captcha}</div>
                                <button onClick={generateCaptcha} className="captcha-refresh">🔄</button>
                                <input type="text" value={captchaInput} onChange={e => setCaptchaInput(e.target.value)} placeholder="Type what you see" style={{ flex: 1 }} />
                            </div>
                        </div>
                        {loginErr && <div className="auth-err">{loginErr}</div>}
                        <button className="btn-primary" style={{ width: '100%', marginBottom: 20 }} onClick={doSignIn}>Sign In →</button>

                        {otpSection && (
                            <div className="otp-section">
                                <div className="otp-title">📱 OTP Verification</div>
                                <p>A 6-digit OTP has been sent to <strong>{pendingEmail}</strong></p>
                                <div className="otp-inputs">
                                    {otpDigits.map((d, i) => (
                                        <input key={i} className="otp-digit" type="text" maxLength={1} value={d}
                                            onChange={e => handleOtpChange(i, e.target.value)}
                                            style={{ borderColor: d ? 'var(--terracotta)' : '#E8D8C4' }} />
                                    ))}
                                </div>
                                <div className="otp-hint">🔐 Your OTP for demo: {currentOTP}</div>
                                {otpErr && <div className="auth-err" style={{ textAlign: 'center' }}>{otpErr}</div>}
                                <button className="btn-primary" style={{ width: '100%' }} onClick={verifyOTP}>Verify & Sign In ✓</button>
                                <div style={{ textAlign: 'center', marginTop: 10, fontSize: '0.85rem', color: 'var(--bark)' }}>
                                    Didn't get OTP? <a onClick={() => { const otp = Math.floor(100000 + Math.random() * 900000).toString(); setCurrentOTP(otp); setOtpDigits(['', '', '', '', '', '']); showToast('✉ New OTP sent!'); }} style={{ color: 'var(--terracotta)', cursor: 'pointer' }}>Resend</a>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {tab === 'register' && (
                    <div>
                        <h2 className="auth-title">Create Account</h2>
                        <p className="auth-sub">Join India's tribal craft community</p>
                        <div className="reg-name-row">
                            <div className="form-group"><label>First Name</label><input type="text" value={regFname} onChange={e => setRegFname(e.target.value)} placeholder="Ravi" /></div>
                            <div className="form-group"><label>Last Name</label><input type="text" value={regLname} onChange={e => setRegLname(e.target.value)} placeholder="Kumar" /></div>
                        </div>
                        <div className="form-group"><label>Email Address</label><input type="text" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="yourname@gmail.com" /></div>
                        <div className="form-group"><label>Phone Number</label><input type="text" value={regPhone} onChange={e => setRegPhone(e.target.value)} placeholder="+91 9876543210" maxLength={13} /></div>
                        <div className="form-group">
                            <label>Password <span style={{ fontSize: '0.78rem', color: 'var(--bark)', fontStyle: 'italic' }}>(min 8 chars, 1 number, 1 special char)</span></label>
                            <div style={{ position: 'relative' }}>
                                <input type={showPwdReg ? 'text' : 'password'} value={regPass} onChange={e => setRegPass(e.target.value)} placeholder="Create a strong password" style={{ paddingRight: 50 }} />
                                <button onClick={() => setShowPwdReg(!showPwdReg)} className="pwd-toggle">{showPwdReg ? '🙈' : '👁'}</button>
                            </div>
                            {regPass && (
                                <div className="pass-strength-bar"><div style={{ height: '100%', width: `${passStrength() * 25}%`, background: strengthColors[passStrength() - 1] || '#E8D8C4', transition: 'all 0.3s' }}></div></div>
                            )}
                            {regPass && <div style={{ fontSize: '0.82rem', marginTop: 5, color: passStrength() < 3 ? '#dc3545' : '#4A6741' }}>{passStrength() < 3 ? `⚠ ${strengthLabels[passStrength() - 1] || 'Too weak'}` : `✓ Password ${strengthLabels[passStrength() - 1]}`}</div>}
                        </div>
                        <div className="form-group"><label>Confirm Password</label><input type="password" value={regCpass} onChange={e => setRegCpass(e.target.value)} placeholder="Re-enter password" /></div>
                        <div className="form-group">
                            <label>Register As</label>
                            <select value={regRole} onChange={e => setRegRole(e.target.value)}>
                                <option value="customer">🛍 Customer – Browse & Buy</option>
                                <option value="artisan">🎨 Artisan – Sell My Crafts</option>
                                <option value="consultant">🏛 Cultural Consultant</option>
                                <option value="admin">⚙️ Admin (requires approval)</option>
                            </select>
                        </div>
                        <div className="terms-row">
                            <input type="checkbox" checked={regTerms} onChange={e => setRegTerms(e.target.checked)} />
                            <label>I agree to the <a style={{ color: 'var(--terracotta)' }}>Terms of Service</a> and <a style={{ color: 'var(--terracotta)' }}>Privacy Policy</a></label>
                        </div>
                        {regErr && <div className="auth-err">{regErr}</div>}
                        <button className="btn-primary" style={{ width: '100%' }} onClick={doRegister}>Create Account →</button>
                        <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.9rem', color: 'var(--bark)' }}>Already have an account? <a onClick={() => setTab('login')} style={{ color: 'var(--terracotta)', cursor: 'pointer', fontWeight: 600 }}>Sign In</a></p>
                    </div>
                )}
            </div>
        </div>
    );
}
