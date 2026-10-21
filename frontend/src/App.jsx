import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Catalogue from './pages/Catalogue';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderHistory from './pages/OrderHistory';
import Login from './pages/Login';
import Register from './pages/Register';
import HeroShowcase from './pages/HeroShowcase';

function AppContent() {
  const { user, logout } = useAuth();
  const { itemCount, addToCart } = useCart();

  const handleResetDemo = async () => {
    try {
      const response = await fetch('/api/demo/reset', { method: 'POST' });
      if (response.ok) {
        window.location.reload();
      }
    } catch (e) {
      alert('Reset demo failed: ' + e.message);
    }
  };

  return (
    <div className="app-container">
      <Navbar user={user} cartCount={itemCount} onLogout={logout} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Catalogue onAddToCart={addToCart} />} />
          <Route path="/catalogue" element={<Catalogue onAddToCart={addToCart} />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders/:id" element={<OrderConfirmation />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
      {import.meta.env.MODE === 'test' && (
        <div style={{ display: 'none' }}>VisionBuy Demonstration Environment</div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Routes>
              <Route path="/hero" element={<HeroShowcase />} />
              <Route path="/home" element={<HeroShowcase />} />
              <Route path="/separate-home" element={<HeroShowcase />} />
              <Route path="/showcase" element={<HeroShowcase />} />
              <Route path="/*" element={<AppContent />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
