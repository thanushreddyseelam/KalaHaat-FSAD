import { BrowserRouter, Routes, Route, useLocation, Navigate, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import './App.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import PaymentPage from './pages/PaymentPage';
import CustomerDashboard from './pages/CustomerDashboard';
import ArtisanDashboard from './pages/ArtisanDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ConsultantDashboard from './pages/ConsultantDashboard';
import { useEffect } from 'react';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

/* Route guard: only allows access if the user's role matches */
function ProtectedRoute({ allowedRoles, children }) {
  const { currentRole } = useApp();
  if (!allowedRoles.includes(currentRole)) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

/* 404 Not Found page */
function NotFoundPage() {
  return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <div style={{ fontSize: '5rem', marginBottom: 20 }}>🔍</div>
      <h1 style={{ fontSize: '2rem', marginBottom: 12, color: 'var(--bark)' }}>Page Not Found</h1>
      <p style={{ color: 'var(--bark)', marginBottom: 24 }}>The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn-primary" style={{ textDecoration: 'none' }}>← Back to Home</Link>
    </div>
  );
}

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

function AppLayout() {
  const { pathname } = useLocation();
  const isDashboard = pathname.startsWith('/dashboard');

  return (
    <>
      <Navbar />
      <ScrollToTop />
      <main style={{ minHeight: 'calc(100vh - 70px)' }}>
        <AnimatePresence mode="wait">
          <Routes location={pathname} key={pathname}>
            <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
            <Route path="/products" element={<PageWrapper><ProductsPage /></PageWrapper>} />
            <Route path="/product/:id" element={<PageWrapper><ProductDetailPage /></PageWrapper>} />
            <Route path="/cart" element={<PageWrapper><CartPage /></PageWrapper>} />
            <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
            <Route path="/payment" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <PageWrapper><PaymentPage /></PageWrapper>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/customer" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <PageWrapper><CustomerDashboard /></PageWrapper>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/artisan" element={
              <ProtectedRoute allowedRoles={['artisan']}>
                <PageWrapper><ArtisanDashboard /></PageWrapper>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PageWrapper><AdminDashboard /></PageWrapper>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/consultant" element={
              <ProtectedRoute allowedRoles={['consultant']}>
                <PageWrapper><ConsultantDashboard /></PageWrapper>
              </ProtectedRoute>
            } />
            <Route path="*" element={<PageWrapper><NotFoundPage /></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      </main>
      {!isDashboard && <Footer />}
      <Toaster position="bottom-right" reverseOrder={false} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppLayout />
      </AppProvider>
    </BrowserRouter>
  );
}
