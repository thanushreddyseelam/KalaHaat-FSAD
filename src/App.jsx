import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import './App.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';
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

function AppLayout() {
  const { pathname } = useLocation();
  const isDashboard = pathname.startsWith('/dashboard');

  return (
    <>
      <Navbar />
      <ScrollToTop />
      <main style={{ minHeight: 'calc(100vh - 70px)' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/dashboard/customer" element={<CustomerDashboard />} />
          <Route path="/dashboard/artisan" element={<ArtisanDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/consultant" element={<ConsultantDashboard />} />
        </Routes>
      </main>
      {!isDashboard && <Footer />}
      <Toast />
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
