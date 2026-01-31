import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Plans from './pages/Plans';
import Methodology from './pages/Methodology';
import Welcome from './pages/Welcome';
import { Terms, Privacy, Risk } from './pages/Legal';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin') || location.pathname.startsWith('/welcome');
  const { themeSettings } = useApp();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Inject Theme Settings into CSS Variables
  useEffect(() => {
    document.documentElement.style.setProperty('--font-main', themeSettings.fontFamily);
    document.documentElement.style.fontSize = themeSettings.baseFontSize;
  }, [themeSettings]);
  
  return (
    <>
      {!location.pathname.startsWith('/welcome') && <Navbar />}
      {children}
      {!isDashboard && <Footer />}
    </>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/methodology" element={<Methodology />} />
            <Route path="/login" element={<Login />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/risk" element={<Risk />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AppProvider>
  );
};

export default App;