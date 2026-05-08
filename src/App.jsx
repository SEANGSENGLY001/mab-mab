import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';
import Home from './pages/Home';
import Memories from './pages/Memories';
import Login from './pages/Login';
import Admin from './pages/Admin';
import MusicPlayer from './components/MusicPlayer';
import LoadingScreen from './components/LoadingScreen';
import './App.css';

function Navigation() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Don't show nav on admin or login pages
  if (location.pathname === '/admin' || location.pathname === '/login') return null;

  const links = [
    { to: '/', label: 'ទំព័រដើម', icon: 'home' },
    { to: '/memories', label: 'អនុស្សាវរីយ៍', icon: 'photo_camera' },
    { to: '/login', label: 'Admin', icon: 'lock' },
  ];

  return (
    <motion.nav
      className={`nav ${isScrolled ? 'nav-scrolled' : ''}`}
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="nav-inner">
        <Link to="/" className="nav-brand">
          <span className="nav-brand-icon"><span className="icon icon--fill">favorite</span></span>
          <span className="nav-brand-text">Mab Mab</span>
        </Link>
        <div className="nav-links">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
            >
              <span className="nav-link-icon"><span className="icon">{link.icon}</span></span>
              <span className="nav-link-label">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </motion.nav>
  );
}

function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <LoadingScreen />;

  if (!user) {
    return (
      <div className="page login-page">
        <div className="login-card">
          <div className="login-header">
            <span className="login-icon"><span className="icon icon--xl">lock</span></span>
            <h2 className="login-title">ការចូលប្រើប្រាស់ត្រូវបានហាមឃាត់</h2>
            <p className="login-subtitle">សូមចូលប្រើប្រាស់ជាមុនសិន</p>
          </div>
          <Link to="/login" className="login-btn" style={{ marginTop: '1rem' }}>
            ចូលប្រើប្រាស់
          </Link>
        </div>
      </div>
    );
  }

  return children;
}

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <LoadingScreen key="loading" />
      ) : (
        <motion.div
          key="app"
          className="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Navigation />
          <MusicPlayer />

          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Home />
                </motion.div>
              } />
              <Route path="/memories" element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Memories />
                </motion.div>
              } />
              <Route path="/login" element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Login />
                </motion.div>
              } />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              } />
            </Routes>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}